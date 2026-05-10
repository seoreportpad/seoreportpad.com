"use client";
import { useEffect, useState } from "react";
import {
  Plus, Trash2, Pencil, Save, X, Search, Globe,
  TrendingUp, Target, Download, BarChart3, Star,
  Users, FileText, ChevronRight, AlertCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Competitor {
  id: string; client_id: string; name: string; website: string;
  da?: number; keywords?: number; notes?: string; created_at: string;
  clients?: { name: string };
  // extended fields
  monthly_traffic?: number;
  backlinks?: number;
  top_pages?: string;
  serp_features?: string[];
}
interface Client { id: string; name: string; }

const SERP_FEATURES = ["Featured Snippet","Local Pack","Knowledge Panel","Image Pack","Video","People Also Ask","Shopping","Sitelinks"];

// Competitor extended meta in localStorage
const COMP_META_KEY = "seo_comp_meta";
interface CompMeta { monthly_traffic?: number; backlinks?: number; top_pages?: string; serp_features?: string[]; }
function getCompMeta(): Record<string,CompMeta> { try { return JSON.parse(localStorage.getItem(COMP_META_KEY)||"{}"); } catch { return {}; } }
function saveCompMeta(d: Record<string,CompMeta>) { localStorage.setItem(COMP_META_KEY, JSON.stringify(d)); }

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClient, setFilterClient] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Competitor>>({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ client_id: "", name: "", website: "", da: "", keywords: "", notes: "" });
  const [compMeta, setCompMeta] = useState<Record<string,CompMeta>>({});
  const [metaModal, setMetaModal] = useState<Competitor|null>(null);
  const [metaForm, setMetaForm] = useState<CompMeta>({});
  const [activeTab, setActiveTab] = useState<"cards"|"scorecard">("cards");
  const [selectedClient, setSelectedClient] = useState<string>("all");

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filterClient !== "all") p.set("clientId", filterClient);
    fetch(`/api/competitors?${p}`)
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => {
        if (!Array.isArray(d)) { setCompetitors([]); return; }
        const meta = getCompMeta();
        setCompetitors(d.map((c: Competitor) => ({ ...c, ...(meta[c.id]??{}) })));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/clients").then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setClients(Array.isArray(d) ? d : []));
    setCompMeta(getCompMeta());
  }, []);
  useEffect(() => { load(); }, [filterClient]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await fetch("/api/competitors", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, da: form.da ? Number(form.da) : null, keywords: form.keywords ? Number(form.keywords) : null }),
    });
    setSaving(false); setShowForm(false);
    setForm(f => ({ ...f, name: "", website: "", da: "", keywords: "", notes: "" }));
    load();
  };

  const update = async (id: string) => {
    await fetch(`/api/competitors/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editData, da: editData.da ? Number(editData.da) : null, keywords: editData.keywords ? Number(editData.keywords) : null }),
    });
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this competitor?")) return;
    await fetch(`/api/competitors/${id}`, { method: "DELETE" }); load();
  };

  const openMeta = (c: Competitor) => {
    setMetaModal(c);
    setMetaForm(compMeta[c.id] ?? {});
  };

  const saveMeta = () => {
    if (!metaModal) return;
    const meta = getCompMeta();
    meta[metaModal.id] = metaForm;
    saveCompMeta(meta);
    setCompMeta({...meta});
    setMetaModal(null);
    load();
  };

  const exportCSV = () => {
    const rows = [["Competitor","Website","Client","DA","Keywords","Traffic","Backlinks","Notes"]];
    for (const c of competitors) {
      const meta = compMeta[c.id] ?? {};
      rows.push([c.name,c.website,c.clients?.name??'',String(c.da??''),String(c.keywords??''),String(meta.monthly_traffic??''),String(meta.backlinks??''),c.notes??'']);
    }
    const csv = rows.map(r=>r.map(c=>`"${c.replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = `Competitors-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const filtered = competitors.filter(c => {
    const mq = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.website.toLowerCase().includes(search.toLowerCase());
    return mq;
  });

  // Group by client for scorecard
  const clientIds = [...new Set(filtered.map(c => c.client_id))];
  const scorecardClient = selectedClient !== "all" ? selectedClient : clientIds[0];
  const scorecardComps = filtered.filter(c => c.client_id === scorecardClient);

  // Build comparison bar chart data
  const scorecardData = scorecardComps.map(c => ({
    name: c.name,
    DA: c.da ?? 0,
    Keywords: c.keywords ?? 0,
    Traffic: (compMeta[c.id]?.monthly_traffic ?? 0),
    Backlinks: (compMeta[c.id]?.backlinks ?? 0),
  }));

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Competitor Analysis</h1>
          <p className="text-slate-500 text-sm mt-1">Track competitor websites per client</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm">
            <Download size={15}/> Export CSV
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <Plus size={16} /> Add Competitor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Total Competitors", value: competitors.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Clients Tracked", value: new Set(competitors.map(c=>c.client_id)).size, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Avg DA", value: competitors.length ? Math.round(competitors.reduce((s,c)=>s+(c.da??0),0)/competitors.length)||"—" : "—", color: "text-teal-600", bg: "bg-teal-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-5 py-4`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm mb-5 w-fit">
        {(["cards","scorecard"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${activeTab===tab?"bg-slate-800 text-white":"text-slate-500 hover:bg-slate-50"}`}>
            {tab === "scorecard" ? "Scorecard" : "Competitor Cards"}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6 animate-fade-in">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700">Add Competitor</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
          </div>
          <form onSubmit={save} className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Client *</label>
                <select required value={form.client_id} onChange={e => setForm({...form,client_id:e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- Select --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Competitor Name *</label>
                <input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="e.g. Competitor Co."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Website *</label>
                <input required value={form.website} onChange={e => setForm({...form,website:e.target.value})} placeholder="https://competitor.com"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Domain Authority</label>
                <input type="number" min="0" max="100" value={form.da} onChange={e => setForm({...form,da:e.target.value})} placeholder="e.g. 42"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Ranking Keywords</label>
                <input type="number" value={form.keywords} onChange={e => setForm({...form,keywords:e.target.value})} placeholder="e.g. 850"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Notes / Strategy</label>
              <textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} rows={3}
                placeholder="e.g. Strong in local SEO, targeting same keywords, weak on backlinks..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : "Save Competitor"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search competitors..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm w-48" />
        </div>
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white shadow-sm">
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* === CARDS TAB === */}
      {activeTab === "cards" && (
        <>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i=><div key={i} className="h-40 bg-white rounded-2xl border border-slate-100 animate-pulse"/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Target size={36} className="mx-auto text-slate-200 mb-3"/>
              <h3 className="text-slate-600 font-bold text-lg mb-2">No competitors tracked</h3>
              <p className="text-slate-400 text-sm mb-6">Add competitor websites to monitor and strategize against</p>
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                <Plus size={15}/> Add Competitor
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(comp => {
                const meta = compMeta[comp.id] ?? {};
                return (
                  <div key={comp.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    {editing === comp.id ? (
                      <div className="p-5 space-y-3">
                        <input value={editData.name??""} onChange={e=>setEditData({...editData,name:e.target.value})} placeholder="Name"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        <input value={editData.website??""} onChange={e=>setEditData({...editData,website:e.target.value})} placeholder="Website"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" value={editData.da??""} onChange={e=>setEditData({...editData,da:Number(e.target.value)})} placeholder="DA"
                            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                          <input type="number" value={editData.keywords??""} onChange={e=>setEditData({...editData,keywords:Number(e.target.value)})} placeholder="Keywords"
                            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <textarea value={editData.notes??""} onChange={e=>setEditData({...editData,notes:e.target.value})} rows={2} placeholder="Notes"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
                        <div className="flex gap-2">
                          <button onClick={() => update(comp.id)} className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
                            <Save size={13}/> Save
                          </button>
                          <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 border border-slate-200 px-4 py-2 rounded-xl text-sm hover:bg-slate-50">
                            <X size={13}/> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 truncate">{comp.name}</h3>
                            {comp.clients?.name && <p className="text-xs text-slate-400 mt-0.5">vs {comp.clients.name}</p>}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                            <button onClick={() => openMeta(comp)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg" title="Add traffic/backlink data">
                              <BarChart3 size={13}/>
                            </button>
                            <button onClick={() => { setEditing(comp.id); setEditData(comp); }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={13}/></button>
                            <button onClick={() => del(comp.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
                          </div>
                        </div>
                        <a href={comp.website} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline truncate mb-3">
                          <Globe size={11} className="shrink-0"/> {comp.website.replace(/^https?:\/\/(www\.)?/,"")}
                        </a>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {comp.da != null && (
                            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                              <p className={`text-xl font-black ${comp.da >= 50?"text-green-600":comp.da>=30?"text-amber-500":"text-slate-500"}`}>{comp.da}</p>
                              <p className="text-xs text-slate-400">DA</p>
                            </div>
                          )}
                          {comp.keywords != null && (
                            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                              <p className="text-xl font-black text-blue-600">{comp.keywords.toLocaleString()}</p>
                              <p className="text-xs text-slate-400">Keywords</p>
                            </div>
                          )}
                          {meta.monthly_traffic != null && (
                            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                              <p className="text-xl font-black text-violet-600">{meta.monthly_traffic.toLocaleString()}</p>
                              <p className="text-xs text-slate-400">Traffic/mo</p>
                            </div>
                          )}
                          {meta.backlinks != null && (
                            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                              <p className="text-xl font-black text-teal-600">{meta.backlinks.toLocaleString()}</p>
                              <p className="text-xs text-slate-400">Backlinks</p>
                            </div>
                          )}
                        </div>

                        {/* SERP features */}
                        {(meta.serp_features?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {meta.serp_features!.map(f => (
                              <span key={f} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-semibold">{f}</span>
                            ))}
                          </div>
                        )}

                        {/* Top pages */}
                        {meta.top_pages && (
                          <div className="bg-blue-50 rounded-xl p-2.5 mb-3">
                            <p className="text-xs font-semibold text-blue-700 mb-1">Top Pages</p>
                            <p className="text-xs text-blue-600 line-clamp-2">{meta.top_pages}</p>
                          </div>
                        )}

                        {comp.notes && (
                          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-xl p-3 line-clamp-3">{comp.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* === SCORECARD TAB === */}
      {activeTab === "scorecard" && (
        <div>
          {clientIds.length > 1 && (
            <div className="mb-5 flex gap-2 items-center">
              <span className="text-sm font-semibold text-slate-600">Client:</span>
              <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                {clientIds.map(cid => {
                  const clientName = clients.find(c=>c.id===cid)?.name ?? cid;
                  return (
                    <button key={cid} onClick={() => setSelectedClient(cid)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedClient===cid?"bg-slate-800 text-white":"text-slate-500 hover:bg-slate-50"}`}>
                      {clientName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {scorecardComps.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <BarChart3 size={36} className="mx-auto text-slate-200 mb-3"/>
              <p className="text-slate-400 font-medium">Add competitors to see scorecard</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Scorecard table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50">
                  <h2 className="font-bold text-slate-700">Side-by-Side Comparison</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 w-48">Metric</th>
                        {scorecardComps.map(c => (
                          <th key={c.id} className="px-5 py-3 text-center text-xs font-semibold text-slate-700">{c.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { label: "Website", key: "website" as const, format: (v:unknown) => v ? <a href={v as string} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">{(v as string).replace(/^https?:\/\/(www\.)?/,"")}</a> : "—" },
                        { label: "Domain Authority", key: "da" as const, format: (v:unknown) => v!=null ? <span className={`font-black text-base ${Number(v)>=50?"text-green-600":Number(v)>=30?"text-amber-500":"text-slate-500"}`}>{v as number}</span> : "—" },
                        { label: "Ranking Keywords", key: "keywords" as const, format: (v:unknown) => v ? <span className="font-bold text-blue-600">{Number(v).toLocaleString()}</span> : "—" },
                        { label: "Monthly Traffic", key: "_traffic" as const, format: (v:unknown, cid:string) => { const t = compMeta[cid]?.monthly_traffic; return t ? <span className="font-bold text-violet-600">{t.toLocaleString()}</span> : "—"; } },
                        { label: "Backlinks", key: "_backlinks" as const, format: (v:unknown, cid:string) => { const b = compMeta[cid]?.backlinks; return b ? <span className="font-bold text-teal-600">{b.toLocaleString()}</span> : "—"; } },
                        { label: "SERP Features", key: "_serp" as const, format: (v:unknown, cid:string) => { const sf = compMeta[cid]?.serp_features; return sf?.length ? <div className="flex flex-wrap gap-1 justify-center">{sf.map(f=><span key={f} className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">{f}</span>)}</div> : "—"; } },
                      ].map(row => (
                        <tr key={row.label} className="hover:bg-slate-50/30">
                          <td className="px-5 py-3 text-xs font-semibold text-slate-600">{row.label}</td>
                          {scorecardComps.map(c => (
                            <td key={c.id} className="px-5 py-3 text-center text-sm">
                              {row.format((c as unknown as Record<string,unknown>)[row.key], c.id)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comparison charts */}
              {scorecardData.length > 0 && (
                <div className="grid md:grid-cols-2 gap-5">
                  {[
                    { key: "DA", label: "Domain Authority", color: "#3b82f6" },
                    { key: "Keywords", label: "Ranking Keywords", color: "#8b5cf6" },
                  ].map(({ key, label, color }) => (
                    <div key={key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <h3 className="font-bold text-slate-700 mb-4 text-sm">{label} Comparison</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={scorecardData} margin={{top:5,right:10,left:-20,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                          <XAxis dataKey="name" tick={{fontSize:11,fill:"#94a3b8"}} tickLine={false} axisLine={false}/>
                          <YAxis tick={{fontSize:11,fill:"#94a3b8"}} tickLine={false} axisLine={false}/>
                          <Tooltip contentStyle={{borderRadius:"12px",border:"1px solid #e2e8f0",fontSize:"12px"}}/>
                          <Bar dataKey={key} fill={color} radius={[4,4,0,0]}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Meta Modal */}
      {metaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800">Extra Data — {metaModal.name}</h3>
              <button onClick={()=>setMetaModal(null)} className="text-slate-400 hover:text-slate-700"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Monthly Traffic (est.)</label>
                  <input type="number" value={metaForm.monthly_traffic??""} onChange={e=>setMetaForm({...metaForm,monthly_traffic:Number(e.target.value)})}
                    placeholder="e.g. 5000"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Backlinks (est.)</label>
                  <input type="number" value={metaForm.backlinks??""} onChange={e=>setMetaForm({...metaForm,backlinks:Number(e.target.value)})}
                    placeholder="e.g. 1200"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Top Pages (URLs or titles, one per line)</label>
                <textarea rows={3} value={metaForm.top_pages??""} onChange={e=>setMetaForm({...metaForm,top_pages:e.target.value})}
                  placeholder="/best-seo-tips&#10;/local-seo-guide"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-2">SERP Features they own</label>
                <div className="flex flex-wrap gap-2">
                  {SERP_FEATURES.map(f => (
                    <label key={f} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox"
                        checked={(metaForm.serp_features??[]).includes(f)}
                        onChange={e => {
                          const curr = metaForm.serp_features ?? [];
                          setMetaForm({...metaForm, serp_features: e.target.checked ? [...curr,f] : curr.filter(x=>x!==f)});
                        }}
                        className="w-3.5 h-3.5 rounded"/>
                      <span className="text-xs text-slate-700">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setMetaModal(null)} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={saveMeta} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700">Save Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
