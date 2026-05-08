import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase";
import { getUserClient } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { report_id } = await req.json();
    if (!report_id) return NextResponse.json({ error: "report_id required" }, { status: 400 });

    const { data: report } = await sb.from("reports").select("id").eq("id", report_id).eq("user_id", user.id).single();
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    const token = crypto.randomBytes(24).toString("hex");
    const service = createServiceClient();
    const { data, error } = await service
      .from("portal_links")
      .upsert({ report_id, token }, { onConflict: "report_id" })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const service = createServiceClient();
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

    const { data: link, error: linkError } = await service
      .from("portal_links")
      .select("*, reports(*, clients(*), keywords(*), work_done(*), metrics(*), on_page_seo(*), local_seo(*), technical_seo(*), schema_seo(*))")
      .eq("token", token)
      .single();
    
    if (linkError || !link) return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });

    const report = link.reports;
    const clientId = report.client_id;
    const userId = report.user_id;

    const [backlinks, competitors, rankHistory, agency, otherReports, tasks] = await Promise.all([
      service.from("backlinks").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
      service.from("competitors").select("*").eq("client_id", clientId).order("created_at", { ascending: false }),
      service.from("rank_history").select("*").eq("client_id", clientId).order("year", { ascending: true }).order("month", { ascending: true }),
      service.from("agency_settings").select("*").eq("user_id", userId).single(),
      service.from("reports")
        .select("id, month, year, portal_links(token)")
        .eq("client_id", clientId)
        .eq("status", "sent") // Only show sent reports to client
        .order("year", { ascending: false })
        .order("month", { ascending: false }),
      service.from("client_tasks")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
    ]);

    return NextResponse.json({
      ...link,
      reports: {
        ...report,
        backlinks: backlinks.data ?? [],
        competitors: competitors.data ?? [],
        rank_history: rankHistory.data ?? [],
        agency: agency.data ?? null,
      },
      history: (otherReports.data ?? []).map(r => ({
        id: r.id,
        month: r.month,
        year: r.year,
        token: (r.portal_links as any)?.[0]?.token
      })).filter(r => r.token),
      tasks: tasks.data ?? []
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
