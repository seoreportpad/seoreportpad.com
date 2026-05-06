import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("reports")
      .select("*, clients(*), keywords(*), work_done(*), metrics(*), on_page_seo(*), local_seo(*), schema_seo(*), technical_seo(*)")
      .eq("id", id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const body = await req.json();
    const { keywords, work_done, metrics, on_page_seo, local_seo, schema_seo, technical_seo, ...reportData } = body;

    await supabase.from("reports").update(reportData).eq("id", id);
    await supabase.from("keywords").delete().eq("report_id", id);
    await supabase.from("work_done").delete().eq("report_id", id);
    await supabase.from("metrics").delete().eq("report_id", id);
    await supabase.from("on_page_seo").delete().eq("report_id", id);
    await supabase.from("local_seo").delete().eq("report_id", id);
    await supabase.from("schema_seo").delete().eq("report_id", id);
    await supabase.from("technical_seo").delete().eq("report_id", id);

    if (keywords?.length) {
      await supabase.from("keywords").insert(keywords.map((k: object) => ({ ...k, report_id: id })));
    }
    if (work_done?.length) {
      await supabase.from("work_done").insert(work_done.map((w: object) => ({ ...w, report_id: id })));
    }
    if (metrics) {
      await supabase.from("metrics").insert({ ...metrics, report_id: id });
    }
    if (on_page_seo) {
      await supabase.from("on_page_seo").insert({ ...on_page_seo, report_id: id });
    }
    if (local_seo) {
      await supabase.from("local_seo").insert({ ...local_seo, report_id: id });
    }
    if (schema_seo) {
      await supabase.from("schema_seo").insert({ ...schema_seo, report_id: id });
    }
    if (technical_seo) {
      await supabase.from("technical_seo").insert({ ...technical_seo, report_id: id });
    }

    const { data } = await supabase
      .from("reports")
      .select("*, clients(*), keywords(*), work_done(*), metrics(*), on_page_seo(*), local_seo(*), schema_seo(*), technical_seo(*)")
      .eq("id", id).single();
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
