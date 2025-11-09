import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch real dashboard data from API
  let dashboardData = {
    overallCHI: 50,
    productAreas: [],
    emergingIssues: [],
    sentimentTimeline: [],
    sourceData: [],
  }

  let outageData = {
    data: [],
    summary: {
      totalReports: 0,
      affectedCities: 0,
      criticalCount: 0,
      highCount: 0,
      status: 'Normal',
    },
  }

  let earlyWarningData = {
    risingIssues: [],
    totalRising: 0,
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

    // Fetch dashboard metrics
    const metricsResponse = await fetch(`${baseUrl}/api/dashboard/metrics`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (metricsResponse.ok) {
      dashboardData = await metricsResponse.json()
    } else {
      console.error('Failed to fetch dashboard metrics:', metricsResponse.statusText)
    }

    // Fetch outage data
    const outageResponse = await fetch(`${baseUrl}/api/dashboard/outages`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (outageResponse.ok) {
      const outageJson = await outageResponse.json()
      if (outageJson.success) {
        outageData = outageJson
      }
    } else {
      console.error('Failed to fetch outage data:', outageResponse.statusText)
    }

    // Fetch early warning data
    const earlyWarningResponse = await fetch(`${baseUrl}/api/dashboard/early-warning`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (earlyWarningResponse.ok) {
      const earlyWarningJson = await earlyWarningResponse.json()
      if (earlyWarningJson.success) {
        earlyWarningData = earlyWarningJson
      }
    } else {
      console.error('Failed to fetch early warning data:', earlyWarningResponse.statusText)
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Will use default values if fetch fails
  }

  // Extract data with fallbacks
  const overallCHI = dashboardData.overallCHI || 50
  const productAreas = dashboardData.productAreas || []
  const emergingIssues = dashboardData.emergingIssues || []
  const sentimentData = dashboardData.sentimentTimeline || []
  const sourceData = dashboardData.sourceData || []

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
        <DashboardContent
          overallCHI={overallCHI}
          productAreas={productAreas}
          emergingIssues={emergingIssues}
          sentimentData={sentimentData}
          sourceData={sourceData}
          outageData={outageData}
          earlyWarningData={earlyWarningData}
        />
      </main>
    </div>
  )
}
