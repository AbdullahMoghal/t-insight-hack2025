import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { GeoMapWrapper } from '@/components/dashboard/geo-map-wrapper'
import { formatDistanceToNow } from 'date-fns'
import { InsertSampleDataButton } from '@/components/dashboard/insert-sample-data-button'

async function getFeedbackData() {
  try {
    const supabase = await createClient()
    
    // Fetch all feedback with location data
    const { data, error } = await supabase
      .from('feedback')
      .select('city, lat, lng, sentiment, intensity')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .limit(1000) // Limit results for performance

    if (error) {
      // Log more detailed error information
      console.error('Error fetching feedback:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      })
      
      // If table doesn't exist, return empty array gracefully
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.warn('Feedback table does not exist yet. Please create it in Supabase.')
        return []
      }
      
      return []
    }

    // Debug: Log what we got
    console.log('Feedback data fetched:', {
      count: data?.length || 0,
      sample: data?.slice(0, 3)
    })

    return data || []
  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error fetching feedback:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return []
  }
}

export default async function GeoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const feedback = await getFeedbackData()
  const lastUpdated = new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-tmobile-magenta/3 to-purple-50">
      {/* Header */}
      <header className="bg-[#E8258E] sticky top-0 z-50 shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/navbar-logo.png"
                alt="T-Insight Logo"
                width={150}
                height={70}
                className="relative"
              />
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-sm text-white hover:text-white/80 transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10"
              >
                Dashboard
              </a>
              <a
                href="/dashboard/geo"
                className="text-sm text-white hover:text-white/80 transition-colors font-medium px-3 py-2 rounded-md hover:bg-white/10"
              >
                GeoMap
              </a>
              <span className="text-sm text-white/90 px-3 py-2">
                {user.email}
              </span>
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="outline"
                  className="border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white border-white/40 transition-all"
                >
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-start justify-between">
            <div>
            <h2 className="text-3xl font-bold text-[#E8258E] mb-2">
              Geographic Pain Point Heatmap
            </h2>
              <p className="text-tmobile-gray-600">
                Visualize customer feedback and issues by location across the United States
              </p>
            </div>
            {feedback.length === 0 && (
              <InsertSampleDataButton />
            )}
          </div>

          {/* Map Container */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-tmobile-gray-200">
            <GeoMapWrapper feedback={feedback} />

            {/* Legend */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-tmobile-gray-700">Intensity:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs text-tmobile-gray-600">Low</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-xs text-tmobile-gray-600">Medium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-xs text-tmobile-gray-600">High</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-tmobile-gray-500">
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-tmobile-gray-200 p-6 shadow-sm">
              <div className="text-sm text-tmobile-gray-600 mb-1">Total Feedback Points</div>
              <div className="text-3xl font-bold text-[#E8258E]">{feedback.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-tmobile-gray-200 p-6 shadow-sm">
              <div className="text-sm text-tmobile-gray-600 mb-1">Unique Cities</div>
              <div className="text-3xl font-bold text-[#E8258E]">
                {new Set(feedback.map((f: any) => f.city)).size}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-tmobile-gray-200 p-6 shadow-sm">
              <div className="text-sm text-tmobile-gray-600 mb-1">Avg. Intensity</div>
              <div className="text-3xl font-bold text-[#E8258E]">
                {feedback.length > 0
                  ? Math.round(
                      feedback.reduce((sum: number, f: any) => sum + (f.intensity || 0), 0) /
                        feedback.length
                    )
                  : 0}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

