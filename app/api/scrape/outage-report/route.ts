import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { generateOutageReportData } from '@/lib/scraper/outage-report';

export async function GET() {
  try {
    // Generate mock Outage.report data
    const result = generateOutageReportData();

    // Store in Supabase (using service role to bypass RLS)
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('raw_events')
      .insert({
        source: result.source,
        fetched_at: result.fetched_at,
        raw_payload: result.outage_data,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      source: 'outage-report',
      note: 'SAMPLE DATA - Event API not publicly accessible',
      status: result.outage_data.current_status,
      events_count: result.outage_data.events.length,
      social_mentions_count: result.outage_data.social_mentions.length,
      fetched_at: result.fetched_at,
      stored_id: data.id,
    });
  } catch (error) {
    console.error('Outage.report mock generator error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
