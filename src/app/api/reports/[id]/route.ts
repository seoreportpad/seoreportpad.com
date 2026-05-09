import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const sb = createServiceClient();
    const { data, error } = await sb.from("reports").select("*, clients(*), keywords(*), work_done(*), metrics(*), on_page_seo(*), local_seo(*), schema_seo(*), technical_seo(*), content_strategy(*), screenshots(*)").eq("id", id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });

    const clientId = data.client_id;
    const month = data.month;
    const year = data.year;

    const [backlinksRes, competitorsRes, workLogsRes, rankHistoryRes, agencyRes] = await Promise.all([
      sb.from("backlinks").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
      sb.from("competitors").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
      sb.from("work_logs").select("*").eq("client_id", clientId).eq("month", month).eq("year", year).order("log_date", { ascending: false }),
      sb.from("rank_history").select("*").eq("client_id", clientId).order("year", { ascending: true }).order("month", { ascending: true }),
      sb.from("agency_settings").select("*").single(),
    ]);

    return NextResponse.json({
      ...data,
      backlinks: backlinksRes.data ?? [],
      competitors: competitorsRes.data ?? [],
      work_logs: workLogsRes.data ?? [],
      rank_history: rankHistoryRes.data ?? [],
      agency: agencyRes.data ?? null,
    });
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const sb = createServiceClient();
    const body = await req.json();
    const { data, error } = await sb.from("reports").update(body).eq("id", id).select("id, status").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;
    const sb = createServiceClient();
    const body = await req.json();
    const { keywords, work_done, metrics, on_page_seo, local_seo, schema_seo, technical_seo, content_strategy, ...reportData } = body;

    await sb.from("reports").update(reportData).eq("id", id);
    await sb.from("keywords").delete().eq("report_id", id);
    await sb.from("work_done").delete().eq("report_id", id);
    await sb.from("metrics").delete().eq("report_id", id);
    await sb.from("on_page_seo").delete().eq("report_id", id);
    await sb.from("local_seo").delete().eq("report_id", id);
    await sb.from("schema_seo").delete().eq("report_id", id);
    await sb.from("technical_seo").delete().eq("report_id", id);
    await sb.from("content_strategy").delete().eq("report_id", id);

    if (keywords?.length) {
      await sb.from("keywords").insert(keywords.map((k: object) => ({ ...k, report_id: id })));

      const { data: reportMeta } = await sb.from("reports").select("client_id, month, year").eq("id", id).single();
      if (reportMeta) {
        const rankRows = (keywords as { keyword: string; curr_ranking?: number; url?: string }[])
          .filter(k => k.curr_ranking != null)
          .map(k => ({
            client_id: reportMeta.client_id,
            keyword: k.keyword,
            position: k.curr_ranking!,
            month: reportMeta.month,
            year: reportMeta.year,
            url: k.url ?? null,
            user_id: auth.user!.id,
          }));
        if (rankRows.length > 0) {
          await sb.from("rank_history").delete().eq("client_id", reportMeta.client_id).eq("month", reportMeta.month).eq("year", reportMeta.year);
          await sb.from("rank_history").insert(rankRows);
        }
      }
    }
    if (work_done?.length) await sb.from("work_done").insert(work_done.map((w: object) => ({ ...w, report_id: id })));
    if (metrics) await sb.from("metrics").insert({ ...metrics, report_id: id });
    if (on_page_seo) await sb.from("on_page_seo").insert({ ...on_page_seo, report_id: id });
    if (local_seo) await sb.from("local_seo").insert({ ...local_seo, report_id: id });
    if (schema_seo) await sb.from("schema_seo").insert({ ...schema_seo, report_id: id });
    if (technical_seo) await sb.from("technical_seo").insert({ ...technical_seo, report_id: id });
    if (content_strategy) await sb.from("content_strategy").insert({ ...content_strategy, report_id: id });

    const { data } = await sb.from("reports").select("*, clients(*), keywords(*), work_done(*), metrics(*), on_page_seo(*), local_seo(*), schema_seo(*), technical_seo(*), content_strategy(*)").eq("id", id).single();
    return NextResponse.json(data);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const sb = createServiceClient();
    // Delete all related data first
    await Promise.all([
      sb.from("keywords").delete().eq("report_id", id),
      sb.from("work_done").delete().eq("report_id", id),
      sb.from("metrics").delete().eq("report_id", id),
      sb.from("on_page_seo").delete().eq("report_id", id),
      sb.from("local_seo").delete().eq("report_id", id),
      sb.from("schema_seo").delete().eq("report_id", id),
      sb.from("technical_seo").delete().eq("report_id", id),
      sb.from("content_strategy").delete().eq("report_id", id),
      sb.from("screenshots").delete().eq("report_id", id),
      sb.from("portal_links").delete().eq("report_id", id),
    ]);
    const { error } = await sb.from("reports").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
