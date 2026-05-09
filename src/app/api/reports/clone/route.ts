import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;
    const sb = createServiceClient();
    const user = auth.user;

    const { reportId, month, year } = await req.json();
    if (!reportId) return NextResponse.json({ error: "reportId required" }, { status: 400 });

    // Fetch source report with all related data
    const { data: src, error: srcErr } = await sb
      .from("reports")
      .select("*, keywords(*), work_done(*), metrics(*), on_page_seo(*), local_seo(*), schema_seo(*), technical_seo(*), content_strategy(*)")
      .eq("id", reportId)
      .single();
    if (srcErr || !src) return NextResponse.json({ error: "Source report not found" }, { status: 404 });

    // Create new report (strip id, timestamps, set new month/year, reset to draft)
    const { id: _id, created_at: _ca, updated_at: _ua, ...reportFields } = src as Record<string, unknown>;
    const { data: newReport, error: nErr } = await sb
      .from("reports")
      .insert({ ...reportFields, month: month ?? src.month, year: year ?? src.year, status: "draft", user_id: user.id })
      .select()
      .single();
    if (nErr || !newReport) return NextResponse.json({ error: nErr?.message ?? "Failed to create report" }, { status: 500 });

    const rid = newReport.id;

    // Clone all sub-tables
    const stripMeta = (rows: Record<string, unknown>[]) =>
      rows.map(({ id: _i, created_at: _c, report_id: _r, ...rest }) => ({ ...rest, report_id: rid }));

    const inserts = [
      src.keywords?.length     && sb.from("keywords").insert(stripMeta(src.keywords)),
      src.work_done?.length    && sb.from("work_done").insert(stripMeta(src.work_done)),
      src.metrics              && sb.from("metrics").insert(stripMeta([src.metrics])),
      src.on_page_seo          && sb.from("on_page_seo").insert(stripMeta([src.on_page_seo])),
      src.local_seo            && sb.from("local_seo").insert(stripMeta([src.local_seo])),
      src.schema_seo           && sb.from("schema_seo").insert(stripMeta([src.schema_seo])),
      src.technical_seo        && sb.from("technical_seo").insert(stripMeta([src.technical_seo])),
      src.content_strategy     && sb.from("content_strategy").insert(stripMeta([src.content_strategy])),
    ].filter(Boolean);
    for (const q of inserts) await q;

    return NextResponse.json({ id: rid });
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
