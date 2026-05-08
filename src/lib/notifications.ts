import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function notifyAgency(lead: any, agencyEmail?: string) {
  try {
    // 1. Email Notification via Resend
    if (agencyEmail) {
      await resend.emails.send({
        from: "SEO Agency <alerts@youragency.com>",
        to: agencyEmail,
        subject: `🔥 New Lead: ${lead.name} (${lead.website})`,
        html: `
          <h1>New Lead Captured!</h1>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Website:</strong> ${lead.website}</p>
          <p><strong>Audit Score:</strong> ${lead.audit_data?.seo || "N/A"}/100</p>
          <br/>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads" style="background:#2563eb; color:white; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:bold;">View Lead in Dashboard</a>
        `
      });
    }

    // 2. Slack Notification (Webhook)
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🔥 *New Lead Captured!*\n*Name:* ${lead.name}\n*Website:* ${lead.website}\n*SEO Score:* ${lead.audit_data?.seo}/100\n<${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads|View Lead>`
        })
      });
    }

    // 3. WhatsApp (using a hypothetical simple webhook or service)
    const waUrl = process.env.WHATSAPP_WEBHOOK_URL;
    if (waUrl) {
      await fetch(waUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `New Lead: ${lead.name} from ${lead.website}. Check dashboard.`
        })
      });
    }
  } catch (e) {
    console.error("Notification Error:", e);
  }
}
