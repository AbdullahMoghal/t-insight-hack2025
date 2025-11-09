'use client'

import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Issue {
  id: string
  topic: string
  intensity: number
  sentiment: number
  sourceCount: number
  productArea: string
}

interface EmergingIssuesTableProps {
  issues: Issue[]
  onCreateOpportunity?: (issueId: string) => void
}

export function EmergingIssuesTable({
  issues,
  onCreateOpportunity,
}: EmergingIssuesTableProps) {
  const [sortKey, setSortKey] = useState<keyof Issue>('intensity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (key: keyof Issue) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  const sortedIssues = [...issues].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    const multiplier = sortOrder === 'asc' ? 1 : -1

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * multiplier
    }
    return String(aVal).localeCompare(String(bVal)) * multiplier
  })

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.3) return 'text-green-600 bg-green-50'
    if (sentiment >= -0.3) return 'text-gray-600 bg-gray-50'
    return 'text-red-600 bg-red-50'
  }

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 0.3) return 'Positive'
    if (sentiment >= -0.3) return 'Neutral'
    return 'Negative'
  }

  return (
    <div className="relative rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50/30 shadow-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-tmobile-magenta/5 to-purple-500/5" />
      <Table>
        <TableHeader>
          <TableRow className="relative bg-gradient-to-r from-tmobile-magenta/5 to-purple-500/5 hover:from-tmobile-magenta/10 hover:to-purple-500/10 border-b-2 border-tmobile-magenta/20">
            <TableHead className="font-semibold text-tmobile-black">
              <button
                onClick={() => handleSort('topic')}
                className="flex items-center gap-1 hover:text-[#E8258E] transition-colors"
              >
                Topic
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead className="font-semibold text-tmobile-black">
              <button
                onClick={() => handleSort('intensity')}
                className="flex items-center gap-1 hover:text-[#E8258E] transition-colors"
              >
                Intensity
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead className="font-semibold text-tmobile-black">
              <button
                onClick={() => handleSort('sentiment')}
                className="flex items-center gap-1 hover:text-[#E8258E] transition-colors"
              >
                Sentiment
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead className="font-semibold text-tmobile-black">
              <button
                onClick={() => handleSort('sourceCount')}
                className="flex items-center gap-1 hover:text-[#E8258E] transition-colors"
              >
                Sources
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead className="font-semibold text-tmobile-black text-right">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedIssues.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-tmobile-gray-500 py-8"
              >
                No issues detected in the last hour
              </TableCell>
            </TableRow>
          ) : (
            sortedIssues.map((issue, index) => (
              <TableRow
                key={issue.id}
                className={`
                  relative
                  ${index % 2 === 0 ? 'bg-white/80' : 'bg-gray-50/50'}
                  hover:bg-gradient-to-r hover:from-tmobile-magenta/10 hover:to-purple-500/10
                  transition-all duration-200
                  border-b border-gray-100/50
                `}
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <span className="text-tmobile-black">{issue.topic}</span>
                    <span className="text-xs text-tmobile-gray-500">
                      {issue.productArea}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-semibold">
                    {issue.intensity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getSentimentColor(issue.sentiment)}>
                    {getSentimentLabel(issue.sentiment)} ({issue.sentiment.toFixed(1)})
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-tmobile-gray-700">
                    {issue.sourceCount}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => onCreateOpportunity?.(issue.id)}
                    className="bg-[#E8258E] hover:bg-[#D01A7A] text-white"
                  >
                    Generate AI Insights
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
