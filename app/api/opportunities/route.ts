/**
 * Opportunities API Route
 * GET - Fetch all opportunities with optional filters
 * POST - Create new opportunity
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateFullRICE, determineSeverity } from '@/lib/utils/rice'

export const dynamic = 'force-dynamic'

interface CreateOpportunityRequest {
  issueId?: string // ID of emerging issue (if from dashboard)
  title: string
  description?: string
  productAreaId: string
  signalIds?: string[] // Array of signal UUIDs (optional if topic provided)
  topic?: string // Topic to query signals by (alternative to signalIds)
  insights?: {
    summary: string
    rootCause: string
    recommendations: string[]
    priority: string
    urgency: string
    expectedImpact: string
    stakeholders: string[]
  }
  effort?: number // Optional, defaults to 5
  confidence?: number // Optional, defaults to 0.7
}

// Utility to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// GET - Fetch all opportunities
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Get filter parameters
    const status = searchParams.get('status')
    const productAreaId = searchParams.get('product_area_id')
    const severity = searchParams.get('severity')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // Build query
    let query = supabase
      .from('opportunity_cards')
      .select(`
        *,
        product_area:product_areas(id, name, color)
      `)

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (productAreaId && productAreaId !== 'all') {
      query = query.eq('product_area_id', productAreaId)
    }
    if (severity && severity !== 'all') {
      query = query.eq('severity', severity)
    }

    // Apply sorting
    if (sortBy === 'rice') {
      // For RICE sorting, we need to calculate it client-side
      // For now, sort by created_at and we'll sort RICE in the client
      query = query.order('created_at', { ascending: sortOrder === 'asc' })
    } else {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    }

    const { data: opportunities, error } = await query

    if (error) {
      console.error('Error fetching opportunities:', error)
      return NextResponse.json(
        { error: 'Failed to fetch opportunities', message: error.message },
        { status: 500 }
      )
    }

    // Calculate RICE scores for each opportunity
    const opportunitiesWithRICE = (opportunities || []).map((opp) => {
      const rice = (opp.reach * opp.impact * opp.confidence) / (opp.effort || 1)
      return {
        ...opp,
        rice_score: Math.round(rice * 10) / 10,
      }
    })

    // Sort by RICE if requested
    if (sortBy === 'rice') {
      opportunitiesWithRICE.sort((a, b) => {
        const diff = b.rice_score - a.rice_score
        return sortOrder === 'asc' ? -diff : diff
      })
    }

    return NextResponse.json({
      success: true,
      opportunities: opportunitiesWithRICE,
      count: opportunitiesWithRICE.length,
    })
  } catch (error) {
    console.error('Error in GET /api/opportunities:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// POST - Create new opportunity
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: CreateOpportunityRequest = await request.json()

    // Validate required fields
    if (!body.title || !body.productAreaId) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'title and productAreaId are required',
        },
        { status: 400 }
      )
    }

    // Determine how to fetch signals
    let signalIds: string[] = []
    let signals: any[] = []

    // Check if we have valid signal IDs
    const hasValidSignalIds = body.signalIds &&
      body.signalIds.length > 0 &&
      body.signalIds.every(id => isValidUUID(id))

    if (hasValidSignalIds) {
      // Use provided signal IDs
      signalIds = body.signalIds!
      const { data, error: signalsError } = await supabase
        .from('signals')
        .select('*')
        .in('id', signalIds)

      if (signalsError) {
        console.error('Error fetching signals:', signalsError)
        return NextResponse.json(
          { error: 'Failed to fetch signals', message: signalsError.message },
          { status: 500 }
        )
      }
      signals = data || []
    } else {
      // Query signals by topic and product area
      const topic = body.topic || body.title

      const { data, error: signalsError } = await supabase
        .from('signals')
        .select('*')
        .eq('product_area_id', body.productAreaId)
        .ilike('topic', `%${topic}%`)
        .order('detected_at', { ascending: false })
        .limit(100) // Limit to most recent 100 signals

      if (signalsError) {
        console.error('Error fetching signals by topic:', signalsError)
        return NextResponse.json(
          { error: 'Failed to fetch signals', message: signalsError.message },
          { status: 500 }
        )
      }

      signals = data || []
      signalIds = signals.map(s => s.id)
    }

    // Fetch product area name
    const { data: productArea, error: productAreaError } = await supabase
      .from('product_areas')
      .select('name')
      .eq('id', body.productAreaId)
      .single()

    if (productAreaError) {
      console.error('Error fetching product area:', productAreaError)
      return NextResponse.json(
        { error: 'Invalid product area', message: productAreaError.message },
        { status: 400 }
      )
    }

    // Calculate RICE components
    const effort = body.effort || 5
    const confidence = body.confidence || 0.7
    const riceResult = calculateFullRICE(signals || [], productArea.name, effort, confidence)

    // Determine severity
    const averageSentiment = signals && signals.length > 0
      ? signals.reduce((sum, s) => sum + s.sentiment, 0) / signals.length
      : 0
    const severity = determineSeverity(averageSentiment, riceResult.reach)

    // Create opportunity
    const { data: opportunity, error: createError } = await supabase
      .from('opportunity_cards')
      .insert({
        title: body.title,
        description: body.description || '',
        product_area_id: body.productAreaId,
        severity,
        status: 'new',
        derived_from_signal_ids: signalIds, // Use the fetched/validated signalIds
        reach: riceResult.reach,
        impact: riceResult.impact,
        effort: riceResult.effort,
        confidence: riceResult.confidence,
        meta: {
          insights: body.insights || null,
          issue_id: body.issueId || null,
          created_from: 'dashboard',
        },
      })
      .select(`
        *,
        product_area:product_areas(id, name, color)
      `)
      .single()

    if (createError) {
      console.error('Error creating opportunity:', createError)
      return NextResponse.json(
        { error: 'Failed to create opportunity', message: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      opportunity: {
        ...opportunity,
        rice_score: riceResult.score,
      },
    })
  } catch (error) {
    console.error('Error in POST /api/opportunities:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
