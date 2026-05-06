import { NextRequest, NextResponse } from "next/server";
import { getUserClient } from "@/lib/auth";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import { Resend } from "resend";

// POST /api/reminders — trigger monthly reminder emails for all clients
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: agencyData } = await sb.from("agency_settings").select("agency_name").eq("user_id", user.id).maybeSingle();
    const agencyName = agencyData?.agency_name ?? "SEO Reports";

    const { data: clients } = await sb.from("clients").select("id, name, email, website").eq("user_id", user.id);
    if (!clients?.length) return NextResponse.json({ sent: 0 });

    if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Resend not configured" }, { status: 503 });
    const resend = new Resend(process.env.RESEND_API_KEY);

    const now = new Date();
    const monthName = now.toLocaleString("default", { month: "long" });
    const year = now.getFullYear();

    let sent = 0;
    for (const client of clients) {
      if (!client.email) continue;
      await resend.emails.send({
        from: `${agencyName} <reports@seoreportpad.com>`,
        to: client.email,
        subject: `Your ${monthName} ${year} SEO Report is Ready`,
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <h2 style="color:#1e293b">Hi ${client.name},</h2>
          <p style="color:#475569">Your <strong>${monthName} ${year}</strong> SEO report for <strong>${client.website}</strong> is ready.</p>
          <p style="color:#475569">Please log in to your client portal to view the full report, including keyword rankings, traffic trends, and completed work this month.</p>
          <p style="margin-top:24px;color:#64748b;font-size:14px">— ${agencyName}</p>
        </div>`,
      });
      sent++;
    }

    return NextResponse.json({ sent });
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

// GET /api/reminders — called by a cron job (vercel cron or similar)
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!isSupabaseConfigured()) return NextResponse.json({ ok: true, sent: 0 });
  try {
    const sb = createServiceClient();
    const { data: users } = await sb.from("subscriptions").select("user_id").in("plan", ["pro", "trialing"]);
    if (!users?.length) return NextResponse.json({ ok: true, sent: 0 });

    if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true, sent: 0 });
    const resend = new Resend(process.env.RESEND_API_KEY);

    const now = new Date();
    const monthName = now.toLocaleString("default", { month: "long" });
    const year = now.getFullYear();
    let totalSent = 0;

    for (const { user_id } of users) {
      const { data: agencyData } = await sb.from("agency_settings").select("agency_name").eq("user_id", user_id).maybeSingle();
      const agencyName = agencyData?.agency_name ?? "SEO Reports";
      const { data: clients } = await sb.from("clients").select("name, email, website").eq("user_id", user_id);
      for (const client of clients ?? []) {
        if (!client.email) continue;
        await resend.emails.send({
          from: `${agencyName} <reports@seoreportpad.com>`,
          to: client.email,
          subject: `Your ${monthName} ${year} SEO Report is Ready`,
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <h2 style="color:#1e293b">Hi ${client.name},</h2>
            <p style="color:#475569">Your <strong>${monthName} ${year}</strong> SEO report for <strong>${client.website}</strong> is ready.</p>
            <p style="color:#64748b;font-size:14px;margin-top:24px">— ${agencyName}</p>
          </div>`,
        });
        totalSent++;
      }
    }

    return NextResponse.json({ ok: true, sent: totalSent });
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
