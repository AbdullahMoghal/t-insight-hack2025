/**
 * Topic Detection and Keyword Extraction
 * Uses keyword-extractor to identify topics and map to product areas
 */

import keywordExtractor from 'keyword-extractor';

export interface TopicResult {
  topic: string; // Primary topic identified
  keywords: string[]; // Extracted keywords
  productArea: string; // Matched product area (Network, Mobile App, Billing, Home Internet)
  confidence: number; // 0 to 1, based on keyword match strength
}

/**
 * Product area keyword mappings (from CLAUDE.md)
 * These will be the fallback if database rules aren't available
 */
export const PRODUCT_AREA_RULES: Record<string, string[]> = {
  'Network': [
    'network', 'outage', 'coverage', 'signal', '5g', 'lte', '4g', 'down',
    'slow', 'speed', 'data', 'connection', 'connectivity', 'bars',
    'reception', 'tower', 'dropped', 'disconnected', 'roaming',
  ],
  'Mobile App': [
    'app', 'login', 'crash', 'tuesdays', 'account', 'mobile app',
    't-mobile app', 'application', 'interface', 'ui', 'ux',
    'feature', 'button', 'screen', 'loading', 'error message',
  ],
  'Billing': [
    'bill', 'charge', 'payment', 'price', 'plan', 'overcharge',
    'billing', 'invoice', 'cost', 'fee', 'refund', 'credit',
    'autopay', 'statement', 'balance', 'owe', 'paid', 'money',
  ],
  'Home Internet': [
    'home internet', 'gateway', 'wifi', 'router', '5g home',
    'home broadband', 'modem', 'wireless', 'internet service',
    'home network', 'tmhi', 't-mobile home', 'home router',
  ],
};

/**
 * Extract keywords from text using keyword-extractor
 */
function extractKeywords(text: string): string[] {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  try {
    const extraction_result = keywordExtractor.extract(text, {
      language: 'english',
      remove_digits: false, // Keep numbers (5G, 4G, etc.)
      return_changed_case: true, // Return lowercase for easier matching
      remove_duplicates: true,
    });

    return extraction_result || [];
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return [];
  }
}

/**
 * Match keywords against product area rules
 * Returns product area with highest match count and confidence
 */
function matchProductArea(keywords: string[]): { area: string; confidence: number } {
  if (keywords.length === 0) {
    return { area: 'General', confidence: 0 };
  }

  const scores: Record<string, number> = {};

  // Score each product area based on keyword matches
  for (const [area, areaKeywords] of Object.entries(PRODUCT_AREA_RULES)) {
    let matchCount = 0;

    for (const keyword of keywords) {
      for (const areaKeyword of areaKeywords) {
        // Check for exact match or substring match
        if (keyword === areaKeyword || keyword.includes(areaKeyword) || areaKeyword.includes(keyword)) {
          matchCount++;
          break; // Don't count the same keyword multiple times
        }
      }
    }

    scores[area] = matchCount;
  }

  // Find area with highest score
  let bestArea = 'General';
  let bestScore = 0;

  for (const [area, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestArea = area;
    }
  }

  // Calculate confidence (percentage of keywords that matched)
  const confidence = bestScore > 0 ? Math.min(1, bestScore / keywords.length) : 0;

  // If confidence is too low, return General
  if (confidence < 0.2) {
    return { area: 'General', confidence: 0 };
  }

  return { area: bestArea, confidence };
}

/**
 * Generate a topic string from keywords
 * Takes top 2-3 keywords and creates a readable topic
 */
function generateTopicString(keywords: string[], text: string): string {
  if (keywords.length === 0) {
    // Fallback: use first few words of text
    const words = text.split(/\s+/).slice(0, 5);
    return words.join(' ').toLowerCase();
  }

  // Take top 2-3 keywords
  const topKeywords = keywords.slice(0, 3);

  return topKeywords.join(' ');
}

/**
 * Detect topic and product area from text
 *
 * @param text - The text to analyze (Reddit post, review, comment, etc.)
 * @returns TopicResult with topic, keywords, product area, and confidence
 *
 * @example
 * ```ts
 * const result = detectTopic("Network outage in Dallas, 5G is completely down");
 * console.log(result.productArea); // "Network"
 * console.log(result.topic); // "network outage dallas"
 * console.log(result.keywords); // ["network", "outage", "dallas", "5g", "down"]
 * ```
 */
export function detectTopic(text: string): TopicResult {
  // Handle empty or invalid text
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      topic: '',
      keywords: [],
      productArea: 'General',
      confidence: 0,
    };
  }

  // Extract keywords
  const keywords = extractKeywords(text);

  // Match to product area
  const { area, confidence } = matchProductArea(keywords);

  // Generate topic string
  const topic = generateTopicString(keywords, text);

  return {
    topic,
    keywords,
    productArea: area,
    confidence,
  };
}

/**
 * Batch detect topics for multiple texts
 */
export function detectTopicBatch(texts: string[]): TopicResult[] {
  return texts.map(text => detectTopic(text));
}

/**
 * Match keywords to product area using database rules
 * This can be used when we have rules loaded from the database
 */
export function matchWithDatabaseRules(
  keywords: string[],
  productAreaRules: Array<{ name: string; keywords: string[] }>
): { area: string; confidence: number } {
  if (keywords.length === 0 || productAreaRules.length === 0) {
    return { area: 'General', confidence: 0 };
  }

  const scores: Record<string, number> = {};

  // Score each product area based on keyword matches
  for (const rule of productAreaRules) {
    let matchCount = 0;

    for (const keyword of keywords) {
      for (const ruleKeyword of rule.keywords) {
        if (keyword === ruleKeyword || keyword.includes(ruleKeyword) || ruleKeyword.includes(keyword)) {
          matchCount++;
          break;
        }
      }
    }

    scores[rule.name] = matchCount;
  }

  // Find area with highest score
  let bestArea = 'General';
  let bestScore = 0;

  for (const [area, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestArea = area;
    }
  }

  // Calculate confidence
  const confidence = bestScore > 0 ? Math.min(1, bestScore / keywords.length) : 0;

  if (confidence < 0.2) {
    return { area: 'General', confidence: 0 };
  }

  return { area: bestArea, confidence };
}
