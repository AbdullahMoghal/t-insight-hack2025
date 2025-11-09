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
import { User, Target, Sparkles, Link as LinkIcon, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface StoryDetailDialogProps {
  story: {
    persona: string
    goal: string
    benefit: string
    linkedSignalIds: string[]
    priority: 'Low' | 'Medium' | 'High' | 'Critical'
  } | null
  storyNumber: number
  epicTitle: string
  epicColor: string
  isOpen: boolean
  onClose: () => void
}

export function StoryDetailDialog({
  story,
  storyNumber,
  epicTitle,
  epicColor,
  isOpen,
  onClose,
}: StoryDetailDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!story) return null

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

  const handleCopyStory = () => {
    const storyText = `User Story: STORY-${storyNumber}
Epic: ${epicTitle}
Priority: ${story.priority}

As a ${story.persona}, I want ${story.goal} so that ${story.benefit}

Linked Signals: ${story.linkedSignalIds.length} customer signal(s)
Signal IDs: ${story.linkedSignalIds.join(', ')}`

    navigator.clipboard.writeText(storyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-tmobile-gray-100 text-tmobile-gray-800 border-tmobile-gray-300 font-bold">
              STORY-{storyNumber}
            </Badge>
            <Badge className={`${getPriorityColor(story.priority)} border font-semibold`}>
              {story.priority} Priority
            </Badge>
          </div>
          <DialogTitle
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: epicColor }}
          >
            User Story Detail
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-tmobile-gray-700">
            Epic: {epicTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Persona Card */}
          <Card className="bg-gradient-to-br from-purple-50/50 to-white border-2 border-purple-200">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-tmobile-gray-700 mb-2">
                    Persona
                  </p>
                  <p className="text-lg text-tmobile-black italic">
                    "{story.persona}"
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Goal Card */}
          <Card className="bg-gradient-to-br from-blue-50/50 to-white border-2 border-blue-200">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-tmobile-gray-700 mb-2">
                    Goal
                  </p>
                  <p className="text-lg text-tmobile-black">
                    {story.goal}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Benefit Card */}
          <Card className="bg-gradient-to-br from-green-50/50 to-white border-2 border-green-200">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-tmobile-gray-700 mb-2">
                    Benefit
                  </p>
                  <p className="text-lg text-tmobile-black">
                    {story.benefit}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Separator />

          {/* User Story Format */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-tmobile-gray-700">
                User Story Format
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyStory}
                className="text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1.5" />
                    Copy Story
                  </>
                )}
              </Button>
            </div>
            <Card
              className="border-2"
              style={{ borderColor: epicColor }}
            >
              <div
                className="p-5"
                style={{
                  background: `linear-gradient(to bottom right, ${epicColor}10, white)`,
                }}
              >
                <p className="text-base text-tmobile-gray-800 leading-relaxed">
                  <span className="font-bold">As a </span>
                  <span className="italic font-medium">{story.persona}</span>
                  <span className="font-bold">, I want </span>
                  <span className="italic font-medium">{story.goal}</span>
                  <span className="font-bold"> so that </span>
                  <span className="italic font-medium">{story.benefit}</span>
                  <span className="font-bold">.</span>
                </p>
              </div>
            </Card>
          </div>

          {/* Linked Signals */}
          {story.linkedSignalIds && story.linkedSignalIds.length > 0 && (
            <Card className="bg-tmobile-gray-50 border border-tmobile-gray-200">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="h-4 w-4 text-[#E8258E]" />
                  <h4 className="text-sm font-semibold text-tmobile-gray-800">
                    Evidence & Customer Signals
                  </h4>
                </div>
                <p className="text-sm text-tmobile-gray-700 mb-2">
                  This story is based on <span className="font-semibold">{story.linkedSignalIds.length}</span>{' '}
                  customer {story.linkedSignalIds.length === 1 ? 'signal' : 'signals'}:
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {story.linkedSignalIds.map((signalId, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs border-tmobile-gray-300 bg-white"
                    >
                      Signal {signalId.slice(0, 8)}...
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-tmobile-gray-200 text-center">
          <p className="text-xs text-tmobile-gray-500 italic">
            Generated with T-Insight AI • Powered by Gemini 2.0 Flash
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
