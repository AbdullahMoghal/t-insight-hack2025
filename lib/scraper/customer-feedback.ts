/**
 * Customer Feedback Scraper (Hybrid Data Approach)
 *
 * Combines data from two sources:
 * 1. BestCompany.com: Live scraped reviews with JSON-LD + HTML location extraction
 * 2. Sample Data: 300 local comments with full city/state/date/time data
 *
 * Returns combined dataset for comprehensive customer feedback analysis.
 * If scraping fails, falls back to sample data only.
 */

import * as cheerio from 'cheerio';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface CustomerComment {
  comment: string;
  city?: string;
  state?: string;
  date?: string;
  time?: string;
}

export interface CustomerFeedbackResult {
  comments: CustomerComment[];
  source: 'customer-feedback';
  data_source: 'scraped' | 'sample' | 'combined';
  fetched_at: string;
}

const BESTCOMPANY_URL = 'https://bestcompany.com/cell-phones/t-mobile';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const SAMPLE_DATA_PATH = join(process.cwd(), 'lib/scraper/data/tmobile_sample_300.json');

/**
 * Attempt to scrape BestCompany.com for customer comments
 */
async function scrapeBestCompany(): Promise<CustomerComment[]> {
  try {
    const response = await fetch(BESTCOMPANY_URL, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const comments: CustomerComment[] = [];

    // Step 1: Extract reviews from JSON-LD for date information
    const jsonLdDates = new Map<string, string>(); // review text -> date

    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const jsonData = JSON.parse($(elem).html() || '{}');

        if (jsonData['@type'] === 'Product' && jsonData.review) {
          const reviews = Array.isArray(jsonData.review) ? jsonData.review : [jsonData.review];

          reviews.forEach((review: { reviewBody?: string; datePublished?: string }) => {
            if (review.reviewBody && review.datePublished) {
              // Map review text to its date
              jsonLdDates.set(review.reviewBody.trim(), review.datePublished);
            }
          });
        }
      } catch {
        // Skip invalid JSON
      }
    });

    // Step 2: Parse HTML to extract reviews with location
    // Look for review text divs
    $('div.whitespace-pre-line.break-words').each((_, elem) => {
      const reviewText = $(elem).text().trim();
      if (!reviewText || reviewText.length < 10) return;

      // Find the parent review container
      const container = $(elem).closest('div.p-6, div[class*="review"], div.rounded');

      // Look for location in the container
      // Location is in: <span class="text-text-secondary">Ormond Beach, FL</span>
      let city: string | undefined;
      let state: string | undefined;

      // Search for span with text-text-secondary class containing location
      container.find('span.text-text-secondary, .text-text-secondary').each((_, span) => {
        const locationText = $(span).text().trim();
        // Match "City, ST" pattern
        const locationMatch = locationText.match(/^([^,]+),\s*([A-Z]{2})$/);
        if (locationMatch) {
          city = locationMatch[1].trim();
          state = locationMatch[2].trim();
          return false; // break loop
        }
      });

      // If not found in span, try searching in the entire container text
      if (!city || !state) {
        const containerText = container.text();
        const locationMatch = containerText.match(/\b([A-Z][a-zA-Z\s.]+),\s+([A-Z]{2})\b/);
        if (locationMatch) {
          city = locationMatch[1].trim();
          state = locationMatch[2].trim();
        }
      }

      // Get date from JSON-LD if available
      const date = jsonLdDates.get(reviewText);

      comments.push({
        comment: reviewText,
        city,
        state,
        date,
      });
    });

    // If we found comments, return them
    if (comments.length > 0) {
      console.log(`✅ Successfully scraped ${comments.length} comments from BestCompany`);
      return comments;
    }

    // If no comments found, throw error to trigger fallback
    throw new Error('No comments found on page');

  } catch (error) {
    console.warn('⚠️  BestCompany scraping failed:', error instanceof Error ? error.message : error);
    throw error; // Re-throw to trigger fallback
  }
}

/**
 * Load sample data from local JSON file
 */
function loadSampleData(): CustomerComment[] {
  try {
    const fileContent = readFileSync(SAMPLE_DATA_PATH, 'utf-8');
    const data = JSON.parse(fileContent) as CustomerComment[];
    console.log(`📦 Loaded ${data.length} comments from sample data`);
    return data;
  } catch (error) {
    console.error('❌ Failed to load sample data:', error);
    throw new Error('Sample data file not found or invalid');
  }
}

/**
 * Main scraper function with hybrid data approach
 */
export async function scrapeCustomerFeedback(): Promise<CustomerFeedbackResult> {
  const allComments: CustomerComment[] = [];
  let dataSource: 'scraped' | 'sample' | 'combined';

  // Always load sample data (300 comments)
  const sampleComments = loadSampleData();
  console.log(`📦 Loaded ${sampleComments.length} sample comments`);

  // Try to scrape BestCompany.com
  try {
    const scrapedComments = await scrapeBestCompany();
    console.log(`🌐 Scraped ${scrapedComments.length} comments from BestCompany`);

    // Combine both datasets
    allComments.push(...scrapedComments);
    allComments.push(...sampleComments);
    dataSource = 'combined';

    console.log(`✅ Total comments: ${allComments.length} (${scrapedComments.length} scraped + ${sampleComments.length} sample)`);
  } catch (error) {
    // If scraping fails, use only sample data
    console.log('⚠️  Scraping failed, using sample data only:', error instanceof Error ? error.message : '');
    allComments.push(...sampleComments);
    dataSource = 'sample';
  }

  return {
    comments: allComments,
    source: 'customer-feedback',
    data_source: dataSource,
    fetched_at: new Date().toISOString(),
  };
}
