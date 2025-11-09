import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { generateDownDetectorData } from '@/lib/scraper/downdetector';

export async function GET() {
  try {
    // Generate mock DownDetector data
    const result = generateDownDetectorData();

    // Store in Supabase (using service role to bypass RLS)
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('raw_events')
      .insert({
        source: result.source,
        fetched_at: result.fetched_at,
        raw_payload: result.report_data,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      source: 'downdetector',
      note: 'SAMPLE DATA - DownDetector blocks scraping',
      total_reports: result.report_data.total_reports,
      status: result.report_data.status,
      comments_count: result.report_data.user_comments.length,
      fetched_at: result.fetched_at,
      stored_id: data.id,
    });
  } catch (error) {
    console.error('DownDetector mock generator error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
