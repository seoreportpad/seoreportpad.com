import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json([]);
  try {
    const reportId = req.nextUrl.searchParams.get("reportId");
    if (!reportId) return NextResponse.json({ error: "reportId required" }, { status: 400 });
    const { data, error } = await createServiceClient()
      .from("screenshots")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });
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
    const { report_id, label, url, type } = body;
    const { data, error } = await createServiceClient()
      .from("screenshots")
      .insert({ report_id, label, url, type: type ?? "general" })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
