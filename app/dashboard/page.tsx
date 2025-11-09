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

  // Mock data for demonstration
  const overallCHI = 68

  const productAreas = [
    {
      id: '1',
      name: 'Network',
      color: '#E8258E',
      chi: 67,
      trend: -5,
      signalCount: 45,
    },
    {
      id: '2',
      name: 'Mobile App',
      color: '#7C3E93',
      chi: 82,
      trend: 3,
      signalCount: 12,
    },
    {
      id: '3',
      name: 'Billing',
      color: '#00A19C',
      chi: 71,
      trend: 0,
      signalCount: 23,
    },
    {
      id: '4',
      name: 'Home Internet',
      color: '#F58220',
      chi: 75,
      trend: 2,
      signalCount: 18,
    },
  ]

  const emergingIssues = [
    {
      id: '1',
      topic: 'Network outage in Texas',
      intensity: 127,
      sentiment: -0.8,
      sourceCount: 8,
      productArea: 'Network',
    },
    {
      id: '2',
      topic: 'App login failing',
      intensity: 89,
      sentiment: -0.7,
      sourceCount: 5,
      productArea: 'Mobile App',
    },
    {
      id: '3',
      topic: 'Unexpected bill charges',
      intensity: 45,
      sentiment: -0.6,
      sourceCount: 12,
      productArea: 'Billing',
    },
    {
      id: '4',
      topic: '5G home gateway issues',
      intensity: 34,
      sentiment: -0.5,
      sourceCount: 6,
      productArea: 'Home Internet',
    },
    {
      id: '5',
      topic: 'Tuesdays app rewards not loading',
      intensity: 28,
      sentiment: -0.4,
      sourceCount: 4,
      productArea: 'Mobile App',
    },
  ]

  // Generate 24 hours of mock sentiment data
  const now = new Date()
  const sentimentData = Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
    return {
      timestamp,
      network: -0.3 + Math.random() * 0.5,
      mobileApp: 0.2 + Math.random() * 0.4,
      billing: -0.1 + Math.random() * 0.4,
      homeInternet: 0.1 + Math.random() * 0.3,
    }
  })

  const sourceData = [
    { name: 'Reddit', value: 145 },
    { name: 'DownDetector', value: 98 },
    { name: 'Community', value: 67 },
    { name: 'App Store', value: 45 },
    { name: 'Play Store', value: 38 },
    { name: 'Twitter', value: 22 },
  ]

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
        <DashboardContent
          overallCHI={overallCHI}
          productAreas={productAreas}
          emergingIssues={emergingIssues}
          sentimentData={sentimentData}
          sourceData={sourceData}
        />
      </main>
    </div>
  )
}
