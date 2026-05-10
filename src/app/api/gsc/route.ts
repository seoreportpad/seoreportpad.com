import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonWithCookies } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

async function getValidToken(userId: string, clientId: string) {
  const sb = createServiceClient();
  const { data: token } = await sb
    .from("gsc_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("client_id", clientId)
    .single();

  if (!token) return null;

  // Refresh if expires within 5 minutes
  if (new Date(token.expires_at).getTime() < Date.now() + 5 * 60 * 1000) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: token.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    const refreshed = await res.json();
    if (!refreshed.access_token) return null;

    const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
    await sb.from("gsc_tokens").update({
      access_token: refreshed.access_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId).eq("client_id", clientId);

    return refreshed.access_token as string;
  }

  return token.access_token as string;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const action = searchParams.get("action") || "performance";
    const siteUrl = searchParams.get("siteUrl");
    const startDate = searchParams.get("startDate") || getDateDaysAgo(28);
    const endDate = searchParams.get("endDate") || getDateDaysAgo(1);

    if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

    // Check if connected
    const sb = createServiceClient();
    const { data: tokenRow } = await sb
      .from("gsc_tokens")
      .select("id, updated_at")
      .eq("user_id", auth.user.id)
      .eq("client_id", clientId)
      .single();

    if (action === "status") {
      return jsonWithCookies({ connected: !!tokenRow }, auth);
    }

    if (!tokenRow) return NextResponse.json({ error: "Not connected. Please connect Google Search Console first." }, { status: 401 });

    const accessToken = await getValidToken(auth.user.id, clientId);
    if (!accessToken) return NextResponse.json({ error: "Token expired. Please reconnect." }, { status: 401 });

    // List sites
    if (action === "sites") {
      const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      return jsonWithCookies({ sites: data.siteEntry ?? [] }, auth);
    }

    if (!siteUrl) return NextResponse.json({ error: "siteUrl required" }, { status: 400 });

    // Performance data
    if (action === "performance") {
      const res = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate,
            endDate,
            dimensions: ["query"],
            rowLimit: 25,
            orderBy: [{ fieldName: "clicks", sortOrder: "DESCENDING" }],
          }),
        }
      );
      const data = await res.json();
      return jsonWithCookies({ rows: data.rows ?? [], startDate, endDate }, auth);
    }

    // Pages performance
    if (action === "pages") {
      const res = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate,
            endDate,
            dimensions: ["page"],
            rowLimit: 20,
            orderBy: [{ fieldName: "clicks", sortOrder: "DESCENDING" }],
          }),
        }
      );
      const data = await res.json();
      return jsonWithCookies({ rows: data.rows ?? [] }, auth);
    }

    // Overview (no dimension — totals)
    if (action === "overview") {
      const res = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ startDate, endDate, dimensions: ["date"], rowLimit: 90 }),
        }
      );
      const data = await res.json();
      return jsonWithCookies({ rows: data.rows ?? [] }, auth);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });
    const sb = createServiceClient();
    await sb.from("gsc_tokens").delete().eq("user_id", auth.user.id).eq("client_id", clientId);
    return jsonWithCookies({ ok: true }, auth);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function getDateDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}
