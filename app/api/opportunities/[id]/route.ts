/**
 * Individual Opportunity API Route
 * GET - Fetch single opportunity with details
 * PATCH - Update opportunity fields
 * DELETE - Delete opportunity
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateRICE } from '@/lib/utils/rice'

export const dynamic = 'force-dynamic'

interface OpportunityParams {
  params: Promise<{ id: string }>
}

// GET - Fetch single opportunity
export async function GET(
  request: NextRequest,
  { params }: OpportunityParams
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: opportunity, error } = await supabase
      .from('opportunity_cards')
      .select(`
        *,
        product_area:product_areas(id, name, color, description)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching opportunity:', error)
      return NextResponse.json(
        { error: 'Opportunity not found', message: error.message },
        { status: 404 }
      )
    }

    // Calculate RICE score
    const rice_score = calculateRICE(
      opportunity.reach,
      opportunity.impact,
      opportunity.confidence,
      opportunity.effort
    )

    return NextResponse.json({
      success: true,
      opportunity: {
        ...opportunity,
        rice_score,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/opportunities/[id]:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// PATCH - Update opportunity
export async function PATCH(
  request: NextRequest,
  { params }: OpportunityParams
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const updates = await request.json()

    // Build update object (only allow certain fields)
    const allowedFields = [
      'title',
      'description',
      'status',
      'severity',
      'effort',
      'confidence',
      'meta',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in updates) {
        updateData[field] = updates[field]
      }
    }

    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update opportunity
    const { data: opportunity, error } = await supabase
      .from('opportunity_cards')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        product_area:product_areas(id, name, color, description)
      `)
      .single()

    if (error) {
      console.error('Error updating opportunity:', error)
      return NextResponse.json(
        { error: 'Failed to update opportunity', message: error.message },
        { status: 500 }
      )
    }

    // Calculate updated RICE score
    const rice_score = calculateRICE(
      opportunity.reach,
      opportunity.impact,
      opportunity.confidence,
      opportunity.effort
    )

    return NextResponse.json({
      success: true,
      opportunity: {
        ...opportunity,
        rice_score,
      },
    })
  } catch (error) {
    console.error('Error in PATCH /api/opportunities/[id]:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete opportunity
export async function DELETE(
  request: NextRequest,
  { params }: OpportunityParams
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('opportunity_cards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting opportunity:', error)
      return NextResponse.json(
        { error: 'Failed to delete opportunity', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Opportunity deleted successfully',
    })
  } catch (error) {
    console.error('Error in DELETE /api/opportunities/[id]:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
