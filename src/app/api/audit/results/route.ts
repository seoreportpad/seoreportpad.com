import { NextRequest, NextResponse } from "next/server";
import { getUserClient } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({});
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    let query = sb.from("audit_results").select("*").eq("user_id", user.id);
    if (clientId) {
      query = query.eq("client_id", clientId);
    } else {
      // If no clientId, maybe return the "global/default" one or just the latest
      query = query.is("client_id", null);
    }

    const { data, error } = await query.maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    return NextResponse.json(data?.checks ?? {});
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { checks, clientId } = await req.json();

    const upsertData: any = {
      user_id: user.id,
      checks,
      updated_at: new Date().toISOString(),
    };

    if (clientId) {
      upsertData.client_id = clientId;
    } else {
      upsertData.client_id = null;
    }

    // Upsert based on user_id and client_id
    // We need a unique constraint on (user_id, client_id) or similar
    // For now, let's just find and update or insert
    const { data: existing } = await sb.from("audit_results")
      .select("id")
      .eq("user_id", user.id)
      .filter("client_id", clientId ? "eq" : "is", clientId)
      .maybeSingle();

    if (existing) {
      const { error } = await sb.from("audit_results").update(upsertData).eq("id", existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await sb.from("audit_results").insert(upsertData);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
