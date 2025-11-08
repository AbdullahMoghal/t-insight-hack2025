import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') || '/auth/confirm-success'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Redirect to success page
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Redirect to error page with error details
  return NextResponse.redirect(new URL('/auth/confirm-error', request.url))
}
