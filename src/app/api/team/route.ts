import { NextRequest, NextResponse } from "next/server";
import { getUserClient } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json([]);
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data, error } = await sb.from("team_members").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await req.json();
    const { error } = await sb.from("team_members").delete().eq("id", id).eq("owner_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
