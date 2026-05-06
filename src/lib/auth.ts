import { NextRequest } from "next/server";
import { createUserClient } from "./supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export function getUserClient(req: NextRequest): SupabaseClient {
  const token = req.cookies.get("sb-access-token")?.value ?? "";
  return createUserClient(token);
}
