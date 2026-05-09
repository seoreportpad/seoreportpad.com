import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json([]);
  try {
    const sb = createServiceClient();
    const { searchParams } = req.nextUrl;
    const clientId = searchParams.get("clientId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    let query = sb.from("work_logs").select("*, clients(name, website)").order("log_date", { ascending: false });
    if (clientId) query = query.eq("client_id", clientId);
    if (month) query = query.eq("month", month);
    if (year) query = query.eq("year", Number(year));
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;
    const sb = createServiceClient();
    const body = await req.json();
    const { data, error } = await sb.from("work_logs").insert({ ...body, user_id: auth.user.id }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
