'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CHIGauge } from './chi-gauge'
import { SentimentTimeline } from './sentiment-timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductArea {
  id: string
  name: string
  color: string
  chi: number
  trend: number
  signalCount: number
}

interface ProductAreaDetailData {
  id: string
  name: string
  color: string
  chi: number
  trend: number
  signalCount: number
  resolvedCount: number
  sentimentTimeline: Array<{
    timestamp: string
    sentiment: number
  }>
  topIssues: Array<{
    id: string
    topic: string
    intensity: number
    sentiment: number
    sourceCount: number
  }>
}

interface ProductAreaDetailProps {
  productArea: ProductArea | null
  isOpen: boolean
  onClose: () => void
}

interface RecommendedAction {
  title: string
  description: string
}

export function ProductAreaDetail({
  productArea,
  isOpen,
  onClose,
}: ProductAreaDetailProps) {
  const [detailData, setDetailData] = useState<ProductAreaDetailData | null>(null)
  const [loading, setLoading] = useState(false)
  const [actions, setActions] = useState<RecommendedAction[]>([])
  const [loadingActions, setLoadingActions] = useState(false)
  const [actionsError, setActionsError] = useState<string | null>(null)

  // Fetch detailed data when modal opens
  useEffect(() => {
    if (isOpen && productArea) {
      setLoading(true)
      fetch(`/api/dashboard/product-area/${productArea.id}`)
        .then((res) => res.json())
        .then((data) => {
          setDetailData(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching product area detail:', error)
          setLoading(false)
        })
    }
  }, [isOpen, productArea])

  // Fetch recommended actions when modal opens and detail data is available
  useEffect(() => {
    if (isOpen && productArea && detailData) {
      setLoadingActions(true)
      setActionsError(null)
      
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      fetch(`${baseUrl}/api/insights/product-area-actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productArea: {
            id: productArea.id,
            name: productArea.name,
          },
          chi: productArea.chi,
          trend: productArea.trend,
          signalCount: productArea.signalCount,
          topIssues: detailData.topIssues || [],
        }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((errorData) => {
              throw new Error(errorData.message || errorData.error || 'Failed to generate actions')
            })
          }
          return res.json()
        })
        .then((data) => {
          if (data.success && data.actions) {
            // Ensure we only show 3 actions
            setActions(data.actions.slice(0, 3))
          } else {
            throw new Error('Invalid response from API')
          }
          setLoadingActions(false)
        })
        .catch((error) => {
          console.error('Error generating recommended actions:', error)
          setActionsError(error instanceof Error ? error.message : 'Failed to generate actions')
          setLoadingActions(false)
        })
    } else if (!isOpen) {
      // Reset actions when modal closes
      setActions([])
      setActionsError(null)
    }
  }, [isOpen, productArea, detailData])

  if (!productArea) return null

  // Use detail data if available, otherwise use basic product area data
  const displayData = detailData || productArea

  // Convert sentiment timeline to chart format
  const areasentimentData = detailData?.sentimentTimeline.map((point) => ({
    timestamp: new Date(point.timestamp),
    [productArea.name]: point.sentiment,
  })) || []

  const getTrendIcon = () => {
    if (productArea.trend > 0)
      return <TrendingUp className="h-5 w-5 text-green-600" />
    if (productArea.trend < 0)
      return <TrendingDown className="h-5 w-5 text-red-600" />
    return <Minus className="h-5 w-5 text-gray-600" />
  }

  const getTrendText = () => {
    if (productArea.trend > 0) return `+${productArea.trend}% vs last hour`
    if (productArea.trend < 0) return `${productArea.trend}% vs last hour`
    return 'No change vs last hour'
  }

  // Real metrics from API
  const metrics = [
    {
      label: 'Active Signals',
      value: displayData.signalCount,
      change: displayData.trend,
      icon: AlertCircle,
      suffix: '',
    },
    {
      label: 'Improved Issues',
      value: detailData?.resolvedCount || 0,
      change: 0, // We don't have historical data for change yet
      icon: CheckCircle2,
      suffix: '',
      description: 'Topics showing sentiment improvement',
    },
  ]

  // Real top issues from API
  const topIssues = detailData?.topIssues || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 gap-0 border-0 shadow-2xl rounded-2xl">
        {/* Colored top border */}
        <div
          className="absolute top-0 left-0 right-0 h-2 rounded-t-2xl"
          style={{ backgroundColor: productArea.color }}
        />

        {/* Header with gradient */}
        <div
          className="relative px-8 pt-8 pb-6 overflow-hidden mt-2"
          style={{
            background: `linear-gradient(135deg, ${productArea.color}10 0%, ${productArea.color}05 50%, transparent 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent backdrop-blur-sm" />
          <DialogHeader className="relative">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{
                      backgroundColor: productArea.color,
                      boxShadow: `0 0 20px ${productArea.color}60`
                    }}
                  />
                  <DialogTitle className="text-4xl font-bold text-tmobile-black">
                    {productArea.name}
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2 ml-7">
                  {getTrendIcon()}
                  <span className="text-sm font-semibold text-tmobile-gray-700">
                    {getTrendText()}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] px-8 py-6 space-y-6 bg-gradient-to-b from-transparent to-gray-50/30">
          {/* CHI Score and Key Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CHI Score Section */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-gray-50/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#E8258E]">
                  Customer Happiness Index
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <CHIGauge score={productArea.chi} size="md" />
              </CardContent>
            </Card>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="flex items-center justify-center p-8 text-tmobile-gray-500">
                Loading metrics...
              </div>
            ) : (
              metrics.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <Card
                    key={index}
                    className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50/50 hover:shadow-xl transition-all hover:scale-105"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="p-3 rounded-xl shadow-md"
                          style={{
                            backgroundColor: `${productArea.color}15`,
                          }}
                        >
                          <Icon
                            className="h-6 w-6"
                            style={{ color: productArea.color }}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-medium text-tmobile-gray-600">
                            {metric.label}
                          </p>
                          {metric.description && (
                            <p className="text-[10px] text-tmobile-gray-400">
                              {metric.description}
                            </p>
                          )}
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-tmobile-black">
                              {metric.value}{metric.suffix}
                            </p>
                            {metric.change !== 0 && (
                              <Badge
                                variant="outline"
                                className={
                                  metric.change > 0
                                    ? 'text-green-600 border-green-200 bg-green-50'
                                    : metric.change < 0
                                    ? 'text-red-600 border-red-200 bg-red-50'
                                    : 'text-gray-600 border-gray-200 bg-gray-50'
                                }
                              >
                                {metric.change > 0 ? '+' : ''}
                                {metric.change}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
            </div>
          </div>

          {/* Sentiment Timeline - Single Line */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/30 overflow-hidden">
            <div
              className="h-1 w-full"
              style={{ backgroundColor: productArea.color }}
            />
            <CardHeader>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-tmobile-magenta to-purple-600 bg-clip-text text-transparent">
                Sentiment Trend (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <SentimentTimeline
                  data={areasentimentData as any}
                  singleLine={productArea.name}
                  color={productArea.color}
                />
              </div>
            </CardContent>
          </Card>

          {/* Top Issues */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-gray-50/50 overflow-hidden">
            <div
              className="h-1 w-full"
              style={{ backgroundColor: productArea.color }}
            />
            <CardHeader>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-tmobile-magenta to-purple-600 bg-clip-text text-transparent">
                Top Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8 text-tmobile-gray-500">
                  Loading issues...
                </div>
              ) : topIssues.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-tmobile-gray-500">
                  No issues found in the last 24 hours
                </div>
              ) : (
                <div className="space-y-3">
                  {topIssues.map((issue, index) => (
                    <div
                      key={index}
                      className="relative p-5 rounded-xl bg-gradient-to-r from-white via-gray-50/50 to-white border-l-4 shadow-md hover:shadow-lg transition-all hover:translate-x-1"
                      style={{ borderLeftColor: productArea.color }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-tmobile-black flex-1">
                          {issue.topic}
                        </h4>
                        <Badge
                          variant="outline"
                          className="font-bold"
                          style={{
                            borderColor: productArea.color,
                            color: productArea.color,
                            backgroundColor: `${productArea.color}10`,
                          }}
                        >
                          Intensity: {issue.intensity}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          className={
                            issue.sentiment >= 0
                              ? 'text-green-700 bg-green-50 border border-green-200'
                              : 'text-red-700 bg-red-50 border border-red-200'
                          }
                        >
                          Sentiment: {issue.sentiment.toFixed(2)}
                        </Badge>
                        <Badge variant="outline" className="text-tmobile-gray-600">
                          {issue.sourceCount} {issue.sourceCount === 1 ? 'source' : 'sources'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="border-0 shadow-xl overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `linear-gradient(135deg, ${productArea.color} 0%, transparent 100%)`,
              }}
            />
            <div
              className="h-1 w-full"
              style={{ backgroundColor: productArea.color }}
            />
            <CardHeader className="relative">
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-tmobile-magenta to-purple-600 bg-clip-text text-transparent">
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {loadingActions ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#E8258E] mb-3" />
                  <p className="text-sm text-tmobile-gray-600">Generating recommendations...</p>
                </div>
              ) : actionsError ? (
                <div className="py-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-semibold mb-2 text-sm">Error</p>
                    <p className="text-red-700 text-xs">{actionsError}</p>
                    {actionsError.includes('GEMINI_API_KEY') && (
                      <p className="text-red-600 text-xs mt-2">
                        Please add GEMINI_API_KEY to your .env.local file
                      </p>
                    )}
                  </div>
                </div>
              ) : actions.length > 0 ? (
                <ul className="space-y-4">
                  {actions.map((action, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/80 hover:bg-white transition-colors">
                      <div
                        className="h-6 w-6 rounded-full flex items-center justify-center mt-0.5 shadow-md flex-shrink-0"
                        style={{
                          backgroundColor: productArea.color,
                          boxShadow: `0 0 15px ${productArea.color}40`
                        }}
                      >
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-tmobile-gray-800 mb-1">
                          {action.title}
                        </p>
                        {action.description && (
                          <p className="text-xs text-tmobile-gray-600 leading-relaxed">
                            {action.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-tmobile-gray-600">No recommendations available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
