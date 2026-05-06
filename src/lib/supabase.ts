import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return !!(url && anonKey && url.startsWith("https://") && anonKey.length > 10);
}

// Anon client — used for auth operations
export const supabase = createClient(url, anonKey);

// User-scoped client — passes the user's JWT so RLS applies correctly
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

// Service role client — bypasses RLS, used only in webhook/admin routes
export function createServiceClient(): SupabaseClient {
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
