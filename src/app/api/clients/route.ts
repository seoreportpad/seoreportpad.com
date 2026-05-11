import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase";
import { getAuthenticatedUser, jsonWithCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json([]);
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;
    const sb = createServiceClient();
    const { data, error } = await sb.from("clients").select("*").eq("user_id", auth.user.id).order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return jsonWithCookies(data ?? [], auth);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;
    const sb = createServiceClient();
    const { autoRoadmap, ...body } = await req.json();
    const { data: client, error } = await sb.from("clients").insert({ ...body, user_id: auth.user.id }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (autoRoadmap) {
      const tasks = [
        { client_id: client.id, user_id: auth.user.id, task: "Comprehensive Technical SEO Audit", status: "todo", category: "Technical" },
        { client_id: client.id, user_id: auth.user.id, task: "Google Search Console & GA4 Setup", status: "todo", category: "Technical" },
        { client_id: client.id, user_id: auth.user.id, task: "Primary Keyword Research & Strategy", status: "todo", category: "Strategy" },
        { client_id: client.id, user_id: auth.user.id, task: "Competitor Backlink Analysis", status: "todo", category: "Off-Page" },
        { client_id: client.id, user_id: auth.user.id, task: "Optimize Homepage Meta Tags & H1", status: "todo", category: "On-Page" },
        { client_id: client.id, user_id: auth.user.id, task: "Google Business Profile Optimization", status: "todo", category: "Local SEO" },
      ];
      try { await sb.from("client_tasks").insert(tasks); } catch { /* table may not exist */ }
    }
    return NextResponse.json(client);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
