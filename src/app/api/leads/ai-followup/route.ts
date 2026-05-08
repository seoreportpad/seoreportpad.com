import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";
import { getUserClient } from "@/lib/auth";
import { isSupabaseConfigured, createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leadId } = await req.json();
    const service = createServiceClient();

    // Fetch lead and agency data
    const [{ data: lead }, { data: agency }] = await Promise.all([
      service.from("leads").select("*").eq("id", leadId).single(),
      service.from("agency_settings").select("*").eq("user_id", user.id).single(),
    ]);

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const apiKey = agency?.gemini_api_key || process.env.GEMINI_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!apiKey || !resendKey) {
      return NextResponse.json({ error: "API keys (Gemini/Resend) not configured" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Write a professional, high-converting SEO outreach email to a potential client.
    Lead Name: ${lead.name}
    Website: ${lead.website}
    Audit Scores:
    - Performance: ${lead.audit_data?.performance}/100
    - SEO: ${lead.audit_data?.seo}/100
    - Accessibility: ${lead.audit_data?.accessibility}/100
    - Best Practices: ${lead.audit_data?.best_practices}/100
    
    Agency Name: ${agency?.agency_name || "Our Agency"}
    
    The email should:
    1. Be personalized and friendly.
    2. Mention specific weaknesses found in their audit (especially if scores are low).
    3. Offer a free 15-min strategy call to discuss a fix.
    4. Keep it concise (under 150 words).
    5. Subject line should be catchy.
    
    Return as JSON: { "subject": "...", "body": "..." }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const emailData = JSON.parse(jsonStr);

    // Send the email
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: `${agency?.agency_name || "SEO Report Pad"} <onboarding@resend.dev>`,
      to: lead.email,
      subject: emailData.subject,
      html: `<div style="font-family: sans-serif; line-height: 1.6; color: #334155;">
        ${emailData.body.replace(/\n/g, "<br>")}
        <br><br>
        <strong>Best Regards,</strong><br>
        ${user.email}<br>
        ${agency?.agency_name || ""}
      </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("AI Follow-up Error:", e);
    return NextResponse.json({ error: "Failed to send AI follow-up" }, { status: 500 });
  }
}
