import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { Navbar } from '@/components/layout/navbar'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch real dashboard data from API
  let dashboardData = {
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
  }

  let outageData = {
    data: [],
    summary: {
      totalReports: 0,
      affectedCities: 0,
      criticalCount: 0,
      highCount: 0,
      status: 'Normal',
    },
  }

  let earlyWarningData = {
    risingIssues: [],
    totalRising: 0,
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

    // Fetch dashboard metrics
    const metricsResponse = await fetch(`${baseUrl}/api/dashboard/metrics`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (metricsResponse.ok) {
      dashboardData = await metricsResponse.json()
    } else {
      console.error('Failed to fetch dashboard metrics:', metricsResponse.statusText)
    }

    // Fetch outage data
    const outageResponse = await fetch(`${baseUrl}/api/dashboard/outages`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (outageResponse.ok) {
      const outageJson = await outageResponse.json()
      if (outageJson.success) {
        outageData = outageJson
      }
    } else {
      console.error('Failed to fetch outage data:', outageResponse.statusText)
    }

    // Fetch early warning data
    const earlyWarningResponse = await fetch(`${baseUrl}/api/dashboard/early-warning`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (earlyWarningResponse.ok) {
      const earlyWarningJson = await earlyWarningResponse.json()
      if (earlyWarningJson.success) {
        earlyWarningData = earlyWarningJson
      }
    } else {
      console.error('Failed to fetch early warning data:', earlyWarningResponse.statusText)
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Will use default values if fetch fails
  }

  // Extract data with fallbacks
  const overallCHI = dashboardData.overallCHI || 50
  const chiTrend = dashboardData.chiTrend || 0
  const previousCHI = dashboardData.previousCHI || 50
  const productAreas = dashboardData.productAreas || []
  const emergingIssues = dashboardData.emergingIssues || []
  const sentimentData = dashboardData.sentimentTimeline || []
  const sourceData = dashboardData.sourceData || []
  const advancedMetrics = dashboardData.advancedMetrics || {
    signalTrend: { current: 0, previous: 0, percentageChange: 0 },
    newIssues: { count: 0, total: 0 },
    responseTime: { averageMinutes: 0, trendMinutes: 0, sampleSize: 0 },
    positiveTrends: { count: 0 },
  }
  const realtimeData = dashboardData.realtimeData || {
    realtimeSignals: [],
    issueVelocity: [],
    sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-tmobile-magenta/3 to-purple-50">
      {/* Header */}
      <Navbar userEmail={user.email} />

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardContent
          overallCHI={overallCHI}
          chiTrend={chiTrend}
          previousCHI={previousCHI}
          productAreas={productAreas}
          emergingIssues={emergingIssues}
          sentimentData={sentimentData}
          sourceData={sourceData}
          advancedMetrics={advancedMetrics}
          realtimeData={realtimeData}
          outageData={outageData}
          earlyWarningData={earlyWarningData}
        />
      </main>
    </div>
  )
}
