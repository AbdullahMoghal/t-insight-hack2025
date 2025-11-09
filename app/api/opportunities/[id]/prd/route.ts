/**
 * PRD Generation API Route
 * POST - Generate comprehensive PRD using Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

interface OpportunityParams {
  params: Promise<{ id: string }>
}

interface PRDResponse {
  problemStatement: string
  userImpact: string
  evidenceSummary: string
  proposedSolution: string
  successMetrics: string[]
  acceptanceCriteria: string[]
  implementation: {
    phase1: string[]
    phase2: string[]
  }
  risks: string[]
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

    // Fetch opportunity with full details
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunity_cards')
      .select(`
        *,
        product_area:product_areas(id, name, color, description)
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

    // Calculate RICE score
    const riceScore = (opportunity.reach * opportunity.impact * opportunity.confidence) / opportunity.effort

    // Prepare Gemini prompt
    const insights = opportunity.meta?.insights || {}
    const signalQuotes = (signals || [])
      .map((s) => `- [${s.source}] "${s.meta?.text || s.topic}" (Sentiment: ${s.sentiment.toFixed(2)})`)
      .join('\n')

    const prompt = `You are a senior product manager at T-Mobile. Generate a comprehensive Product Requirements Document (PRD) for the following customer issue.

**Issue Context:**
- Title: ${opportunity.title}
- Description: ${opportunity.description || 'N/A'}
- Product Area: ${opportunity.product_area?.name || 'Unknown'}
- Severity: ${opportunity.severity}
- RICE Score: ${riceScore.toFixed(1)} (Reach: ${opportunity.reach}, Impact: ${opportunity.impact}, Confidence: ${opportunity.confidence}, Effort: ${opportunity.effort})

**AI-Generated Insights:**
${insights.summary || 'No summary available'}

Root Cause: ${insights.rootCause || 'Not analyzed'}

Recommendations:
${(insights.recommendations || []).map((r: string) => `- ${r}`).join('\n')}

**Customer Evidence (Verbatim Quotes):**
${signalQuotes || 'No customer quotes available'}

**Instructions:**
Generate a PRD in the following JSON format. Be specific, actionable, and data-driven.

{
  "problemStatement": "Clear, concise problem description (2-3 sentences)",
  "userImpact": "Who is affected and how severely, using reach/intensity data",
  "evidenceSummary": "Summary of customer feedback patterns from signals",
  "proposedSolution": "Detailed solution approach with 3-5 specific features/changes to implement",
  "successMetrics": [
    "CHI improvement target: +X points in ${opportunity.product_area?.name || 'product area'}",
    "Sentiment recovery: from ${insights.summary ? 'current negative' : 'baseline'} to target positive",
    "Affected users: Reduce complaints from ${opportunity.reach} signals"
  ],
  "acceptanceCriteria": [
    "Given [context], when [action], then [outcome]",
    "Given [context], when [action], then [outcome]",
    "Given [context], when [action], then [outcome]"
  ],
  "implementation": {
    "phase1": ["Step 1", "Step 2", "Step 3"],
    "phase2": ["Step 4", "Step 5"]
  },
  "risks": ["Risk 1 with mitigation strategy", "Risk 2 with mitigation strategy"]
}

Return ONLY valid JSON, no markdown formatting, no code blocks.`

    // Generate PRD with Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    let prdJson: PRDResponse
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : text
      prdJson = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError)
      console.error('Raw response:', text)

      // Fallback PRD
      prdJson = {
        problemStatement: opportunity.description || `Addressing ${opportunity.title}`,
        userImpact: `${opportunity.reach} customers affected with average sentiment of ${(signals || []).reduce((sum, s) => sum + s.sentiment, 0) / ((signals || []).length || 1)}`,
        evidenceSummary: 'Customer feedback analysis unavailable',
        proposedSolution: 'Solution generation failed. Please regenerate.',
        successMetrics: [
          `Improve CHI by 5+ points in ${opportunity.product_area?.name}`,
          `Reduce negative sentiment signals by 50%`,
          `Address ${opportunity.reach} affected customers`,
        ],
        acceptanceCriteria: [
          'Given the issue exists, when solution is deployed, then customer complaints decrease',
        ],
        implementation: {
          phase1: ['Analyze root cause', 'Design solution', 'Develop fix'],
          phase2: ['Test thoroughly', 'Deploy to production', 'Monitor impact'],
        },
        risks: ['Implementation complexity may exceed estimate'],
      }
    }

    // Update opportunity with PRD
    const { error: updateError } = await supabase
      .from('opportunity_cards')
      .update({
        meta: {
          ...opportunity.meta,
          prd: prdJson,
          prd_generated_at: new Date().toISOString(),
        },
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating opportunity with PRD:', updateError)
    }

    return NextResponse.json({
      success: true,
      prd: prdJson,
    })
  } catch (error) {
    console.error('Error in POST /api/opportunities/[id]/prd:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate PRD',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
