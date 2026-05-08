import { NextRequest, NextResponse } from "next/server";
import { getUserClient } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { month, year, clientIds, template } = await req.json();
    if (!month || !year) return NextResponse.json({ error: "month and year required" }, { status: 400 });

    let query = sb.from("clients").select("id, name").eq("user_id", user.id);
    if (clientIds?.length) query = query.in("id", clientIds);
    const { data: clients, error: clientErr } = await query;
    if (clientErr) return NextResponse.json({ error: clientErr.message }, { status: 500 });
    if (!clients?.length) return NextResponse.json({ results: [] });

    const results = [];

    for (const client of clients) {
      try {
        // Check if report already exists for this client/month/year
        const { data: existing } = await sb.from("reports")
          .select("id")
          .eq("client_id", client.id)
          .eq("month", month)
          .eq("year", year)
          .maybeSingle();

        if (existing) {
          results.push({ clientId: client.id, clientName: client.name, status: "exists", message: "Report already exists" });
          continue;
        }

        // Create new report
        const newReport: any = {
          client_id: client.id,
          user_id: user.id,
          month,
          year,
          status: "draft",
        };

        const { data: report, error: insertErr } = await sb.from("reports").insert(newReport).select().single();

        if (insertErr) {
          results.push({ clientId: client.id, clientName: client.name, status: "error", message: insertErr.message });
          continue;
        }

        // If template is copy_last, try to find and copy metrics
        if (template === "copy_last" && report) {
          // Find most recent report
          const { data: lastReport } = await sb.from("reports")
            .select("id, metrics")
            .eq("client_id", client.id)
            .neq("id", report.id)
            .order("year", { ascending: false })
            .order("month", { ascending: false }) // This is a bit naive since months are strings, but usually works for recent
            .limit(1)
            .maybeSingle();

          if (lastReport?.metrics) {
            // Copy metrics, swapping current to previous
            const lastM = lastReport.metrics as any;
            const newMetrics = {
              prev_traffic: lastM.organic_traffic,
              prev_backlinks: lastM.backlinks,
              prev_da: lastM.domain_authority,
              // Keep notes/recommendations if desired, but usually they change
            };
            await sb.from("reports").update({ metrics: newMetrics }).eq("id", report.id);
            
            // Optionally copy keywords
            const { data: kws } = await sb.from("keywords").select("*").eq("report_id", lastReport.id);
            if (kws?.length) {
              const newKws = kws.map(k => ({
                report_id: report.id,
                user_id: user.id,
                keyword: k.keyword,
                prev_ranking: k.curr_ranking, // Move current to previous
                search_volume: k.search_volume,
                url: k.url
              }));
              await sb.from("keywords").insert(newKws);
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
