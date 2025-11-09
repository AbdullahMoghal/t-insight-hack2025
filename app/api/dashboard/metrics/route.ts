/**
 * Dashboard Metrics API
 *
 * GET /api/dashboard/metrics
 * Returns all dashboard data in a single response for optimal performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateCHI, getCHITrend } from '@/lib/utils/chi';
import {
  getProductAreaMetrics,
  getEmergingIssues,
  getSentimentTimeline,
  getSourceBreakdown,
} from '@/lib/utils/dashboard-data';
import {
  getSignalTrend,
  getNewIssuesCount,
  getAverageResponseTime,
  getPositiveTrendsCount,
} from '@/lib/utils/advanced-metrics';
import {
  getRealtimeSignals,
  getIssueVelocityByProductArea,
  getSentimentDistribution,
} from '@/lib/utils/realtime-data';

export const dynamic = 'force-dynamic'; // Always fetch fresh data
export const revalidate = 0; // Disable caching

export async function GET(request: NextRequest) {
  try {
    // Use 24-hour window to show existing data (configurable)
    const timeWindowHours = 24;

    // Fetch all dashboard data in parallel for better performance
    const [
      overallCHI,
      chiTrend,
      productAreas,
      emergingIssues,
      sentimentTimeline,
      sourceData,
      signalTrend,
      newIssues,
      responseTime,
      positiveTrends,
      realtimeSignals,
      issueVelocity,
      sentimentDistribution,
    ] = await Promise.all([
      calculateCHI(timeWindowHours * 60), // Overall CHI from time window
      getCHITrend(timeWindowHours * 60), // CHI trend vs previous period
      getProductAreaMetrics(timeWindowHours),
      getEmergingIssues(10, timeWindowHours), // Top 10 emerging issues
      getSentimentTimeline('24h'),
      getSourceBreakdown(),
      getSignalTrend(1), // Signal count trend (last hour)
      getNewIssuesCount(1), // New issues in last hour
      getAverageResponseTime(), // Response time metrics
      getPositiveTrendsCount(), // Count of improving product areas
      getRealtimeSignals(20), // Recent signals for activity feed
      getIssueVelocityByProductArea(), // Issue velocity by product area
      getSentimentDistribution(24), // Sentiment distribution (24h)
    ]);

    // Calculate previous CHI score for display
    const currentCHI = overallCHI || 50;
    const previousCHI = currentCHI - chiTrend;

    // Return all data including advanced metrics and realtime data
    return NextResponse.json({
      overallCHI: currentCHI,
      chiTrend,
      previousCHI,
      productAreas,
      emergingIssues,
      sentimentTimeline,
      sourceData,
      advancedMetrics: {
        signalTrend: {
          current: signalTrend.current,
          previous: signalTrend.previous,
          percentageChange: signalTrend.percentageChange,
        },
        newIssues: {
          count: newIssues.newIssuesCount,
          total: newIssues.totalIssues,
        },
        responseTime: {
          averageMinutes: responseTime.averageMinutes,
          trendMinutes: responseTime.trendMinutes,
          sampleSize: responseTime.sampleSize,
        },
        positiveTrends: {
          count: positiveTrends,
        },
      },
      realtimeData: {
        realtimeSignals,
        issueVelocity,
        sentimentDistribution,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);

    // Return fallback data on error
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
        overallCHI: 50,
        chiTrend: 0,
        previousCHI: 50,
        productAreas: [],
        emergingIssues: [],
        sentimentTimeline: [],
        sourceData: [],
        advancedMetrics: {
          signalTrend: { current: 0, previous: 0, percentageChange: 0 },
          newIssues: { count: 0, total: 0 },
          responseTime: { averageMinutes: 0, trendMinutes: 0, sampleSize: 0 },
          positiveTrends: { count: 0 },
        },
        realtimeData: {
          realtimeSignals: [],
          issueVelocity: [],
          sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
        },
      },
      { status: 500 }
    );
  }
}
