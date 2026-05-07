"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Crown, Clock, CheckCircle2, XCircle,
  Globe, Mail, Calendar, FileText, Users,
  Loader2, Save, Trash2, Ban, AlertTriangle,
} from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface SubData { plan: string; status: string; trial_ends_at?: string; current_period_end?: string; stripe_customer_id?: string; stripe_subscription_id?: string; }
interface AgencyData { agency_name?: string; logo_url?: string; primary_color?: string; from_email?: string; }
interface Client { id: string; name: string; website: string; }
interface Report { id: string; month: string; year: number; status: string; created_at: string; }
interface UserDetail {
  user: { id: string; email: string; created_at: string; last_sign_in_at?: string; email_confirmed_at?: string; banned_until?: string; };
  subscription: SubData | null;
  agency: AgencyData | null;
  clients: Client[];
  reports: Report[];
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"ban" | "delete" | null>(null);

  const [subForm, setSubForm] = useState({
    plan: "free",
    status: "active",
    trial_ends_at: "",
    note: "",
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${id}`);
    if (res.status === 401) { router.push("/admin/login"); return; }
    const d = await res.json();
    setData(d);
    if (d.subscription) {
      setSubForm({
        plan: d.subscription.plan ?? "free",
        status: d.subscription.status ?? "active",
        trial_ends_at: d.subscription.trial_ends_at ? d.subscription.trial_ends_at.slice(0, 10) : "",
        note: "",
      });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const saveSubscription = async () => {
    setSaving(true);
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...subForm,
        trial_ends_at: subForm.trial_ends_at ? new Date(subForm.trial_ends_at).toISOString() : null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    load();
  };

  const doAction = async (action: "ban" | "delete") => {
    await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setConfirmAction(null);
    if (action === "delete") router.push("/admin/dashboard");
    else load();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={28} className="animate-spin text-slate-500" />
    </div>
  );
  if (!data?.user) return <div className="text-slate-500 py-16 text-center">User not found</div>;

  const u = data.user;
  const sub = data.subscription;
  const agency = data.agency;
  const isBanned = u.banned_until && new Date(u.banned_until) > new Date();

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to Users
      </Link>

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xl font-black text-white shrink-0">
              {u.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-black text-white">{u.email}</h1>
                {u.email_confirmed_at
                  ? <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full"><CheckCircle2 size={11} /> Confirmed</span>
                  : <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full"><XCircle size={11} /> Not Confirmed</span>}
                {isBanned && <span className="flex items-center gap-1 text-xs text-red-400 bg-red-900/30 px-2 py-0.5 rounded-full"><Ban size={11} /> Banned</span>}
                {agency?.agency_name && <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full">{agency.agency_name}</span>}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ID: <span className="font-mono text-slate-400">{u.id}</span>
              </p>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar size={11} /> Joined {new Date(u.created_at).toLocaleDateString()}</span>
                {u.last_sign_in_at && <span className="flex items-center gap-1"><Clock size={11} /> Last login {new Date(u.last_sign_in_at).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setConfirmAction("ban")}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-900/30 hover:bg-amber-900/50 text-amber-400 rounded-xl border border-amber-800/40 transition-colors">
              <Ban size={13} /> {isBanned ? "Unban" : "Ban"}
            </button>
            <button onClick={() => setConfirmAction("delete")}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-xl border border-red-800/40 transition-colors">
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>

        {/* Agency branding */}
        {agency && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3">
            {agency.agency_name && <div><p className="text-xs text-slate-600 mb-0.5">Agency</p><p className="text-sm text-white font-medium">{agency.agency_name}</p></div>}
            {agency.from_email && <div><p className="text-xs text-slate-600 mb-0.5">From Email</p><p className="text-sm text-slate-300">{agency.from_email}</p></div>}
            {agency.primary_color && <div><p className="text-xs text-slate-600 mb-0.5">Brand Color</p><div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full border border-slate-700" style={{ background: agency.primary_color }} /><span className="text-sm text-slate-300">{agency.primary_color}</span></div></div>}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Subscription editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Crown size={16} className="text-amber-400" /> Subscription
          </h2>

          {/* Current status */}
          {sub && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Plan</p>
                <p className="text-sm font-bold text-white capitalize">{sub.plan ?? "Free"}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <p className={`text-sm font-bold capitalize ${sub.status === "active" ? "text-green-400" : sub.status === "trialing" ? "text-amber-400" : "text-red-400"}`}>{sub.status}</p>
              </div>
              {sub.trial_ends_at && (
                <div className="bg-slate-800 rounded-xl p-3 col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Trial Ends</p>
                  <p className={`text-sm font-bold ${new Date(sub.trial_ends_at) < new Date() ? "text-red-400" : "text-amber-400"}`}>
                    {new Date(sub.trial_ends_at).toLocaleDateString()}
                    {new Date(sub.trial_ends_at) < new Date() ? " (expired)" : ""}
                  </p>
                </div>
              )}
              {sub.stripe_customer_id && (
                <div className="bg-slate-800 rounded-xl p-3 col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Stripe Customer</p>
                  <p className="text-xs font-mono text-slate-400">{sub.stripe_customer_id}</p>
                </div>
              )}
            </div>
          )}

          {/* Editor */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Plan</label>
              <select value={subForm.plan} onChange={e => setSubForm({ ...subForm, plan: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Status</label>
              <select value={subForm.status} onChange={e => setSubForm({ ...subForm, status: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="canceled">Canceled</option>
                <option value="past_due">Past Due</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Trial ends at</label>
              <input type="date" value={subForm.trial_ends_at} onChange={e => setSubForm({ ...subForm, trial_ends_at: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Admin note (optional)</label>
              <input placeholder="e.g. Upgraded manually for free" value={subForm.note}
                onChange={e => setSubForm({ ...subForm, note: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <button onClick={saveSubscription} disabled={saving}
              className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${saved ? "bg-green-600 text-white" : "bg-red-600 hover:bg-red-500 text-white"} disabled:opacity-50`}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Subscription</>}
            </button>
          </div>
        </div>

        {/* Clients & Reports */}
        <div className="space-y-5">
          {/* Clients */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="font-bold text-white mb-3 flex items-center gap-2">
              <Users size={15} className="text-blue-400" /> Clients ({data.clients.length})
            </h2>
            {data.clients.length === 0 ? (
              <p className="text-slate-600 text-sm">No clients yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.clients.map(c => (
                  <div key={c.id} className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2">
                    <Globe size={13} className="text-slate-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{c.name}</p>
                      <p className="text-xs text-slate-500 truncate">{c.website}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reports */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="font-bold text-white mb-3 flex items-center gap-2">
              <FileText size={15} className="text-violet-400" /> Reports ({data.reports.length})
            </h2>
            {data.reports.length === 0 ? (
              <p className="text-slate-600 text-sm">No reports yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.reports.map(r => (
                  <div key={r.id} className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{r.month} {r.year}</p>
                      <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.status === "sent" ? "bg-green-900/40 text-green-400" : r.status === "ready" ? "bg-blue-900/40 text-blue-400" : "bg-slate-700 text-slate-400"}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-900/40 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h3 className="font-bold text-white capitalize">{confirmAction} User?</h3>
            </div>
            <p className="text-slate-400 text-sm mb-5">
              {confirmAction === "delete"
                ? "This will permanently delete the user and all their data. This cannot be undone."
                : "This will ban the user from logging in. You can unban them later."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => doAction(confirmAction)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">
                Confirm {confirmAction}
              </button>
              <button onClick={() => setConfirmAction(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
