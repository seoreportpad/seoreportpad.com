import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase";
import { getAuthenticatedUser, jsonWithCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json([]);
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;
    const sb = createServiceClient();
    const clientId = req.nextUrl.searchParams.get("clientId");
    let query = sb.from("websites").select("*, clients(name)").eq("user_id", auth.user.id).order("created_at", { ascending: true });
    if (clientId) query = query.eq("client_id", clientId);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return jsonWithCookies(data ?? [], auth);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;
    const sb = createServiceClient();
    const body = await req.json();
    const { data, error } = await sb.from("websites").insert({ ...body, user_id: auth.user.id }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
