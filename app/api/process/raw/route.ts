/**
 * Raw Event Processing API
 * Processes unprocessed raw_events into signals with sentiment and topic analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { analyzeSentiment } from '@/lib/processing/sentiment';
import { detectTopic } from '@/lib/processing/topic-detector';
import { findExistingDuplicate, mergeSignals, type Signal } from '@/lib/processing/deduplicator';

/**
 * Extract text content from raw event based on source type
 */
function extractTextFromEvent(rawPayload: any, source: string): string {
  try {
    switch (source) {
      case 'reddit':
        if (Array.isArray(rawPayload)) {
          return rawPayload
            .map((post: any) => `${post.title} ${post.selftext || ''}`.trim())
            .join('\n\n');
        }
        return '';

      case 'downdetector':
        if (rawPayload?.user_comments) {
          return rawPayload.user_comments
            .map((comment: any) => comment.text)
            .join('\n\n');
        }
        return '';

      case 'outage-report':
        const descriptions = rawPayload?.events
          ?.map((event: any) => event.description || '')
          .join('\n\n') || '';
        const mentions = rawPayload?.social_mentions?.join('\n\n') || '';
        return `${descriptions}\n\n${mentions}`.trim();

      case 'tmobile-community':
        if (Array.isArray(rawPayload)) {
          return rawPayload
            .map((discussion: any) => `${discussion.title} ${discussion.excerpt}`.trim())
            .join('\n\n');
        }
        return '';

      case 'customer-feedback':
        if (Array.isArray(rawPayload.comments)) {
          return rawPayload.comments
            .map((comment: any) => comment.comment)
            .join('\n\n');
        }
        return '';

      case 'google-news':
        if (Array.isArray(rawPayload)) {
          return rawPayload
            .map((article: any) => `${article.title} ${article.description || ''}`.trim())
            .join('\n\n');
        }
        return '';

      case 'istheservicedown':
        const statusMsg = rawPayload?.status_message || '';
        const socialMentions = rawPayload?.social_mentions
          ?.map((mention: any) => mention.text)
          .join('\n\n') || '';
        return `${statusMsg}\n\n${socialMentions}`.trim();

      default:
        console.warn(`Unknown source type: ${source}`);
        return '';
    }
  } catch (error) {
    console.error(`Error extracting text from ${source}:`, error);
    return '';
  }
}

/**
 * Extract geographic data from raw event if available
 */
