import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConfirmSuccessPage() {
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
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-semibold">Email Confirmed!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-tmobile-gray-50 p-4 border border-tmobile-gray-200">
              <p className="text-sm text-tmobile-gray-700 text-center">
                Thank you for confirming your email address. Your account is now active and ready to use.
              </p>
            </div>

            <Link href="/login" className="block">
              <Button className="w-full bg-tmobile-magenta hover:bg-tmobile-magenta-dark">
                Continue to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
