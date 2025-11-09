/**
 * Signal Deduplication
 * Groups similar signals within a time window and calculates intensity
 */

export interface Signal {
  id?: string;
  topic: string;
  keywords: string[];
  sentiment: number;
  detected_at: Date | string;
  source: string;
  product_area?: string;
  meta?: any;
}

export interface DuplicateGroup {
  representative: Signal; // The signal to keep/insert
  duplicates: Signal[]; // Similar signals to aggregate
  intensity: number; // Count of signals in this group
  avgSentiment: number; // Average sentiment of the group
}

/**
 * Time window for grouping signals (in milliseconds)
 * Default: 30 minutes
 */
const TIME_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Minimum keyword overlap ratio to consider signals as duplicates
 * 0.5 = at least 50% of keywords must match
 */
const KEYWORD_SIMILARITY_THRESHOLD = 0.5;

/**
 * Calculate keyword similarity between two signals
 * Returns a score between 0 and 1
 */
function calculateKeywordSimilarity(keywords1: string[], keywords2: string[]): number {
  if (keywords1.length === 0 || keywords2.length === 0) {
    return 0;
  }

  // Count how many keywords are in both sets
  const set1 = new Set(keywords1.map(k => k.toLowerCase()));
  const set2 = new Set(keywords2.map(k => k.toLowerCase()));

  let matchCount = 0;
  for (const keyword of set1) {
    if (set2.has(keyword)) {
      matchCount++;
    }
  }

  // Jaccard similarity: intersection / union
  const union = new Set([...set1, ...set2]);
  return matchCount / union.size;
}

/**
 * Check if two signals are within the time window
 */
function isWithinTimeWindow(date1: Date | string, date2: Date | string): boolean {
  const time1 = typeof date1 === 'string' ? new Date(date1).getTime() : date1.getTime();
  const time2 = typeof date2 === 'string' ? new Date(date2).getTime() : date2.getTime();

  return Math.abs(time1 - time2) <= TIME_WINDOW_MS;
}

/**
 * Check if two signals are duplicates based on:
 * - Same topic (or highly similar keywords)
 * - Same product area
 * - Within time window
 */
function areDuplicates(signal1: Signal, signal2: Signal): boolean {
  // Must be in the same product area
  if (signal1.product_area !== signal2.product_area) {
    return false;
  }

  // Must be within time window
  if (!isWithinTimeWindow(signal1.detected_at, signal2.detected_at)) {
    return false;
  }

  // Check keyword similarity
  const similarity = calculateKeywordSimilarity(signal1.keywords, signal2.keywords);

  return similarity >= KEYWORD_SIMILARITY_THRESHOLD;
}

/**
 * Select the representative signal from a group
 * Chooses the one with:
 * 1. Highest sentiment magnitude (most extreme positive or negative)
 * 2. If tied, earliest timestamp
 */
function selectRepresentative(signals: Signal[]): Signal {
  if (signals.length === 0) {
    throw new Error('Cannot select representative from empty group');
  }

  if (signals.length === 1) {
    return signals[0];
  }

  // Sort by sentiment magnitude (absolute value), then by time
  const sorted = [...signals].sort((a, b) => {
    const magnitudeA = Math.abs(a.sentiment);
    const magnitudeB = Math.abs(b.sentiment);

    if (magnitudeA !== magnitudeB) {
      return magnitudeB - magnitudeA; // Higher magnitude first
    }

    // If same magnitude, prefer earlier timestamp
    const timeA = typeof a.detected_at === 'string' ? new Date(a.detected_at).getTime() : a.detected_at.getTime();
    const timeB = typeof b.detected_at === 'string' ? new Date(b.detected_at).getTime() : b.detected_at.getTime();
    return timeA - timeB;
  });

  return sorted[0];
}

/**
 * Calculate average sentiment of a group
 */
function calculateAvgSentiment(signals: Signal[]): number {
  if (signals.length === 0) return 0;

  const sum = signals.reduce((acc, signal) => acc + signal.sentiment, 0);
  return sum / signals.length;
}

/**
 * Group signals by similarity and time window
 *
 * @param signals - Array of signals to deduplicate
 * @returns Array of DuplicateGroups with representative, duplicates, and intensity
 *
 * @example
 * ```ts
 * const signals = [
 *   { topic: "network outage", keywords: ["network", "outage"], sentiment: -0.8, detected_at: new Date(), product_area: "Network" },
 *   { topic: "network down", keywords: ["network", "down"], sentiment: -0.9, detected_at: new Date(), product_area: "Network" },
 *   { topic: "billing issue", keywords: ["bill", "charge"], sentiment: -0.6, detected_at: new Date(), product_area: "Billing" },
 * ];
 *
 * const groups = groupDuplicates(signals);
 * // Returns:
 * // [
 * //   { representative: signal[1], duplicates: [signal[0], signal[1]], intensity: 2, avgSentiment: -0.85 },
 * //   { representative: signal[2], duplicates: [signal[2]], intensity: 1, avgSentiment: -0.6 }
 * // ]
 * ```
 */
export function groupDuplicates(signals: Signal[]): DuplicateGroup[] {
  if (signals.length === 0) {
    return [];
  }

  // Track which signals have been grouped
  const grouped = new Set<number>();
  const groups: DuplicateGroup[] = [];

  // For each signal, find all duplicates
  for (let i = 0; i < signals.length; i++) {
    if (grouped.has(i)) continue; // Already in a group

    const currentSignal = signals[i];
    const duplicates: Signal[] = [currentSignal];

    // Find all signals that are duplicates of this one
    for (let j = i + 1; j < signals.length; j++) {
      if (grouped.has(j)) continue;

      const otherSignal = signals[j];

      if (areDuplicates(currentSignal, otherSignal)) {
        duplicates.push(otherSignal);
        grouped.add(j);
      }
    }

    grouped.add(i);

    // Create group
    const representative = selectRepresentative(duplicates);
    const avgSentiment = calculateAvgSentiment(duplicates);

    groups.push({
      representative,
      duplicates,
      intensity: duplicates.length,
      avgSentiment,
    });
  }

  return groups;
}

/**
 * Check if a new signal is a duplicate of existing signals in the database
 * This is used when processing new signals against already stored ones
 *
 * @param newSignal - The new signal to check
 * @param existingSignals - Signals from database within time window
 * @returns The existing signal it's a duplicate of, or null if unique
 */
export function findExistingDuplicate(
  newSignal: Signal,
  existingSignals: Signal[]
): Signal | null {
  for (const existing of existingSignals) {
    if (areDuplicates(newSignal, existing)) {
      return existing;
    }
  }

  return null;
}

/**
 * Merge two signals (used when updating intensity of an existing signal)
 */
export function mergeSignals(existing: Signal, newSignal: Signal): Signal {
  return {
    ...existing,
    // Update sentiment to be average of both
    sentiment: (existing.sentiment + newSignal.sentiment) / 2,
    // Keep earliest timestamp
    detected_at: new Date(existing.detected_at) < new Date(newSignal.detected_at)
      ? existing.detected_at
      : newSignal.detected_at,
    // Merge metadata
    meta: {
      ...existing.meta,
      duplicate_count: (existing.meta?.duplicate_count || 1) + 1,
      latest_source: newSignal.source,
      latest_detected: newSignal.detected_at,
    },
  };
}
