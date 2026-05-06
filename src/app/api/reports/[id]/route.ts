import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getUserClient } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const sb = getUserClient(req);
    const { data, error } = await sb.from("reports").select("*, clients(*), keywords(*), work_done(*), metrics(*), on_page_seo(*), local_seo(*), schema_seo(*), technical_seo(*)").eq("id", id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const sb = getUserClient(req);
    const body = await req.json();
    const { keywords, work_done, metrics, on_page_seo, local_seo, schema_seo, technical_seo, ...reportData } = body;

    await sb.from("reports").update(reportData).eq("id", id);
    await sb.from("keywords").delete().eq("report_id", id);
    await sb.from("work_done").delete().eq("report_id", id);
    await sb.from("metrics").delete().eq("report_id", id);
    await sb.from("on_page_seo").delete().eq("report_id", id);
    await sb.from("local_seo").delete().eq("report_id", id);
    await sb.from("schema_seo").delete().eq("report_id", id);
    await sb.from("technical_seo").delete().eq("report_id", id);

    if (keywords?.length) await sb.from("keywords").insert(keywords.map((k: object) => ({ ...k, report_id: id })));
    if (work_done?.length) await sb.from("work_done").insert(work_done.map((w: object) => ({ ...w, report_id: id })));
    if (metrics) await sb.from("metrics").insert({ ...metrics, report_id: id });
    if (on_page_seo) await sb.from("on_page_seo").insert({ ...on_page_seo, report_id: id });
    if (local_seo) await sb.from("local_seo").insert({ ...local_seo, report_id: id });
    if (schema_seo) await sb.from("schema_seo").insert({ ...schema_seo, report_id: id });
    if (technical_seo) await sb.from("technical_seo").insert({ ...technical_seo, report_id: id });

    const { data } = await sb.from("reports").select("*, clients(*), keywords(*), work_done(*), metrics(*), on_page_seo(*), local_seo(*), schema_seo(*), technical_seo(*)").eq("id", id).single();
    return NextResponse.json(data);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const sb = getUserClient(req);
    const { error } = await sb.from("reports").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
