import { NextRequest, NextResponse } from "next/server";
import { getUserClient } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ plan: "free", status: "active" });

    const { data } = await sb.from("subscriptions").select("*").eq("user_id", user.id).single();
    if (!data) return NextResponse.json({ plan: "free", status: "active" });

    const isTrialing = data.status === "trialing" && data.trial_ends_at && new Date(data.trial_ends_at) > new Date();
    const isActive = data.status === "active" || isTrialing;

    return NextResponse.json({
      plan: data.plan,
      status: data.status,
      isActive,
      isTrialing,
      trialEndsAt: data.trial_ends_at,
      currentPeriodEnd: data.current_period_end,
    });
  } catch (e: unknown) {
    return NextResponse.json({ plan: "free", status: "active" });
  }
}
