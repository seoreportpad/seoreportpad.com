import { NextRequest } from "next/server";
import { createServiceClient } from "./supabase";

export async function verifyAdminToken(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin-token")?.value;
  if (!token) return false;
  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("admin_sessions")
      .select("id, expires_at")
      .eq("token", token)
      .single();
    if (!data) return false;
    if (new Date(data.expires_at) < new Date()) {
      await sb.from("admin_sessions").delete().eq("token", token);
      return false;
    }
    return true;
  } catch { return false; }
}
