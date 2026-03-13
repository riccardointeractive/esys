import { createBrowserClient as cmsBrowserClient } from '@digiko-npm/cms/supabase'

/**
 * Browser-side Supabase client with anon key.
 * Respects RLS — only reads published content.
 */
export function getBrowserClient() {
  return cmsBrowserClient({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })
}
