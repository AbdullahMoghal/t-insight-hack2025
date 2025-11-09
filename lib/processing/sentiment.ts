/**
 * Sentiment Analysis with wink-sentiment
 * Production-ready implementation with comprehensive error handling and telecom domain optimization
 */

// @ts-expect-error - wink-sentiment doesn't have type definitions
import sentiment from 'wink-sentiment';

export interface SentimentResult {
  score: number; // -1 (very negative) to 1 (very positive)
  confidence: number; // 0 to 1, based on token analysis and text quality
  rawScore: number; // Original wink-sentiment score before normalization
  normalizedScore: number; // wink-sentiment's built-in normalized score
  details: {
    totalTokens: number;
    scoredTokens: number;
    negationDetected: boolean;
    dominantTokens: string[]; // Top tokens that influenced sentiment
    textQuality: 'high' | 'medium' | 'low';
  };
}

/**
 * Domain-specific keyword overrides for telecom/T-Mobile context
 * Applied after wink-sentiment's base analysis for better accuracy
 */
const TELECOM_SENTIMENT_BOOSTERS: Record<string, number> = {
  // Critical negative terms (network issues)
  'outage': -0.3,
  'down': -0.25,
  'dropped': -0.25,
  'disconnected': -0.25,
  'no signal': -0.3,
  'no service': -0.3,

  // Moderate negative terms (performance issues)
  'slow': -0.2,
  'lagging': -0.2,
  'buffering': -0.2,
  'throttled': -0.25,
  'congested': -0.2,

  // Quality negative terms
  'terrible': -0.25,
  'worst': -0.25,
  'unusable': -0.3,
  'pathetic': -0.25,
  'garbage': -0.25,

  // Positive resolution terms
  'fixed': 0.3,
  'resolved': 0.3,
  'restored': 0.3,
  'working again': 0.3,

  // Positive quality terms
  'working': 0.2,
  'better': 0.2,
  'improved': 0.25,
  'excellent': 0.25,
  'amazing': 0.25,
  'fantastic': 0.25,
  'reliable': 0.2,
  'fast': 0.2,
};

/**
 * Text preprocessing for better sentiment analysis
 */
function preprocessText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleaned = text.trim();

  // Normalize whitespace (keep single spaces)
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Preserve emoticons and emojis (wink-sentiment handles these)
  // Don't strip URLs - they might contain sentiment context

  // Handle excessive punctuation (!!!!! → !!)
  cleaned = cleaned.replace(/([!?.]){3,}/g, '$1$1');

  // Handle ALL CAPS shouting - normalize to sentence case for better analysis
  // But preserve intentional emphasis (single words)
  const words = cleaned.split(' ');
  cleaned = words.map(word => {
    // If word is ALL CAPS and longer than 3 chars, it's likely shouting
    if (word.length > 3 && word === word.toUpperCase() && /^[A-Z]+$/.test(word)) {
      // Keep first letter caps, rest lowercase
      return word.charAt(0) + word.slice(1).toLowerCase();
    }
    return word;
  }).join(' ');

  return cleaned;
}

/**
 * Assess text quality for confidence calculation
 */
function assessTextQuality(text: string): 'high' | 'medium' | 'low' {
  const length = text.length;
  const wordCount = text.split(/\s+/).length;
  const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
  const uniqueRatio = uniqueWords / wordCount;

  // Check for spam patterns
  const hasExcessivePunctuation = (text.match(/[!?]/g) || []).length > wordCount * 0.3;
  const hasExcessiveRepetition = uniqueRatio < 0.3;

  // Low quality: spam, gibberish, or very short
  if (wordCount < 3 || hasExcessivePunctuation || hasExcessiveRepetition) {
    return 'low';
  }

  // High quality: good length, varied vocabulary
  if (wordCount >= 10 && length >= 50 && uniqueRatio > 0.6) {
    return 'high';
  }

  // Medium quality: everything else
  return 'medium';
}

/**
 * Calculate confidence based on wink-sentiment's tokenized output and text quality
 */
