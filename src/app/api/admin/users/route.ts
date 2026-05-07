import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();

  // Get all auth users with their subscription + agency + counts
  let users = null, error: unknown = null;
  try {
    const result = await sb.rpc("admin_get_users");
    users = result.data;
    error = result.error;
  } catch (e) { error = e; }

  if (error || !users) {
    // Fallback: manual join
    const { data: subs } = await sb.from("subscriptions").select("*");
    const { data: agencies } = await sb.from("agency_settings").select("user_id, agency_name, logo_url");
    const { data: authList } = await sb.auth.admin.listUsers({ perPage: 1000 });

    const subMap = Object.fromEntries((subs ?? []).map(s => [s.user_id, s]));
    const agencyMap = Object.fromEntries((agencies ?? []).map(a => [a.user_id, a]));

    const result = (authList?.users ?? []).map(u => ({
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

  return NextResponse.json(users);
}
