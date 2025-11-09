'use client'

import { Sparkles, TrendingUp, Heart, Star } from 'lucide-react'
import { format } from 'date-fns'

interface DelightMoment {
  id: string
  topic: string
  productArea: string
  color: string
  sentiment: number // 0.5 to 1.0
  intensity: number
  timestamp: Date
  source: string
  highlights?: string[]
}

interface MomentsOfDelightProps {
  moments?: DelightMoment[]
}

export function MomentsOfDelight({ moments = [] }: MomentsOfDelightProps) {
  const getDelightLevel = (sentiment: number) => {
    if (sentiment >= 0.8) return { icon: Star, label: 'Exceptional', color: 'text-purple-600', bg: 'bg-purple-100' }
    if (sentiment >= 0.6) return { icon: Heart, label: 'Great', color: 'text-pink-600', bg: 'bg-pink-100' }
    return { icon: TrendingUp, label: 'Good', color: 'text-green-600', bg: 'bg-green-100' }
  }

  return (
    <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-2xl shadow-xl">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 opacity-50" />

      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-yellow-100/80 backdrop-blur-sm border-b border-purple-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-purple-900">Moments of Delight ✨</h3>
            <p className="text-xs text-purple-700">Celebrating positive customer experiences</p>
          </div>
        </div>
      </div>

      {/* Delight Moments */}
      <div className="relative max-h-[400px] overflow-y-auto p-6">
        {moments.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-tmobile-gray-300 mx-auto mb-3" />
            <p className="text-sm text-tmobile-gray-600">No exceptional moments yet</p>
            <p className="text-xs text-tmobile-gray-500 mt-1">
              Positive feedback will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {moments.map((moment, index) => {
              const delight = getDelightLevel(moment.sentiment)
              const Icon = delight.icon

              return (
                <div
                  key={moment.id}
                  className="relative bg-white/80 backdrop-blur-sm border border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Glow Effect */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-10"
                    style={{
                      background: `radial-gradient(circle at top left, ${moment.color}, transparent)`,
                    }}
                  />

                  {/* Content */}
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: moment.color }}
                        />
                        <h4 className="font-semibold text-tmobile-black text-sm">
                          {moment.topic}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon className={`h-4 w-4 ${delight.color}`} />
                        <span className={`text-xs font-semibold ${delight.color}`}>
                          {delight.label}
                        </span>
                      </div>
                    </div>

                    {/* Highlights */}
                    {moment.highlights && moment.highlights.length > 0 && (
                      <div className="mb-3 space-y-1">
                        {moment.highlights.map((highlight, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs text-tmobile-gray-700"
                          >
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span className="italic">&quot;{highlight}&quot;</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-purple-200">
                      <div className="flex items-center gap-3 text-xs text-tmobile-gray-600">
                        <span className="flex items-center gap-1">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${moment.color}20`,
                              color: moment.color,
                            }}
                          >
                            {moment.productArea}
                          </span>
                        </span>
                        <span>•</span>
                        <span>{moment.source}</span>
                        <span>•</span>
                        <span>{format(moment.timestamp, 'MMM d, HH:mm')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${delight.bg} ${delight.color}`}>
                          {(moment.sentiment * 100).toFixed(0)}%
                        </div>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {moment.intensity} signals
                        </div>
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
      {moments.length > 0 && (
        <div className="relative border-t border-purple-200 px-6 py-3 bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-purple-700 font-medium">
              🎉 {moments.length} positive moment{moments.length > 1 ? 's' : ''} detected
            </p>
            <p className="text-xs text-purple-600">
              Avg sentiment: {(moments.reduce((acc, m) => acc + m.sentiment, 0) / moments.length * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
