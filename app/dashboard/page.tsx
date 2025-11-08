import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tmobile-gray-50 via-white to-tmobile-magenta/5">
      <header className="bg-white/80 backdrop-blur-md border-b border-tmobile-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="T-Mobile Logo"
              width={40}
              height={40}
              className="drop-shadow-sm"
            />
            <h1 className="text-2xl font-semibold text-tmobile-black">T-Insight</h1>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              className="border-tmobile-gray-300 hover:bg-tmobile-gray-100"
            >
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-tmobile-gray-200 p-8">
          <h2 className="text-3xl font-semibold text-tmobile-black mb-4">
            Welcome to T-Insight
          </h2>
          <p className="text-tmobile-gray-600 mb-6">
            You&apos;re signed in as <span className="font-medium text-tmobile-black">{user.email}</span>
          </p>
          <div className="bg-tmobile-gray-50 rounded-lg p-6 border border-tmobile-gray-200">
            <h3 className="text-lg font-semibold text-tmobile-black mb-2">
              Dashboard Coming Soon
            </h3>
            <p className="text-tmobile-gray-600">
              This is a placeholder for the customer intelligence dashboard. The full dashboard
              with charts, signals, and opportunity cards will be implemented in the next phase.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
