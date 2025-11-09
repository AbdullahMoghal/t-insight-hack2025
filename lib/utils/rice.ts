/**
 * RICE Scoring Utilities
 *
 * RICE = (Reach × Impact × Confidence) / Effort
 * Used for prioritizing PM opportunities based on customer signals
 */

export interface Signal {
  id: string
  intensity: number
  sentiment: number
  topic: string
  product_area_id?: string
}

export interface RICEComponents {
  reach: number
  impact: number
  confidence: number
  effort: number
}

export interface RICEResult extends RICEComponents {
  score: number
}

/**
 * Calculate RICE score from components
 * @param reach - Total signal intensity (affected users)
 * @param impact - Impact score 1-10
 * @param confidence - Confidence level 0-1
 * @param effort - Effort estimate 1-10
 * @returns RICE score (rounded to 1 decimal)
 */
export function calculateRICE(
  reach: number,
  impact: number,
  confidence: number,
  effort: number
): number {
  if (effort === 0) return 0
  const score = (reach * impact * confidence) / effort
  return Math.round(score * 10) / 10
}

/**
 * Calculate reach from signal intensities
 * Reach = sum of all signal intensities linked to this opportunity
 * @param signals - Array of signals
 * @returns Total reach (signal intensity sum)
 */
export function calculateReach(signals: Signal[]): number {
  return signals.reduce((sum, signal) => sum + (signal.intensity || 1), 0)
}

/**
 * Calculate impact score based on product area and sentiment severity
 * @param productAreaName - Product area name
 * @param averageSentiment - Average sentiment of signals (-1 to 1)
 * @returns Impact score 1-10
 */
export function calculateImpact(
  productAreaName: string,
  averageSentiment: number
): number {
  // Base impact by product area
  const baseImpact: Record<string, number> = {
    'Network': 9,        // Network issues are critical
    'Billing': 8,        // Billing affects revenue
    'Home Internet': 7,  // Growing product area
    'Mobile App': 6,     // Important but less critical
    'General': 5,        // Default
  }

  const base = baseImpact[productAreaName] || 5

  // Adjust based on sentiment severity
  // Very negative sentiment (-0.7 to -1) increases impact
  if (averageSentiment <= -0.7) {
    return Math.min(10, base + 2)
  }
  // Moderately negative (-0.4 to -0.7) adds slight boost
  if (averageSentiment <= -0.4) {
    return Math.min(10, base + 1)
  }
  // Neutral or positive doesn't boost
  return base
}

/**
 * Determine severity level based on sentiment and intensity
 * @param averageSentiment - Average sentiment (-1 to 1)
 * @param totalIntensity - Total signal intensity
 * @returns Severity level
 */
export function determineSeverity(
  averageSentiment: number,
  totalIntensity: number
): 'low' | 'medium' | 'high' | 'critical' {
  // Critical: Very negative sentiment + high intensity
  if (averageSentiment <= -0.7 && totalIntensity >= 100) {
    return 'critical'
  }

  // High: Moderately negative + high intensity OR very negative + medium intensity
  if (
    (averageSentiment <= -0.5 && totalIntensity >= 75) ||
    (averageSentiment <= -0.7 && totalIntensity >= 50)
  ) {
    return 'high'
  }

  // Medium: Some negativity with decent intensity
  if (
    (averageSentiment <= -0.3 && totalIntensity >= 30) ||
    (averageSentiment <= -0.5 && totalIntensity >= 20)
  ) {
    return 'medium'
  }

  // Low: Everything else
  return 'low'
}

/**
 * Get color for RICE score visualization
 * @param score - RICE score
 * @returns Tailwind color class
 */
export function getRICEColor(score: number): string {
  if (score >= 100) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 50) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (score >= 20) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-gray-600 bg-gray-50 border-gray-200'
}

/**
 * Get severity color class
 * @param severity - Severity level
 * @returns Tailwind color class
 */
export function getSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
  }
  return colors[severity]
}

/**
 * Get status color class
 * @param status - Opportunity status
 * @returns Tailwind color class
 */
export function getStatusColor(status: 'new' | 'in-progress' | 'done'): string {
  const colors = {
    'new': 'bg-blue-100 text-blue-800 border-blue-200',
    'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'done': 'bg-green-100 text-green-800 border-green-200',
  }
  return colors[status]
}

/**
 * Format status for display
 * @param status - Opportunity status
 * @returns Formatted status string
 */
export function formatStatus(status: 'new' | 'in-progress' | 'done'): string {
  const formatted = {
    'new': 'New',
    'in-progress': 'In Progress',
    'done': 'Done',
  }
  return formatted[status]
}

/**
 * Calculate full RICE components from signals
 * @param signals - Array of signals linked to opportunity
 * @param productAreaName - Product area name
 * @param effort - Effort estimate (default 5)
 * @param confidence - Confidence level (default 0.7)
 * @returns Complete RICE result
 */
export function calculateFullRICE(
  signals: Signal[],
  productAreaName: string,
  effort: number = 5,
  confidence: number = 0.7
): RICEResult {
  const reach = calculateReach(signals)
  const averageSentiment = signals.length > 0
    ? signals.reduce((sum, s) => sum + s.sentiment, 0) / signals.length
    : 0
  const impact = calculateImpact(productAreaName, averageSentiment)
  const score = calculateRICE(reach, impact, confidence, effort)

  return {
    reach,
    impact,
    confidence,
    effort,
    score,
  }
}
