/**
 * Advanced Dashboard Metrics
 * Calculate real-time metrics that go beyond basic CHI and signal counts
 */

import { createServiceClient } from '@/lib/supabase/service';

/**
 * Calculate signal trend (percentage change vs previous hour)
 * @returns { current, previous, percentageChange }
 */
export async function getSignalTrend(timeWindowHours: number = 1): Promise<{
  current: number;
  previous: number;
  percentageChange: number;
}> {
  try {
    const supabase = createServiceClient();

    // Current time window
    const currentWindowStart = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    const previousWindowStart = new Date(currentWindowStart.getTime() - timeWindowHours * 60 * 60 * 1000);

    // Count signals in current window
    const { count: currentCount, error: currentError } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true })
      .gte('detected_at', currentWindowStart.toISOString());

    if (currentError) {
      console.error('Error counting current signals:', currentError);
      return { current: 0, previous: 0, percentageChange: 0 };
    }

    // Count signals in previous window
    const { count: previousCount, error: previousError } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true })
      .gte('detected_at', previousWindowStart.toISOString())
      .lt('detected_at', currentWindowStart.toISOString());

    if (previousError) {
      console.error('Error counting previous signals:', previousError);
      return { current: currentCount || 0, previous: 0, percentageChange: 0 };
    }

    // Calculate percentage change
    const current = currentCount || 0;
    const previous = previousCount || 0;
    const percentageChange = previous > 0
      ? Math.round(((current - previous) / previous) * 100)
      : 0;

    return {
      current,
      previous,
      percentageChange,
    };
  } catch (error) {
    console.error('Error calculating signal trend:', error);
    return { current: 0, previous: 0, percentageChange: 0 };
  }
}

/**
 * Calculate new issues in the last hour (issues that didn't exist in the previous hour)
 * @returns { newIssuesCount, totalIssues }
 */
export async function getNewIssuesCount(timeWindowHours: number = 1): Promise<{
  newIssuesCount: number;
  totalIssues: number;
}> {
  try {
    const supabase = createServiceClient();

    const currentWindowStart = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    const previousWindowStart = new Date(currentWindowStart.getTime() - timeWindowHours * 60 * 60 * 1000);

    // Get topics from current window
    const { data: currentSignals, error: currentError } = await supabase
      .from('signals')
      .select('topic, product_area_id')
      .gte('detected_at', currentWindowStart.toISOString());

    if (currentError || !currentSignals) {
      console.error('Error fetching current signals:', currentError);
      return { newIssuesCount: 0, totalIssues: 0 };
    }

    // Get topics from previous window
    const { data: previousSignals, error: previousError } = await supabase
      .from('signals')
      .select('topic, product_area_id')
      .gte('detected_at', previousWindowStart.toISOString())
      .lt('detected_at', currentWindowStart.toISOString());

    if (previousError || !previousSignals) {
      console.error('Error fetching previous signals:', previousError);
      return { newIssuesCount: 0, totalIssues: 0 };
    }

    // Create sets of unique issues (topic + product_area_id)
    const currentIssues = new Set(
      currentSignals.map(s => `${s.topic}::${s.product_area_id}`)
    );

    const previousIssues = new Set(
      previousSignals.map(s => `${s.topic}::${s.product_area_id}`)
    );

    // Count new issues (in current but not in previous)
    const newIssues = Array.from(currentIssues).filter(issue => !previousIssues.has(issue));

    return {
      newIssuesCount: newIssues.length,
      totalIssues: currentIssues.size,
    };
  } catch (error) {
    console.error('Error calculating new issues:', error);
    return { newIssuesCount: 0, totalIssues: 0 };
  }
}

/**
 * Calculate average response time from signal detection to opportunity creation
 * @returns { averageMinutes, trend (vs previous period), sampleSize }
 */
