import { NextRequest, NextResponse } from "next/server";
import { getUserClient } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({});
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await sb.from("agency_settings").select("*").eq("user_id", user.id).maybeSingle();
    return NextResponse.json(data ?? {});
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { data, error } = await sb.from("agency_settings").upsert({ ...body, user_id: user.id }, { onConflict: "user_id" }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