function extractGeoData(rawPayload: any, source: string): any {
  try {
    if (source === 'customer-feedback' && Array.isArray(rawPayload.comments)) {
      const locations = rawPayload.comments
        .filter((c: any) => c.city && c.state)
        .map((c: any) => ({ city: c.city, state: c.state }));

      if (locations.length > 0) {
        return { locations };
      }
    }

    if (source === 'downdetector' && rawPayload?.user_comments) {
      const locations = rawPayload.user_comments
        .filter((c: any) => c.location)
        .map((c: any) => c.location);

      if (locations.length > 0) {
        return { locations };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Map product area name to database ID
 */
async function mapProductAreaToId(
  productAreaName: string,
  supabase: any
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('product_areas')
      .select('id')
      .eq('name', productAreaName)
      .single();

    if (error || !data) {
      console.warn(`Product area not found: ${productAreaName}`);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error mapping product area:', error);
    return null;
  }
}

/**
 * Extract individual items from raw event for multi-signal sources
 * Most sources should create one signal per item (post, article, event, comment)
 */
function extractIndividualItems(rawPayload: any, source: string): Array<{ text: string; geo?: any }> {
  try {
    switch (source) {
      case 'reddit':
        if (Array.isArray(rawPayload)) {
          return rawPayload.map((post: any) => ({
            text: `${post.title} ${post.selftext || ''}`.trim(),
            geo: undefined,
          }));
        }
        return [];

      case 'google-news':
        if (Array.isArray(rawPayload)) {
          return rawPayload.map((article: any) => ({
            text: `${article.title} ${article.description || ''}`.trim(),
            geo: undefined,
          }));
        }
        return [];

      case 'tmobile-community':
        if (Array.isArray(rawPayload)) {
          return rawPayload.map((discussion: any) => ({
            text: `${discussion.title} ${discussion.excerpt}`.trim(),
            geo: undefined,
          }));
        }
        return [];

      case 'outage-report':
        if (rawPayload?.events && Array.isArray(rawPayload.events)) {
          return rawPayload.events.map((event: any) => ({
            text: event.description || '',
            geo: undefined,
          }));
        }
        return [];

      case 'downdetector':
        if (rawPayload?.user_comments && Array.isArray(rawPayload.user_comments)) {
          return rawPayload.user_comments.map((comment: any) => ({
            text: comment.text || '',
            geo: comment.location ? { location: comment.location } : undefined,
          }));
        }
        return [];

      case 'customer-feedback':
        if (Array.isArray(rawPayload.comments)) {
          return rawPayload.comments.map((comment: any) => ({
            text: comment.comment,
            geo: comment.city && comment.state ? { city: comment.city, state: comment.state } : undefined,
          }));
        }
        return [];

      case 'istheservicedown':
        const statusMsg = rawPayload?.status_message || '';
        const socialMentions = rawPayload?.social_mentions
          ?.map((mention: any) => mention.text)
          .join('\n\n') || '';
        const text = `${statusMsg}\n\n${socialMentions}`.trim();
        return text ? [{ text, geo: undefined }] : [];

      default:
        console.warn(`Unknown source type: ${source}`);
        return [];
    }
  } catch (error) {
    console.error(`Error extracting items from ${source}:`, error);
    return [];
  }
}

/**
 * Process a single text item into a signal
 */
async function processSingleItem(
  text: string,
  geo: any,
  event: any,
  supabase: any
): Promise<boolean> {
  try {
    const sentimentResult = analyzeSentiment(text);

    const topicResult = detectTopic(text);

    const productAreaId = await mapProductAreaToId(topicResult.productArea, supabase);

    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    let recentSignals: any[] = [];
    if (productAreaId) {
      const { data, error: queryError } = await supabase
        .from('signals')
        .select('*')
        .eq('product_area_id', productAreaId)
        .gte('detected_at', thirtyMinsAgo);

      if (queryError) {
        console.error('Error querying recent signals:', queryError);
      } else {
        recentSignals = data || [];
      }
    }

    const newSignal: Signal = {
      topic: topicResult.topic,
      keywords: topicResult.keywords,
      sentiment: sentimentResult.score,
      detected_at: event.fetched_at || new Date().toISOString(),
      source: event.source,
      product_area: topicResult.productArea,
      meta: {
        original_text: text.substring(0, 1000),
        confidence: topicResult.confidence,
        sentiment_confidence: sentimentResult.confidence,
        raw_event_id: event.id,
        keywords: topicResult.keywords,
      },
    };

    const existingDuplicate = recentSignals.length > 0
      ? findExistingDuplicate(newSignal, recentSignals)
      : null;

    if (existingDuplicate) {
      const mergedSignal = mergeSignals(existingDuplicate, newSignal);

      const { error: updateError } = await supabase
        .from('signals')
        .update({
          sentiment: mergedSignal.sentiment,
          intensity: (existingDuplicate.meta?.duplicate_count || 1) + 1,
          meta: mergedSignal.meta,
        })
        .eq('id', existingDuplicate.id);

      if (updateError) {
        console.error('Error updating signal:', updateError);
        return false;
      }

      return true;
    } else {
      const { error: insertError } = await supabase
        .from('signals')
        .insert({
          source: event.source,
          detected_at: newSignal.detected_at,
          sentiment: sentimentResult.score,
          topic: topicResult.topic,
          intensity: 1,
          product_area_id: productAreaId,
          geo,
          meta: newSignal.meta,
        });

      if (insertError) {
        console.error('Error inserting signal:', insertError);
        return false;
      }

      return true;
    }
  } catch (error) {
    console.error('Error processing single item:', error);
    return false;
  }
}

/**
 * Process a single raw event into signal(s)
 * Can create multiple signals for sources like customer-feedback
 */
async function processEvent(
  event: any,
  supabase: any
): Promise<{ success: boolean; signalsCreated: number }> {
  try {
    const items = extractIndividualItems(event.raw_payload, event.source);

    if (items.length === 0) {
      console.log(`No items extracted from event ${event.id} (source: ${event.source})`);
      return { success: true, signalsCreated: 0 };
    }

    let signalsCreated = 0;
    for (const item of items) {
      const success = await processSingleItem(item.text, item.geo, event, supabase);
      if (success) signalsCreated++;
    }

    return { success: true, signalsCreated };
  } catch (error) {
    console.error('Error processing event:', error);
    return { success: false, signalsCreated: 0 };
  }
}

/**
 * POST /api/process/raw
 * Process unprocessed raw events into signals
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    const { data: unprocessedEvents, error: queryError } = await supabase
      .from('raw_events')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(100);

    if (queryError) {
      console.error('Error querying raw events:', queryError);
      return NextResponse.json(
        { error: 'Failed to query raw events', details: queryError.message },
        { status: 500 }
      );
    }

    if (!unprocessedEvents || unprocessedEvents.length === 0) {
      return NextResponse.json({
        message: 'No unprocessed events found',
        processed: 0,
        signalsCreated: 0,
      });
    }

    console.log(`Processing ${unprocessedEvents.length} unprocessed events...`);

    let totalSignalsCreated = 0;
    let successCount = 0;
    const processedEventIds: string[] = [];

    for (const event of unprocessedEvents) {
      const result = await processEvent(event, supabase);

      if (result.success) {
        successCount++;
        totalSignalsCreated += result.signalsCreated;
        processedEventIds.push(event.id);
      }
    }

    if (processedEventIds.length > 0) {
      const { error: updateError } = await supabase
        .from('raw_events')
        .update({ processed: true })
        .in('id', processedEventIds);

      if (updateError) {
        console.error('Error marking events as processed:', updateError);
      }
    }

    return NextResponse.json({
      message: 'Processing complete',
      processed: successCount,
      signalsCreated: totalSignalsCreated,
      total: unprocessedEvents.length,
    });
  } catch (error) {
    console.error('Error in process/raw route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/process/raw
 * Get status of unprocessed events
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    const { count: unprocessedCount, error: countError } = await supabase
      .from('raw_events')
      .select('*', { count: 'exact', head: true })
      .eq('processed', false);

    if (countError) {
      console.error('Error counting raw events:', countError);
      return NextResponse.json(
        { error: 'Failed to count events', details: countError.message },
        { status: 500 }
      );
    }

    const { count: signalCount, error: signalError } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true });

    if (signalError) {
      console.error('Error counting signals:', signalError);
      return NextResponse.json(
        { error: 'Failed to count signals', details: signalError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      unprocessedEvents: unprocessedCount || 0,
      totalSignals: signalCount || 0,
      status: unprocessedCount && unprocessedCount > 0 ? 'ready' : 'idle',
    });
  } catch (error) {
    console.error('Error in process/raw GET route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
