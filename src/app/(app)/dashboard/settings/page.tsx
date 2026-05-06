"use client";
import { useState, useEffect } from "react";
import {
  Save, User, Mail, CheckCircle, ExternalLink, Building2,
  Users, Palette, Bell, Loader2, Trash2, UserPlus,
} from "lucide-react";

interface TeamMember { id: string; member_email: string; role: string; status: string; }

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: "Muhammad Ismail", title: "SEO Specialist" });
  const [agency, setAgency] = useState({ agency_name: "", logo_url: "", primary_color: "#2563eb", from_email: "" });
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [invite, setInvite] = useState({ email: "", role: "editor" });

  const [profileSaved, setProfileSaved] = useState(false);
  const [agencySaved, setAgencySaved] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [agencyLoading, setAgencyLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("seo_settings");
    if (stored) { try { setProfile(JSON.parse(stored)); } catch { /* noop */ } }

    fetch("/api/agency").then(r => r.ok ? r.json() : null).then(d => {
      if (d && d.agency_name !== undefined) setAgency(prev => ({ ...prev, ...d }));
    }).catch(() => {});

    fetch("/api/team").then(r => r.ok ? r.json() : []).then(setTeam).catch(() => {});
  }, []);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("seo_settings", JSON.stringify(profile));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const saveAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgencyLoading(true);
    try {
      await fetch("/api/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agency),
      });
      setAgencySaved(true);
      setTimeout(() => setAgencySaved(false), 2500);
    } finally { setAgencyLoading(false); }
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invite),
      });
      if (res.ok) {
        const member = await res.json();
        setTeam(t => [...t, member]);
        setInvite({ email: "", role: "editor" });
        setInviteSent(true);
        setTimeout(() => setInviteSent(false), 3000);
      }
    } finally { setInviteLoading(false); }
  };

  const removeTeamMember = async (id: string) => {
    await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTeam(t => t.filter(m => m.id !== id));
  };

  const sendReminders = async () => {
    setReminderLoading(true);
    try {
      const res = await fetch("/api/reminders", { method: "POST" });
      const data = await res.json();
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
      alert(`Sent ${data.sent ?? 0} reminder email${data.sent === 1 ? "" : "s"}`);
    } finally { setReminderLoading(false); }
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const sectionHeader = (icon: React.ReactNode, label: string) => (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 bg-slate-50/50">
      {icon}
      <h2 className="font-bold text-slate-700">{label}</h2>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your profile, agency branding, team, and notifications</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* Profile */}
        <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {sectionHeader(<User size={16} className="text-blue-600" />, "Your Profile")}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-5 mb-2">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-sm"
                style={{ background: agency.primary_color || "#2563eb" }}>
                {profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800">{profile.name || "Your Name"}</p>
                <p className="text-sm text-slate-500">{profile.title || "Your Title"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Full Name</label>
                <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Muhammad Ismail" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Title / Role</label>
                <input value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })}
                  placeholder="SEO Specialist" className={inputCls} />
              </div>
            </div>
            <button type="submit"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                profileSaved ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}>
              {profileSaved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save Profile</>}
            </button>
          </div>
        </form>

        {/* Agency / White-label */}
        <form onSubmit={saveAgency} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {sectionHeader(<Building2 size={16} className="text-violet-600" />, "Agency Branding (White-Label)")}
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500">This name and color appear on client reports and email templates.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Agency Name</label>
                <input value={agency.agency_name} onChange={e => setAgency({ ...agency, agency_name: e.target.value })}
                  placeholder="My SEO Agency" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Logo URL (optional)</label>
                <input value={agency.logo_url} onChange={e => setAgency({ ...agency, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Brand Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={agency.primary_color}
                    onChange={e => setAgency({ ...agency, primary_color: e.target.value })}
                    className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer p-1" />
                  <input value={agency.primary_color} onChange={e => setAgency({ ...agency, primary_color: e.target.value })}
                    placeholder="#2563eb" className={`${inputCls} flex-1`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Reply-to Email</label>
                <input value={agency.from_email} onChange={e => setAgency({ ...agency, from_email: e.target.value })}
                  placeholder="hello@myagency.com" type="email" className={inputCls} />
              </div>
            </div>
            {agency.agency_name && (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
                  style={{ background: agency.primary_color || "#2563eb" }}>
                  {agency.agency_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{agency.agency_name}</p>
                  <p className="text-xs text-slate-400">Preview of how your brand appears on reports</p>
                </div>
              </div>
            )}
            <button type="submit" disabled={agencyLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50 ${
                agencySaved ? "bg-green-600 text-white" : "bg-violet-600 text-white hover:bg-violet-700"
              }`}>
              {agencyLoading ? <Loader2 size={15} className="animate-spin" /> : agencySaved ? <CheckCircle size={15} /> : <Palette size={15} />}
              {agencySaved ? "Saved!" : agencyLoading ? "Saving…" : "Save Branding"}
            </button>
          </div>
        </form>

        {/* Team Members */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {sectionHeader(<Users size={16} className="text-teal-600" />, "Team Members")}
          <div className="p-6 space-y-4">
            {team.length > 0 && (
              <div className="divide-y divide-slate-50 mb-2">
                {team.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{m.member_email}</p>
                      <p className="text-xs text-slate-400 capitalize">{m.role} · {m.status === "pending" ? "Invite pending" : "Active"}</p>
                    </div>
                    <button onClick={() => removeTeamMember(m.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={sendInvite} className="flex gap-2">
              <input type="email" required placeholder="colleague@example.com"
                value={invite.email} onChange={e => setInvite({ ...invite, email: e.target.value })}
                className={`${inputCls} flex-1`} />
              <select value={invite.role} onChange={e => setInvite({ ...invite, role: e.target.value })}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button type="submit" disabled={inviteLoading}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  inviteSent ? "bg-green-600 text-white" : "bg-teal-600 hover:bg-teal-700 text-white"
                } disabled:opacity-50`}>
                {inviteLoading ? <Loader2 size={14} className="animate-spin" /> : inviteSent ? <CheckCircle size={14} /> : <UserPlus size={14} />}
                {inviteSent ? "Sent!" : "Invite"}
              </button>
            </form>
            <p className="text-xs text-slate-400">Invited members get an email with a link to join your workspace.</p>
          </div>
        </div>

        {/* Email / Reminders */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {sectionHeader(<Bell size={16} className="text-orange-500" />, "Monthly Email Reminders")}
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600">Send a &quot;report is ready&quot; notification to all clients with an email address on file.</p>
            <div className="flex items-center gap-3">
              <button onClick={sendReminders} disabled={reminderLoading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  reminderSent ? "bg-green-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
                } disabled:opacity-50`}>
                {reminderLoading ? <Loader2 size={15} className="animate-spin" /> : reminderSent ? <CheckCircle size={15} /> : <Mail size={15} />}
                {reminderSent ? "Emails Sent!" : reminderLoading ? "Sending…" : "Send Monthly Reminders"}
              </button>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3">
              <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">Resend is configured</p>
                <p className="text-xs text-green-600">Emails send from <strong>reports@seoreportpad.com</strong> with your agency name.</p>
                <a href="https://resend.com" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline mt-2">
                  Resend Dashboard <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
