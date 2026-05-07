import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Look up admin user
  const { data: admin } = await sb
    .from("admin_users")
    .select("id, email, password_hash, role")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Compare password — stored as bcrypt or plain SHA-256 depending on setup.
  // We'll use a simple env-var-based master password check as the secure fallback.
  const masterPass = process.env.ADMIN_PASSWORD;
  const validByEnv = masterPass && password === masterPass && email === process.env.ADMIN_EMAIL;

  // Also support bcrypt hash stored in DB (if bcryptjs is installed)
  let validByHash = false;
  if (admin.password_hash && !validByEnv && admin.password_hash.startsWith("$2")) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const bcrypt = require("bcryptjs") as { compare: (a: string, b: string) => Promise<boolean> };
      validByHash = await bcrypt.compare(password, admin.password_hash);
    } catch { /* bcryptjs not installed */ }
  }

  if (!validByEnv && !validByHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Create session token
  const token = randomBytes(32).toString("hex");
  await sb.from("admin_sessions").insert({ token });
  await sb.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", admin.id);

  const res = NextResponse.json({ success: true });
  res.cookies.set("admin-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return res;
}
