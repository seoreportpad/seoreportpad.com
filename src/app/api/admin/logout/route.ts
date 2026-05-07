import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin-token")?.value;
  if (token) {
    try {
      const sb = createServiceClient();
      await sb.from("admin_sessions").delete().eq("token", token);
    } catch { /* ignore */ }
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin-token", "", { maxAge: 0, path: "/" });
  return res;
}
