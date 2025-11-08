import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/auth/confirm-success'

  // Create redirect URL and clean up query parameters
  const redirectTo = new URL(next, requestUrl.origin)
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('code')
  redirectTo.searchParams.delete('next')

  const supabase = await createClient()

  // Handle PKCE flow (code parameter)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(redirectTo)
    }
  }

  // Handle OTP flow (token_hash parameter) for backward compatibility
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      return NextResponse.redirect(redirectTo)
    }
  }

  // Verification failed - redirect to error page
  redirectTo.pathname = '/auth/confirm-error'
  return NextResponse.redirect(redirectTo)
}
