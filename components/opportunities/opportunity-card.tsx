'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertCircle,
  FileText,
  Eye,
  Lightbulb,
  MoreVertical,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import {
  getSeverityColor,
  getStatusColor,
  getRICEColor,
  formatStatus,
} from '@/lib/utils/rice'

interface OpportunityCardProps {
  opportunity: {
    id: string
    title: string
    description?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    status: 'new' | 'in-progress' | 'done'
    reach: number
    impact: number
    confidence: number
    effort: number
    rice_score: number
    product_area?: {
      id: string
      name: string
      color: string
    }
    meta?: {
      insights?: unknown
      prd?: unknown
      stories?: unknown[]
    }
    created_at: string
  }
  onViewEvidence?: (id: string) => void
  onGeneratePRD?: (id: string) => void
  onViewPRD?: (id: string) => void
  onGenerateStories?: (id: string) => void
  onUpdateStatus?: (id: string, status: 'new' | 'in-progress' | 'done') => void
  onDelete?: (id: string) => void
}

export function OpportunityCard({
  opportunity,
  onViewEvidence,
  onGeneratePRD,
  onViewPRD,
  onGenerateStories,
  onUpdateStatus,
  onDelete,
}: OpportunityCardProps) {
  const [expanded, setExpanded] = useState(false)
  const hasPRD = !!opportunity.meta?.prd
  const hasStories = !!opportunity.meta?.stories && (opportunity.meta.stories as unknown[]).length > 0

  const productAreaColor = opportunity.product_area?.color || '#E20074'

  return (
    <Card
      className="relative overflow-hidden bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 group"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: productAreaColor,
      }}
    >
      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-tmobile-magenta/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      />

      <div className="relative p-6 space-y-4">
        {/* Header with Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getSeverityColor(opportunity.severity)} text-xs font-semibold border`}>
                {opportunity.severity.toUpperCase()}
              </Badge>
              <Badge className={`${getStatusColor(opportunity.status)} text-xs font-semibold border`}>
                {formatStatus(opportunity.status)}
              </Badge>
              {opportunity.product_area && (
                <Badge
                  variant="outline"
                  className="text-xs border"
                  style={{
                    borderColor: productAreaColor,
                    color: productAreaColor,
                  }}
                >
                  {opportunity.product_area.name}
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-semibold text-tmobile-black leading-tight">
              {opportunity.title}
            </h3>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onUpdateStatus && (
                <>
                  <DropdownMenuItem onClick={() => onUpdateStatus(opportunity.id, 'new')}>
                    Mark as New
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus(opportunity.id, 'in-progress')}>
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus(opportunity.id, 'done')}>
                    Mark as Done
                  </DropdownMenuItem>
                </>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(opportunity.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {opportunity.description && (
          <p className="text-sm text-tmobile-gray-700 leading-relaxed">
            {expanded || opportunity.description.length < 150
              ? opportunity.description
              : `${opportunity.description.slice(0, 150)}...`}
            {opportunity.description.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-2 text-[#E8258E] hover:text-[#D01A7A] font-medium text-xs"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </p>
        )}

        {/* RICE Score Display */}
        <div className="bg-gradient-to-r from-tmobile-gray-50 to-white rounded-lg p-4 border border-tmobile-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-tmobile-gray-700">RICE Score</span>
            <Badge className={`${getRICEColor(opportunity.rice_score)} text-base font-bold px-3 py-1 border`}>
              {opportunity.rice_score.toFixed(1)}
            </Badge>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xs text-tmobile-gray-500 mb-1">Reach</div>
              <div className="text-lg font-semibold text-tmobile-black">{opportunity.reach}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-tmobile-gray-500 mb-1">Impact</div>
              <div className="text-lg font-semibold text-tmobile-black">{opportunity.impact}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-tmobile-gray-500 mb-1">Confidence</div>
              <div className="text-lg font-semibold text-tmobile-black">{opportunity.confidence.toFixed(1)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-tmobile-gray-500 mb-1">Effort</div>
              <div className="text-lg font-semibold text-tmobile-black">{opportunity.effort}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {onViewEvidence && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewEvidence(opportunity.id)}
              className="text-xs border-[#E8258E]/30 text-[#E8258E] hover:bg-[#E8258E]/10 hover:border-[#E8258E]/50"
            >
              <Eye className="h-3 w-3 mr-1.5" />
              View Evidence
            </Button>
          )}

          {hasPRD ? (
            onViewPRD && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewPRD(opportunity.id)}
                className="text-xs border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:border-blue-500/50"
              >
                <FileText className="h-3 w-3 mr-1.5" />
                View PRD
              </Button>
            )
          ) : (
            onGeneratePRD && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGeneratePRD(opportunity.id)}
                className="text-xs border-purple-500/30 text-purple-600 hover:bg-purple-500/10 hover:border-purple-500/50"
              >
                <TrendingUp className="h-3 w-3 mr-1.5" />
                Generate PRD
              </Button>
            )
          )}

          {onGenerateStories && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onGenerateStories(opportunity.id)}
              className="text-xs border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:border-orange-500/50"
            >
              <Lightbulb className="h-3 w-3 mr-1.5" />
              {hasStories ? 'Regenerate' : 'Generate'} Stories
            </Button>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-tmobile-gray-200 text-xs text-tmobile-gray-500">
          <span>Created {new Date(opportunity.created_at).toLocaleDateString()}</span>
          {hasStories && (
            <span className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {(opportunity.meta?.stories as unknown[]).length} user {(opportunity.meta?.stories as unknown[]).length === 1 ? 'story' : 'stories'}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
