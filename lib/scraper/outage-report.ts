/**
 * Outage.report Mock Data Generator
 * Generates realistic sample data since Event API is not publicly accessible
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface OutageEvent {
  timestamp: string;
  status: string;
  event_type?: string;
  description?: string;
  affected_count?: number;
}

export interface OutageReportData {
  current_status: string;
  events: OutageEvent[];
  social_mentions: string[];
}

export interface OutageReportResult {
  outage_data: OutageReportData;
  source: string;
  fetched_at: string;
}

interface OutageReportSampleData {
  eventTypes: string[];
  sampleEventDescriptions: string[];
  sampleSocialMentions: string[];
}

// Load sample data from JSON file
let sampleData: OutageReportSampleData;
try {
  const dataPath = join(process.cwd(), 'lib/scraper/data/outage-report-sample.json');
  const fileContent = readFileSync(dataPath, 'utf-8');
  sampleData = JSON.parse(fileContent);
} catch (error) {
  console.error('Failed to load outage-report sample data:', error);
  throw new Error('Sample data file not found');
}

const EVENT_TYPES = sampleData.eventTypes;
const SAMPLE_EVENT_DESCRIPTIONS = sampleData.sampleEventDescriptions;
const SAMPLE_SOCIAL_MENTIONS = sampleData.sampleSocialMentions;

/**
 * Generate random outage events
 */
function generateEvents(count: number = 5): OutageEvent[] {
  const now = new Date();
  const events: OutageEvent[] = [];

  for (let i = 0; i < count; i++) {
    // Generate timestamp within last 48 hours
    const hoursAgo = Math.floor(Math.random() * 48);
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();

    const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const description = SAMPLE_EVENT_DESCRIPTIONS[Math.floor(Math.random() * SAMPLE_EVENT_DESCRIPTIONS.length)];

    events.push({
      timestamp,
      status: eventType,
      event_type: eventType,
      description,
      affected_count: Math.floor(Math.random() * 1000) + 10,
    });
  }

  // Sort by timestamp (newest first)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Generate mock social mentions
 */
function generateSocialMentions(count: number = 10): string[] {
  const mentions: string[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const randomMention = SAMPLE_SOCIAL_MENTIONS[Math.floor(Math.random() * SAMPLE_SOCIAL_MENTIONS.length)];
    mentions.push(randomMention);
  }

  return mentions;
}

/**
 * Determine current status based on recent events
 */
function determineCurrentStatus(events: OutageEvent[]): string {
  if (events.length === 0) {
    return 'ok';
  }

  const latestEvent = events[0];

  // If most recent event is resolved, status is ok
  if (latestEvent.event_type === 'resolved') {
    return 'ok';
  }

  // If outage or investigating, status is outage
  if (latestEvent.event_type === 'outage' || latestEvent.event_type === 'investigating') {
    return 'outage';
  }

  // If degraded, status is degraded
  if (latestEvent.event_type === 'degraded') {
    return 'degraded';
  }

  return 'ok';
}

/**
 * Generate realistic Outage.report mock data
 */
export function generateOutageReportData(): OutageReportResult {
  // Generate 3-7 events
  const eventCount = 3 + Math.floor(Math.random() * 5);
  const events = generateEvents(eventCount);

  // Determine status based on events
  const current_status = determineCurrentStatus(events);

  // Generate social mentions
  const social_mentions = generateSocialMentions(10);

  return {
    outage_data: {
      current_status,
      events,
      social_mentions,
    },
    source: 'outage-report',
    fetched_at: new Date().toISOString(),
  };
}
