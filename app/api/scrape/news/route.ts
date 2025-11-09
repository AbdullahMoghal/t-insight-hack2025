import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { scrapeNews } from '@/lib/scraper/news';

export async function GET() {
  try {
    // Scrape Google News
    const result = await scrapeNews();

    // Store in Supabase (using service role to bypass RLS)
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('raw_events')
      .insert({
        source: result.source,
        fetched_at: result.fetched_at,
        raw_payload: result.articles,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      source: 'google-news',
      articles_count: result.articles.length,
      queries: ['T-Mobile outage', 'T-Mobile network down', 'T-Mobile billing issue'],
      fetched_at: result.fetched_at,
      stored_id: data.id,
    });
  } catch (error) {
    console.error('News scraper error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
