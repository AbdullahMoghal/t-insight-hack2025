/**
 * Customer Feedback Scraper API Route
 *
 * Combines data from two sources:
 * 1. BestCompany.com scraped reviews (with city/state from JSON-LD + HTML)
 * 2. Local sample data (300 comments with full location data)
 *
 * Returns combined dataset for richer customer feedback analysis.
 * Stores results in Supabase raw_events table.
 */

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { scrapeCustomerFeedback } from '@/lib/scraper/customer-feedback';

export async function GET() {
  try {
    console.log('🔍 Starting customer feedback scraper...');

    // Scrape customer feedback (hybrid approach)
    const result = await scrapeCustomerFeedback();

    console.log(`📊 Retrieved ${result.comments.length} comments (${result.data_source})`);

    // Store in Supabase using service role client (bypasses RLS)
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('raw_events')
      .insert({
        source: result.source,
        fetched_at: result.fetched_at,
        raw_payload: {
          comments: result.comments,
          data_source: result.data_source,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Stored customer feedback with ID: ${data.id}`);

    return NextResponse.json({
      success: true,
      source: 'customer-feedback',
      comments_count: result.comments.length,
      data_source: result.data_source,
      fetched_at: result.fetched_at,
      stored_id: data.id,
    });

  } catch (error) {
    console.error('❌ Customer feedback scraper error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
