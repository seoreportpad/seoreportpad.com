"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Globe, Pencil, Trash2, Save, X,
  ExternalLink, FileText, BarChart3, CheckCircle2,
  PauseCircle, XCircle, Layout, ChevronRight,
} from "lucide-react";

interface Website {
  id: string;
  client_id: string;
  url: string;
  name: string;
  niche: string;
  platform: string;
  notes: string;
  status: "active" | "paused" | "cancelled";
  created_at: string;
  report_count?: number;
}

interface Client {
  id: string;
  name: string;
  website: string;
}

const PLATFORMS = ["WordPress", "Shopify", "Wix", "Squarespace", "Webflow", "Custom", "Other"];
const NICHES = ["E-commerce", "Local Business", "SaaS", "Blog", "Healthcare", "Real Estate", "Education", "Restaurant", "Agency", "Other"];

const STATUS_CFG = {
  active:    { label: "Active",    icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-200" },
  paused:    { label: "Paused",    icon: PauseCircle,  color: "text-amber-600 bg-amber-50 border-amber-200" },
  cancelled: { label: "Cancelled", icon: XCircle,      color: "text-red-500 bg-red-50 border-red-200" },
};

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const labelCls = "text-xs font-semibold text-slate-600 block mb-1.5";

const emptyForm = (): Omit<Website, "id" | "client_id" | "created_at"> => ({
  url: "", name: "", niche: "", platform: "WordPress", notes: "", status: "active",
});

export default function ClientWebsitesPage() {
  const { id: clientId } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Website>>({});
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const safe = (url: string) => fetch(url).then(r => r.ok ? r.json() : null).catch(() => null);
    Promise.all([
      safe(`/api/clients/${clientId}`),
      safe(`/api/websites?clientId=${clientId}`),
      safe(`/api/reports?clientId=${clientId}`),
    ]).then(([c, w, r]) => {
      if (c && !c.error) setClient(c);
      const sites: Website[] = Array.isArray(w) ? w : [];
      setWebsites(sites);
      // Count reports per website
      if (Array.isArray(r)) {
        const counts: Record<string, number> = {};
        for (const report of r) {
          if (report.website_id) counts[report.website_id] = (counts[report.website_id] || 0) + 1;
        }
        setReportCounts(counts);
      }
      setLoading(false);
    });
  }, [clientId]);

  const addWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url.trim()) return;
    setSaving(true);
    const res = await fetch("/api/websites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, client_id: clientId }),
    });
    const data = await res.json();
    if (res.ok) {
      setWebsites(prev => [...prev, data]);
      setForm(emptyForm());
      setShowForm(false);
    }
    setSaving(false);
  };

  const updateWebsite = async (id: string) => {
    const res = await fetch(`/api/websites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    const data = await res.json();
    if (res.ok) setWebsites(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
    setEditing(null);
  };

  const deleteWebsite = async (id: string) => {
    if (!confirm("Delete this website? All its reports will lose the website link (reports are kept).")) return;
    await fetch(`/api/websites/${id}`, { method: "DELETE" });
    setWebsites(prev => prev.filter(w => w.id !== id));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft size={16} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-0.5">
            <Link href="/dashboard/clients" className="hover:text-blue-600">Clients</Link>
            <ChevronRight size={12} />
            <Link href={`/dashboard/clients/${clientId}`} className="hover:text-blue-600">{client?.name}</Link>
            <ChevronRight size={12} />
            <span className="text-slate-600">Websites</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">Websites</h1>
          <p className="text-slate-500 text-sm mt-0.5">{client?.name} — {websites.length} website{websites.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setShowForm(true); setForm(emptyForm()); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <Plus size={15} /> Add Website
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-blue-50 to-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center gap-2"><Globe size={15} className="text-blue-600" /> New Website</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={15} /></button>
          </div>
          <form onSubmit={addWebsite} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Website URL <span className="text-red-500">*</span></label>
                <input required value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="https://example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Website Name / Label</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Main Site, Blog, E-commerce" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Platform</label>
                <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className={inputCls}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Niche</label>
                <select value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })} className={inputCls}>
                  <option value="">Select niche...</option>
                  {NICHES.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Website["status"] })} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Migrating to new host in June" className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                <Save size={14} /> {saving ? "Saving..." : "Save Website"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Website list */}
      {websites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Globe size={40} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-slate-600 font-bold text-lg mb-2">No websites yet</h3>
          <p className="text-slate-400 text-sm mb-6">Add websites for {client?.name} to track reports per site</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
            <Plus size={15} /> Add First Website
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {websites.map(w => {
            const st = STATUS_CFG[w.status] ?? STATUS_CFG.active;
            const StIcon = st.icon;
            const rCount = reportCounts[w.id] ?? 0;
            return (
              <div key={w.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                {editing === w.id ? (
                  <div className="p-4 space-y-3">
                    <input value={editData.url ?? ""} onChange={e => setEditData({ ...editData, url: e.target.value })}
                      placeholder="URL" className={inputCls} />
                    <input value={editData.name ?? ""} onChange={e => setEditData({ ...editData, name: e.target.value })}
                      placeholder="Label" className={inputCls} />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={editData.platform ?? "WordPress"} onChange={e => setEditData({ ...editData, platform: e.target.value })} className={inputCls}>
                        {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                      </select>
                      <select value={editData.status ?? "active"} onChange={e => setEditData({ ...editData, status: e.target.value as Website["status"] })} className={inputCls}>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <input value={editData.notes ?? ""} onChange={e => setEditData({ ...editData, notes: e.target.value })}
                      placeholder="Notes" className={inputCls} />
                    <div className="flex gap-2">
                      <button onClick={() => updateWebsite(w.id)} className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">
                        <Save size={13} /> Save
                      </button>
                      <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 text-sm border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Globe size={18} className="text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{w.name || "Website"}</p>
                            <a href={w.url} target="_blank" rel="noreferrer"
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1 truncate">
                              {w.url.replace(/^https?:\/\//, "")} <ExternalLink size={9} />
                            </a>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0 ${st.color}`}>
                          <StIcon size={10} /> {st.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        {w.platform && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Layout size={10} /> {w.platform}
                          </span>
                        )}
                        {w.niche && (
                          <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">{w.niche}</span>
                        )}
                      </div>

                      {w.notes && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{w.notes}</p>}

                      <div className="flex items-center gap-4 pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <FileText size={12} className="text-slate-400" />
                          <span><span className="font-bold text-slate-700">{rCount}</span> reports</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pb-4 flex items-center gap-2">
                      <Link href={`/dashboard/reports?clientId=${clientId}&websiteId=${w.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 rounded-xl transition-colors">
                        <BarChart3 size={12} /> View Reports
                      </Link>
                      <Link href={`/dashboard/reports/new?clientId=${clientId}&websiteId=${w.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 py-2 rounded-xl transition-colors">
                        <Plus size={12} /> New Report
                      </Link>
                      <button onClick={() => { setEditing(w.id); setEditData({ ...w }); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deleteWebsite(w.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
