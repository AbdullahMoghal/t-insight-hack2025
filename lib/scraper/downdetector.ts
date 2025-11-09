/**
 * DownDetector Mock Data Generator
 * Generates realistic sample data since DownDetector blocks scraping
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface DownDetectorReport {
  total_reports: number;
  problem_types: {
    type: string;
    percentage: number;
  }[];
  user_comments: {
    text: string;
    timestamp: string;
    location?: string;
  }[];
  baseline: number;
  status: string;
}

export interface DownDetectorResult {
  report_data: DownDetectorReport;
  source: string;
  fetched_at: string;
}

interface DownDetectorSampleData {
  problemTypes: { type: string; percentage: number }[];
  sampleComments: string[];
  locations: string[];
}

// Load sample data from JSON file
let sampleData: DownDetectorSampleData;
try {
  const dataPath = join(process.cwd(), 'lib/scraper/data/downdetector-sample.json');
  const fileContent = readFileSync(dataPath, 'utf-8');
  sampleData = JSON.parse(fileContent);
} catch (error) {
  console.error('Failed to load downdetector sample data:', error);
  throw new Error('Sample data file not found');
}

const PROBLEM_TYPES = sampleData.problemTypes;
const SAMPLE_COMMENTS = sampleData.sampleComments;
const LOCATIONS = sampleData.locations;

/**
 * Generate random number of reports (fluctuates realistically)
 */
function generateReportCount(): number {
  const baselineHour = new Date().getHours();
  const baseline = 50; // Normal baseline

  // Add random variance (-30 to +200)
  const variance = Math.floor(Math.random() * 230) - 30;

  // Peak hours (6am-9am, 5pm-8pm) get +50 boost
  const peakBoost = (baselineHour >= 6 && baselineHour <= 9) || (baselineHour >= 17 && baselineHour <= 20) ? 50 : 0;

  return Math.max(baseline + variance + peakBoost, 20);
}

/**
 * Generate mock user comments
 */
function generateComments(count: number = 10): Array<{text: string; timestamp: string; location?: string}> {
  const comments = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const randomComment = SAMPLE_COMMENTS[Math.floor(Math.random() * SAMPLE_COMMENTS.length)];
    const randomLocation = Math.random() > 0.5 ? LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)] : undefined;

    // Generate timestamp within last 2 hours
    const minutesAgo = Math.floor(Math.random() * 120);
    const timestamp = new Date(now.getTime() - minutesAgo * 60000).toISOString();

    comments.push({
      text: randomComment,
      timestamp,
      location: randomLocation,
    });
  }

  return comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Generate realistic DownDetector mock data
 */
export function generateDownDetectorData(): DownDetectorResult {
  const total_reports = generateReportCount();
  const baseline = 50;

  // Determine status based on reports
  let status = 'normal';
  if (total_reports > 150) {
    status = 'outage';
  } else if (total_reports > 100) {
    status = 'issues';
  }

  // Vary problem type percentages slightly
  const problem_types = PROBLEM_TYPES.map(pt => ({
    type: pt.type,
    percentage: pt.percentage + Math.floor(Math.random() * 10) - 5, // ±5% variance
  }));

  return {
    report_data: {
      total_reports,
      baseline,
      status,
      problem_types,
      user_comments: generateComments(Math.min(total_reports, 15)),
    },
    source: 'downdetector',
    fetched_at: new Date().toISOString(),
  };
}
