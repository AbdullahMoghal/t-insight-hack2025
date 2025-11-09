'use client'

import { useEffect, useState } from 'react'
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

interface Signal {
  id: string
  topic: string
  sentiment: number
  source: string
  timestamp: Date
  productArea: string
  color: string
}

interface RealtimeActivityFeedProps {
  signals?: Signal[]
}

export function RealtimeActivityFeed({ signals = [] }: RealtimeActivityFeedProps) {
  const [visibleSignals, setVisibleSignals] = useState<Signal[]>([])
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Show only the most recent 10 signals
    setVisibleSignals(signals.slice(0, 10))
  }, [signals])

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.3) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (sentiment < -0.3) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const getSentimentBadge = (sentiment: number) => {
    if (sentiment > 0.3) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Positive
        </span>
      )
    }
    if (sentiment < -0.3) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Negative
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Neutral
      </span>
    )
  }

  return (
    <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-2xl shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-tmobile-magenta/5 to-purple-500/5 border-b border-tmobile-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="h-6 w-6 text-[#E8258E]" />
              {isLive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8258E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E8258E]"></span>
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-[#E8258E]">Live Activity Feed</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-tmobile-gray-600">
              {visibleSignals.length} signals
            </span>
            <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          </div>
        </div>
      </div>

      {/* Activity Stream */}
      <div className="flex-1 overflow-y-auto">
        {visibleSignals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Activity className="h-12 w-12 text-tmobile-gray-300 mb-3" />
            <p className="text-sm text-tmobile-gray-600">No signals detected yet</p>
            <p className="text-xs text-tmobile-gray-500 mt-1">Waiting for customer feedback...</p>
          </div>
        ) : (
          <div className="divide-y divide-tmobile-gray-200">
            {visibleSignals.map((signal, index) => (
              <div
                key={signal.id}
                className="px-6 py-3 hover:bg-tmobile-magenta/5 transition-colors duration-200 animate-fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Sentiment Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getSentimentIcon(signal.sentiment)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: signal.color }}
                      />
                      <p className="text-sm font-medium text-tmobile-black truncate">
                        {signal.topic}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-tmobile-gray-600">
                      <span>{signal.source}</span>
                      <span>•</span>
                      <span>{signal.productArea}</span>
                      <span>•</span>
                      <span>{format(signal.timestamp, 'HH:mm:ss')}</span>
                    </div>
                  </div>

                  {/* Sentiment Badge */}
                  <div className="flex-shrink-0">
                    {getSentimentBadge(signal.sentiment)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-tmobile-gray-200 px-6 py-3 bg-gradient-to-r from-tmobile-gray-50 to-white flex-shrink-0">
        <p className="text-xs text-tmobile-gray-600 text-center">
          Auto-refreshes every 30 seconds • Showing last 10 signals
        </p>
      </div>
    </div>
  )
}
