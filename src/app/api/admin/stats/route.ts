import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const now = new Date();

  // Last 30 days array helper
  const last30dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });

  if (!serviceKey) {
    // Limited stats without service role — use anon client for public table data
    const token = req.cookies.get("admin-access-token")?.value;
    const sb = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const [{ data: reports }, { data: clients }, { data: subs }] = await Promise.all([
      sb.from("reports").select("created_at"),
      sb.from("clients").select("created_at"),
      sb.from("subscriptions").select("plan, status, created_at, trial_ends_at"),
    ]);

    const planBreakdown = { free: 0, pro: 0, trialing: 0, expired: 0 };
    (subs ?? []).forEach((s: any) => {
      if (s.status === "trialing" && s.trial_ends_at && new Date(s.trial_ends_at) > now) planBreakdown.trialing++;
      else if (s.status === "active" && s.plan === "pro") planBreakdown.pro++;
      else if (s.status === "canceled" || (s.status === "trialing" && new Date(s.trial_ends_at) <= now)) planBreakdown.expired++;
      else planBreakdown.free++;
    });

    const reportsPerDay: Record<string, number> = {};
    (reports ?? []).forEach((r: any) => {
      const day = r.created_at?.slice(0, 10);
      if (day) reportsPerDay[day] = (reportsPerDay[day] ?? 0) + 1;
    });

    return NextResponse.json({
      totals: {
        users: 1, // can't list all without service key
        confirmed: 1,
        reports: (reports ?? []).length,
        clients: (clients ?? []).length,
        pro: planBreakdown.pro,
        trialing: planBreakdown.trialing,
      },
      planBreakdown,
      signupsChart: last30dates.map(d => ({ date: d, signups: 0 })),
      reportsChart: last30dates.map(d => ({ date: d, reports: reportsPerDay[d] ?? 0 })),
      _note: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local for full user stats",
    });
  }

  // Full stats with service role key
  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

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
  const planBreakdown = { free: 0, pro: 0, trialing: 0, expired: 0 };
  (subs ?? []).forEach((s: any) => {
    if (s.status === "trialing" && s.trial_ends_at && new Date(s.trial_ends_at) > now) planBreakdown.trialing++;
    else if (s.status === "active" && s.plan === "pro") planBreakdown.pro++;
    else if (s.status === "canceled" || (s.status === "trialing" && new Date(s.trial_ends_at) <= now)) planBreakdown.expired++;
    else planBreakdown.free++;
  });
  planBreakdown.free += users.length - (subs ?? []).length;

  const signupsPerDay: Record<string, number> = {};
  users.forEach(u => {
    const day = u.created_at.slice(0, 10);
    signupsPerDay[day] = (signupsPerDay[day] ?? 0) + 1;
  });

  const reportsPerDay: Record<string, number> = {};
  (reports ?? []).forEach((r: any) => {
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
    signupsChart: last30dates.map(d => ({ date: d, signups: signupsPerDay[d] ?? 0 })),
    reportsChart: last30dates.map(d => ({ date: d, reports: reportsPerDay[d] ?? 0 })),
  });
}
