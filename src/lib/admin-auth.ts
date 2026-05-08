import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function verifyAdminToken(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin-access-token")?.value;
  if (!token) return false;

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Verify JWT via Supabase Auth (no service key needed)
    const sb = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error } = await sb.auth.getUser();
    if (error || !user || !user.email) return false;

    const normalizedEmail = user.email.toLowerCase();

    // Method 1: Check env-based admin email list (most reliable)
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (adminEmails.includes(normalizedEmail)) return true;

    // Method 2: Check admin_users table via service role (if available)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      const serviceClient = createClient(url, serviceKey, { auth: { persistSession: false } });
      const { data: adminRow } = await serviceClient
        .from("admin_users")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();
      return !!adminRow;
    }

    // Method 3: dev fallback — if no config at all, allow any authenticated user
    if (adminEmails.length === 0 && !serviceKey) return true;

    return false;
  } catch {
    return false;
  }
}
