import { createClient, SupabaseClient } from "@supabase/supabase-js";

const getUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const getAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const getServiceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  const url = getUrl();
  const key = getAnonKey();
  return !!(url && key && url.startsWith("https://") && key.length > 10);
}

// Anon client — lazy, only created when first used
let _supabase: SupabaseClient | null = null;
export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const url = getUrl();
    const key = getAnonKey();
    // Use placeholder values so createClient doesn't throw at module evaluation
    // time when env vars are absent. Real calls will fail gracefully.
    _supabase = createClient(
      url || "https://placeholder.supabase.co",
      key || "placeholder-anon-key-0000000000000000000000000000",
    );
  }
  return _supabase;
}
// Keep named export for legacy imports (signup page uses this directly)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// User-scoped client — passes the user's JWT so RLS applies correctly
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(getUrl(), getAnonKey(), {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

// Service role client — bypasses RLS, used only in webhook/admin routes
export function createServiceClient(): SupabaseClient {
  const key = getServiceKey();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(getUrl(), key, { auth: { persistSession: false } });
}
