'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { WorkflowDiagrams } from '@/components/workflow/workflow-diagrams'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, BarChart3, Lightbulb, LineChart, CheckCircle2 } from 'lucide-react'

export default function HowItWorksPage() {
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    const fetchUser = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-tmobile-magenta/3 to-purple-50">
      <Navbar userEmail={userEmail} />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#E8258E] mb-4">How T-Insight Works</h1>
          <p className="text-xl text-tmobile-gray-600 max-w-3xl mx-auto">
            A PM-first intelligence workspace that transforms customer signals into actionable
            opportunities
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#E8258E]/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-[#E8258E]" />
              </div>
              <h3 className="font-bold text-lg">1. Detect</h3>
            </div>
            <p className="text-sm text-tmobile-gray-600">
              Automatically scrape customer signals from Reddit, DownDetector, community forums, and
              app reviews
            </p>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#7C3E93]/10 rounded-lg">
                <LineChart className="h-6 w-6 text-[#7C3E93]" />
              </div>
              <h3 className="font-bold text-lg">2. Process</h3>
            </div>
            <p className="text-sm text-tmobile-gray-600">
              Analyze sentiment, detect topics, deduplicate, and map to product areas (Network, App,
              Billing, Home Internet)
            </p>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#00A19C]/10 rounded-lg">
                <Lightbulb className="h-6 w-6 text-[#00A19C]" />
              </div>
              <h3 className="font-bold text-lg">3. Prioritize</h3>
            </div>
            <p className="text-sm text-tmobile-gray-600">
              Auto-create opportunities with RICE scoring, generate PRDs and user stories, and
              organize by severity
            </p>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#F58220]/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-[#F58220]" />
              </div>
              <h3 className="font-bold text-lg">4. Validate</h3>
            </div>
            <p className="text-sm text-tmobile-gray-600">
              Close-the-loop monitoring tracks sentiment recovery after deploying solutions and
              generates release notes
            </p>
          </Card>
        </div>

        {/* Interactive Diagrams */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-tmobile-black mb-6">Workflow Visualizations</h2>
          <WorkflowDiagrams />
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-tmobile-black mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
              <h3 className="text-xl font-bold text-[#E8258E] mb-3">Customer Happiness Index (CHI)</h3>
              <p className="text-tmobile-gray-600 mb-4">
                Real-time sentiment score (0-100) calculated from weighted signal analysis across
                all product areas. Updates every 5 minutes to give you instant visibility into
                customer satisfaction.
              </p>
              <ul className="space-y-2 text-sm text-tmobile-gray-700">
                <li>• Overall CHI + per-product-area scores</li>
                <li>• Trend indicators (↑ up, ↓ down, → flat)</li>
                <li>• 24-hour sentiment timeline</li>
              </ul>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
              <h3 className="text-xl font-bold text-[#E8258E] mb-3">RICE Prioritization</h3>
              <p className="text-tmobile-gray-600 mb-4">
                Automatically calculate priority scores for every opportunity using the RICE
                framework: (Reach × Impact × Confidence) / Effort
              </p>
              <ul className="space-y-2 text-sm text-tmobile-gray-700">
                <li>• Reach = Total signal intensity</li>
                <li>• Impact = Product area criticality (8-10 for Network/Billing)</li>
                <li>• Confidence = 0.7 default (PM editable)</li>
                <li>• Effort = PM-estimated complexity (1-10)</li>
              </ul>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
              <h3 className="text-xl font-bold text-[#E8258E] mb-3">AI-Powered Insights</h3>
              <p className="text-tmobile-gray-600 mb-4">
                Generate PRDs, user stories, and release notes automatically from signal data using
                GenAI assistance.
              </p>
              <ul className="space-y-2 text-sm text-tmobile-gray-700">
                <li>• PRD generation with problem, impact, and success metrics</li>
                <li>• User story creation with personas and acceptance criteria</li>
                <li>• Release notes with customer-facing and internal sections</li>
              </ul>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl p-6">
              <h3 className="text-xl font-bold text-[#E8258E] mb-3">Close-the-Loop Monitoring</h3>
              <p className="text-tmobile-gray-600 mb-4">
                Automatically monitor sentiment recovery after marking opportunities as "Done" to
                validate that your solutions worked.
              </p>
              <ul className="space-y-2 text-sm text-tmobile-gray-700">
                <li>• 72-hour automatic monitoring period</li>
                <li>• Recovery detection: sentiment ↑0.2 or intensity ↓50%</li>
                <li>• Auto-generate release notes when recovered</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* PM Workflow Steps */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-tmobile-black mb-6">Your Daily Workflow</h2>
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-[#E8258E]/5 to-[#7C3E93]/5 backdrop-blur-sm border-2 border-[#E8258E]/30 shadow-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E8258E] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Morning Review (Dashboard)</h4>
                  <p className="text-tmobile-gray-700">
                    Check CHI score, review new signals, and identify emerging issues in the
                    Dashboard. Look for sudden CHI drops or high-intensity signals that need
                    attention.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-[#7C3E93]/5 to-[#00A19C]/5 backdrop-blur-sm border-2 border-[#7C3E93]/30 shadow-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#7C3E93] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Prioritize (PM Workbench)</h4>
                  <p className="text-tmobile-gray-700">
                    Create opportunities from emerging issues, review RICE scores, and filter by
                    severity. Focus on critical and high-severity items first.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-[#00A19C]/5 to-[#F58220]/5 backdrop-blur-sm border-2 border-[#00A19C]/30 shadow-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#00A19C] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Plan (Generate & Review)</h4>
                  <p className="text-tmobile-gray-700">
                    Generate PRDs and user stories, review evidence from signals, and refine your
                    approach. Edit AI-generated content to match your product strategy.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-[#F58220]/5 to-[#E8258E]/5 backdrop-blur-sm border-2 border-[#F58220]/30 shadow-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#F58220] text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Execute & Validate</h4>
                  <p className="text-tmobile-gray-700">
                    Mark opportunities as "In Progress" while working, then "Done" when deployed.
                    T-Insight automatically monitors recovery and generates release notes when
                    sentiment improves.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-[#E8258E]/10 via-white to-[#7C3E93]/10 backdrop-blur-sm border-2 border-[#E8258E]/30 shadow-2xl p-12">
            <h2 className="text-3xl font-bold text-[#E8258E] mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-tmobile-gray-700 mb-8 max-w-2xl mx-auto">
              Head to the Dashboard to see real-time customer signals, or explore the PM Workbench
              to start creating opportunities.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/dashboard">
                <Button className="bg-[#E8258E] hover:bg-[#D01A7A] text-white px-8 py-6 text-lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pm/opportunities">
                <Button
                  variant="outline"
                  className="border-2 border-[#E8258E] text-[#E8258E] hover:bg-[#E8258E]/10 px-8 py-6 text-lg"
                >
                  View Opportunities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
