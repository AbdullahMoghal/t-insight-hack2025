import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Cron endpoint to capture intensity snapshots
 * Should be called every 15-30 minutes to build historical trend data
 *
 * Usage:
 * curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
 *   http://localhost:3000/api/cron/capture-snapshots
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid authorization header')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get signals from the last 24 hours to calculate current intensity
    // Changed from 1 hour to 24 hours to ensure we capture data even with infrequent signals
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: recentSignals, error: signalsError } = await supabase
      .from('signals')
      .select(`
        topic,
        intensity,
        product_area_id
      `)
      .gte('detected_at', twentyFourHoursAgo)

    if (signalsError) {
      console.error('Error fetching signals:', signalsError)
      return NextResponse.json({ success: false, error: signalsError.message }, { status: 500 })
    }

    // Group by topic and product area
    const issueMap = new Map<string, {
      topic: string
      productAreaId: string
      totalIntensity: number
      signalCount: number
    }>()

    for (const signal of recentSignals || []) {
      const key = `${signal.topic}::${signal.product_area_id}`
      const existing = issueMap.get(key)

      if (existing) {
        existing.totalIntensity += signal.intensity || 0
        existing.signalCount += 1
      } else {
        issueMap.set(key, {
          topic: signal.topic,
          productAreaId: signal.product_area_id || '',
          totalIntensity: signal.intensity || 0,
          signalCount: 1,
        })
      }
    }

    // Insert snapshots for each issue
    const snapshots = Array.from(issueMap.values()).map(issue => ({
      topic: issue.topic,
      product_area_id: issue.productAreaId,
      intensity: issue.totalIntensity,
      signal_count: issue.signalCount,
      snapshot_at: new Date().toISOString(),
    }))

    if (snapshots.length > 0) {
      const { error: insertError } = await supabase
        .from('signal_intensity_snapshots')
        .insert(snapshots)

      if (insertError) {
        console.error('Error inserting snapshots:', insertError)
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
      }
    }

    // Clean up old snapshots (keep only last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { error: deleteError } = await supabase
      .from('signal_intensity_snapshots')
      .delete()
      .lt('snapshot_at', sevenDaysAgo)

    if (deleteError) {
      console.error('Error cleaning old snapshots:', deleteError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      snapshotsCaptured: snapshots.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error capturing snapshots:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
