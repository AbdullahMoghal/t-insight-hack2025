'use client'

import { TrendingUp, Award, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductArea {
  id: string
  name: string
  color: string
  chi: number
  trend: number
  signalCount: number
}

interface TopPerformersProps {
  productAreas: ProductArea[]
}

export function TopPerformers({ productAreas }: TopPerformersProps) {
  // Sort product areas by CHI score (highest first)
  const topProductAreas = [...productAreas]
    .sort((a, b) => b.chi - a.chi)
    .slice(0, 4)

  // Calculate average CHI
  const avgCHI = productAreas.length > 0
    ? Math.round(productAreas.reduce((sum, area) => sum + area.chi, 0) / productAreas.length)
    : 0

  // Count improving areas
  const improvingAreas = productAreas.filter(area => area.trend > 0).length

  return (
    <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-2xl shadow-xl">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50" />

      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-100/80 via-purple-100/80 to-pink-100/80 backdrop-blur-sm border-b border-blue-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Award className="h-6 w-6 text-blue-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-900">Top Performers 🏆</h3>
            <p className="text-xs text-blue-700">Best performing product areas</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-h-[400px] overflow-y-auto p-6">
        {topProductAreas.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-tmobile-gray-300 mx-auto mb-3" />
            <p className="text-sm text-tmobile-gray-600">No product areas available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <div className="text-xs text-blue-600 mb-1">Avg CHI</div>
                <div className="text-2xl font-bold text-blue-700">{avgCHI}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <div className="text-xs text-green-600 mb-1">Improving</div>
                <div className="text-2xl font-bold text-green-700">{improvingAreas}</div>
              </div>
            </div>

            {/* Top Product Areas */}
            {topProductAreas.map((area, index) => {
              const isImproving = area.trend > 0
              const rank = index + 1
              
              return (
                <div
                  key={area.id}
                  className="relative bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                >
                  {/* Glow Effect */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-10"
                    style={{
                      background: `radial-gradient(circle at top left, ${area.color}, transparent)`,
                    }}
                  />

                  {/* Content */}
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-white shadow-md flex-shrink-0"
                          style={{
                            backgroundColor: area.color,
                            boxShadow: `0 0 15px ${area.color}40`
                          }}
                        >
                          {rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-tmobile-black text-sm truncate">
                            {area.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium" style={{ color: area.color }}>
                              CHI: {Math.round(area.chi)}
                            </span>
                            {isImproving && (
                              <Badge className="bg-green-100 text-green-700 border-green-300 text-xs px-1.5 py-0">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +{area.trend}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                      <div className="flex items-center gap-3 text-xs text-tmobile-gray-600">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          <span>{area.signalCount} signals</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isImproving ? (
                          <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Improving
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Stable</span>
                        )}
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
      {topProductAreas.length > 0 && (
        <div className="relative border-t border-blue-200 px-6 py-3 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-blue-700 font-medium">
              🏆 {topProductAreas.length} top performer{topProductAreas.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-blue-600">
              Avg CHI: {avgCHI}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

