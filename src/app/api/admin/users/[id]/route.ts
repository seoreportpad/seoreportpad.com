import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminToken(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sb = createServiceClient();

  const [{ data: user }, { data: sub }, { data: agency }, { data: clients }, { data: reports }] = await Promise.all([
    sb.auth.admin.getUserById(id),
    sb.from("subscriptions").select("*").eq("user_id", id).maybeSingle(),
    sb.from("agency_settings").select("*").eq("user_id", id).maybeSingle(),
    sb.from("clients").select("id, name, website").eq("user_id", id),
    sb.from("reports").select("id, month, year, status, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
  ]);

  return NextResponse.json({
    user: user?.user ?? null,
    subscription: sub,
    agency,
    clients: clients ?? [],
    reports: reports ?? [],
  });
}

// Update subscription plan/status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminToken(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const sb = createServiceClient();

  const { plan, status, trial_ends_at, note } = body;

  // Upsert subscription
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (plan !== undefined) updateData.plan = plan;
  if (status !== undefined) updateData.status = status;
  if (trial_ends_at !== undefined) updateData.trial_ends_at = trial_ends_at;

  const { data: existing } = await sb.from("subscriptions").select("id").eq("user_id", id).maybeSingle();
  if (existing) {
    await sb.from("subscriptions").update(updateData).eq("user_id", id);
  } else {
    await sb.from("subscriptions").insert({ user_id: id, ...updateData, created_at: new Date().toISOString() });
  }

  // Log the action
  if (note) {
    try { await sb.from("admin_notes").insert({ user_id: id, note, created_at: new Date().toISOString() }); } catch { /* table may not exist */ }
  }

  return NextResponse.json({ success: true });
}

// Delete / ban user
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminToken(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { action } = await req.json(); // action: "ban" | "delete"
  const sb = createServiceClient();

  if (action === "ban") {
    await sb.auth.admin.updateUserById(id, { ban_duration: "876600h" }); // ~100 years
    return NextResponse.json({ success: true, action: "banned" });
  }

  if (action === "delete") {
    await sb.auth.admin.deleteUser(id);
    return NextResponse.json({ success: true, action: "deleted" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
