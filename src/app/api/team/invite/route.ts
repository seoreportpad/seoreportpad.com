import { NextRequest, NextResponse } from "next/server";
import { getUserClient } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Resend } from "resend";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, role } = await req.json();
    if (!email || !role) return NextResponse.json({ error: "email and role required" }, { status: 400 });

    const token = randomUUID();
    const { data, error } = await sb.from("team_members").insert({
      owner_id: user.id,
      member_email: email,
      role,
      status: "pending",
      invite_token: token,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const origin = req.headers.get("origin") ?? "https://seoreportpad.com";
      await resend.emails.send({
        from: "SEO Reports <reports@seoreportpad.com>",
        to: email,
        subject: "You've been invited to join an SEO workspace",
        html: `<p>You've been invited to join an SEO Reports workspace as <strong>${role}</strong>.</p>
          <p><a href="${origin}/invite/accept?token=${token}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:12px">Accept Invite</a></p>`,
      });
    }

    return NextResponse.json(data);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
