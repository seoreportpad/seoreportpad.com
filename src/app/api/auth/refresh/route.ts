import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("sb-refresh-token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session) {
    const res = NextResponse.json({ error: "Session expired, please login again" }, { status: 401 });
    res.cookies.set("sb-access-token", "", { httpOnly: true, maxAge: 0, path: "/" });
    res.cookies.set("sb-refresh-token", "", { httpOnly: true, maxAge: 0, path: "/" });
    return res;
  }

  const { access_token, refresh_token, expires_in } = data.session;
  const res = NextResponse.json({ success: true });

  res.cookies.set("sb-access-token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expires_in,
    path: "/",
  });

  res.cookies.set("sb-refresh-token", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return res;
}
