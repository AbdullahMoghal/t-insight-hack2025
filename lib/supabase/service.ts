/**
 * Supabase Service Role Client
 * Used for API routes that need to bypass RLS policies
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client with service role key
 * This bypasses Row Level Security (RLS) policies
 * Use ONLY in secure server-side contexts (API routes, server actions)
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
