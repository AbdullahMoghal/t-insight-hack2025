'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

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
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              Sign in to T-Insight
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="border-tmobile-gray-300 focus:ring-tmobile-magenta"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-tmobile-magenta hover:text-tmobile-magenta-dark transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="border-tmobile-gray-300 focus:ring-tmobile-magenta"
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-tmobile-negative bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-tmobile-magenta hover:bg-tmobile-magenta-dark"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-tmobile-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-tmobile-magenta hover:text-tmobile-magenta-dark font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
