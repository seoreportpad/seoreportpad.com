import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, password, agencyName } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Create user in Supabase Auth
  const { data: user, error: userError } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm for admin created users
  });

  if (userError || !user.user) {
    return NextResponse.json({ error: userError?.message || "Failed to create user" }, { status: 400 });
  }

  // Create agency setting if provided
  if (agencyName) {
    await sb.from("agency_settings").insert({
      user_id: user.user.id,
      agency_name: agencyName,
    });
  }

  // Assign Free plan by default
  await sb.from("subscriptions").insert({
    user_id: user.user.id,
    plan: "free",
    status: "active",
  });

  return NextResponse.json({ success: true, user: user.user });
}
