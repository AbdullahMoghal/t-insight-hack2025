'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Target, Sparkles, Link as LinkIcon, ChevronRight } from 'lucide-react'

interface StoryCardProps {
  story: {
    persona: string
    goal: string
    benefit: string
    linkedSignalIds: string[]
    priority: 'Low' | 'Medium' | 'High' | 'Critical'
  }
  storyNumber: number
  epicColor: string
  onClick?: () => void
}

export function StoryCard({ story, storyNumber, epicColor, onClick }: StoryCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <Card
      onClick={onClick}
      className="bg-white border border-tmobile-gray-200 hover:border-[#E8258E]/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: epicColor,
      }}
    >
      <div className="p-4 space-y-3">
        {/* Story Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-tmobile-gray-100 text-tmobile-gray-800 border-tmobile-gray-300 text-xs font-bold">
                STORY-{storyNumber}
              </Badge>
              <Badge className={`${getPriorityColor(story.priority)} text-xs font-semibold border`}>
                {story.priority}
              </Badge>
            </div>
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-[#E8258E] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-tmobile-gray-700 italic leading-relaxed">
                "{story.persona}"
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-tmobile-gray-400 group-hover:text-[#E8258E] transition-colors flex-shrink-0" />
        </div>

        {/* Story Content - Condensed */}
        <div className="space-y-2">
          {/* Goal */}
          <div className="flex items-start gap-2">
            <Target className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-tmobile-gray-800 leading-relaxed">
              <span className="font-semibold">Goal:</span> {story.goal}
            </p>
          </div>

          {/* Benefit */}
          <div className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-tmobile-gray-800 leading-relaxed">
              <span className="font-semibold">Benefit:</span> {story.benefit}
            </p>
          </div>
        </div>

        {/* User Story Format - Condensed */}
        <div className="bg-tmobile-gray-50/70 border-l-2 border-[#E8258E] rounded-r px-3 py-2">
          <p className="text-xs text-tmobile-gray-700 leading-relaxed">
            <span className="font-semibold">As a </span>
            <span className="italic">{story.persona}</span>
            <span className="font-semibold">, I want </span>
            <span className="italic">{story.goal}</span>
            <span className="font-semibold"> so that </span>
            <span className="italic">{story.benefit}</span>
          </p>
        </div>

        {/* Linked Signals */}
        {story.linkedSignalIds && story.linkedSignalIds.length > 0 && (
          <div className="flex items-center gap-2 pt-1 text-xs text-tmobile-gray-500">
            <LinkIcon className="h-3 w-3" />
            <span>
              {story.linkedSignalIds.length} customer{' '}
              {story.linkedSignalIds.length === 1 ? 'signal' : 'signals'}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
