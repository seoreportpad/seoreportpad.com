import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getUserClient } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json([]);
  try {
    const sb = getUserClient(req);
    const { data, error } = await sb.from("clients").select("*, reports(count)").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { autoRoadmap, ...body } = await req.json();
    const { data: client, error } = await sb.from("clients").insert({ ...body, user_id: user.id }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (autoRoadmap) {
      const standardTasks = [
        { client_id: client.id, user_id: user.id, task: "Comprehensive Technical SEO Audit", status: "todo", category: "Technical" },
        { client_id: client.id, user_id: user.id, task: "Google Search Console & GA4 Setup", status: "todo", category: "Technical" },
        { client_id: client.id, user_id: user.id, task: "Primary Keyword Research & Strategy", status: "todo", category: "Strategy" },
        { client_id: client.id, user_id: user.id, task: "Competitor Backlink Analysis", status: "todo", category: "Off-Page" },
        { client_id: client.id, user_id: user.id, task: "Optimize Homepage Meta Tags & H1", status: "todo", category: "On-Page" },
        { client_id: client.id, user_id: user.id, task: "Google Business Profile Optimization", status: "todo", category: "Local SEO" },
      ];
      await sb.from("client_tasks").insert(standardTasks);
    }

    return NextResponse.json(client);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
