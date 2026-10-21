import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let adminClient: SupabaseClient | null = null

/** Server-only Supabase client (service role). Never import in client components. */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local for Supabase CRM backend.'
    )
  }
  if (!adminClient) {
    adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return adminClient
}

export function isSupabaseCrmConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  )
}

/** True when CRM should use Supabase (default). Set CRM_DATA_BACKEND=json for legacy file storage. */
export function useSupabaseCrmBackend(): boolean {
  const flag = process.env.CRM_DATA_BACKEND?.trim().toLowerCase()
  if (flag === 'json' || flag === 'file') return false
  return true
}

/** Ensures Supabase env is present before CRM API runs (when not using JSON backend). */
export function assertSupabaseCrmBackend(): void {
  if (!useSupabaseCrmBackend()) return
  if (!isSupabaseCrmConfigured()) {
    throw new Error(
      'CRM_DATA_BACKEND is Supabase but NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local'
    )
  }
}
