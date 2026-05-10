import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/auth/callback",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/leads",         // public lead capture
  "/api/portal",        // client portal (token-based)
  "/api/briefs/public", // public brief preview
  "/_next",
  "/favicon",
  "/images",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Only protect /dashboard routes and /api routes (not admin, not marketing)
  const isDashboard = pathname.startsWith("/dashboard");
  const isProtectedApi = pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/api/leads") &&
    !pathname.startsWith("/api/portal") &&
    !pathname.startsWith("/api/briefs/public");

  if (!isDashboard && !isProtectedApi) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("sb-access-token")?.value;
  const refreshToken = req.cookies.get("sb-refresh-token")?.value;

  // No tokens at all → redirect to login
  if (!accessToken && !refreshToken) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Has at least a refresh token — let the route handle actual verification
  // (SessionRefresher + getAuthenticatedUser do the real check)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/((?!auth|admin|leads|portal|briefs/public).*)",
  ],
};
