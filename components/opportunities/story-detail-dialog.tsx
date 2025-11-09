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
import { User, Target, Sparkles, Link as LinkIcon, Copy, Check, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface Signal {
  id: string
  topic: string
  sentiment: number
  intensity: number
  source: string
  detected_at: string
  product_areas?: {
    name: string
    color: string
  } | {
    name: string
    color: string
  }[] | null
}

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
  const [signals, setSignals] = useState<Signal[]>([])
  const [loadingSignals, setLoadingSignals] = useState(false)

  // Fetch actual signal data when dialog opens
  useEffect(() => {
    if (isOpen && story?.linkedSignalIds && story.linkedSignalIds.length > 0) {
      fetchSignals()
    }
  }, [isOpen, story?.linkedSignalIds])

  const fetchSignals = async () => {
    if (!story?.linkedSignalIds) return

    setLoadingSignals(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error } = await supabase
        .from('signals')
        .select(`
          id,
          topic,
          sentiment,
          intensity,
          source,
          detected_at,
          product_areas (
            name,
            color
          )
        `)
        .in('id', story.linkedSignalIds)
        .order('detected_at', { ascending: false })

      if (!error && data) {
        setSignals(data as Signal[])
      }
    } catch (error) {
      console.error('Error fetching signals:', error)
    } finally {
      setLoadingSignals(false)
    }
  }

  if (!story) return null

  // Normalize topic to title case
  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

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

  const getSentimentBadge = (sentiment: number) => {
    if (sentiment > 0.3) {
      return { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', text: 'Positive' }
    }
    if (sentiment < -0.3) {
      return { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100', text: 'Negative' }
    }
    return { icon: Minus, color: 'text-gray-600', bg: 'bg-gray-100', text: 'Neutral' }
  }

  const handleCopyStory = () => {
    const signalsText = signals.length > 0
      ? signals.map(s => `- ${s.topic} (${s.source}, Sentiment: ${s.sentiment.toFixed(2)})`).join('\n')
      : story.linkedSignalIds.join(', ')

    const storyText = `User Story: STORY-${storyNumber}
Epic: ${epicTitle}
Priority: ${story.priority}

As a ${story.persona}, I want ${story.goal} so that ${story.benefit}

Linked Signals: ${story.linkedSignalIds.length} customer signal(s)
${signals.length > 0 ? signalsText : `Signal IDs: ${story.linkedSignalIds.join(', ')}`}`

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
                <p className="text-sm text-tmobile-gray-700 mb-3">
                  This story is based on <span className="font-semibold">{story.linkedSignalIds.length}</span>{' '}
                  customer {story.linkedSignalIds.length === 1 ? 'signal' : 'signals'}:
                </p>

                {loadingSignals ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E8258E] mx-auto"></div>
                    <p className="text-xs text-tmobile-gray-600 mt-2">Loading signals...</p>
                  </div>
                ) : signals.length > 0 ? (
                  <div className="space-y-2 mt-3">
                    {signals.map((signal) => {
                      const sentimentBadge = getSentimentBadge(signal.sentiment)
                      const SentimentIcon = sentimentBadge.icon

                      return (
                        <div
                          key={signal.id}
                          className="bg-white border border-tmobile-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {signal.product_areas && (
                                  <span
                                    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: (signal.product_areas as any).color }}
                                  />
                                )}
                                <p className="text-sm font-medium text-tmobile-black truncate">
                                  {toTitleCase(signal.topic)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-tmobile-gray-600">
                                <span>{signal.source}</span>
                                {signal.product_areas && (
                                  <>
                                    <span>•</span>
                                    <span>{(signal.product_areas as any).name}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span>Intensity: {signal.intensity}</span>
                              </div>
                            </div>
                            <Badge className={`${sentimentBadge.bg} ${sentimentBadge.color} border-0 flex items-center gap-1`}>
                              <SentimentIcon className="h-3 w-3" />
                              <span className="text-xs">{sentimentBadge.text}</span>
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
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
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-tmobile-gray-200 text-center">
          <p className="text-xs text-tmobile-gray-500 italic">
            Generated with InsighT AI • Powered by Gemini 2.0 Flash
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
