import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase";
import { getUserClient } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { report_id } = await req.json();
    if (!report_id) return NextResponse.json({ error: "report_id required" }, { status: 400 });

    // Verify this report belongs to the user
    const { data: report } = await sb.from("reports").select("id").eq("id", report_id).eq("user_id", user.id).single();
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    const token = crypto.randomBytes(24).toString("hex");
    // Use service client to bypass RLS for portal_links (public read policy already set)
    const service = createServiceClient();
    const { data, error } = await service
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
    // Public read — use service client
    const service = createServiceClient();
    const { data, error } = await service
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
