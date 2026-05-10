import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const error = searchParams.get("error");

  const base = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  if (error || !code || !stateRaw) {
    return NextResponse.redirect(`${base}/dashboard/tools/gsc?error=access_denied`);
  }

  let state: { userId: string; clientId: string };
  try {
    state = JSON.parse(stateRaw);
  } catch {
    return NextResponse.redirect(`${base}/dashboard/tools/gsc?error=invalid_state`);
  }

  const redirectUri = `${base}/api/auth/google/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokens.access_token) {
    return NextResponse.redirect(`${base}/dashboard/tools/gsc?error=token_exchange_failed`);
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const sb = createServiceClient();
  await sb.from("gsc_tokens").upsert({
    user_id: state.userId,
    client_id: state.clientId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expiresAt,
    scope: tokens.scope,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,client_id" });

  return NextResponse.redirect(`${base}/dashboard/tools/gsc?connected=${state.clientId}`);
}
