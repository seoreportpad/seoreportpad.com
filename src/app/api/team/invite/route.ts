import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getUserClient } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, role } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const service = createServiceClient();

    // 1. Check if agency exists
    const { data: agency } = await service.from("agency_settings").select("*").eq("user_id", user.id).single();
    if (!agency) return NextResponse.json({ error: "Agency not configured" }, { status: 400 });

    // 2. Insert into team_members (with pending status)
    const { data: member, error: insertError } = await service.from("team_members").insert({
      agency_id: agency.id,
      member_email: email,
      role: role || "editor",
      status: "pending",
      invited_by: user.id
    }).select().single();

    if (insertError) throw insertError;

    // 3. Send invitation email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: `${agency.agency_name || "SEO Report Pad"} <onboarding@resend.dev>`,
        to: email,
        subject: `Invite: Join ${agency.agency_name || "the SEO agency"} workspace`,
        html: `<div style="font-family: sans-serif; padding: 40px; color: #1e293b;">
          <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 20px;">You're Invited!</h1>
          <p style="font-size: 16px; line-height: 1.6;">
            <strong>${user.email}</strong> has invited you to join their agency workspace on <strong>SEO Report Pad</strong> as a <strong>${role}</strong>.
          </p>
          <div style="margin-top: 30px;">
            <a href="${req.nextUrl.origin}/signup?invite=${member.id}" 
               style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; text-decoration: none;">
               Accept Invitation
            </a>
          </div>
          <p style="font-size: 12px; color: #64748b; margin-top: 40px;">
            If you didn't expect this, you can safely ignore this email.
          </p>
        </div>`
      });
    }

    return NextResponse.json(member);
  } catch (e: any) {
    console.error("Invite Error:", e);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}
