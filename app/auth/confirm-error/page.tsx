import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConfirmErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-tmobile-magenta/5 via-white to-tmobile-magenta/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-tmobile-magenta/10 via-transparent to-transparent pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.svg"
            alt="T-Mobile Logo"
            width={80}
            height={80}
            className="drop-shadow-lg"
            priority
          />
        </div>

        <Card className="border-tmobile-gray-200 shadow-xl backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-semibold">Confirmation Failed</CardTitle>
            <CardDescription>
              We couldn&apos;t verify your email address. The confirmation link may have expired or is invalid.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-700 mb-2 font-medium">
                What you can do:
              </p>
              <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
                <li>Request a new confirmation email</li>
                <li>Check that you&apos;re using the latest link from your email</li>
                <li>Ensure the link hasn&apos;t expired (links are valid for 24 hours)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Link href="/signup" className="block">
                <Button className="w-full bg-tmobile-magenta hover:bg-tmobile-magenta-dark">
                  Try Signing Up Again
                </Button>
              </Link>

              <Link href="/login" className="block">
                <Button variant="outline" className="w-full border-tmobile-gray-300 hover:bg-tmobile-gray-100">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
