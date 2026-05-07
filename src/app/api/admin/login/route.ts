import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });

  // 1. Sign in via Supabase Auth
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: authData, error: authError } = await sb.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (authError || !authData.session)
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const userId = authData.user.id;

  // 2. Check this user is in admin_users table
  const service = createServiceClient();
  const { data: adminRow } = await service
    .from("admin_users")
    .select("id, role")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (!adminRow)
    return NextResponse.json({ error: "Access denied — not an admin account" }, { status: 403 });

  // 3. Update last_login
  await service.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", adminRow.id);

  // 4. Set Supabase JWT cookies (same pattern as regular login)
  const { access_token, refresh_token, expires_in } = authData.session;
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin-access-token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expires_in,
    path: "/",
  });
  res.cookies.set("admin-refresh-token", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
