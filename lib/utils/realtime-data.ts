/**
 * Realtime Dashboard Data Utilities
 * Functions to fetch live data for realtime components
 */

import { createServiceClient } from '@/lib/supabase/service';
import { normalizeTopicText } from './dashboard-data';

/**
 * Realtime signal for activity feed
 */
export interface RealtimeSignal {
  id: string;
  topic: string;
  sentiment: number;
  source: string;
  timestamp: Date;
  productArea: string;
  color: string;
}

/**
 * Issue velocity data for velocity chart
 */
export interface IssueVelocityData {
  name: string; // Product area name
  growing: number; // Count of issues with positive velocity
  stable: number; // Count of issues with near-zero velocity
  declining: number; // Count of issues with negative velocity
  color: string;
}

/**
 * Sentiment distribution data
 */
export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

/**
 * Get recent signals for realtime activity feed
 * @param limit Number of signals to fetch (default 20)
 * @returns Array of recent signals with all details
 */
export async function getRealtimeSignals(limit: number = 20): Promise<RealtimeSignal[]> {
  try {
    const supabase = createServiceClient();

    // Fetch most recent signals with product area info
    const { data: signals, error } = await supabase
      .from('signals')
      .select(`
        id,
        topic,
        sentiment,
        source,
        detected_at,
        product_areas (
          name,
          color
        )
      `)
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching realtime signals:', error);
      return [];
    }

    if (!signals || signals.length === 0) {
      return [];
    }

    // Transform to expected format
    return signals.map(signal => ({
      id: signal.id,
      topic: normalizeTopicText(signal.topic),
      sentiment: signal.sentiment || 0,
      source: signal.source,
      timestamp: new Date(signal.detected_at),
      productArea: (signal.product_areas as any)?.name || 'Other',
      color: (signal.product_areas as any)?.color || '#E8258E',
    }));
  } catch (error) {
    console.error('Error getting realtime signals:', error);
    return [];
  }
}

/**
 * Get issue velocity data by product area
 * Categorizes issues as growing, stable, or declining based on velocity
 * @returns Array of velocity data per product area
 */
export async function getIssueVelocityByProductArea(): Promise<IssueVelocityData[]> {
  try {
    const supabase = createServiceClient();

    // Get all product areas
    const { data: productAreas, error: paError } = await supabase
      .from('product_areas')
      .select('id, name, color')
      .order('name');

    if (paError || !productAreas) {
      console.error('Error fetching product areas:', paError);
      return [];
    }

    // Get signals from last 24 hours grouped by topic and product area
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

    const { data: recentSignals, error: signalsError } = await supabase
      .from('signals')
      .select('topic, product_area_id, intensity, detected_at')
      .gte('detected_at', twentyFourHoursAgo)
      .order('detected_at', { ascending: true });

    if (signalsError || !recentSignals) {
      console.error('Error fetching signals for velocity:', signalsError);
      return [];
    }

    // Group signals by topic and product area, calculate velocity
    const issueVelocityByArea = new Map<string, { growing: number; stable: number; declining: number }>();

    for (const area of productAreas) {
      issueVelocityByArea.set(area.id, { growing: 0, stable: 0, declining: 0 });
    }

    // Group signals by topic + product area
    const issueMap = new Map<string, {
      earlier: number[];  // intensities before 12h ago
      recent: number[];   // intensities after 12h ago
      productAreaId: string;
    }>();

    for (const signal of recentSignals) {
      const key = `${signal.topic}::${signal.product_area_id}`;
      const signalTime = new Date(signal.detected_at);

      if (!issueMap.has(key)) {
        issueMap.set(key, {
          earlier: [],
          recent: [],
          productAreaId: signal.product_area_id || '',
        });
      }

      const issue = issueMap.get(key)!;

      // Split into earlier vs recent based on 12h threshold
      if (signalTime < new Date(twelveHoursAgo)) {
        issue.earlier.push(signal.intensity || 0);
      } else {
        issue.recent.push(signal.intensity || 0);
      }
    }

    // Calculate velocity for each issue
    for (const [key, issue] of issueMap.entries()) {
      if (!issue.productAreaId) continue;

      const velocityData = issueVelocityByArea.get(issue.productAreaId);
      if (!velocityData) continue;

      // Calculate average intensity for each period
      const earlierAvg = issue.earlier.length > 0
        ? issue.earlier.reduce((sum, val) => sum + val, 0) / issue.earlier.length
        : 0;

      const recentAvg = issue.recent.length > 0
        ? issue.recent.reduce((sum, val) => sum + val, 0) / issue.recent.length
        : 0;

      // Only calculate velocity if we have data from both periods
      if (issue.earlier.length > 0 && issue.recent.length > 0) {
        const velocityChange = recentAvg - earlierAvg;

        // Categorize based on velocity
        // Growing: increase > 2 intensity points
        // Declining: decrease > 2 intensity points
        // Stable: change within ±2 points
        if (velocityChange > 2) {
          velocityData.growing++;
        } else if (velocityChange < -2) {
          velocityData.declining++;
        } else {
          velocityData.stable++;
        }
      } else if (issue.recent.length > 0 && issue.earlier.length === 0) {
        // New issue in the recent period
        velocityData.growing++;
      } else if (issue.earlier.length > 0 && issue.recent.length === 0) {
        // Issue that stopped appearing
        velocityData.declining++;
      }
    }

    // Build result array
    return productAreas.map(area => ({
      name: area.name,
      growing: issueVelocityByArea.get(area.id)?.growing || 0,
      stable: issueVelocityByArea.get(area.id)?.stable || 0,
      declining: issueVelocityByArea.get(area.id)?.declining || 0,
      color: area.color,
    }));
  } catch (error) {
    console.error('Error calculating issue velocity:', error);
    return [];
  }
}

/**
 * Get sentiment distribution across all recent signals
 * @param timeWindowHours Time window to analyze (default 24 hours)
 * @returns Counts of positive, neutral, and negative signals
 */
export async function getSentimentDistribution(timeWindowHours: number = 24): Promise<SentimentDistribution> {
  try {
    const supabase = createServiceClient();

    const timeAgo = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000).toISOString();

    // Fetch all signals from time window
    const { data: signals, error } = await supabase
      .from('signals')
      .select('sentiment')
      .gte('detected_at', timeAgo);

    if (error || !signals) {
      console.error('Error fetching signals for sentiment distribution:', error);
      return { positive: 0, neutral: 0, negative: 0 };
    }

    // Count by sentiment ranges
    // Positive: sentiment > 0.2
    // Neutral: -0.2 <= sentiment <= 0.2
    // Negative: sentiment < -0.2
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    for (const signal of signals) {
      const sentiment = signal.sentiment || 0;

      if (sentiment > 0.2) {
        positive++;
      } else if (sentiment < -0.2) {
        negative++;
      } else {
        neutral++;
      }
    }

    return { positive, neutral, negative };
  } catch (error) {
    console.error('Error calculating sentiment distribution:', error);
    return { positive: 0, neutral: 0, negative: 0 };
  }
}
