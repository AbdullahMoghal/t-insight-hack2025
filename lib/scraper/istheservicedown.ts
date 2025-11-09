/**
 * IsTheServiceDown Scraper
 * Fetches T-Mobile service status and problem breakdown
 */

import * as cheerio from 'cheerio';

export interface ServiceStatus {
  status: string;
  status_message?: string;
  problems: {
    type: string;
    percentage: number;
  }[];
  social_mentions: {
    text: string;
    timestamp: string;
  }[];
}

export interface IsTheServiceDownResult {
  status_data: ServiceStatus;
  source: string;
  fetched_at: string;
}

const URL = 'https://istheservicedown.com/problems/t-mobile';
const USER_AGENT = 'Mozilla/5.0 (compatible; InsighT/1.0)';

/**
 * Scrape IsTheServiceDown for T-Mobile status
 */
export async function scrapeIsTheServiceDown(): Promise<IsTheServiceDownResult> {
  try {
    const response = await fetch(URL, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`IsTheServiceDown returned ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let status = 'unknown';
    let status_message = '';

    const mainHeading = $('h1, h2').first().text().trim();
    status_message = mainHeading;

    const pageText = $('body').text();
    const pageTextLower = pageText.toLowerCase();

    if (pageTextLower.includes('no problems detected') ||
        pageTextLower.includes("haven't detected any problems") ||
        pageTextLower.includes("at the moment, we haven't detected")) {
      status = 'ok';
      status_message = 'No problems detected at T-Mobile';

    } else if (pageTextLower.includes('is having issues since') ||
               pageTextLower.includes('is having problems since') ||
               pageTextLower.includes('is experiencing issues')) {
      status = 'issues';

      $('*').each((_, elem) => {
        const text = $(elem).text().trim();
        if (text.length > 20 && text.length < 200 &&
            (text.toLowerCase().includes('is having issues since') ||
             text.toLowerCase().includes('is experiencing issues'))) {
          status_message = text;
          return false;
        }
      });

      if (!status_message || status_message === mainHeading) {
        status_message = 'T-Mobile is experiencing issues';
      }
    }

    if (status === 'unknown' && mainHeading) {
      const headingLower = mainHeading.toLowerCase();

      if (headingLower.includes('outage report') || headingLower.includes('outage')) {
        status = 'issues';
      }
    }

    const problems: { type: string; percentage: number }[] = [];

    $('body').find('*').each((_, elem) => {
      const text = $(elem).text();
      const matches = text.matchAll(/([A-Za-z\s-]+?)\s*[\(:]?\s*(\d+)\s*%/g);

      for (const match of matches) {
        const type = match[1].trim();
        const percentage = parseInt(match[2], 10);

        if (type.length > 2 && type.length < 30 && percentage > 0 && percentage <= 100) {
          if (!problems.some(p => p.type.toLowerCase() === type.toLowerCase())) {
            problems.push({ type, percentage });
          }
        }
      }
    });

    $('li, .problem-item, .stat-item').each((_, elem) => {
      const text = $(elem).text().trim();
      const match = text.match(/([A-Za-z\s-]+?)\s*[\(:]?\s*(\d+)\s*%/);

      if (match) {
        const type = match[1].trim();
        const percentage = parseInt(match[2], 10);

        if (type.length > 2 && type.length < 30 && percentage > 0 && percentage <= 100) {
          if (!problems.some(p => p.type.toLowerCase() === type.toLowerCase())) {
            problems.push({ type, percentage });
          }
        }
      }
    });

    const social_mentions: { text: string; timestamp: string }[] = [];

    $('p, .tweet, .report, .comment').each((_, elem) => {
      const text = $(elem).text().trim();

      const isUserReport =
        (text.includes('@TMobile') || text.includes('@AsurionCares') || text.includes('@')) &&
        text.length > 30 && text.length < 300 &&
        !text.toLowerCase().includes('please let us know') &&
        !text.toLowerCase().includes('how would you rate') &&
        !text.toLowerCase().includes('graph below') &&
        !text.toLowerCase().includes('recent problems reported') &&
        !text.toLowerCase().includes('is a major wireless') &&
        !text.toLowerCase().includes('most recent') &&
        !text.toLowerCase().includes('cookie') &&
        !text.toLowerCase().includes('privacy');

      if (isUserReport) {
        social_mentions.push({
          text: text.substring(0, 280),
          timestamp: new Date().toISOString(),
        });
      }
    });

    return {
      status_data: {
        status,
        status_message: status_message || undefined,
        problems: problems.length > 0 ? problems : [],
        social_mentions: social_mentions.slice(0, 10),
      },
      source: 'istheservicedown',
      fetched_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error scraping IsTheServiceDown:', error);
    throw error;
  }
}
