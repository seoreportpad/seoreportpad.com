import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    // Without service role key we can't list auth users.
    // Return the current admin's own data as a minimal fallback.
    const token = req.cookies.get("admin-access-token")?.value;
    const sb = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user } } = await sb.auth.getUser();
    const { data: subs } = await sb.from("subscriptions").select("*").eq("user_id", user?.id ?? "");
    const { data: agencies } = await sb.from("agency_settings").select("*").eq("user_id", user?.id ?? "");

    return NextResponse.json([{
      id: user?.id ?? "",
      email: user?.email ?? "",
      created_at: user?.created_at ?? "",
      last_sign_in: user?.last_sign_in_at ?? null,
      email_confirmed: !!user?.email_confirmed_at,
      subscription: subs?.[0] ?? null,
      agency: agencies?.[0] ?? null,
      _note: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local to see all users",
    }]);
  }

  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Get all tables in parallel
  const [authResult, { data: subs }, { data: agencies }] = await Promise.all([
    sb.auth.admin.listUsers({ perPage: 1000 }),
    sb.from("subscriptions").select("*"),
    sb.from("agency_settings").select("user_id, agency_name, logo_url"),
  ]);

  const subMap = Object.fromEntries((subs ?? []).map((s: any) => [s.user_id, s]));
  const agencyMap = Object.fromEntries((agencies ?? []).map((a: any) => [a.user_id, a]));

  const result = (authResult.data?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in: u.last_sign_in_at,
    email_confirmed: !!u.email_confirmed_at,
    subscription: subMap[u.id] ?? null,
    agency: agencyMap[u.id] ?? null,
  }));

  return NextResponse.json(result);
}
