import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron Orchestrator
 * Calls all scraper endpoints and aggregates results
 * Secured with CRON_SECRET environment variable
 */

const SCRAPER_ENDPOINTS = [
  '/api/scrape/reddit',
  '/api/scrape/news',
  '/api/scrape/istheservicedown',
  '/api/scrape/outage-report',
  '/api/scrape/downdetector',
  '/api/scrape/community',
  '/api/scrape/customer-feedback',
];

interface ScraperResult {
  source: string;
  status: 'success' | 'error';
  count?: number;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    // Check authorization header
    const expectedAuth = `Bearer ${cronSecret}`;
    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Call all scrapers sequentially
    const results: Record<string, ScraperResult> = {};
    let totalCount = 0;

    for (const endpoint of SCRAPER_ENDPOINTS) {
      const sourceName = endpoint.split('/').pop() || 'unknown';

      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const count =
            data.posts_count ||
            data.articles_count ||
            data.discussions_count ||
            data.total_reports ||
            data.problems_count ||
            data.comments_count ||
            1;

          results[sourceName] = {
            source: data.source,
            status: 'success',
            count,
          };

          totalCount += count;
        } else {
          results[sourceName] = {
            source: sourceName,
            status: 'error',
            error: data.error || 'Unknown error',
          };
        }
      } catch (error) {
        results[sourceName] = {
          source: sourceName,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      // Wait 2 seconds between scraper calls to be polite
      if (SCRAPER_ENDPOINTS.indexOf(endpoint) < SCRAPER_ENDPOINTS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Return summary
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sources: results,
      total_items: totalCount,
      summary: {
        success_count: Object.values(results).filter(r => r.status === 'success').length,
        error_count: Object.values(results).filter(r => r.status === 'error').length,
      },
    });
  } catch (error) {
    console.error('Cron orchestrator error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
