import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Step 1: Sign in via Supabase Auth
  const sb = createClient(url, anon);
  const { data: authData, error: authError } = await sb.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (authError || !authData.session) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const { access_token, refresh_token, expires_in } = authData.session;

  // Step 2: Check if user is admin
  // Method A: env-based admin email list (most reliable, no DB table needed)
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const normalizedEmail = email.trim().toLowerCase();
  let isAdmin = adminEmails.includes(normalizedEmail);

  // Method B: Check admin_users table (with service role key if available)
  if (!isAdmin) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      try {
        const serviceClient = createClient(url, serviceKey, { auth: { persistSession: false } });
        const { data: adminRow } = await serviceClient
          .from("admin_users")
          .select("id")
          .eq("email", normalizedEmail)
          .maybeSingle();
        isAdmin = !!adminRow;
        if (isAdmin) {
          await serviceClient
            .from("admin_users")
            .update({ last_login: new Date().toISOString() })
            .eq("email", normalizedEmail);
        }
      } catch {
        // table may not exist yet — fall through
      }
    } else {
      // No service key and no env email list — try anon client with user's JWT
      try {
        const userClient = createClient(url, anon, {
          global: { headers: { Authorization: `Bearer ${access_token}` } },
        });
        const { data: adminRow } = await userClient
          .from("admin_users")
          .select("id")
          .eq("email", normalizedEmail)
          .maybeSingle();
        isAdmin = !!adminRow;
      } catch {
        // table may not exist — fall through
      }
    }
  }

  // Method C: If no admin config at all, allow the first authenticated user (dev mode)
  if (!isAdmin && adminEmails.length === 0 && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    isAdmin = true; // dev fallback — remove this in production
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Access denied — not an admin account" }, { status: 403 });
  }

  // Step 3: Set auth cookies
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
