import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "not configured" }, { status: 503 });
  
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  const service = createServiceClient();
  try {
    const { data: brief, error } = await service
      .from("content_briefs")
      .select("*, clients(name, website)")
      .eq("token", token)
      .single();
      
    // Because agency_settings is linked to user_id, we can fetch it via a separate query if the join is complex.
    // Let's do it cleanly to avoid join issues if user_id doesn't map directly in a generic way.
    if (error || !brief) return NextResponse.json({ error: "Brief not found or expired" }, { status: 404 });

    const { data: agency } = await service.from("agency_settings").select("*").eq("user_id", brief.user_id).single();

    return NextResponse.json({
      ...brief,
      agency: agency || null
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
