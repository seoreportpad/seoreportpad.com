import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json([]);
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    let query = supabase
      .from("reports")
      .select("*, clients(id, name, website, email), metrics(*)")
      .order("created_at", { ascending: false });

    if (clientId) query = query.eq("client_id", clientId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const body = await req.json();
    const { keywords, work_done, metrics, on_page_seo, local_seo, schema_seo, technical_seo, ...reportData } = body;

    const { data: report, error: rErr } = await supabase
      .from("reports")
      .insert(reportData)
      .select()
      .single();
    if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

    if (keywords?.length) {
      await supabase.from("keywords").insert(keywords.map((k: object) => ({ ...k, report_id: report.id })));
    }
    if (work_done?.length) {
      await supabase.from("work_done").insert(work_done.map((w: object) => ({ ...w, report_id: report.id })));
    }
    if (metrics) {
      await supabase.from("metrics").insert({ ...metrics, report_id: report.id });
    }
    if (on_page_seo) {
      await supabase.from("on_page_seo").insert({ ...on_page_seo, report_id: report.id });
    }
    if (local_seo) {
      await supabase.from("local_seo").insert({ ...local_seo, report_id: report.id });
    }
    if (schema_seo) {
      await supabase.from("schema_seo").insert({ ...schema_seo, report_id: report.id });
    }
    if (technical_seo) {
      await supabase.from("technical_seo").insert({ ...technical_seo, report_id: report.id });
    }

    const { data: full } = await supabase
      .from("reports")
      .select("*, clients(*), keywords(*), work_done(*), metrics(*), on_page_seo(*), local_seo(*), schema_seo(*), technical_seo(*)")
      .eq("id", report.id)
      .single();

    return NextResponse.json(full);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
