"use client";
import { useState, useEffect } from "react";
import { Save, User, Mail, Info, CheckCircle, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const [form, setForm] = useState({ name: "Muhammad Ismail", title: "SEO Specialist" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("seo_settings");
    if (stored) { try { setForm(JSON.parse(stored)); } catch { /* noop */ } }
  }, []);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("seo_settings", JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your profile and email preferences</p>
      </div>

      <form onSubmit={save} className="max-w-2xl space-y-5">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 bg-slate-50/50">
            <User size={16} className="text-blue-600" />
            <h2 className="font-bold text-slate-700">Your Profile</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-sm">
                {form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800">{form.name || "Your Name"}</p>
                <p className="text-sm text-slate-500">{form.title || "Your Title"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Muhammad Ismail"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Title / Role</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="SEO Specialist"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Email via Resend */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 bg-slate-50/50">
            <Mail size={16} className="text-blue-600" />
            <h2 className="font-bold text-slate-700">Email Settings</h2>
          </div>
          <div className="p-6">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3">
              <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">Resend is configured</p>
                <p className="text-xs text-green-600">Emails send from <strong>reports@seoreportpad.com</strong> automatically. No setup needed.</p>
                <a href="https://resend.com" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline mt-2">
                  Resend Dashboard <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 bg-slate-50/50">
            <Info size={16} className="text-blue-600" />
            <h2 className="font-bold text-slate-700">Database (Supabase)</h2>
          </div>
          <div className="p-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-600 space-y-2">
              <p className="text-slate-400 font-sans font-semibold text-xs mb-3">Add to .env.local in project root:</p>
              <p><span className="text-blue-600">NEXT_PUBLIC_SUPABASE_URL</span>=https://xxxx.supabase.co</p>
              <p><span className="text-blue-600">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>=eyJhbGci...</p>
            </div>
            <a href="https://supabase.com" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline mt-3">
              Get free Supabase account <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <button type="submit"
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
            saved ? "bg-green-600 text-white shadow-green-200" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
          }`}>
          {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </form>
    </div>
  );
}
