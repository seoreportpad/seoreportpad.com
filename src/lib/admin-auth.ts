import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceClient } from "./supabase";

export async function verifyAdminToken(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin-access-token")?.value;
  if (!token) return false;
  try {
    // Verify JWT via Supabase Auth
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const { data: { user }, error } = await sb.auth.getUser();
    if (error || !user) return false;

    // Check user is in admin_users table
    const service = createServiceClient();
    const { data: adminRow } = await service
      .from("admin_users")
      .select("id")
      .eq("email", user.email ?? "")
      .maybeSingle();

    return !!adminRow;
  } catch { return false; }
}