export async function getAverageResponseTime(): Promise<{
  averageMinutes: number;
  trendMinutes: number; // Positive = slower, Negative = faster
  sampleSize: number;
}> {
  try {
    const supabase = createServiceClient();

    // Get opportunities created in the last 7 days with their linked signals
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString();

    const { data: opportunities, error: oppError } = await supabase
      .from('opportunity_cards')
      .select('id, created_at, meta, derived_from_signal_ids')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false });

    if (oppError || !opportunities || opportunities.length === 0) {
      console.error('Error fetching opportunities:', oppError);
      return { averageMinutes: 0, trendMinutes: 0, sampleSize: 0 };
    }

    // Calculate response times for each opportunity
    const recentResponseTimes: number[] = []; // Last 3.5 days
    const olderResponseTimes: number[] = []; // 3.5-7 days ago

    for (const opp of opportunities) {
      // Get the topic from meta to find related signals
      const topic = (opp.meta as any)?.topic;
      if (!topic) continue;

      // Find the earliest signal for this topic
      const { data: signals, error: signalError } = await supabase
        .from('signals')
        .select('detected_at')
        .eq('topic', topic)
        .order('detected_at', { ascending: true })
        .limit(1);

      if (signalError || !signals || signals.length === 0) continue;

      const firstSignalTime = new Date(signals[0].detected_at);
      const opportunityCreatedTime = new Date(opp.created_at);
      const responseTimeMinutes = (opportunityCreatedTime.getTime() - firstSignalTime.getTime()) / (1000 * 60);

      // Only count reasonable response times (< 7 days)
      if (responseTimeMinutes > 0 && responseTimeMinutes < 7 * 24 * 60) {
        const oppCreatedAt = new Date(opp.created_at);

        if (oppCreatedAt >= new Date(threeDaysAgo)) {
          recentResponseTimes.push(responseTimeMinutes);
        } else {
          olderResponseTimes.push(responseTimeMinutes);
        }
      }
    }

    // Calculate averages
    const recentAvg = recentResponseTimes.length > 0
      ? recentResponseTimes.reduce((sum, val) => sum + val, 0) / recentResponseTimes.length
      : 0;

    const olderAvg = olderResponseTimes.length > 0
      ? olderResponseTimes.reduce((sum, val) => sum + val, 0) / olderResponseTimes.length
      : 0;

    // Calculate trend (positive = slower, negative = faster)
    const trendMinutes = olderAvg > 0 ? recentAvg - olderAvg : 0;

    return {
      averageMinutes: Math.round(recentAvg),
      trendMinutes: Math.round(trendMinutes),
      sampleSize: recentResponseTimes.length,
    };
  } catch (error) {
    console.error('Error calculating response time:', error);
    return { averageMinutes: 0, trendMinutes: 0, sampleSize: 0 };
  }
}

/**
 * Get count of positive trends (product areas with improving CHI)
 * @returns Number of product areas with positive CHI trend
 *
 * OPTIMIZATION: This function is optimized to calculate all trends in parallel
 * instead of sequentially to reduce total API time.
 */
export async function getPositiveTrendsCount(): Promise<number> {
  try {
    const supabase = createServiceClient();

    // Get all product areas
    const { data: productAreas, error: paError } = await supabase
      .from('product_areas')
      .select('id');

    if (paError || !productAreas) {
      console.error('Error fetching product areas:', paError);
      return 0;
    }

    // Import getCHITrend
    const { getCHITrend } = await import('./chi');

    // OPTIMIZATION: Calculate all trends in parallel instead of sequentially
    const trendPromises = productAreas.map(area => getCHITrend(60, area.id));
    const trends = await Promise.all(trendPromises);

    // Count positive trends
    const positiveTrends = trends.filter(trend => trend > 0).length;

    return positiveTrends;
  } catch (error) {
    console.error('Error calculating positive trends:', error);
    return 0;
  }
}

/**
 * Format minutes into human-readable time
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } else {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
}
