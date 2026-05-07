import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = createServiceClient();

  const [
    { data: authList },
    { data: subs },
    { data: reports },
    { data: clients },
  ] = await Promise.all([
    sb.auth.admin.listUsers({ perPage: 1000 }),
    sb.from("subscriptions").select("plan, status, created_at, trial_ends_at, current_period_end"),
    sb.from("reports").select("created_at, status"),
    sb.from("clients").select("created_at"),
  ]);

  const users = authList?.users ?? [];
  const now = new Date();

  // Plan breakdown
  const planBreakdown = { free: 0, pro: 0, trialing: 0, expired: 0 };
  (subs ?? []).forEach(s => {
    if (s.status === "trialing" && s.trial_ends_at && new Date(s.trial_ends_at) > now) planBreakdown.trialing++;
    else if (s.status === "active" && s.plan === "pro") planBreakdown.pro++;
    else if (s.status === "canceled" || (s.status === "trialing" && s.trial_ends_at && new Date(s.trial_ends_at) <= now)) planBreakdown.expired++;
    else planBreakdown.free++;
  });
  // Users with no subscription row count as free
  planBreakdown.free += users.length - (subs ?? []).length;

  // Signups per day last 30 days
  const signupsPerDay: Record<string, number> = {};
  users.forEach(u => {
    const day = u.created_at.slice(0, 10);
    signupsPerDay[day] = (signupsPerDay[day] ?? 0) + 1;
  });

  // Last 30 days array
  const last30: { date: string; signups: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    last30.push({ date: key, signups: signupsPerDay[key] ?? 0 });
  }

  // Reports per day last 30
  const reportsPerDay: Record<string, number> = {};
  (reports ?? []).forEach(r => {
    const day = r.created_at?.slice(0, 10);
    if (day) reportsPerDay[day] = (reportsPerDay[day] ?? 0) + 1;
  });

  return NextResponse.json({
    totals: {
      users: users.length,
      confirmed: users.filter(u => u.email_confirmed_at).length,
      reports: (reports ?? []).length,
      clients: (clients ?? []).length,
      pro: planBreakdown.pro,
      trialing: planBreakdown.trialing,
    },
    planBreakdown,
    signupsChart: last30,
    reportsChart: last30.map(d => ({ date: d.date, reports: reportsPerDay[d.date] ?? 0 })),
  });
}
