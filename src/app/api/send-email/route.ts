import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getUserClient } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { to, subject, html, reportId } = body;

  if (!to || !subject || !html) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Load agency branding if Supabase is configured
  let agencyName = "SEO Reports";
  let agencyColor = "#2563eb";
  let agencyFrom = "reports@seoreportpad.com";

  if (isSupabaseConfigured()) {
    try {
      const sb = getUserClient(req);
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data: agency } = await sb.from("agency_settings").select("agency_name, primary_color, from_email").eq("user_id", user.id).maybeSingle();
        if (agency) {
          if (agency.agency_name) agencyName = agency.agency_name;
          if (agency.primary_color) agencyColor = agency.primary_color;
          if (agency.from_email) agencyFrom = agency.from_email;
        }
      }
    } catch { /* use defaults */ }
  }

  // Wrap in branded shell if html doesn't already have full doc structure
  const branded = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif">
<div style="max-width:680px;margin:0 auto;padding:24px 16px">
  <!-- Header -->
  <div style="background:${agencyColor};border-radius:16px 16px 0 0;padding:28px 32px;display:flex;align-items:center;justify-content:space-between">
    <div>
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:0.05em;text-transform:uppercase">Monthly SEO Report</p>
      <p style="margin:4px 0 0;color:#fff;font-size:22px;font-weight:900">${agencyName}</p>
    </div>
  </div>
  <!-- Body -->
  <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:0">
    ${html}
    <!-- Footer -->
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center">
      <p style="margin:0;color:#94a3b8;font-size:12px">Sent by <strong>${agencyName}</strong> · Powered by SEO Report Manager</p>
      ${agencyFrom !== "reports@seoreportpad.com" ? `<p style="margin:4px 0 0;color:#94a3b8;font-size:11px">Reply to: ${agencyFrom}</p>` : ""}
    </div>
  </div>
</div>
</body></html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const sendParams: Parameters<typeof resend.emails.send>[0] = {
      from: `${agencyName} <reports@seoreportpad.com>`,
      to,
      subject,
      html: branded,
    };
    if (agencyFrom && agencyFrom !== "reports@seoreportpad.com") {
      sendParams.replyTo = agencyFrom;
    }

    const { error } = await resend.emails.send(sendParams);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Mark report as sent if reportId provided
    if (reportId && isSupabaseConfigured()) {
      try {
        const sb = getUserClient(req);
        await sb.from("reports").update({ status: "sent" }).eq("id", reportId);
      } catch { /* non-critical */ }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
