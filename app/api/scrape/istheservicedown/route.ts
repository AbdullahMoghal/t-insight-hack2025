import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { scrapeIsTheServiceDown } from '@/lib/scraper/istheservicedown';

export async function GET() {
  try {
    // Scrape IsTheServiceDown
    const result = await scrapeIsTheServiceDown();

    // Store in Supabase (using service role to bypass RLS)
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('raw_events')
      .insert({
        source: result.source,
        fetched_at: result.fetched_at,
        raw_payload: result.status_data,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      source: 'istheservicedown',
      status: result.status_data.status,
      problems_count: result.status_data.problems.length,
      social_mentions_count: result.status_data.social_mentions.length,
      fetched_at: result.fetched_at,
      stored_id: data.id,
    });
  } catch (error) {
    console.error('IsTheServiceDown scraper error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
