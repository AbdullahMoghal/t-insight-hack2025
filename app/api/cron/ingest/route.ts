import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron Orchestrator (POST endpoint)
 * Calls all scraper endpoints IN PARALLEL and aggregates results
 * Secured with CRON_SECRET environment variable
 *
 * Called by: Supabase pg_cron via net.http_post()
 *
 * Performance: ~3-5 seconds (parallel) vs ~14 seconds (sequential)
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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    const expectedAuth = `Bearer ${cronSecret}`;
    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const results: Record<string, ScraperResult> = {};
    let totalCount = 0;

    const scraperPromises = SCRAPER_ENDPOINTS.map(async (endpoint) => {
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

          return {
            sourceName,
            result: {
              source: data.source,
              status: 'success' as const,
              count,
            },
          };
        } else {
          return {
            sourceName,
            result: {
              source: sourceName,
              status: 'error' as const,
              error: data.error || 'Unknown error',
            },
          };
        }
      } catch (error) {
        return {
          sourceName,
          result: {
            source: sourceName,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    });

    const scraperResults = await Promise.all(scraperPromises);

    for (const { sourceName, result } of scraperResults) {
      results[sourceName] = result;
      if (result.status === 'success' && result.count) {
        totalCount += result.count;
      }
    }

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
