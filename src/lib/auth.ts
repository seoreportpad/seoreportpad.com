import { NextRequest, NextResponse } from "next/server";
import { createUserClient } from "./supabase";
import { SupabaseClient } from "@supabase/supabase-js";

type CookieMeta = {
  name: string; value: string; maxAge: number;
  httpOnly: boolean; secure: boolean; sameSite: "lax"; path: string;
};

type AuthSuccess = {
  user: { id: string; email?: string };
  client: SupabaseClient;
  refreshedResponse: null;
  newCookies: CookieMeta[];
};

type AuthFailure = {
  user: null;
  client: null;
  refreshedResponse: NextResponse;
  newCookies: [];
};

export type AuthResult = AuthSuccess | AuthFailure;

export function getUserClient(req: NextRequest): SupabaseClient {
  const token = req.cookies.get("sb-access-token")?.value ?? "";
  return createUserClient(token);
}

// Applies any refreshed cookies to a response (call after building your own response).
export function applyCookies(res: NextResponse, auth: AuthResult): NextResponse {
  for (const c of auth.newCookies) {
    res.cookies.set(c.name, c.value, { httpOnly: c.httpOnly, secure: c.secure, sameSite: c.sameSite, maxAge: c.maxAge, path: c.path });
  }
  return res;
}

// Shorthand: build a JSON response and automatically attach refreshed cookies.
export function jsonWithCookies(body: unknown, auth: AuthResult, init?: { status?: number }): NextResponse {
  const res = NextResponse.json(body, init);
  return applyCookies(res, auth);
}

// Call this in API routes to get a validated user or return 401.
// When tokens were refreshed, newCookies is populated — pass your response through applyCookies() to send them to the browser.
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthResult> {
  const accessToken = req.cookies.get("sb-access-token")?.value ?? "";
  const refreshToken = req.cookies.get("sb-refresh-token")?.value ?? "";

  const client = createUserClient(accessToken);
  const { data: { user }, error } = await client.auth.getUser();

  if (!error && user) {
    return { user: { id: user.id, email: user.email }, client, refreshedResponse: null, newCookies: [] };
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
      const base = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

      return {
        user: { id: data.session.user.id, email: data.session.user.email },
        client: newClient,
        refreshedResponse: null,
        newCookies: [
          { ...base, name: "sb-access-token", value: access_token, maxAge: expires_in },
          { ...base, name: "sb-refresh-token", value: refresh_token, maxAge: 60 * 60 * 24 * 30 },
        ],
      };
    }
  }

  // Both tokens invalid — clear cookies and send 401
  const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  res.cookies.set("sb-access-token", "", { httpOnly: true, maxAge: 0, path: "/" });
  res.cookies.set("sb-refresh-token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return { user: null, client: null, refreshedResponse: res, newCookies: [] };
}
