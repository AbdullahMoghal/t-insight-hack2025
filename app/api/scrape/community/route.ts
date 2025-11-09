import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { generateCommunityData } from '@/lib/scraper/community';

export async function GET() {
  try {
    const result = generateCommunityData();

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('raw_events')
      .insert({
        source: result.source,
        fetched_at: result.fetched_at,
        raw_payload: result.discussions,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      source: 'tmobile-community',
      note: 'SAMPLE DATA - T-Mobile Community requires OAuth',
      discussions_count: result.discussions.length,
      categories: [...new Set(result.discussions.map(d => d.category))],
      fetched_at: result.fetched_at,
      stored_id: data.id,
    });
  } catch (error) {
    console.error('T-Mobile Community mock generator error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
