import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when the public Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

/** Read-only client (anon key) for public data fetching. */
export function getSupabaseReadClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

/**
 * Write client for admin mutations. Prefers the service-role key (server only),
 * falling back to the anon key if RLS policies allow writes.
 */
export function getSupabaseWriteClient(): SupabaseClient | null {
  if (!url) return null;
  const key = serviceKey || anonKey;
  if (!key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const SUPABASE_BUCKET = "media";
