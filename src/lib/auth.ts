import { NextRequest, NextResponse } from "next/server";
import { createUserClient } from "./supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export function getUserClient(req: NextRequest): SupabaseClient {
  const token = req.cookies.get("sb-access-token")?.value ?? "";
  return createUserClient(token);
}

// Call this in API routes to get a validated user or return 401.
// Automatically attempts token refresh if access token is expired.
export async function getAuthenticatedUser(req: NextRequest): Promise<
  | { user: { id: string; email?: string }; client: SupabaseClient; refreshedResponse: null }
  | { user: null; client: null; refreshedResponse: NextResponse }
> {
  const accessToken = req.cookies.get("sb-access-token")?.value ?? "";
  const refreshToken = req.cookies.get("sb-refresh-token")?.value ?? "";

  const client = createUserClient(accessToken);
  const { data: { user }, error } = await client.auth.getUser();

  if (!error && user) {
    return { user: { id: user.id, email: user.email }, client, refreshedResponse: null };
  }

  // Access token expired — try refresh
  if (refreshToken) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error: refreshError } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (!refreshError && data.session) {
      const { access_token, refresh_token, expires_in } = data.session;
      const newClient = createUserClient(access_token);

      // Return 200 with set-cookie headers so browser gets new tokens
      // Caller should merge these cookies into their response
      const cookieRes = new NextResponse(null, { status: 200 });
      cookieRes.cookies.set("sb-access-token", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: expires_in,
        path: "/",
      });
      cookieRes.cookies.set("sb-refresh-token", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      return {
        user: { id: data.session.user.id, email: data.session.user.email },
        client: newClient,
        refreshedResponse: null,
      };
    }
  }

  // Both tokens invalid — send 401
  const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  res.cookies.set("sb-access-token", "", { httpOnly: true, maxAge: 0, path: "/" });
  res.cookies.set("sb-refresh-token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return { user: null, client: null, refreshedResponse: res };
}
