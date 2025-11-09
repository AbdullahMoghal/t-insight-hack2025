'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { User, Target, Sparkles, Link as LinkIcon } from 'lucide-react'

interface UserStory {
  persona: string
  goal: string
  benefit: string
  linkedSignalIds: string[]
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
}

interface UserStoriesProps {
  opportunityTitle: string
  stories: UserStory[]
  isOpen: boolean
  onClose: () => void
}

export function UserStories({
  opportunityTitle,
  stories,
  isOpen,
  onClose,
}: UserStoriesProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E8258E] flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            AI-Generated User Stories
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            {opportunityTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {stories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-tmobile-gray-500">No user stories generated yet</p>
            </div>
          ) : (
            stories.map((story, index) => (
              <Card
                key={index}
                className="bg-white border-2 border-tmobile-gray-200 hover:border-[#E8258E]/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Story Header */}
                <div className="bg-gradient-to-r from-tmobile-magenta/5 via-purple-50/50 to-transparent px-6 py-4 border-b border-tmobile-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-5 w-5 text-[#E8258E]" />
                        <h3 className="text-lg font-semibold text-tmobile-black">
                          Story #{index + 1}
                        </h3>
                      </div>
                      <p className="text-sm text-tmobile-gray-600 italic">
                        "{story.persona}"
                      </p>
                    </div>
                    <Badge className={`${getPriorityColor(story.priority)} border font-semibold`}>
                      {story.priority}
                    </Badge>
                  </div>
                </div>

                {/* Story Content */}
                <div className="px-6 py-5 space-y-4">
                  {/* Goal */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-tmobile-gray-700 mb-1">
                        Goal
                      </p>
                      <p className="text-base text-tmobile-black">
                        {story.goal}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Benefit */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <Sparkles className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-tmobile-gray-700 mb-1">
                        Benefit
                      </p>
                      <p className="text-base text-tmobile-black">
                        {story.benefit}
                      </p>
                    </div>
                  </div>

                  {/* User Story Format */}
                  <div className="bg-tmobile-gray-50 border-l-4 border-[#E8258E] rounded-r-lg p-4 mt-4">
                    <p className="text-sm text-tmobile-gray-700 leading-relaxed">
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
                    <div className="flex items-center gap-2 pt-2 text-xs text-tmobile-gray-500">
                      <LinkIcon className="h-3 w-3" />
                      <span>
                        Based on {story.linkedSignalIds.length} customer{' '}
                        {story.linkedSignalIds.length === 1 ? 'signal' : 'signals'}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-tmobile-gray-200 text-center">
          <p className="text-xs text-tmobile-gray-500 italic">
            Generated with T-Insight AI • Powered by Gemini 2.0 Flash
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
