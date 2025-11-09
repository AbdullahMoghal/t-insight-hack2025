'use client'

import { useState, useEffect } from 'react'
import { CHIGauge } from './chi-gauge'
import { ProductAreaCard } from './product-area-card'
import { EmergingIssuesTable } from './emerging-issues-table'
import { SentimentTimeline } from './sentiment-timeline'
import { SourceBreakdown } from './source-breakdown'
import { ProductAreaDetail } from './product-area-detail'
import { RealtimeActivityFeed } from './realtime-activity-feed'
import { EarlyWarningSystem } from './early-warning-system'
import { MomentsOfDelight } from './moments-of-delight'
import { IssueVelocityChart } from './issue-velocity-chart'
import { SentimentDistribution } from './sentiment-distribution'
import { SplashScreen } from '@/components/ui/splash-screen'

interface ProductArea {
  id: string
  name: string
  color: string
  chi: number
  trend: number
  signalCount: number
}

interface Issue {
  id: string
  topic: string
  intensity: number
  sentiment: number
  sourceCount: number
  productArea: string
}

interface DataPoint {
  timestamp: Date
  network: number
  mobileApp: number
  billing: number
  homeInternet: number
}

interface SourceData {
  name: string
  value: number
}

interface OutageSummary {
  totalReports: number
  affectedCities: number
  criticalCount: number
  highCount: number
  mediumCount?: number
  lowCount?: number
  status: string
}

interface OutageData {
  data: unknown[]
  summary: OutageSummary
}

interface DashboardContentProps {
  overallCHI: number
  productAreas: ProductArea[]
  emergingIssues: Issue[]
  sentimentData: DataPoint[]
  sourceData: SourceData[]
  outageData?: OutageData
}