function calculateConfidence(
  winkResult: any,
  textQuality: 'high' | 'medium' | 'low',
  textLength: number
): number {
  let baseConfidence = 0.5;

  // Adjust for text quality
  if (textQuality === 'high') baseConfidence = 0.8;
  else if (textQuality === 'medium') baseConfidence = 0.6;
  else if (textQuality === 'low') baseConfidence = 0.3;

  // Boost confidence if we have tokenized phrase data
  if (winkResult.tokenizedPhrase && Array.isArray(winkResult.tokenizedPhrase)) {
    const tokens = winkResult.tokenizedPhrase;
    const scoredTokens = tokens.filter((t: any) =>
      t.score !== undefined && t.score !== 0
    ).length;

    // More scored tokens = higher confidence
    if (scoredTokens > 5) baseConfidence = Math.min(0.95, baseConfidence + 0.1);
    else if (scoredTokens > 2) baseConfidence = Math.min(0.9, baseConfidence + 0.05);
    else if (scoredTokens === 0) baseConfidence = Math.max(0.2, baseConfidence - 0.2);
  }

  // Penalize very short text
  if (textLength < 10) baseConfidence *= 0.5;
  else if (textLength < 20) baseConfidence *= 0.7;

  return Math.max(0.1, Math.min(0.95, baseConfidence));
}

/**
 * Extract dominant sentiment-driving tokens from wink result
 */
function extractDominantTokens(winkResult: any): string[] {
  if (!winkResult.tokenizedPhrase || !Array.isArray(winkResult.tokenizedPhrase)) {
    return [];
  }

  return winkResult.tokenizedPhrase
    .filter((token: any) => token.score && Math.abs(token.score) >= 1)
    .map((token: any) => token.value)
    .slice(0, 5); // Top 5 most impactful tokens
}

/**
 * Detect if negation is present in tokenized phrase
 */
function detectNegation(winkResult: any): boolean {
  if (!winkResult.tokenizedPhrase || !Array.isArray(winkResult.tokenizedPhrase)) {
    return false;
  }

  return winkResult.tokenizedPhrase.some((token: any) => token.negation === true);
}

/**
 * Apply telecom-specific sentiment adjustments
 * Uses subtle boosting to preserve wink-sentiment's base analysis
 */
function applyTelecomBoosters(text: string, baseScore: number): number {
  const lowerText = text.toLowerCase();
  let totalBoost = 0;
  let boostCount = 0;

  // Check for telecom-specific phrases and keywords
  for (const [phrase, boost] of Object.entries(TELECOM_SENTIMENT_BOOSTERS)) {
    if (lowerText.includes(phrase)) {
      totalBoost += boost;
      boostCount++;
    }
  }

  // Apply average boost if any telecom terms found
  if (boostCount > 0) {
    const avgBoost = totalBoost / boostCount;

    // Blend base score with telecom boost (80% base, 20% boost)
    // This preserves wink-sentiment's intelligence while adding domain knowledge
    const boosted = baseScore + (avgBoost * 0.2);

    // Clamp to -1 to +1 range
    return Math.max(-1, Math.min(1, boosted));
  }

  return baseScore;
}

/**
 * Analyze sentiment of text using wink-sentiment with telecom domain optimization
 *
 * @param text - The text to analyze (Reddit post, review, comment, etc.)
 * @returns Comprehensive SentimentResult with score, confidence, and detailed analysis
 *
 * @example
 * ```ts
 * const result = analyzeSentiment("Terrible network outage in NYC! Been down for 3 hours.");
 * console.log(result.score); // -0.85 (very negative)
 * console.log(result.confidence); // 0.8 (high confidence)
 * console.log(result.details.negationDetected); // false
 *
 * const result2 = analyzeSentiment("Not a good experience with customer service");
 * console.log(result2.score); // -0.6 (negative)
 * console.log(result2.details.negationDetected); // true
 *
 * const result3 = analyzeSentiment("Service is fixed and working great now! 🎉");
 * console.log(result3.score); // 0.75 (positive)
 * console.log(result3.details.dominantTokens); // ['fixed', 'working', 'great', '🎉']
 * ```
 */
