'use client'

import { TrendingUp, ArrowUpRight, CheckCircle2, BarChart3, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PositiveTrend {
  id: string
  type: 'chi_improvement' | 'issue_resolved' | 'sentiment_boost' | 'signal_reduction'
  title: string
  description: string
  productArea: string
  color: string
  metric: string
  change: number
  changeType: 'increase' | 'decrease' // increase = good (e.g., CHI up), decrease = good (e.g., issues down)
}

interface PositiveTrendsProps {
  trends?: PositiveTrend[]
  productAreas?: Array<{
    name: string
    color: string
    chi: number
    trend: number
  }>
}

export function PositiveTrends({ trends = [], productAreas = [] }: PositiveTrendsProps) {
  // Generate trends from product areas if not provided
  const displayTrends = trends.length > 0 
    ? trends 
    : productAreas
        .filter(area => area.trend > 0) // Only show improving areas
        .slice(0, 4)
        .map((area, index) => ({
          id: `trend-${index}`,
          type: 'chi_improvement' as const,
          title: `${area.name} CHI Improving`,
          description: `Customer Happiness Index trending upward`,
          productArea: area.name,
          color: area.color,
          metric: `${area.chi}`,
          change: area.trend,
          changeType: 'increase' as const,
        }))

  const getTrendIcon = (type: PositiveTrend['type']) => {
    switch (type) {
      case 'chi_improvement':
        return TrendingUp
      case 'issue_resolved':
        return CheckCircle2
      case 'sentiment_boost':
        return Sparkles
      case 'signal_reduction':
        return BarChart3
      default:
        return ArrowUpRight
    }
  }

  const getTrendColor = (type: PositiveTrend['type']) => {
    switch (type) {
      case 'chi_improvement':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'issue_resolved':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'sentiment_boost':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'signal_reduction':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-2xl shadow-xl">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 opacity-50" />

      {/* Header */}
      <div className="relative bg-gradient-to-r from-green-100/80 via-blue-100/80 to-purple-100/80 backdrop-blur-sm border-b border-green-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <TrendingUp className="h-6 w-6 text-green-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900">Positive Trends 📈</h3>
            <p className="text-xs text-green-700">Improvements and wins across product areas</p>
          </div>
        </div>
      </div>

      {/* Trends List */}
      <div className="relative max-h-[400px] overflow-y-auto p-6">
        {displayTrends.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-tmobile-gray-300 mx-auto mb-3" />
            <p className="text-sm text-tmobile-gray-600">No positive trends detected yet</p>
            <p className="text-xs text-tmobile-gray-500 mt-1">
              Improvements will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayTrends.map((trend, index) => {
              const Icon = getTrendIcon(trend.type)
              const colorClass = getTrendColor(trend.type)

              return (
                <div
                  key={trend.id}
                  className="relative bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Glow Effect */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-10"
                    style={{
                      background: `radial-gradient(circle at top left, ${trend.color}, transparent)`,
                    }}
                  />

                  {/* Content */}
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span
                          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: trend.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-tmobile-black text-sm truncate">
                            {trend.title}
                          </h4>
                          <p className="text-xs text-tmobile-gray-600 mt-0.5">
                            {trend.description}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${colorClass} border font-semibold flex-shrink-0 ml-2`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {trend.changeType === 'increase' ? '+' : ''}{trend.change}
                        {trend.type === 'chi_improvement' ? ' pts' : trend.type === 'signal_reduction' ? '%' : '%'}
                      </Badge>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-green-200">
                      <div className="flex items-center gap-3 text-xs text-tmobile-gray-600">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${trend.color}20`,
                            color: trend.color,
                          }}
                        >
                          {trend.productArea}
                        </span>
                        <span>•</span>
                        <span className="font-medium">{trend.metric}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                        <ArrowUpRight className="h-3 w-3" />
                        <span>Improving</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {displayTrends.length > 0 && (
        <div className="relative border-t border-green-200 px-6 py-3 bg-gradient-to-r from-green-50/80 to-blue-50/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-green-700 font-medium">
              ✨ {displayTrends.length} positive trend{displayTrends.length > 1 ? 's' : ''} detected
            </p>
            <p className="text-xs text-green-600">
              Avg improvement: +{(
                displayTrends.reduce((acc, t) => acc + t.change, 0) / displayTrends.length
              ).toFixed(1)} pts
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

