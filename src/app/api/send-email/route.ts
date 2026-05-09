import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getAuthenticatedUser } from "@/lib/auth";
import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase";

function replaceVars(text: string, vars: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (_, key) => vars[key] || `{${key}}`);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  let { to, subject, html, reportId, month, year, clientName } = body;

  if (!to || (!subject && !html)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Load agency branding if Supabase is configured
  let agencyName = "SEO Reports";
  let agencyColor = "#2563eb";
  let agencyFrom = "reports@seoreportpad.com";
  let templateSubject = "";
  let templateBody = "";

  if (isSupabaseConfigured()) {
    try {
      const auth = await getAuthenticatedUser(req);
      const sb = createServiceClient();
      if (auth.user) {
        const { data: agency } = await sb.from("agency_settings")
          .select("agency_name, primary_color, from_email, email_subject, email_body")
          .eq("user_id", auth.user.id)
          .maybeSingle();

        if (agency) {
          if (agency.agency_name) agencyName = agency.agency_name;
          if (agency.primary_color) agencyColor = agency.primary_color;
          if (agency.from_email) agencyFrom = agency.from_email;
          templateSubject = agency.email_subject || "";
          templateBody = agency.email_body || "";
        }

        if (reportId && (!month || !year || !clientName)) {
          const { data: report } = await sb.from("reports")
            .select("month, year, clients(name)")
            .eq("id", reportId)
            .single();
          if (report) {
            month = month || report.month;
            year = year || report.year;
            clientName = clientName || (report.clients as unknown as Record<string, unknown>)?.name;
          }
        }
      }
    } catch { /* use defaults */ }
  }

  const vars = { month: month || "", year: String(year || ""), client_name: clientName || "Valued Client" };

  // Use template if available
  if (templateSubject) {
    subject = replaceVars(templateSubject, vars);
  }
  if (templateBody) {
    const bodyText = replaceVars(templateBody, vars);
    // Convert newlines to <br> for HTML
    html = `<div style="white-space: pre-wrap; color: #334155; font-size: 16px; line-height: 1.6;">${bodyText}</div>`;
  }

  // Final branded shell
  const branded = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif">
<div style="max-width:680px;margin:0 auto;padding:24px 16px">
  <div style="background:${agencyColor};border-radius:16px 16px 0 0;padding:28px 32px;display:flex;align-items:center;justify-content:space-between">
    <div>
      <p style="margin:0;color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:0.05em;text-transform:uppercase">Monthly SEO Report</p>
      <p style="margin:4px 0 0;color:#fff;font-size:22px;font-weight:900">${agencyName}</p>
    </div>
  </div>
  <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:0">
    ${html}
    <div style="margin-top:40px; text-align:center;">
       <a href="https://seoreportpad.com/portal/${reportId}" style="background:${agencyColor}; color:white; padding:12px 24px; border-radius:12px; text-decoration:none; font-weight:bold; display:inline-block;">View Full Interactive Report</a>
    </div>
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center">
      <p style="margin:0;color:#94a3b8;font-size:12px">Sent by <strong>${agencyName}</strong> · Powered by SEO Report Manager</p>
      ${agencyFrom !== "reports@seoreportpad.com" ? `<p style="margin:4px 0 0;color:#94a3b8;font-size:11px">Reply to: ${agencyFrom}</p>` : ""}
    </div>
  </div>
</div>
</body></html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const sendParams: any = {
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

    if (reportId && isSupabaseConfigured()) {
      try {
        await createServiceClient().from("reports").update({ status: "sent" }).eq("id", reportId);
      } catch { /* non-critical */ }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