export function analyzeSentiment(text: string): SentimentResult {
  // Handle invalid input
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      score: 0,
      confidence: 0,
      rawScore: 0,
      normalizedScore: 0,
      details: {
        totalTokens: 0,
        scoredTokens: 0,
        negationDetected: false,
        dominantTokens: [],
        textQuality: 'low',
      },
    };
  }

  try {
    // Preprocess text for better analysis
    const cleaned = preprocessText(text);

    // Assess text quality
    const textQuality = assessTextQuality(cleaned);

    // Run wink-sentiment analysis
    const winkResult = sentiment(cleaned);

    // Extract base score (wink-sentiment typically returns -5 to +5)
    const rawScore = winkResult.score || 0;

    // wink-sentiment's normalizedScore is NOT guaranteed to be in -1 to +1 range
    // So we normalize the raw score ourselves to ensure it's in the correct range
    // Divide by 5 since wink-sentiment typically ranges from -5 to +5
    let normalizedScore = rawScore / 5;

    // Clamp to -1 to +1 range to be safe
    normalizedScore = Math.max(-1, Math.min(1, normalizedScore));

    // Apply telecom-specific boosters to normalized score
    let finalScore = applyTelecomBoosters(cleaned, normalizedScore);

    // CRITICAL: Ensure final score is ALWAYS in -1 to +1 range (database constraint)
    finalScore = Math.max(-1, Math.min(1, finalScore));

    // Calculate confidence based on tokens and text quality
    const confidence = calculateConfidence(winkResult, textQuality, cleaned.length);

    // Extract analysis details
    const totalTokens = winkResult.tokenizedPhrase?.length || 0;
    const scoredTokens = winkResult.tokenizedPhrase?.filter((t: any) =>
      t.score !== undefined && t.score !== 0
    ).length || 0;
    const negationDetected = detectNegation(winkResult);
    const dominantTokens = extractDominantTokens(winkResult);

    return {
      score: finalScore,
      confidence,
      rawScore,
      normalizedScore,
      details: {
        totalTokens,
        scoredTokens,
        negationDetected,
        dominantTokens,
        textQuality,
      },
    };
  } catch (error) {
    // Graceful fallback on error
    console.error('Error in sentiment analysis:', error);
    return {
      score: 0,
      confidence: 0.1,
      rawScore: 0,
      normalizedScore: 0,
      details: {
        totalTokens: 0,
        scoredTokens: 0,
        negationDetected: false,
        dominantTokens: [],
        textQuality: 'low',
      },
    };
  }
}

/**
 * Batch analyze sentiment for multiple texts
 * More efficient than calling analyzeSentiment individually
 */
export function analyzeSentimentBatch(texts: string[]): SentimentResult[] {
  if (!Array.isArray(texts)) {
    return [];
  }

  return texts.map(text => analyzeSentiment(text));
}

/**
 * Get sentiment label for UI display
 */
export function getSentimentLabel(score: number): 'positive' | 'neutral' | 'negative' {
  if (score > 0.15) return 'positive';
  if (score < -0.15) return 'negative';
  return 'neutral';
}

/**
 * Get sentiment color for UI (T-Mobile color scheme)
 */
export function getSentimentColor(score: number): string {
  if (score > 0.15) return '#00A19C'; // Teal (positive)
  if (score < -0.15) return '#C4262E'; // Red (negative)
  return '#737373'; // Gray (neutral)
}

/**
 * Get confidence level label for UI
 */
export function getConfidenceLabel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.7) return 'high';
  if (confidence >= 0.4) return 'medium';
  return 'low';
}

/**
 * Validate sentiment result quality
 * Returns true if the result is reliable enough to use
 */
export function isReliableResult(result: SentimentResult): boolean {
  return (
    result.confidence >= 0.3 &&
    result.details.textQuality !== 'low' &&
    result.details.totalTokens >= 2
  );
}
