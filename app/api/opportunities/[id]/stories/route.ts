/**
 * User Stories Generation API Route
 * POST - Generate user stories using Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

interface OpportunityParams {
  params: Promise<{ id: string }>
}

interface UserStory {
  persona: string
  goal: string
  benefit: string
  linkedSignalIds: string[]
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
}

interface StoriesResponse {
  stories: UserStory[]
}

export async function POST(
  request: NextRequest,
  { params }: OpportunityParams
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Validate Gemini API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    // Fetch opportunity
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunity_cards')
      .select(`
        *,
        product_area:product_areas(id, name, color)
      `)
      .eq('id', id)
      .single()

    if (oppError) {
      return NextResponse.json(
        { error: 'Opportunity not found', message: oppError.message },
        { status: 404 }
      )
    }

    // Fetch linked signals
    const { data: signals, error: signalsError } = await supabase
      .from('signals')
      .select('*')
      .in('id', opportunity.derived_from_signal_ids || [])

    if (signalsError) {
      console.error('Error fetching signals:', signalsError)
    }

    // Prepare Gemini prompt
    const signalQuotes = (signals || [])
      .map((s, index) => `Signal ${index + 1} [ID: ${s.id}]:\n- Source: ${s.source}\n- Text: "${s.meta?.text || s.topic}"\n- Sentiment: ${s.sentiment.toFixed(2)}`)
      .join('\n\n')

    const prompt = `You are a product manager analyzing customer feedback for T-Mobile. Generate 3-5 user stories from the following customer signals.

**Issue Context:**
- Title: ${opportunity.title}
- Product Area: ${opportunity.product_area?.name || 'Unknown'}
- Severity: ${opportunity.severity}

**Customer Feedback:**
${signalQuotes || 'No customer quotes available'}

**Instructions:**
Extract personas from the feedback and generate user stories in this JSON format. Each story should:
1. Identify a specific user persona based on the signals
2. State what they want to accomplish (WITHOUT "I want" prefix)
3. Explain why it benefits them (WITHOUT "so that" prefix)
4. Link to the signal IDs that support this story
5. Assign a priority based on impact

IMPORTANT: Do NOT include "I want" or "so that" in the goal and benefit fields - these will be added automatically.

{
  "stories": [
    {
      "persona": "Frustrated mobile app user trying to check their account",
      "goal": "log in without errors",
      "benefit": "I can manage my account quickly and avoid calling support",
      "linkedSignalIds": ["signal-id-1", "signal-id-2"],
      "priority": "High"
    },
    {
      "persona": "Customer experiencing billing discrepancies",
      "goal": "see a clear breakdown of my charges",
      "benefit": "I can understand what I'm paying for and dispute errors",
      "linkedSignalIds": ["signal-id-3"],
      "priority": "Medium"
    }
  ]
}

Rules:
- Generate 3-5 stories (not more, not less)
- Use actual signal IDs from the feedback above
- Personas should be specific (not generic)
- Benefits should be tangible and user-focused
- Priority should match the sentiment/intensity of signals

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    // Generate stories with Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    let storiesJson: StoriesResponse
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : text
      storiesJson = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError)
      console.error('Raw response:', text)

      // Fallback stories
      storiesJson = {
        stories: [
          {
            persona: `${opportunity.product_area?.name} user affected by ${opportunity.title}`,
            goal: 'have this issue resolved',
            benefit: 'I can use the service without problems',
            linkedSignalIds: opportunity.derived_from_signal_ids?.slice(0, 2) || [],
            priority: opportunity.severity === 'critical' ? 'Critical' : opportunity.severity === 'high' ? 'High' : 'Medium',
          },
          {
            persona: 'Customer support agent handling related complaints',
            goal: 'have a solution to offer customers',
            benefit: 'I can reduce ticket volume and improve satisfaction',
            linkedSignalIds: opportunity.derived_from_signal_ids?.slice(0, 1) || [],
            priority: 'Medium',
          },
        ],
      }
    }

    // Validate stories
    if (!storiesJson.stories || !Array.isArray(storiesJson.stories)) {
      storiesJson = {
        stories: [
          {
            persona: 'User',
            goal: 'have this issue resolved',
            benefit: 'I can have a better experience',
            linkedSignalIds: [],
            priority: 'Medium',
          },
        ],
      }
    }

    // Clean up stories - remove "I want" and "so that" if present
    storiesJson.stories = storiesJson.stories.map(story => ({
      ...story,
      goal: story.goal
        .replace(/^I want to /i, '')
        .replace(/^I want /i, '')
        .replace(/^to /i, ''),
      benefit: story.benefit
        .replace(/^so that /i, '')
        .replace(/^that /i, ''),
    }))

    // Update opportunity with stories
    const { error: updateError } = await supabase
      .from('opportunity_cards')
      .update({
        meta: {
          ...opportunity.meta,
          stories: storiesJson.stories,
          stories_generated_at: new Date().toISOString(),
        },
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating opportunity with stories:', updateError)
    }

    return NextResponse.json({
      success: true,
      stories: storiesJson.stories,
    })
  } catch (error) {
    console.error('Error in POST /api/opportunities/[id]/stories:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate user stories',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
