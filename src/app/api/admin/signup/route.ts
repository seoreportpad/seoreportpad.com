import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase";

// Only allow signup if ADMIN_SIGNUP_SECRET header matches env var
// This prevents random people from creating admin accounts
export async function POST(req: NextRequest) {
  const { email, password, name, secret } = await req.json();

  if (!email || !password || !name)
    return NextResponse.json({ error: "Email, password and name required" }, { status: 400 });

  // Guard: require a signup secret set in env
  const adminSecret = process.env.ADMIN_SIGNUP_SECRET;
  if (!adminSecret || secret !== adminSecret)
    return NextResponse.json({ error: "Invalid signup secret" }, { status: 403 });

  if (password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  // 1. Create Supabase Auth user
  const service = createServiceClient();
  const { data: authData, error: authError } = await service.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true, // auto-confirm for admin
    user_metadata: { full_name: name },
  });

  if (authError)
    return NextResponse.json({ error: authError.message }, { status: 400 });

  // 2. Insert into admin_users table
  const { error: insertError } = await service
    .from("admin_users")
    .insert({
      email: email.trim().toLowerCase(),
      password_hash: "supabase-auth", // placeholder, real auth via Supabase
      role: "admin",
    });

  if (insertError) {
    // Rollback: delete the auth user
    await service.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, userId: authData.user.id });
}
