import { NextRequest, NextResponse } from "next/server";
import { getUserClient } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

// POST /api/bulk-reports — create a draft report for each client for the given month/year
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { month, year, clientIds } = await req.json();
    if (!month || !year) return NextResponse.json({ error: "month and year required" }, { status: 400 });

    let query = sb.from("clients").select("id").eq("user_id", user.id);
    if (clientIds?.length) query = query.in("id", clientIds);
    const { data: clients, error: clientErr } = await query;
    if (clientErr) return NextResponse.json({ error: clientErr.message }, { status: 500 });
    if (!clients?.length) return NextResponse.json({ created: 0 });

    const reports = clients.map((c: { id: string }) => ({
      client_id: c.id,
      user_id: user.id,
      month,
      year,
      status: "draft",
    }));

    const { data, error } = await sb.from("reports").insert(reports).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ created: data?.length ?? 0, reports: data });
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
