"use client";
import { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, Save, X, Search, Globe, Copy, Eye, CheckCircle2, FileText, TrendingUp, Pencil } from "lucide-react";

interface PortalReport { title: string; date: string; summary: string; highlights: string[]; }
interface PortalClient {
  id: string; name: string; website: string; slug: string; package: string;
  start_date: string; access_code: string; welcome_message: string;
  reports: PortalReport[];
  keywords: { keyword: string; position: string; change: string }[];
  created_at: string;
}

const LS_KEY = "seo_client_portal_v1";
function load(): PortalClient[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function persist(d: PortalClient[]) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function makeSlug(n: string) { return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + uid().slice(-4); }
function makeCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

export default function ClientPortalPage() {
  const [clients, setClients] = useState<PortalClient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", website: "", package: "", start_date: "", welcome_message: "" });
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", website: "", package: "", welcome_message: "" });
  const [addingKw, setAddingKw] = useState(false);
  const [kwForm, setKwForm] = useState({ keyword: "", position: "", change: "" });
  const [addingReport, setAddingReport] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", date: new Date().toISOString().slice(0, 10), summary: "", highlights: "" });

  useEffect(() => { setClients(load()); }, []);
  const save = (d: PortalClient[]) => { setClients(d); persist(d); };

  const addClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const c: PortalClient = {
      id: uid(), name: form.name, website: form.website, slug: makeSlug(form.name),
      package: form.package, start_date: form.start_date, access_code: makeCode(),
      welcome_message: form.welcome_message || `Welcome to your SEO portal, ${form.name}!`,
      reports: [], keywords: [], created_at: new Date().toISOString(),
    };
    const updated = [c, ...clients];
    save(updated); setSelected(c.id); setShowForm(false);
    setForm({ name: "", website: "", package: "", start_date: "", welcome_message: "" });
  };

  const updateClient = (id: string) => { save(clients.map(c => c.id !== id ? c : { ...c, ...editForm })); setEditingClient(null); };
  const deleteClient = (id: string) => {
    if (!confirm("Remove portal?")) return;
    save(clients.filter(c => c.id !== id));
    if (selected === id) setSelected(null);
  };
  const addKeyword = (clientId: string) => {
    if (!kwForm.keyword.trim()) return;
    save(clients.map(c => c.id !== clientId ? c : { ...c, keywords: [...c.keywords, { ...kwForm }] }));
    setKwForm({ keyword: "", position: "", change: "" }); setAddingKw(false);
  };
  const removeKeyword = (clientId: string, idx: number) =>
    save(clients.map(c => c.id !== clientId ? c : { ...c, keywords: c.keywords.filter((_, i) => i !== idx) }));
  const addReport = (clientId: string) => {
    if (!reportForm.title.trim()) return;
    const report: PortalReport = { ...reportForm, highlights: reportForm.highlights.split("\n").map(s => s.trim()).filter(Boolean) };
    save(clients.map(c => c.id !== clientId ? c : { ...c, reports: [report, ...c.reports] }));
    setReportForm({ title: "", date: new Date().toISOString().slice(0, 10), summary: "", highlights: "" });
    setAddingReport(false);
  };
  const removeReport = (clientId: string, idx: number) =>
    save(clients.map(c => c.id !== clientId ? c : { ...c, reports: c.reports.filter((_, i) => i !== idx) }));
  const regenerateCode = (id: string) => save(clients.map(c => c.id !== id ? c : { ...c, access_code: makeCode() }));
  const copyLink = (slug: string, code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/portal/${slug}?code=${code}`);
    setCopied(slug); setTimeout(() => setCopied(null), 2000);
  };

  const filtered = useMemo(() => clients.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())), [clients, search]);
  const current = clients.find(c => c.id === selected);
  const ic = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white";
  const lc = "text-xs font-semibold text-slate-600 block mb-1.5";

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Client Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Give each client a private link to view their rankings and reports</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors shadow-sm self-start">
          <Plus size={16} /> Create Portal
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Portals", value: clients.length, color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Total Reports", value: clients.reduce((s, c) => s + c.reports.length, 0), color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Keywords Shared", value: clients.reduce((s, c) => s + c.keywords.length, 0), color: "text-violet-600", bg: "bg-violet-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-5 py-4`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-cyan-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-cyan-50 to-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center gap-2"><Globe size={16} className="text-cyan-600" />Create Client Portal</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"><X size={16} /></button>
          </div>
          <form onSubmit={addClient} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={lc}>Client Name <span className="text-red-500">*</span></label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. ABC Plumbing Dubai" className={ic} /></div>
              <div><label className={lc}>Website</label>
                <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." className={ic} /></div>
              <div><label className={lc}>Package</label>
                <input value={form.package} onChange={e => setForm({ ...form, package: e.target.value })} placeholder="e.g. Local SEO Pro" className={ic} /></div>
              <div><label className={lc}>Start Date</label>
                <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className={ic} /></div>
            </div>
            <div><label className={lc}>Welcome Message</label>
              <textarea value={form.welcome_message} onChange={e => setForm({ ...form, welcome_message: e.target.value })} rows={2}
                placeholder="Hello! Welcome to your SEO dashboard..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none" /></div>
            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-700"><Save size={14} /> Create Portal</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white" />
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Globe size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No portals yet</p>
            </div>
          )}
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSelected(selected === c.id ? null : c.id)}
              className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all ${selected === c.id ? "border-cyan-300 ring-2 ring-cyan-100" : "border-slate-100 hover:border-cyan-200"}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{c.name}</p>
                  {c.website && <p className="text-xs text-slate-400 truncate">{c.website.replace(/^https?:\/\/(www\.)?/, "")}</p>}
                  {c.package && <p className="text-xs text-cyan-600 font-medium mt-0.5">{c.package}</p>}
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => copyLink(c.slug, c.access_code)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${copied === c.slug ? "text-green-600 bg-green-50" : "text-slate-400 hover:text-cyan-600 hover:bg-cyan-50"}`}>
                    {copied === c.slug ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                  </button>
                  <a href={`/portal/${c.slug}?code=${c.access_code}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                    className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"><Eye size={13} /></a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><TrendingUp size={10} />{c.keywords.length} keywords</span>
                <span className="flex items-center gap-1"><FileText size={10} />{c.reports.length} reports</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">{c.access_code}</span>
                <span className="text-xs text-slate-300">access code</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {!current ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <Globe size={40} className="text-slate-200 mb-4" />
              <p className="text-slate-500 font-semibold">Select a portal to manage content</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                {editingClient === current.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                      <input value={editForm.website} onChange={e => setEditForm({ ...editForm, website: e.target.value })} placeholder="Website" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                      <input value={editForm.package} onChange={e => setEditForm({ ...editForm, package: e.target.value })} placeholder="Package" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                      <textarea value={editForm.welcome_message} onChange={e => setEditForm({ ...editForm, welcome_message: e.target.value })} rows={2} placeholder="Welcome message" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none resize-none col-span-2" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateClient(current.id)} className="flex items-center gap-1.5 text-sm bg-cyan-600 text-white px-3 py-1.5 rounded-lg hover:bg-cyan-700"><Save size={12} /> Save</button>
                      <button onClick={() => setEditingClient(null)} className="text-sm border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-800">{current.name}</h2>
                      {current.website && <p className="text-sm text-slate-500">{current.website}</p>}
                      {current.package && <p className="text-xs text-cyan-600 font-semibold mt-1">{current.package}</p>}
                      {current.welcome_message && <p className="text-xs text-slate-500 mt-2 italic">"{current.welcome_message}"</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                          <code className="text-xs text-cyan-700 font-mono">/portal/{current.slug}</code>
                          <button onClick={() => copyLink(current.slug, current.access_code)}
                            className={`p-1 rounded transition-colors ${copied === current.slug ? "text-green-500" : "text-slate-400 hover:text-cyan-600"}`}>
                            {copied === current.slug ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                          <span className="text-xs text-slate-500">Code:</span>
                          <code className="text-xs font-mono font-bold text-slate-700">{current.access_code}</code>
                          <button onClick={() => regenerateCode(current.id)} className="text-xs text-slate-400 hover:text-cyan-600 underline">new</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`/portal/${current.slug}?code=${current.access_code}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50">
                        <Eye size={12} /> Preview
                      </a>
                      <button onClick={() => { setEditingClient(current.id); setEditForm({ name: current.name, website: current.website, package: current.package, welcome_message: current.welcome_message }); }}
                        className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"><Pencil size={14} /></button>
                      <button onClick={() => deleteClient(current.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2"><TrendingUp size={15} className="text-cyan-600" />Keyword Rankings</h3>
                  <button onClick={() => setAddingKw(!addingKw)} className="flex items-center gap-1.5 text-xs text-cyan-600 font-semibold hover:underline"><Plus size={12} /> Add</button>
                </div>
                {addingKw && (
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex gap-2 flex-wrap items-end">
                    <input value={kwForm.keyword} onChange={e => setKwForm({ ...kwForm, keyword: e.target.value })} placeholder="Keyword" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none flex-1 min-w-32" />
                    <input value={kwForm.position} onChange={e => setKwForm({ ...kwForm, position: e.target.value })} placeholder="#pos" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none w-16 text-center" />
                    <input value={kwForm.change} onChange={e => setKwForm({ ...kwForm, change: e.target.value })} placeholder="±" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none w-16 text-center" />
                    <button onClick={() => addKeyword(current.id)} className="text-xs bg-cyan-600 text-white px-3 py-1.5 rounded-lg hover:bg-cyan-700 flex items-center gap-1"><Save size={11} /> Add</button>
                    <button onClick={() => setAddingKw(false)} className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg"><X size={11} /></button>
                  </div>
                )}
                {current.keywords.length === 0 ? <p className="text-center text-slate-300 text-sm py-8">No keywords added yet</p> : (
                  <div className="divide-y divide-slate-50">
                    {current.keywords.map((kw, idx) => (
                      <div key={idx} className="px-5 py-3 flex items-center justify-between group">
                        <p className="text-sm text-slate-700 flex-1">{kw.keyword}</p>
                        <div className="flex items-center gap-3">
                          {kw.position && <span className={`text-sm font-black ${Number(kw.position) <= 3 ? "text-green-600" : Number(kw.position) <= 10 ? "text-blue-600" : "text-slate-500"}`}>#{kw.position}</span>}
                          {kw.change && <span className={`text-xs font-semibold ${kw.change.startsWith("+") ? "text-green-600" : kw.change.startsWith("-") ? "text-red-500" : "text-slate-400"}`}>{kw.change}</span>}
                          <button onClick={() => removeKeyword(current.id, idx)} className="p-1 text-slate-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2"><FileText size={15} className="text-cyan-600" />Monthly Reports</h3>
                  <button onClick={() => setAddingReport(!addingReport)} className="flex items-center gap-1.5 text-xs text-cyan-600 font-semibold hover:underline"><Plus size={12} /> Add</button>
                </div>
                {addingReport && (
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={reportForm.title} onChange={e => setReportForm({ ...reportForm, title: e.target.value })} placeholder="e.g. May 2025 SEO Report" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                      <input type="date" value={reportForm.date} onChange={e => setReportForm({ ...reportForm, date: e.target.value })} className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                    </div>
                    <textarea value={reportForm.summary} onChange={e => setReportForm({ ...reportForm, summary: e.target.value })} rows={2} placeholder="Summary for the client..." className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none resize-none" />
                    <textarea value={reportForm.highlights} onChange={e => setReportForm({ ...reportForm, highlights: e.target.value })} rows={3}
                      placeholder={"Key highlights (one per line)\ne.g. Organic traffic up 22%"} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => addReport(current.id)} className="text-xs bg-cyan-600 text-white px-3 py-1.5 rounded-lg hover:bg-cyan-700 flex items-center gap-1"><Save size={11} /> Add</button>
                      <button onClick={() => setAddingReport(false)} className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg"><X size={11} /></button>
                    </div>
                  </div>
                )}
                {current.reports.length === 0 ? <p className="text-center text-slate-300 text-sm py-8">No reports added yet</p> : (
                  <div className="divide-y divide-slate-50">
                    {current.reports.map((r, idx) => (
                      <div key={idx} className="px-5 py-4 group">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{r.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{r.date ? new Date(r.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" }) : ""}</p>
                            {r.summary && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{r.summary}</p>}
                            {r.highlights?.length > 0 && (
                              <ul className="mt-1.5 space-y-0.5">
                                {r.highlights.map((h, hi) => (
                                  <li key={hi} className="text-xs text-slate-600 flex items-start gap-1.5"><CheckCircle2 size={11} className="text-green-500 shrink-0 mt-0.5" />{h}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <button onClick={() => removeReport(current.id, idx)} className="p-1 text-slate-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all shrink-0"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
