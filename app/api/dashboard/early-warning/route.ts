import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface VelocityData {
  topic: string
  productAreaId: string
  productAreaName: string
  color: string
  currentIntensity: number
  velocity: number
  projectedIntensity: number
  timeToSpreadHours: number
  affectedUsers: number
  confidence: number
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current emerging issues (from signals in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data: recentSignals, error: signalsError } = await supabase
      .from('signals')
      .select(`
        topic,
        intensity,
        product_area_id,
        detected_at,
        product_areas (
          id,
          name,
          color
        )
      `)
      .gte('detected_at', oneHourAgo)
      .order('detected_at', { ascending: false })

    if (signalsError) {
      console.error('Error fetching signals:', signalsError)
      return NextResponse.json({ success: false, error: signalsError.message }, { status: 500 })
    }

    // Group by topic and product area
    const issueMap = new Map<string, {
      topic: string
      productAreaId: string
      productAreaName: string
      color: string
      totalIntensity: number
      signalCount: number
      latestTimestamp: Date
    }>()

    for (const signal of recentSignals || []) {
      const key = `${signal.topic}::${signal.product_area_id}`
      const existing = issueMap.get(key)

      if (existing) {
        existing.totalIntensity += signal.intensity || 0
        existing.signalCount += 1
        if (new Date(signal.detected_at) > existing.latestTimestamp) {
          existing.latestTimestamp = new Date(signal.detected_at)
        }
      } else {
        issueMap.set(key, {
          topic: signal.topic,
          productAreaId: signal.product_area_id || '',
          productAreaName: (signal.product_areas as any)?.name || 'Unknown',
          color: (signal.product_areas as any)?.color || '#E8258E',
          totalIntensity: signal.intensity || 0,
          signalCount: 1,
          latestTimestamp: new Date(signal.detected_at),
        })
      }
    }

    // Calculate velocity for each issue
    const risingIssues: VelocityData[] = []

    for (const [key, issue] of issueMap.entries()) {
      // Get historical snapshots for this topic (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const { data: snapshots, error: snapshotsError } = await supabase
        .from('signal_intensity_snapshots')
        .select('intensity, snapshot_at, signal_count')
        .eq('topic', issue.topic)
        .eq('product_area_id', issue.productAreaId)
        .gte('snapshot_at', twentyFourHoursAgo)
        .order('snapshot_at', { ascending: true })

      if (snapshotsError) {
        console.error('Error fetching snapshots:', snapshotsError)
        continue
      }

      // Calculate velocity (signals per hour)
      let velocity = 0
      let projectedIntensity = issue.totalIntensity
      let confidence = 0.5 // Default confidence
      let timeToSpreadHours = 0

      if (snapshots && snapshots.length >= 2) {
        // We have historical data - calculate real velocity
        const oldestSnapshot = snapshots[0]
        const newestSnapshot = snapshots[snapshots.length - 1]

        const timeDiffHours = (new Date(newestSnapshot.snapshot_at).getTime() - new Date(oldestSnapshot.snapshot_at).getTime()) / (1000 * 60 * 60)

        if (timeDiffHours > 0) {
          // Velocity = change in intensity per hour
          const intensityChange = newestSnapshot.intensity - oldestSnapshot.intensity
          velocity = intensityChange / timeDiffHours

          // Higher confidence if we have more data points
          confidence = Math.min(0.9, 0.5 + (snapshots.length / 20))

          // Project intensity 2 hours ahead based on velocity
          projectedIntensity = Math.max(issue.totalIntensity, issue.totalIntensity + (velocity * 2))

          // Calculate time to reach critical threshold (e.g., intensity > 100)
          const criticalThreshold = 100
          if (velocity > 0 && issue.totalIntensity < criticalThreshold) {
            timeToSpreadHours = (criticalThreshold - issue.totalIntensity) / velocity
          } else {
            timeToSpreadHours = 0 // Already critical or declining
          }
        }
      } else if (issue.signalCount > 1) {
        // No snapshots yet, but we have multiple signals in the current hour
        // Estimate velocity based on current hour activity
        const hoursSinceFirstSignal = (Date.now() - issue.latestTimestamp.getTime()) / (1000 * 60 * 60)
        if (hoursSinceFirstSignal > 0.1) { // At least 6 minutes of data
          velocity = issue.totalIntensity / Math.max(hoursSinceFirstSignal, 1)
          projectedIntensity = issue.totalIntensity + (velocity * 2)
          confidence = 0.3 // Lower confidence for new issues

          const criticalThreshold = 100
          if (velocity > 0 && issue.totalIntensity < criticalThreshold) {
            timeToSpreadHours = (criticalThreshold - issue.totalIntensity) / velocity
          }
        }
      }

      // Only include issues that are growing (velocity > threshold)
      if (velocity > 5) { // More than 5 signals/hour growth
        // Estimate affected users (could be based on intensity and product area data)
        // For now, use intensity * average users per signal (estimate: 50-200 users per signal)
        const avgUsersPerSignal = 100
        const affectedUsers = Math.round(issue.totalIntensity * avgUsersPerSignal)

        risingIssues.push({
          topic: issue.topic,
          productAreaId: issue.productAreaId,
          productAreaName: issue.productAreaName,
          color: issue.color,
          currentIntensity: Math.round(issue.totalIntensity),
          velocity: Math.round(velocity * 10) / 10, // Round to 1 decimal
          projectedIntensity: Math.round(projectedIntensity),
          timeToSpreadHours: Math.round(timeToSpreadHours * 10) / 10,
          affectedUsers,
          confidence: Math.round(confidence * 100) / 100,
        })
      }
    }

    // Sort by velocity (descending) - most rapidly growing issues first
    risingIssues.sort((a, b) => b.velocity - a.velocity)

    // Return top 5 rising issues
    const topRisingIssues = risingIssues.slice(0, 5)

    return NextResponse.json({
      success: true,
      risingIssues: topRisingIssues,
      totalRising: risingIssues.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in early warning system:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
