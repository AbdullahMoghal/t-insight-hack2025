/**
 * Opportunity Signals API Route
 * GET - Fetch all signals linked to an opportunity (for evidence drawer)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface OpportunityParams {
  params: Promise<{ id: string }>
}

// GET - Fetch signals for opportunity
export async function GET(
  request: NextRequest,
  { params }: OpportunityParams
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // First, get the opportunity to retrieve signal IDs
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunity_cards')
      .select('derived_from_signal_ids, title')
      .eq('id', id)
      .single()

    if (oppError) {
      console.error('Error fetching opportunity:', oppError)
      return NextResponse.json(
        { error: 'Opportunity not found', message: oppError.message },
        { status: 404 }
      )
    }

    if (!opportunity.derived_from_signal_ids || opportunity.derived_from_signal_ids.length === 0) {
      return NextResponse.json({
        success: true,
        signals: [],
        count: 0,
        summary: {
          totalSignals: 0,
          averageSentiment: 0,
          sources: [],
          timeRange: null,
        },
      })
    }

    // Fetch signals
    const { data: signals, error: signalsError } = await supabase
      .from('signals')
      .select(`
        *,
        product_area:product_areas(id, name, color)
      `)
      .in('id', opportunity.derived_from_signal_ids)
      .order('detected_at', { ascending: false })

    if (signalsError) {
      console.error('Error fetching signals:', signalsError)
      return NextResponse.json(
        { error: 'Failed to fetch signals', message: signalsError.message },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const totalSignals = signals?.length || 0
    const averageSentiment = totalSignals > 0
      ? signals.reduce((sum, s) => sum + s.sentiment, 0) / totalSignals
      : 0

    // Get unique sources
    const sourceCounts: Record<string, number> = {}
    signals?.forEach((signal) => {
      sourceCounts[signal.source] = (sourceCounts[signal.source] || 0) + 1
    })
    const sources = Object.entries(sourceCounts).map(([name, count]) => ({
      name,
      count,
    }))

    // Time range
    const timestamps = signals?.map((s) => new Date(s.detected_at).getTime()) || []
    const timeRange = timestamps.length > 0
      ? {
          earliest: new Date(Math.min(...timestamps)),
          latest: new Date(Math.max(...timestamps)),
        }
      : null

    // Group signals by source for easier display
    const groupedSignals: Record<string, typeof signals> = {}
    signals?.forEach((signal) => {
      if (!groupedSignals[signal.source]) {
        groupedSignals[signal.source] = []
      }
      groupedSignals[signal.source].push(signal)
    })

    return NextResponse.json({
      success: true,
      signals: signals || [],
      groupedSignals,
      count: totalSignals,
      summary: {
        totalSignals,
        averageSentiment: Math.round(averageSentiment * 100) / 100,
        sources,
        timeRange,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/opportunities/[id]/signals:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
