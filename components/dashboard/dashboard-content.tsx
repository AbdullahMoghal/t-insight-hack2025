'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CHIGauge } from './chi-gauge'
import { ProductAreaCard } from './product-area-card'
import { EmergingIssuesTable } from './emerging-issues-table'
import { SentimentTimeline } from './sentiment-timeline'
import { ProductAreaDetail } from './product-area-detail'
import { RealtimeActivityFeed } from './realtime-activity-feed'
import { EarlyWarningSystem } from './early-warning-system'
import { TopPerformers } from './top-performers'
import { IssueVelocityChart } from './issue-velocity-chart'
import { SentimentDistribution } from './sentiment-distribution'
import { SplashScreen } from '@/components/ui/splash-screen'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Save, ExternalLink } from 'lucide-react'
import { formatMinutes } from '@/lib/utils/advanced-metrics'

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

interface Insights {
  summary: string
  rootCause: string
  recommendations: string[]
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  urgency: 'Low' | 'Medium' | 'High' | 'Critical'
  expectedImpact: string
  stakeholders: string[]
}

interface EarlyWarningData {
  risingIssues: Array<{
    topic: string
    productAreaId: string
    productAreaName: string
    color: string
    currentIntensity: number
    velocity: number
    projectedIntensity: number
    timeToSpreadHours: number
    affectedUsers: number
    confidence: number
  }>
  totalRising: number
}

interface AdvancedMetrics {
  signalTrend: {
    current: number
    previous: number
    percentageChange: number
  }
  newIssues: {
    count: number
    total: number
  }
  responseTime: {
    averageMinutes: number
    trendMinutes: number
    sampleSize: number
  }
  positiveTrends: {
    count: number
  }
}

interface RealtimeData {
  realtimeSignals: Array<{
    id: string
    topic: string
    sentiment: number
    source: string
    timestamp: Date
    productArea: string
    color: string
  }>
  issueVelocity: Array<{
    name: string
    growing: number
    stable: number
    declining: number
    color: string
  }>
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
  }
}

interface DashboardContentProps {
  overallCHI: number
  chiTrend: number
  previousCHI: number
  productAreas: ProductArea[]
  emergingIssues: Issue[]
  sentimentData: DataPoint[]
  sourceData: SourceData[]
  advancedMetrics: AdvancedMetrics
  realtimeData: RealtimeData
  outageData?: OutageData
  earlyWarningData?: EarlyWarningData
}

