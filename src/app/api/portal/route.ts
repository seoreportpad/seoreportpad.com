import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const { report_id } = await req.json();
    const token = crypto.randomBytes(24).toString("hex");
    const { data, error } = await supabase
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
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });
    const { data, error } = await supabase
      .from("portal_links")
      .select("*, reports(*, clients(*), keywords(*), work_done(*), metrics(*))")
      .eq("token", token)
      .single();
    if (error || !data) return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
