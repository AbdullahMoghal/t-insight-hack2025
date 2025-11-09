'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { EpicCard } from '@/components/opportunities/epic-card'
import { OpportunityFilters } from '@/components/opportunities/opportunity-filters'
import { EvidenceDrawer } from '@/components/opportunities/evidence-drawer'
import { PRDDisplay } from '@/components/opportunities/prd-display'
import { StoryDetailDialog } from '@/components/opportunities/story-detail-dialog'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'

interface Opportunity {
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
    prd?: {
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
    stories?: Array<{
      persona: string
      goal: string
      benefit: string
      linkedSignalIds: string[]
      priority: 'Low' | 'Medium' | 'High' | 'Critical'
    }>
  }
  created_at: string
}

interface ProductArea {
  id: string
  name: string
  color: string
}

export default function OpportunitiesPage() {
  const router = useRouter()

  // State
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [productAreas, setProductAreas] = useState<ProductArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')

  // Filters
  const [status, setStatus] = useState('all')
  const [productArea, setProductArea] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [sortBy, setSortBy] = useState('rice-desc')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals/Drawers
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false)
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null)
  const [prdDialogOpen, setPrdDialogOpen] = useState(false)
  const [selectedPRD, setSelectedPRD] = useState<{
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
  } | null>(null)
  const [selectedPRDTitle, setSelectedPRDTitle] = useState('')
  const [storyDetailOpen, setStoryDetailOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<{
    persona: string
    goal: string
    benefit: string
    linkedSignalIds: string[]
    priority: 'Low' | 'Medium' | 'High' | 'Critical'
  } | null>(null)
  const [selectedStoryNumber, setSelectedStoryNumber] = useState(0)
  const [selectedStoryEpicTitle, setSelectedStoryEpicTitle] = useState('')
  const [selectedStoryEpicColor, setSelectedStoryEpicColor] = useState('#E20074')

  // Loading states
  const [generatingPRD, setGeneratingPRD] = useState<string | null>(null)
  const [generatingStories, setGeneratingStories] = useState<string | null>(null)

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    fetchUser()
  }, [])

  // Fetch opportunities and product areas
  useEffect(() => {
    fetchData()
  }, [status, productArea, severity, sortBy])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query params
      const params = new URLSearchParams()
      if (status !== 'all') params.append('status', status)
      if (productArea !== 'all') params.append('product_area_id', productArea)
      if (severity !== 'all') params.append('severity', severity)

      const [sortField, sortOrder] = sortBy.split('-')
      params.append('sort_by', sortField)
      params.append('sort_order', sortOrder)

      // Fetch opportunities
      const oppResponse = await fetch(`/api/opportunities?${params.toString()}`)
      const oppData = await oppResponse.json()

      if (!oppResponse.ok) {
        throw new Error(oppData.message || 'Failed to fetch opportunities')
      }

      setOpportunities(oppData.opportunities || [])

      // Fetch product areas (only once)
      if (productAreas.length === 0) {
        // Use createClient from Supabase browser client
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data: areas } = await supabase
          .from('product_areas')
          .select('id, name, color')
          .order('name')

        setProductAreas(areas || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load opportunities')
    } finally {
      setLoading(false)
    }
  }

  // Filter opportunities by search query
  const filteredOpportunities = opportunities.filter((opp) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      opp.title.toLowerCase().includes(query) ||
      opp.description?.toLowerCase().includes(query) ||
      opp.product_area?.name.toLowerCase().includes(query)
    )
  })

  // Handlers
  const handleViewEvidence = (id: string) => {
    setSelectedOpportunityId(id)
    setEvidenceDrawerOpen(true)
  }

  const handleGeneratePRD = async (id: string) => {
    setGeneratingPRD(id)
    try {
      const response = await fetch(`/api/opportunities/${id}/prd`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate PRD')
      }

      toast.success('PRD Generated!', {
        description: 'Your product requirements document is ready.',
      })

      // Refresh opportunities to get updated meta
      await fetchData()
    } catch (err) {
      console.error('Error generating PRD:', err)
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'Failed to generate PRD',
      })
    } finally {
      setGeneratingPRD(null)
    }
  }

  const handleViewPRD = (id: string) => {
    const opp = opportunities.find((o) => o.id === id)
    if (opp?.meta?.prd) {
      setSelectedPRD(opp.meta.prd)
      setSelectedPRDTitle(opp.title)
      setPrdDialogOpen(true)
    }
  }

  const handleGenerateStories = async (id: string) => {
    setGeneratingStories(id)
    try {
      const response = await fetch(`/api/opportunities/${id}/stories`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate user stories')
      }

      toast.success('User Stories Generated!', {
        description: `${data.stories.length} user stories created.`,
      })

      // Refresh opportunities to show stories in epic cards
      await fetchData()
    } catch (err) {
      console.error('Error generating stories:', err)
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'Failed to generate user stories',
      })
    } finally {
      setGeneratingStories(null)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: 'new' | 'in-progress' | 'done') => {
    try {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update status')
      }

      toast.success('Status Updated', {
        description: `Opportunity marked as ${newStatus}`,
      })

      await fetchData()
    } catch (err) {
      console.error('Error updating status:', err)
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'Failed to update status',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return

    try {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete opportunity')
      }

      toast.success('Opportunity Deleted', {
        description: 'The opportunity has been removed.',
      })

      await fetchData()
    } catch (err) {
      console.error('Error deleting opportunity:', err)
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'Failed to delete opportunity',
      })
    }
  }

  const handleClearFilters = () => {
    setStatus('all')
    setProductArea('all')
    setSeverity('all')
    setSearchQuery('')
  }

  const handleViewStoryDetail = (
    epicId: string,
    story: {
      persona: string
      goal: string
      benefit: string
      linkedSignalIds: string[]
      priority: 'Low' | 'Medium' | 'High' | 'Critical'
    },
    storyIndex: number
  ) => {
    const epic = opportunities.find((o) => o.id === epicId)
    if (!epic) return

    setSelectedStory(story)
    setSelectedStoryNumber(storyIndex + 1)
    setSelectedStoryEpicTitle(epic.title)
    setSelectedStoryEpicColor(epic.product_area?.color || '#E20074')
    setStoryDetailOpen(true)
  }

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Stats
  const stats = {
    total: opportunities.length,
    new: opportunities.filter((o) => o.status === 'new').length,
    inProgress: opportunities.filter((o) => o.status === 'in-progress').length,
    done: opportunities.filter((o) => o.status === 'done').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-tmobile-magenta/3 to-purple-50">
      {/* Header */}
      <header className="bg-[#E8258E] sticky top-0 z-[100] shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/dashboard" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
              <Image
                src="/navbar-logo.png"
                alt="T-Insight Logo"
                width={150}
                height={70}
                className="relative"
              />
            </a>
            <div className="flex items-center gap-4">
              <a
                href="/pm/opportunities"
                className="text-sm text-white hover:text-white/80 transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10"
              >
                PM Workbench
              </a>
              <a
                href="/dashboard/geo"
                className="text-sm text-white hover:text-white/80 transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10"
              >
                GeoMap
              </a>
              <span className="text-sm text-white/90 px-3 py-2">
                {userEmail || 'Loading...'}
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white border-white/40 transition-all"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#E8258E] mb-2">PM Workbench</h1>
          <p className="text-lg text-tmobile-gray-600">
            Epics and user stories prioritized from customer signals
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-tmobile-gray-200 shadow-lg">
            <div className="text-sm text-tmobile-gray-600 mb-1">Total Epics</div>
            <div className="text-3xl font-bold text-[#E8258E]">{stats.total}</div>
          </div>
          <div className="bg-blue-50/95 backdrop-blur-sm rounded-xl p-4 border border-blue-200 shadow-lg">
            <div className="text-sm text-blue-700 mb-1">New</div>
            <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
          </div>
          <div className="bg-yellow-50/95 backdrop-blur-sm rounded-xl p-4 border border-yellow-200 shadow-lg">
            <div className="text-sm text-yellow-700 mb-1">In Progress</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
          </div>
          <div className="bg-green-50/95 backdrop-blur-sm rounded-xl p-4 border border-green-200 shadow-lg">
            <div className="text-sm text-green-700 mb-1">Done</div>
            <div className="text-3xl font-bold text-green-600">{stats.done}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <OpportunityFilters
            status={status}
            productArea={productArea}
            severity={severity}
            sortBy={sortBy}
            searchQuery={searchQuery}
            productAreas={productAreas}
            onStatusChange={setStatus}
            onProductAreaChange={setProductArea}
            onSeverityChange={setSeverity}
            onSortByChange={setSortBy}
            onSearchChange={setSearchQuery}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#E8258E] mb-4" />
            <p className="text-tmobile-gray-600">Loading opportunities...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Opportunities</h3>
            <p className="text-red-700">{error}</p>
            <Button
              onClick={fetchData}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOpportunities.length === 0 && (
          <div className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 rounded-2xl p-12 text-center">
            <h3 className="text-xl font-semibold text-tmobile-gray-800 mb-2">
              No Epics Yet
            </h3>
            <p className="text-tmobile-gray-600 mb-6">
              {searchQuery
                ? 'No epics match your search. Try a different query.'
                : 'Create epics from emerging issues on the Dashboard.'}
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-[#E8258E] hover:bg-[#D01A7A] text-white"
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {/* Epics Grid - Jira-like Layout */}
        {!loading && !error && filteredOpportunities.length > 0 && (
          <div className="space-y-6">
            {filteredOpportunities.map((epic) => (
              <EpicCard
                key={epic.id}
                epic={epic}
                onViewEvidence={handleViewEvidence}
                onGeneratePRD={generatingPRD === epic.id ? undefined : handleGeneratePRD}
                onViewPRD={handleViewPRD}
                onGenerateStories={generatingStories === epic.id ? undefined : handleGenerateStories}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
                onViewStoryDetail={handleViewStoryDetail}
              />
            ))}
          </div>
        )}
      </main>

      {/* Evidence Drawer */}
      <EvidenceDrawer
        opportunityId={selectedOpportunityId}
        isOpen={evidenceDrawerOpen}
        onClose={() => {
          setEvidenceDrawerOpen(false)
          setSelectedOpportunityId(null)
        }}
      />

      {/* PRD Dialog */}
      <PRDDisplay
        opportunityTitle={selectedPRDTitle}
        prd={selectedPRD || null}
        isOpen={prdDialogOpen}
        onClose={() => {
          setPrdDialogOpen(false)
          setSelectedPRD(null)
        }}
      />

      {/* Story Detail Dialog */}
      <StoryDetailDialog
        story={selectedStory}
        storyNumber={selectedStoryNumber}
        epicTitle={selectedStoryEpicTitle}
        epicColor={selectedStoryEpicColor}
        isOpen={storyDetailOpen}
        onClose={() => {
          setStoryDetailOpen(false)
          setSelectedStory(null)
        }}
      />
    </div>
  )
}
