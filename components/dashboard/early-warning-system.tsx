'use client'

import { AlertTriangle, TrendingUp, Clock, Users } from 'lucide-react'

interface RisingIssue {
  id: string
  topic: string
  productArea: string
  color: string
  velocity: number // signals per hour
  currentIntensity: number
  projectedIntensity: number
  timeToSpread: string // e.g., "2 hours"
  affectedUsers: number
}

interface EarlyWarningSystemProps {
  risingIssues?: RisingIssue[]
  isLoading?: boolean
}

export function EarlyWarningSystem({ risingIssues = [], isLoading = false }: EarlyWarningSystemProps) {
  // Normalize topic to title case
  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getSeverityColor = (velocity: number) => {
    if (velocity > 50) return 'border-red-500 bg-red-50'
    if (velocity > 25) return 'border-orange-500 bg-orange-50'
    if (velocity > 10) return 'border-yellow-500 bg-yellow-50'
    return 'border-blue-500 bg-blue-50'
  }

  const getSeverityLabel = (velocity: number) => {
    if (velocity > 50) return { text: 'Critical', color: 'text-red-700', bg: 'bg-red-100' }
    if (velocity > 25) return { text: 'High', color: 'text-orange-700', bg: 'bg-orange-100' }
    if (velocity > 10) return { text: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-100' }
    return { text: 'Low', color: 'text-blue-700', bg: 'bg-blue-100' }
  }

  return (
    <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border-b border-orange-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-orange-900">Early Warning System</h3>
            <p className="text-xs text-orange-700">Detecting issues before they spread</p>
          </div>
        </div>
      </div>

      {/* Rising Issues */}
      <div className="relative max-h-[400px] overflow-y-auto p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
            <p className="text-sm font-medium text-orange-800">Analyzing Trends...</p>
            <p className="text-xs text-orange-600 mt-1">Detecting rapidly escalating issues</p>
          </div>
        ) : risingIssues.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-800">All Clear</p>
            <p className="text-xs text-green-600 mt-1">No rapidly escalating issues detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {risingIssues.map((issue) => {
              const severity = getSeverityLabel(issue.velocity)
              return (
                <div
                  key={issue.id}
                  className={`relative border-l-4 ${getSeverityColor(issue.velocity)} rounded-lg p-4 hover:shadow-md transition-shadow`}
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: issue.color }}
                        />
                        <h4 className="font-semibold text-tmobile-black text-sm">
                          {toTitleCase(issue.topic)}
                        </h4>
                      </div>
                      <p className="text-xs text-tmobile-gray-600">
                        {issue.productArea}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${severity.bg} ${severity.color}`}>
                      {severity.text}
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-tmobile-gray-600">Velocity</span>
                      </div>
                      <p className="text-sm font-bold text-tmobile-black">
                        +{issue.velocity}/hr
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-tmobile-gray-600">Affected</span>
                      </div>
                      <p className="text-sm font-bold text-tmobile-black">
                        {issue.affectedUsers.toLocaleString()}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-tmobile-gray-600">ETA</span>
                      </div>
                      <p className="text-sm font-bold text-tmobile-black">
                        {issue.timeToSpread}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-xs text-tmobile-gray-600">Projected</span>
                      </div>
                      <p className="text-sm font-bold text-red-600">
                        {issue.projectedIntensity}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-tmobile-gray-600 mb-1">
                      <span>Intensity Growth</span>
                      <span>
                        {issue.currentIntensity} → {issue.projectedIntensity}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((issue.currentIntensity / issue.projectedIntensity) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {risingIssues.length > 0 && (
        <div className="border-t border-tmobile-gray-200 px-6 py-3 bg-gradient-to-r from-orange-50 to-white">
          <p className="text-xs text-orange-700 font-medium">
            ⚠️ {risingIssues.length} issue{risingIssues.length > 1 ? 's' : ''} detected with rapid growth
          </p>
        </div>
      )}
    </div>
  )
}
