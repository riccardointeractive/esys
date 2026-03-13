import { createAdminClient as cmsAdminClient } from '@digiko-npm/cms/supabase'

/**
 * Server-side Supabase client with service role key.
 * Bypasses RLS — use only in API routes / server actions.
 */
export function getAdminClient() {
  return cmsAdminClient({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  })
}
