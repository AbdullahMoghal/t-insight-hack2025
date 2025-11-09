'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react'

interface SentimentData {
  positive: number
  neutral: number
  negative: number
}

interface SourceData {
  name: string
  value: number
}

interface SentimentDistributionProps {
  data?: SentimentData
  productArea?: string
  sourceData?: SourceData[]
}

export function SentimentDistribution({ data, productArea, sourceData = [] }: SentimentDistributionProps) {
  const [currentView, setCurrentView] = useState(0) // 0 = sentiment, 1 = sources
  // Default data if none provided
  const sentimentData = data || { positive: 0, neutral: 0, negative: 0 }

  const total = sentimentData.positive + sentimentData.neutral + sentimentData.negative

  const chartData = [
    { name: 'Positive', value: sentimentData.positive, color: '#00A19C', icon: TrendingUp },
    { name: 'Neutral', value: sentimentData.neutral, color: '#737373', icon: Minus },
    { name: 'Negative', value: sentimentData.negative, color: '#C4262E', icon: TrendingDown },
  ]

  const getPercentage = (value: number) => {
    if (total === 0) return 0
    return ((value / total) * 100).toFixed(1)
  }

  const getDominantSentiment = () => {
    if (total === 0) return { label: 'No Data', color: '#737373', icon: Minus }
    const max = Math.max(sentimentData.positive, sentimentData.neutral, sentimentData.negative)
    if (max === sentimentData.positive) return { label: 'Positive', color: '#00A19C', icon: TrendingUp }
    if (max === sentimentData.negative) return { label: 'Negative', color: '#C4262E', icon: TrendingDown }
    return { label: 'Neutral', color: '#737373', icon: Minus }
  }

  const dominant = getDominantSentiment()
  const DominantIcon = dominant.icon

  const COLORS = [
    '#E8258E', '#7C3E93', '#00A19C', '#F58220',
    '#4F46E5', '#EC4899', '#10B981', '#F59E0B'
  ]

  const sourceTotal = sourceData.reduce((sum, item) => sum + item.value, 0)
  const sourceChartData = sourceData.map((item) => ({
    ...item,
    percentage: ((item.value / sourceTotal) * 100).toFixed(1),
  }))

  const views = ['Sentiment', 'Sources']

  const handlePrevView = () => {
    setCurrentView((prev) => (prev === 0 ? views.length - 1 : prev - 1))
  }

  const handleNextView = () => {
    setCurrentView((prev) => (prev === views.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-2xl shadow-xl p-6 h-full flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-tmobile-magenta/5 via-transparent to-purple-500/5" />

      <div className="relative flex-1 flex flex-col">
        <div className="mb-4 flex-shrink-0 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#E8258E] mb-1">
              {currentView === 0 ? 'Sentiment Distribution' : 'Source Distribution'}
            </h3>
            <p className="text-xs text-tmobile-gray-600">
              {currentView === 0
                ? (productArea ? `${productArea} sentiment breakdown` : 'Overall sentiment breakdown')
                : 'Distribution across data sources'
              }
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevView}
              className="p-1 rounded-lg hover:bg-tmobile-magenta/10 transition-colors"
              aria-label="Previous view"
            >
              <ChevronLeft className="h-5 w-5 text-[#E8258E]" />
            </button>
            <button
              onClick={handleNextView}
              className="p-1 rounded-lg hover:bg-tmobile-magenta/10 transition-colors"
              aria-label="Next view"
            >
              <ChevronRight className="h-5 w-5 text-[#E8258E]" />
            </button>
          </div>
        </div>

        {/* Sentiment View */}
        {currentView === 0 && (
          <>
            {total === 0 ? (
              <div className="text-center py-12 flex-1 flex items-center justify-center">
                <div>
                  <Minus className="h-12 w-12 text-tmobile-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-tmobile-gray-600">No sentiment data available</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                {/* Pie Chart */}
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

            {/* Stats Grid */}
            <div className="mt-4 grid grid-cols-3 gap-3 flex-shrink-0">
              {chartData.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.name}
                    className="text-center p-2 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    style={{
                      backgroundColor: `${item.color}05`,
                    }}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <Icon className="h-3 w-3" style={{ color: item.color }} />
                    </div>
                    <p className="text-xs text-tmobile-gray-600 mb-0.5">{item.name}</p>
                    <p className="text-xl font-bold" style={{ color: item.color }}>
                      {getPercentage(item.value)}%
                    </p>
                    <p className="text-xs text-tmobile-gray-500 mt-0.5">
                      {item.value.toLocaleString()} signals
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Dominant Sentiment Card */}
            <div
              className="mt-3 p-3 rounded-lg border-2 flex-shrink-0"
              style={{
                borderColor: dominant.color,
                backgroundColor: `${dominant.color}10`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${dominant.color}20`,
                    }}
                  >
                    <DominantIcon className="h-4 w-4" style={{ color: dominant.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-tmobile-gray-600">Dominant Sentiment</p>
                    <p className="text-sm font-bold" style={{ color: dominant.color }}>
                      {dominant.label}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-tmobile-gray-600">Total Signals</p>
                  <p className="text-base font-bold text-tmobile-black">
                    {total.toLocaleString()}
                  </p>
                </div>
              </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Source View */}
        {currentView === 1 && (
          <>
            {sourceTotal === 0 ? (
              <div className="text-center py-12 flex-1 flex items-center justify-center">
                <div>
                  <Minus className="h-12 w-12 text-tmobile-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-tmobile-gray-600">No source data available</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                {/* Pie Chart */}
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={sourceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sourceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Source List */}
                <div className="mt-4 space-y-2 flex-shrink-0 max-h-[280px] overflow-y-auto">
                  {sourceChartData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-tmobile-gray-50 to-white border border-tmobile-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-tmobile-black">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-tmobile-gray-600">
                          {item.value.toLocaleString()} signals
                        </span>
                        <span
                          className="text-sm font-bold min-w-[3rem] text-right"
                          style={{ color: COLORS[index % COLORS.length] }}
                        >
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