export function DashboardContent({
  overallCHI,
  productAreas,
  emergingIssues,
  sentimentData,
  sourceData,
  outageData,
}: DashboardContentProps) {
  const [selectedProductArea, setSelectedProductArea] = useState<ProductArea | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Mark as ready after component mounts and data is available
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleProductAreaClick = (areaName: string) => {
    const area = productAreas.find((a) => a.name === areaName)
    if (area) {
      setSelectedProductArea(area)
    }
  }

  const handleCreateOpportunity = (issueId: string) => {
    console.log(`Create opportunity for issue ${issueId}`)
    // TODO: Navigate to opportunity creation page or open modal
  }

  // Mock data for new components (will be replaced with real data from API)
  const mockRealtimeSignals = emergingIssues.slice(0, 10).map((issue) => ({
    id: issue.id,
    topic: issue.topic,
    sentiment: issue.sentiment,
    source: 'Reddit',
    timestamp: new Date(),
    productArea: issue.productArea,
    color: productAreas.find((pa) => pa.name === issue.productArea)?.color || '#E8258E',
  }))

  const mockRisingIssues = emergingIssues.slice(0, 3).map((issue) => ({
    id: issue.id,
    topic: issue.topic,
    productArea: issue.productArea,
    color: productAreas.find((pa) => pa.name === issue.productArea)?.color || '#E8258E',
    velocity: issue.intensity / 2,
    currentIntensity: issue.intensity,
    projectedIntensity: Math.round(issue.intensity * 1.5),
    timeToSpread: '2 hours',
    affectedUsers: issue.intensity * 100,
  }))

  const mockDelightMoments = emergingIssues
    .filter((issue) => issue.sentiment > 0.5)
    .slice(0, 5)
    .map((issue) => ({
      id: issue.id,
      topic: issue.topic,
      productArea: issue.productArea,
      color: productAreas.find((pa) => pa.name === issue.productArea)?.color || '#E8258E',
      sentiment: issue.sentiment,
      intensity: issue.intensity,
      timestamp: new Date(),
      source: 'Reddit',
      highlights: [`Great improvement in ${issue.topic}`],
    }))

  const mockVelocityData = productAreas.map((area) => ({
    name: area.name,
    growing: Math.floor(Math.random() * 10),
    stable: Math.floor(Math.random() * 15),
    declining: Math.floor(Math.random() * 8),
    color: area.color,
  }))

  const totalSignals = emergingIssues.reduce((acc, issue) => acc + issue.intensity, 0)
  const mockSentimentData = {
    positive: Math.floor(totalSignals * 0.4),
    neutral: Math.floor(totalSignals * 0.3),
    negative: Math.floor(totalSignals * 0.3),
  }

  return (
    <>
      {/* Splash Screen */}
      {!isReady && <SplashScreen />}

      {/* Dashboard Content */}
      <div className="space-y-6">
        {/* Hero Section - CHI with Key Metrics */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-tmobile-magenta/5 border-0 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-tmobile-magenta/5 via-transparent to-purple-500/5" />
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* CHI Gauge */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center border-r border-tmobile-gray-200">
            <h2 className="text-2xl font-bold text-[#E8258E] mb-2">
              Customer Happiness Index
            </h2>
            <p className="text-xs text-tmobile-gray-600 mb-6">
              Overall sentiment score
            </p>
            <CHIGauge
              score={overallCHI}
              size="lg"
              trend={-2.3}
              previousScore={overallCHI + 2.3}
            />
          </div>

          {/* Key Metrics Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-xs text-tmobile-gray-600 mb-1">Total Signals</div>
              <div className="text-3xl font-bold text-[#E8258E]">
                {totalSignals.toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-1">↑ 12% vs last hour</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-xs text-tmobile-gray-600 mb-1">Active Issues</div>
              <div className="text-3xl font-bold text-orange-600">
                {emergingIssues.length}
              </div>
              <div className="text-xs text-red-600 mt-1">↑ 3 new issues</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-xs text-tmobile-gray-600 mb-1">Positive Moments</div>
              <div className="text-3xl font-bold text-green-600">
                {mockDelightMoments.length}
              </div>
              <div className="text-xs text-green-600 mt-1">✨ Trending up</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-xs text-tmobile-gray-600 mb-1">Data Sources</div>
              <div className="text-3xl font-bold text-blue-600">
                {sourceData.length}
              </div>
              <div className="text-xs text-tmobile-gray-600 mt-1">All active</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-xs text-tmobile-gray-600 mb-1">Rising Issues</div>
              <div className="text-3xl font-bold text-red-600">
                {mockRisingIssues.length}
              </div>
              <div className="text-xs text-red-600 mt-1">⚠️ Needs attention</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-xs text-tmobile-gray-600 mb-1">Avg Response Time</div>
              <div className="text-3xl font-bold text-purple-600">
                5m
              </div>
              <div className="text-xs text-green-600 mt-1">↓ 2m faster</div>
            </div>
          </div>
        </div>
      </section>

      {/* Outage Metrics Section */}
      {outageData && outageData.summary.totalReports > 0 && (
        <section className="bg-white rounded-2xl shadow-xl p-6 border border-tmobile-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#E8258E] mb-1">
                Network Status
              </h2>
              <p className="text-sm text-tmobile-gray-600">
                Real-time outage reports from DownDetector and Outage.Report
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                outageData.summary.status === 'Major Outage'
                  ? 'bg-red-100 text-red-800'
                  : outageData.summary.status === 'Widespread Issues'
                  ? 'bg-orange-100 text-orange-800'
                  : outageData.summary.status === 'Service Degradation'
                  ? 'bg-yellow-100 text-yellow-800'
                  : outageData.summary.status === 'Minor Issues'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {outageData.summary.status}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-tmobile-magenta/5 to-purple-50 rounded-xl p-4 border border-tmobile-gray-200">
              <div className="text-sm text-tmobile-gray-600 mb-1">Total Reports</div>
              <div className="text-2xl font-bold text-[#E8258E]">
                {outageData.summary.totalReports.toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="text-sm text-tmobile-gray-600 mb-1">Affected Cities</div>
              <div className="text-2xl font-bold text-blue-600">
                {outageData.summary.affectedCities}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
              <div className="text-sm text-tmobile-gray-600 mb-1">Critical</div>
              <div className="text-2xl font-bold text-red-600">
                {outageData.summary.criticalCount}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200">
              <div className="text-sm text-tmobile-gray-600 mb-1">High</div>
              <div className="text-2xl font-bold text-orange-600">
                {outageData.summary.highCount}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="text-sm text-tmobile-gray-600 mb-1">View Map</div>
              <a
                href="/dashboard/geo"
                className="inline-flex items-center text-sm font-semibold text-[#E8258E] hover:text-[#C4006D] transition-colors"
              >
                Go to GeoMap →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Critical Alerts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarlyWarningSystem risingIssues={mockRisingIssues} />
        <MomentsOfDelight moments={mockDelightMoments} />
      </section>

      {/* Product Area Cards Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#E8258E]">Product Areas</h2>
            <p className="text-sm text-tmobile-gray-600 mt-1">
              Click any area to drill down into details
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productAreas.map((area) => (
            <ProductAreaCard
              key={area.id}
              name={area.name}
              color={area.color}
              chi={area.chi}
              trend={area.trend}
              signalCount={area.signalCount}
              onClick={() => handleProductAreaClick(area.name)}
            />
          ))}
        </div>
      </section>

      {/* Live Activity and Analytics Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <RealtimeActivityFeed signals={mockRealtimeSignals} />
        </div>
        <div className="lg:col-span-1">
          <SentimentDistribution data={mockSentimentData} />
        </div>
      </section>

      {/* Emerging Issues Table */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#E8258E]">Top Emerging Issues</h2>
          <p className="text-sm text-tmobile-gray-600 mt-1">
            Most impactful issues detected in the last hour
          </p>
        </div>
        <EmergingIssuesTable
          issues={emergingIssues}
          onCreateOpportunity={handleCreateOpportunity}
        />
      </section>

      {/* Analytics Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IssueVelocityChart data={mockVelocityData} />
        <SentimentTimeline data={sentimentData} />
      </section>

      {/* Source Breakdown */}
      <section>
        <SourceBreakdown data={sourceData} />
      </section>

      {/* Product Area Detail Sheet */}
      <ProductAreaDetail
        productArea={selectedProductArea}
        isOpen={!!selectedProductArea}
        onClose={() => setSelectedProductArea(null)}
      />
      </div>
    </>
  )
}