export function DashboardContent({
  overallCHI,
  chiTrend,
  previousCHI,
  productAreas,
  emergingIssues,
  sentimentData,
  sourceData,
  advancedMetrics,
  realtimeData,
  outageData,
  earlyWarningData,
}: DashboardContentProps) {
  const router = useRouter()
  const [selectedProductArea, setSelectedProductArea] = useState<ProductArea | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [insights, setInsights] = useState<Insights | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [insightsError, setInsightsError] = useState<string | null>(null)
  const [isSavingOpportunity, setIsSavingOpportunity] = useState(false)
  const [sentimentTimeRange, setSentimentTimeRange] = useState<'24h' | '7d' | '30d'>('24h')
  const [sentimentDataState, setSentimentDataState] = useState<DataPoint[]>(sentimentData)
  const [originalSentimentData] = useState<DataPoint[]>(sentimentData) // Store original 24h data
  const [earlyWarningDataState, setEarlyWarningDataState] = useState<EarlyWarningData | undefined>(earlyWarningData)
  const [isLoadingEarlyWarning, setIsLoadingEarlyWarning] = useState(false)

  useEffect(() => {
    // Mark as ready after component mounts and data is available
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Fetch early warning data on mount
  useEffect(() => {
    const fetchEarlyWarningData = async () => {
      setIsLoadingEarlyWarning(true)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
        const response = await fetch(`${baseUrl}/api/dashboard/early-warning`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setEarlyWarningDataState(data)
          }
        } else {
          console.error('Failed to fetch early warning data:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching early warning data:', error)
      } finally {
        setIsLoadingEarlyWarning(false)
      }
    }

    fetchEarlyWarningData()
  }, [])

  // Fetch sentiment data when time range changes
  useEffect(() => {
    // If switching back to 24h, restore original data
    if (sentimentTimeRange === '24h') {
      setSentimentDataState(originalSentimentData)
      return
    }

    const fetchSentimentData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
        const response = await fetch(`${baseUrl}/api/dashboard/sentiment-timeline?range=${sentimentTimeRange}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.timeline && Array.isArray(data.timeline)) {
            // Convert timestamp strings to Date objects
            const timeline = data.timeline.map((point: any) => ({
              ...point,
              timestamp: new Date(point.timestamp),
            }))
            setSentimentDataState(timeline)
          } else {
            console.warn('No timeline data received')
          }
        } else {
          console.error('Failed to fetch sentiment timeline:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching sentiment timeline:', error)
      }
    }

    fetchSentimentData()
  }, [sentimentTimeRange, originalSentimentData])

  const handleProductAreaClick = (areaName: string) => {
    const area = productAreas.find((a) => a.name === areaName)
    if (area) {
      setSelectedProductArea(area)
    }
  }

  const handleCreateOpportunity = async (issueId: string) => {
    const issue = emergingIssues.find((i) => i.id === issueId)
    if (!issue) {
      console.error('Issue not found:', issueId)
      return
    }

    setSelectedIssue(issue)
    setInsights(null)
    setInsightsError(null)
    setIsLoadingInsights(true)

    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: issue.topic,
          intensity: issue.intensity,
          sentiment: issue.sentiment,
          sourceCount: issue.sourceCount,
          productArea: issue.productArea,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate insights')
      }

      if (data.success && data.insights) {
        setInsights(data.insights)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error generating insights:', error)
      setInsightsError(
        error instanceof Error ? error.message : 'Failed to generate insights'
      )
    } finally {
      setIsLoadingInsights(false)
    }
  }

  const handleSaveOpportunity = async () => {
    if (!selectedIssue || !insights) {
      toast.error('Cannot save opportunity', {
        description: 'Missing issue or insights data',
      })
      return
    }

    setIsSavingOpportunity(true)

    try {
      // Get product area ID
      const productAreaMatch = productAreas.find((pa) => pa.name === selectedIssue.productArea)
      if (!productAreaMatch) {
        throw new Error('Product area not found')
      }

      // Create opportunity
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueId: selectedIssue.id,
          title: selectedIssue.topic,
          description: insights.summary,
          productAreaId: productAreaMatch.id,
          topic: selectedIssue.topic, // API will query signals by topic and product area
          insights,
          effort: 5, // Default effort
          confidence: 0.7, // Default confidence
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create opportunity')
      }

      toast.success('Opportunity Created!', {
        description: 'View it in the PM Workbench',
        action: {
          label: 'Go to Workbench',
          onClick: () => router.push('/pm/opportunities'),
        },
      })

      // Close dialog
      setSelectedIssue(null)
      setInsights(null)
      setInsightsError(null)
    } catch (error) {
      console.error('Error saving opportunity:', error)
      toast.error('Failed to save opportunity', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsSavingOpportunity(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Transform early warning data for the component
  const risingIssues = (earlyWarningDataState?.risingIssues || []).map((issue) => ({
    id: `${issue.topic}-${issue.productAreaId}`,
    topic: issue.topic,
    productArea: issue.productAreaName,
    color: issue.color,
    velocity: issue.velocity,
    currentIntensity: issue.currentIntensity,
    projectedIntensity: issue.projectedIntensity,
    timeToSpread: issue.timeToSpreadHours > 0
      ? `${Math.round(issue.timeToSpreadHours * 10) / 10} hours`
      : 'Already critical',
    affectedUsers: issue.affectedUsers,
  }))

  // Use real realtime signals from API
  const realtimeSignals = realtimeData.realtimeSignals

  // Use real issue velocity data from API
  const velocityData = realtimeData.issueVelocity

  // Use real sentiment distribution from API
  const sentimentDistributionData = realtimeData.sentimentDistribution

  // Calculate total signals for display
  const totalSignals = emergingIssues.reduce((acc, issue) => acc + issue.intensity, 0)

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
              trend={chiTrend}
              previousScore={previousCHI}
            />
          </div>

          {/* Key Metrics Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-xs text-tmobile-gray-600 mb-1">Total Signals</div>
              <div className="text-3xl font-bold text-[#E8258E]">
                {totalSignals.toLocaleString()}
              </div>
              <div className={`text-xs mt-1 ${
                advancedMetrics.signalTrend.percentageChange >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {advancedMetrics.signalTrend.percentageChange >= 0 ? '↑' : '↓'} {Math.abs(advancedMetrics.signalTrend.percentageChange)}% vs last hour
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-xs text-tmobile-gray-600 mb-1">Active Issues</div>
              <div className="text-3xl font-bold text-orange-600">
                {emergingIssues.length}
              </div>
              <div className={`text-xs mt-1 ${
                advancedMetrics.newIssues.count > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {advancedMetrics.newIssues.count > 0 ? '↑' : '→'} {advancedMetrics.newIssues.count} new issue{advancedMetrics.newIssues.count !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-xs text-tmobile-gray-600 mb-1">Positive Trends</div>
              <div className="text-3xl font-bold text-green-600">
                {advancedMetrics.positiveTrends.count}
              </div>
              <div className="text-xs text-green-600 mt-1">📈 Improving area{advancedMetrics.positiveTrends.count !== 1 ? 's' : ''}</div>
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
              {isLoadingEarlyWarning ? (
                <div className="flex items-center justify-center h-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-red-600">
                    {risingIssues.length}
                  </div>
                  <div className="text-xs text-red-600 mt-1">⚠️ Needs attention</div>
                </>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-xs text-tmobile-gray-600 mb-1">Avg Response Time</div>
              <div className="text-3xl font-bold text-purple-600">
                {advancedMetrics.responseTime.averageMinutes > 0
                  ? formatMinutes(advancedMetrics.responseTime.averageMinutes)
                  : 'N/A'}
              </div>
              <div className={`text-xs mt-1 ${
                advancedMetrics.responseTime.trendMinutes < 0
                  ? 'text-green-600'
                  : advancedMetrics.responseTime.trendMinutes > 0
                  ? 'text-red-600'
                  : 'text-tmobile-gray-600'
              }`}>
                {advancedMetrics.responseTime.trendMinutes < 0 && `↓ ${formatMinutes(Math.abs(advancedMetrics.responseTime.trendMinutes))} faster`}
                {advancedMetrics.responseTime.trendMinutes > 0 && `↑ ${formatMinutes(advancedMetrics.responseTime.trendMinutes)} slower`}
                {advancedMetrics.responseTime.trendMinutes === 0 && advancedMetrics.responseTime.sampleSize > 0 && '→ No change'}
                {advancedMetrics.responseTime.sampleSize === 0 && 'Not enough data'}
              </div>
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
              <div className="text-sm text-tmobile-gray-600 mb-1">Geographic View</div>
              <a
                href="/dashboard/geo"
                className="inline-flex items-center text-sm font-semibold text-[#E8258E] hover:text-[#C4006D] transition-colors"
              >
                Regional Outage Map →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Critical Alerts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarlyWarningSystem risingIssues={risingIssues} isLoading={isLoadingEarlyWarning} />
        <TopPerformers productAreas={productAreas} />
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
          <RealtimeActivityFeed signals={realtimeSignals} />
        </div>
        <div className="lg:col-span-1">
          <SentimentDistribution data={sentimentDistributionData} sourceData={sourceData} />
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
        <IssueVelocityChart data={velocityData} />
        <SentimentTimeline
          data={sentimentDataState}
          timeRange={sentimentTimeRange}
          onTimeRangeChange={(range) => setSentimentTimeRange(range)}
        />
      </section>

      {/* Product Area Detail Sheet */}
      <ProductAreaDetail
        productArea={selectedProductArea}
        isOpen={!!selectedProductArea}
        onClose={() => setSelectedProductArea(null)}
      />

      {/* Insights Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={(open) => {
        if (!open) {
          setSelectedIssue(null)
          setInsights(null)
          setInsightsError(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#E8258E]">
              AI-Generated Insights
            </DialogTitle>
            {selectedIssue && (
              <DialogDescription className="mt-2">
                <span className="font-semibold">Issue:</span> {selectedIssue.topic}
                <br />
                <span className="font-semibold">Product Area:</span> {selectedIssue.productArea}
              </DialogDescription>
            )}
          </DialogHeader>

          {isLoadingInsights && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8258E] mb-4"></div>
              <p className="text-tmobile-gray-600">Generating insights with AI...</p>
            </div>
          )}

          {insightsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-700">{insightsError}</p>
            </div>
          )}

          {insights && !isLoadingInsights && (
            <div className="space-y-6 mt-4">
              {/* Priority and Urgency Badges */}
              <div className="flex gap-4">
                <div className={`px-3 py-1 rounded-full border text-sm font-semibold ${getPriorityColor(insights.priority)}`}>
                  Priority: {insights.priority}
                </div>
                <div className={`px-3 py-1 rounded-full border text-sm font-semibold ${getUrgencyColor(insights.urgency)}`}>
                  Urgency: {insights.urgency}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-2 text-tmobile-gray-800">Summary</h3>
                <p className="text-tmobile-gray-700">{insights.summary}</p>
              </div>

              {/* Root Cause */}
              <div>
                <h3 className="font-semibold text-lg mb-2 text-tmobile-gray-800">Root Cause Analysis</h3>
                <p className="text-tmobile-gray-700">{insights.rootCause}</p>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-tmobile-gray-800">Recommendations</h3>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#E8258E] font-bold mt-1">•</span>
                      <span className="text-tmobile-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expected Impact */}
              <div>
                <h3 className="font-semibold text-lg mb-2 text-tmobile-gray-800">Expected Impact</h3>
                <p className="text-tmobile-gray-700">{insights.expectedImpact}</p>
              </div>

              {/* Stakeholders */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-tmobile-gray-800">Stakeholders</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.stakeholders.map((stakeholder, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#E8258E]/10 text-[#E8258E] rounded-full text-sm font-medium border border-[#E8258E]/20"
                    >
                      {stakeholder}
                    </span>
                  ))}
                </div>
              </div>

              {/* Save as Opportunity Button */}
              <div className="flex gap-3 pt-6 border-t border-tmobile-gray-200">
                <Button
                  onClick={handleSaveOpportunity}
                  disabled={isSavingOpportunity}
                  className="flex-1 bg-[#E8258E] hover:bg-[#D01A7A] text-white font-semibold"
                >
                  {isSavingOpportunity ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save as Opportunity
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => router.push('/pm/opportunities')}
                  variant="outline"
                  className="border-[#E8258E]/30 text-[#E8258E] hover:bg-[#E8258E]/10"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Workbench
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </>
  )
}
