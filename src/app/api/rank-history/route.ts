import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json([]);
  try {
    const clientId = req.nextUrl.searchParams.get("clientId");
    const keyword = req.nextUrl.searchParams.get("keyword");
    let query = supabase
      .from("rank_history")
      .select("*, clients(name)")
      .order("tracked_at", { ascending: false });
    if (clientId) query = query.eq("client_id", clientId);
    if (keyword) query = query.ilike("keyword", `%${keyword}%`);
    const { data, error } = await query;
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
    const { data, error } = await supabase.from("rank_history").insert(body).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
