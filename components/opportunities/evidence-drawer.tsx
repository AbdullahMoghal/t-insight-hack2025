'use client'

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, Calendar, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'

interface Signal {
  id: string
  source: string
  topic: string
  sentiment: number
  intensity: number
  detected_at: string
  meta?: {
    text?: string
    url?: string
    author?: string
  }
  product_area?: {
    name: string
    color: string
  }
}

interface EvidenceDrawerProps {
  opportunityId: string | null
  isOpen: boolean
  onClose: () => void
}

export function EvidenceDrawer({ opportunityId, isOpen, onClose }: EvidenceDrawerProps) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [groupedSignals, setGroupedSignals] = useState<Record<string, Signal[]>>({})
  const [summary, setSummary] = useState<{
    totalSignals: number
    averageSentiment: number
    sources: Array<{ name: string; count: number }>
    timeRange: { earliest: string; latest: string } | null
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && opportunityId) {
      fetchSignals()
    }
  }, [isOpen, opportunityId])

  const fetchSignals = async () => {
    if (!opportunityId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/signals`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch signals')
      }

      setSignals(data.signals || [])
      setGroupedSignals(data.groupedSignals || {})
      setSummary(data.summary || null)
    } catch (err) {
      console.error('Error fetching signals:', err)
      setError(err instanceof Error ? err.message : 'Failed to load evidence')
    } finally {
      setLoading(false)
    }
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment >= 0.3) return <ThumbsUp className="h-4 w-4 text-green-600" />
    if (sentiment >= -0.3) return <Minus className="h-4 w-4 text-gray-600" />
    return <ThumbsDown className="h-4 w-4 text-red-600" />
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.3) return 'bg-green-100 text-green-800 border-green-200'
    if (sentiment >= -0.3) return 'bg-gray-100 text-gray-800 border-gray-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white/95 backdrop-blur-md">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-[#E8258E]">
            Evidence & Source Signals
          </SheetTitle>
          <SheetDescription>
            Customer feedback and signals supporting this opportunity
          </SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8258E]"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-red-800 font-medium">Error loading evidence</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && summary && (
          <div className="space-y-6 mt-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-tmobile-magenta/5 to-purple-50 rounded-xl p-4 border border-tmobile-gray-200">
                <div className="text-sm text-tmobile-gray-600 mb-1">Total Signals</div>
                <div className="text-2xl font-bold text-[#E8258E]">
                  {summary.totalSignals}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <div className="text-sm text-tmobile-gray-600 mb-1">Avg Sentiment</div>
                <div className="flex items-center gap-2">
                  {getSentimentIcon(summary.averageSentiment)}
                  <span className="text-2xl font-bold text-tmobile-black">
                    {summary.averageSentiment.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sources */}
            {summary.sources.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-tmobile-gray-800 mb-3">
                  Top Sources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summary.sources.map((source) => (
                    <Badge
                      key={source.name}
                      variant="outline"
                      className="bg-white border-tmobile-gray-300"
                    >
                      {source.name} ({source.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Signals by Source */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-tmobile-gray-800">
                Signals ({signals.length})
              </h3>

              {Object.entries(groupedSignals).map(([source, sourceSignals]) => (
                <div key={source} className="space-y-3">
                  <h4 className="text-sm font-semibold text-tmobile-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E8258E]" />
                    {source} ({sourceSignals.length})
                  </h4>

                  {sourceSignals.map((signal) => (
                    <div
                      key={signal.id}
                      className="bg-white border border-tmobile-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <p className="text-sm text-tmobile-black font-medium mb-1">
                            {signal.topic}
                          </p>
                          {signal.meta?.text && (
                            <p className="text-sm text-tmobile-gray-700 leading-relaxed">
                              "{signal.meta.text}"
                            </p>
                          )}
                        </div>
                        <Badge className={`${getSentimentColor(signal.sentiment)} text-xs border shrink-0`}>
                          {signal.sentiment.toFixed(2)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-tmobile-gray-100">
                        <div className="flex items-center gap-4 text-xs text-tmobile-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatRelativeTime(signal.detected_at)}
                          </span>
                          {signal.meta?.author && (
                            <span>By {signal.meta.author}</span>
                          )}
                        </div>

                        {signal.meta?.url && (
                          <a
                            href={signal.meta.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#E8258E] hover:text-[#D01A7A] font-medium flex items-center gap-1"
                          >
                            View Source
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && signals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-tmobile-gray-500">No signals found for this opportunity</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
