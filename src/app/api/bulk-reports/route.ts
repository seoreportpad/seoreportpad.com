import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;
    const sb = createServiceClient();

    const { month, year, clientIds, template } = await req.json();
    if (!month || !year) return NextResponse.json({ error: "month and year required" }, { status: 400 });

    let query = sb.from("clients").select("id, name");
    if (clientIds?.length) query = query.in("id", clientIds);
    const { data: clients, error: clientErr } = await query;
    if (clientErr) return NextResponse.json({ error: clientErr.message }, { status: 500 });
    if (!clients?.length) return NextResponse.json({ results: [] });

    const results = [];

    for (const client of clients) {
      try {
        const { data: existing } = await sb.from("reports").select("id").eq("client_id", client.id).eq("month", month).eq("year", year).maybeSingle();
        if (existing) {
          results.push({ clientId: client.id, clientName: client.name, status: "exists", message: "Report already exists" });
          continue;
        }

        const { data: report, error: insertErr } = await sb.from("reports").insert({ client_id: client.id, user_id: auth.user!.id, month, year, status: "draft" }).select().single();
        if (insertErr) { results.push({ clientId: client.id, clientName: client.name, status: "error", message: insertErr.message }); continue; }

        if (template === "copy_last" && report) {
          const { data: lastReport } = await sb.from("reports").select("id, metrics(*)").eq("client_id", client.id).neq("id", report.id).order("year", { ascending: false }).limit(1).maybeSingle();
          if (lastReport) {
            const lastM = Array.isArray(lastReport.metrics) ? lastReport.metrics[0] : lastReport.metrics as Record<string, unknown> | null;
            if (lastM) {
              await sb.from("metrics").insert({ report_id: report.id, prev_traffic: lastM.organic_traffic, prev_backlinks: lastM.backlinks, prev_da: lastM.domain_authority });
            }
            const { data: kws } = await sb.from("keywords").select("*").eq("report_id", lastReport.id);
            if (kws?.length) {
              await sb.from("keywords").insert(kws.map(k => ({ report_id: report.id, keyword: k.keyword, prev_ranking: k.curr_ranking, search_volume: k.search_volume, url: k.url })));
            }
          }
        }

        results.push({ clientId: client.id, clientName: client.name, reportId: report.id, status: "created" });
      } catch (err) {
        results.push({ clientId: client.id, clientName: client.name, status: "error", message: String(err) });
      }
    }

    return NextResponse.json({ results });
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
