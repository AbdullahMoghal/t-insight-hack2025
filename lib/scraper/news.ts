/**
 * Google News RSS Scraper
 * Fetches news articles about T-Mobile from Google News RSS feeds
 */

import { XMLParser } from 'fast-xml-parser';

export interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

export interface NewsScraperResult {
  articles: NewsArticle[];
  source: string;
  fetched_at: string;
}

const SEARCH_QUERIES = [
  'T-Mobile outage',
  'T-Mobile network down',
  'T-Mobile billing issue',
];

const USER_AGENT = 'Mozilla/5.0 (compatible; T-Insight/1.0)';

/**
 * Fetch news for a single search query
 */
async function fetchNewsForQuery(query: string): Promise<NewsArticle[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Google News RSS returned ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();

    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const result = parser.parse(xmlText);

    // Extract items from RSS feed
    const items = result.rss?.channel?.item || [];
    const articles: NewsArticle[] = Array.isArray(items) ? items : [items];

    return articles.map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || '',
      description: item.description || '',
      source: item.source?.['@_url'] || item.source || 'Unknown',
    }));
  } catch (error) {
    console.error(`Error fetching news for "${query}":`, error);
    throw error;
  }
}

/**
 * Scrape all configured news queries
 */
export async function scrapeNews(): Promise<NewsScraperResult> {
  const allArticles: NewsArticle[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      const articles = await fetchNewsForQuery(query);
      allArticles.push(...articles);

      // Be polite: wait 1 second between requests
      if (SEARCH_QUERIES.indexOf(query) < SEARCH_QUERIES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to fetch news for "${query}", continuing...`);
    }
  }

  // Remove duplicates based on link
  const uniqueArticles = Array.from(
    new Map(allArticles.map(article => [article.link, article])).values()
  );

  return {
    articles: uniqueArticles,
    source: 'google-news',
    fetched_at: new Date().toISOString(),
  };
}
