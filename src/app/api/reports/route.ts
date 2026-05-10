import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase";
import { getAuthenticatedUser, jsonWithCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json([]);
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;
    const sb = createServiceClient();
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const websiteId = searchParams.get("websiteId");
    let query = sb.from("reports").select("*, clients(id, name, website, email), metrics(*), keywords(*), work_done(*), websites(id, url, name)").eq("user_id", auth.user.id).order("created_at", { ascending: false });
    if (clientId) query = query.eq("client_id", clientId);
    if (websiteId) query = query.eq("website_id", websiteId);
    const { data, error } = await query;
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
    const body = await req.json();
    const { keywords, work_done, metrics, on_page_seo, local_seo, schema_seo, technical_seo, content_strategy, ...reportData } = body;

    const { data: report, error: rErr } = await sb.from("reports").insert({ ...reportData, user_id: auth.user.id }).select().single();
    if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

    if (keywords?.length) await sb.from("keywords").insert(keywords.map((k: object) => ({ ...k, report_id: report.id })));
    if (work_done?.length) await sb.from("work_done").insert(work_done.map((w: object) => ({ ...w, report_id: report.id })));
    if (metrics) await sb.from("metrics").insert({ ...metrics, report_id: report.id });
    if (on_page_seo) await sb.from("on_page_seo").insert({ ...on_page_seo, report_id: report.id });
    if (local_seo) await sb.from("local_seo").insert({ ...local_seo, report_id: report.id });
    if (schema_seo) await sb.from("schema_seo").insert({ ...schema_seo, report_id: report.id });
    if (technical_seo) await sb.from("technical_seo").insert({ ...technical_seo, report_id: report.id });
    if (content_strategy) await sb.from("content_strategy").insert({ ...content_strategy, report_id: report.id });

    const { data: full } = await sb.from("reports").select("*, clients(*), keywords(*), work_done(*), metrics(*), on_page_seo(*), local_seo(*), schema_seo(*), technical_seo(*), content_strategy(*)").eq("id", report.id).single();
    return NextResponse.json(full);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
