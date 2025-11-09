import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { scrapeReddit } from '@/lib/scraper/reddit';

export async function GET() {
  try {
    // Scrape Reddit
    const result = await scrapeReddit();

    // Store in Supabase (using service role to bypass RLS)
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('raw_events')
      .insert({
        source: result.source,
        fetched_at: result.fetched_at,
        raw_payload: result.posts,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      source: 'reddit',
      posts_count: result.posts.length,
      subreddits: ['r/tmobile', 'r/tmobileisp'],
      fetched_at: result.fetched_at,
      stored_id: data.id,
    });
  } catch (error) {
    console.error('Reddit scraper error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
