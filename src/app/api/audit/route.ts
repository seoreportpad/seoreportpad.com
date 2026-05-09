import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getUserClient } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const sb = getUserClient(req);
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

    const { data, error } = await sb.from("audit_results").select("*").eq("client_id", clientId).single();
    if (error && error.code !== "PGRST116") return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || { checks: {} });
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { clientId, checks } = await req.json();
    if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

    const { data, error } = await sb.from("audit_results").upsert({
      user_id: user.id,
      client_id: clientId,
      checks,
      updated_at: new Date().toISOString()
    }, { onConflict: "client_id" }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
