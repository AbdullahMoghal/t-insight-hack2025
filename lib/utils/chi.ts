/**
 * Customer Happiness Index (CHI) Calculation Utility
 *
 * CHI is calculated as a weighted average sentiment score (0-100):
 * - Sentiment values range from -1 (very negative) to +1 (very positive)
 * - Weights are based on signal intensity
 * - Final score is scaled to 0-100 for display
 */

import { createServiceClient } from '@/lib/supabase/service';

interface CHICache {
  value: number;
  timestamp: number;
  productAreaId?: string;
}

const chiCache = new Map<string, CHICache>();
const CACHE_DURATION_MS = 5 * 60 * 1000;

/**
 * Calculate Customer Happiness Index from signal data
 *
 * @param timeWindowMinutes - Time window to consider (default: 60 minutes)
 * @param productAreaId - Optional product area filter
 * @param useCache - Whether to use cached values (default: true)
 * @returns CHI score (0-100) or null if no data
 */
export async function calculateCHI(
  timeWindowMinutes: number = 60,
  productAreaId?: string,
  useCache: boolean = true
): Promise<number | null> {
  try {
    const cacheKey = `chi_${timeWindowMinutes}_${productAreaId || 'all'}`;

    if (useCache) {
      const cached = chiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        return cached.value;
      }
    }

    const supabase = createServiceClient();

    const timeThreshold = new Date(Date.now() - timeWindowMinutes * 60 * 1000).toISOString();

    let query = supabase
      .from('signals')
      .select('sentiment, intensity')
      .gte('detected_at', timeThreshold);

    if (productAreaId) {
      query = query.eq('product_area_id', productAreaId);
    }

    const { data: signals, error } = await query;

    if (error) {
      console.error('Error fetching signals for CHI calculation:', error);
      return null;
    }

    if (!signals || signals.length === 0) {
      return null;
    }

    let totalWeightedSentiment = 0;
    let totalIntensity = 0;

    for (const signal of signals) {
      const sentiment = signal.sentiment || 0;
      const intensity = signal.intensity || 1;

      totalWeightedSentiment += sentiment * intensity;
      totalIntensity += intensity;
    }

    if (totalIntensity === 0) {
      return null;
    }

    const avgSentiment = totalWeightedSentiment / totalIntensity;

    const chiScore = Math.round(((avgSentiment + 1) / 2) * 100);

    const clampedScore = Math.max(0, Math.min(100, chiScore));

    chiCache.set(cacheKey, {
      value: clampedScore,
      timestamp: Date.now(),
      productAreaId,
    });

    return clampedScore;
  } catch (error) {
    console.error('Error calculating CHI:', error);
    return null;
  }
}

/**
 * Get CHI trend by comparing current window to previous window
 *
 * @param timeWindowMinutes - Current time window
 * @param productAreaId - Optional product area filter
 * @returns Trend value (positive = improving, negative = declining)
 */
export async function getCHITrend(
  timeWindowMinutes: number = 60,
  productAreaId?: string
): Promise<number> {
  try {
    const currentCHI = await calculateCHI(timeWindowMinutes, productAreaId, false);

    if (currentCHI === null) {
      return 0;
    }

    const supabase = createServiceClient();

    const currentWindowStart = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const previousWindowStart = new Date(currentWindowStart.getTime() - timeWindowMinutes * 60 * 1000);

    let query = supabase
      .from('signals')
      .select('sentiment, intensity')
      .gte('detected_at', previousWindowStart.toISOString())
      .lt('detected_at', currentWindowStart.toISOString());

    if (productAreaId) {
      query = query.eq('product_area_id', productAreaId);
    }

    const { data: previousSignals, error } = await query;

    if (error || !previousSignals || previousSignals.length === 0) {
      return 0;
    }

    let totalWeightedSentiment = 0;
    let totalIntensity = 0;

    for (const signal of previousSignals) {
      const sentiment = signal.sentiment || 0;
      const intensity = signal.intensity || 1;

      totalWeightedSentiment += sentiment * intensity;
      totalIntensity += intensity;
    }

    if (totalIntensity === 0) {
      return 0;
    }

    const avgSentiment = totalWeightedSentiment / totalIntensity;
    const previousCHI = Math.round(((avgSentiment + 1) / 2) * 100);

    return currentCHI - previousCHI;
  } catch (error) {
    console.error('Error calculating CHI trend:', error);
    return 0;
  }
}

export function clearCHICache(): void {
  chiCache.clear();
}
