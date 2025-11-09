/**
 * DownDetector Data Loader
 * Loads static outage data modeled after real DownDetector JSON structure
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface OutageLocation {
  city: string;
  state: string;
  lat: number;
  lng: number;
  reportCount: number;
  problemType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  comments: string[];
}

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
  outage_locations: OutageLocation[];
}

export interface DownDetectorResult {
  report_data: DownDetectorReport;
  source: string;
  fetched_at: string;
}

/**
 * Load DownDetector data from static JSON file
 * This mimics real DownDetector data structure
 */
export function generateDownDetectorData(): DownDetectorResult {
  try {
    const dataPath = join(process.cwd(), 'lib/scraper/data/downdetector-data.json');
    const fileContent = readFileSync(dataPath, 'utf-8');
    const reportData: DownDetectorReport = JSON.parse(fileContent);

    return {
      report_data: reportData,
      source: 'downdetector',
      fetched_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to load downdetector data:', error);

    return {
      report_data: {
        total_reports: 0,
        baseline: 50,
        status: 'normal',
        problem_types: [],
        user_comments: [],
        outage_locations: [],
      },
      source: 'downdetector',
      fetched_at: new Date().toISOString(),
    };
  }
}
