import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getUserClient } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json([]);
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clientId = req.nextUrl.searchParams.get("clientId");
    let query = sb.from("content_briefs").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (clientId) query = query.eq("client_id", clientId);

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
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const token = crypto.randomBytes(16).toString("hex");

    const { data, error } = await sb.from("content_briefs").insert({
      user_id: user.id,
      client_id: body.client_id,
      title: body.title,
      primary_keyword: body.primary_keyword,
      secondary_keywords: body.secondary_keywords,
      word_count: body.word_count,
      tone: body.tone,
      outline: body.outline,
      competitor_links: body.competitor_links,
      internal_links: body.internal_links,
      instructions: body.instructions,
      nlp_terms: body.nlp_terms,
      semantic_entities: body.semantic_entities,
      status: body.status || "draft",
      token: token
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
