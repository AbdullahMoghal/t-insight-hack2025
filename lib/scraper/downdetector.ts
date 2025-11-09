/**
 * DownDetector Mock Data Generator
 * Generates realistic sample data since DownDetector blocks scraping
 */

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

const PROBLEM_TYPES = [
  { type: 'Mobile network', percentage: 45 },
  { type: 'Mobile App', percentage: 30 },
  { type: 'Billing', percentage: 15 },
  { type: 'Website', percentage: 10 },
];

const SAMPLE_COMMENTS = [
  'Network down in Dallas, TX. No data at all.',
  'App keeps crashing when I try to pay my bill',
  '5G not working in Seattle area',
  'Cannot make calls in downtown Chicago',
  'Been trying to login to my account for 30 minutes',
  'Home internet gateway keeps disconnecting',
  'No service in Brooklyn for the past hour',
  'Getting error message when checking my balance',
  'Coverage is terrible in this area lately',
  'Customer service line is busy, probably an outage',
  'My bill shows incorrect charges again',
  'Website won\'t load on mobile or desktop',
  'LTE working but 5G is completely down',
  'T-Mobile Tuesday app not loading',
  'Cannot send or receive text messages',
];

const LOCATIONS = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Seattle, WA',
];

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
