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
  ChevronDown,
  ChevronRight,
  FileText,
  Eye,
  Lightbulb,
  MoreVertical,
  Trash2,
  TrendingUp,
  Layers,
} from 'lucide-react'
import {
  getSeverityColor,
  getStatusColor,
  getRICEColor,
  formatStatus,
} from '@/lib/utils/rice'
import { StoryCard } from './story-card'

interface UserStory {
  persona: string
  goal: string
  benefit: string
  linkedSignalIds: string[]
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
}

interface EpicCardProps {
  epic: {
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
      stories?: UserStory[]
    }
    created_at: string
  }
  onViewEvidence?: (id: string) => void
  onGeneratePRD?: (id: string) => void
  onViewPRD?: (id: string) => void
  onGenerateStories?: (id: string) => void
  onUpdateStatus?: (id: string, status: 'new' | 'in-progress' | 'done') => void
  onDelete?: (id: string) => void
  onViewStoryDetail?: (epicId: string, story: UserStory, storyIndex: number) => void
}

export function EpicCard({
  epic,
  onViewEvidence,
  onGeneratePRD,
  onViewPRD,
  onGenerateStories,
  onUpdateStatus,
  onDelete,
  onViewStoryDetail,
}: EpicCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [storiesExpanded, setStoriesExpanded] = useState(true)
  const hasPRD = !!epic.meta?.prd
  const stories = (epic.meta?.stories as UserStory[]) || []
  const hasStories = stories.length > 0

  const productAreaColor = epic.product_area?.color || '#E20074'

  return (
    <Card
      className="relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300"
      style={{
        borderLeftWidth: '6px',
        borderLeftColor: productAreaColor,
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-tmobile-magenta/3 to-purple-500/3 pointer-events-none" />

      <div className="relative">
        {/* Epic Header */}
        <div className="p-6 space-y-4 border-b-2 border-tmobile-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              {/* Epic Label & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  EPIC
                </Badge>
                <Badge className={`${getSeverityColor(epic.severity)} text-xs font-semibold border`}>
                  {epic.severity.toUpperCase()}
                </Badge>
                <Badge className={`${getStatusColor(epic.status)} text-xs font-semibold border`}>
                  {formatStatus(epic.status)}
                </Badge>
                {epic.product_area && (
                  <Badge
                    variant="outline"
                    className="text-xs border"
                    style={{
                      borderColor: productAreaColor,
                      color: productAreaColor,
                    }}
                  >
                    {epic.product_area.name}
                  </Badge>
                )}
              </div>

              {/* Epic Title */}
              <h3 className="text-xl font-bold text-tmobile-black leading-tight">
                {epic.title}
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
                    <DropdownMenuItem onClick={() => onUpdateStatus(epic.id, 'new')}>
                      Mark as New
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus(epic.id, 'in-progress')}>
                      Mark as In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus(epic.id, 'done')}>
                      Mark as Done
                    </DropdownMenuItem>
                  </>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(epic.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Epic
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {epic.description && (
            <p className="text-sm text-tmobile-gray-700 leading-relaxed">
              {expanded || epic.description.length < 150
                ? epic.description
                : `${epic.description.slice(0, 150)}...`}
              {epic.description.length > 150 && (
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
              <Badge className={`${getRICEColor(epic.rice_score)} text-base font-bold px-3 py-1 border`}>
                {epic.rice_score.toFixed(1)}
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xs text-tmobile-gray-500 mb-1">Reach</div>
                <div className="text-lg font-semibold text-tmobile-black">{epic.reach}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-tmobile-gray-500 mb-1">Impact</div>
                <div className="text-lg font-semibold text-tmobile-black">{epic.impact}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-tmobile-gray-500 mb-1">Confidence</div>
                <div className="text-lg font-semibold text-tmobile-black">{epic.confidence.toFixed(1)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-tmobile-gray-500 mb-1">Effort</div>
                <div className="text-lg font-semibold text-tmobile-black">{epic.effort}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {onViewEvidence && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewEvidence(epic.id)}
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
                  onClick={() => onViewPRD(epic.id)}
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
                  onClick={() => onGeneratePRD(epic.id)}
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
                onClick={() => onGenerateStories(epic.id)}
                className="text-xs border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:border-orange-500/50"
              >
                <Lightbulb className="h-3 w-3 mr-1.5" />
                {hasStories ? 'Regenerate' : 'Generate'} Stories
              </Button>
            )}
          </div>

          {/* Metadata Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-tmobile-gray-200 text-xs text-tmobile-gray-500">
            <span>Created {new Date(epic.created_at).toLocaleDateString()}</span>
            {hasStories && (
              <span className="flex items-center gap-1 font-medium text-tmobile-gray-700">
                <AlertCircle className="h-3 w-3" />
                {stories.length} user {stories.length === 1 ? 'story' : 'stories'}
              </span>
            )}
          </div>
        </div>

        {/* Stories Section */}
        {hasStories && (
          <div className="bg-gradient-to-br from-tmobile-gray-50/50 to-white">
            {/* Stories Header */}
            <button
              onClick={() => setStoriesExpanded(!storiesExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-tmobile-gray-50/80 transition-colors border-b border-tmobile-gray-100"
            >
              <div className="flex items-center gap-2">
                {storiesExpanded ? (
                  <ChevronDown className="h-5 w-5 text-tmobile-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-tmobile-gray-600" />
                )}
                <h4 className="font-semibold text-tmobile-black text-base">
                  User Stories ({stories.length})
                </h4>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                Click to {storiesExpanded ? 'collapse' : 'expand'}
              </Badge>
            </button>

            {/* Stories List */}
            {storiesExpanded && (
              <div className="p-4 space-y-3">
                {stories.map((story, index) => (
                  <StoryCard
                    key={index}
                    story={story}
                    storyNumber={index + 1}
                    epicColor={productAreaColor}
                    onClick={() => onViewStoryDetail?.(epic.id, story, index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
