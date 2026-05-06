"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Save, X, Search, Globe, TrendingUp, Target } from "lucide-react";

interface Competitor {
  id: string; client_id: string; name: string; website: string;
  da?: number; keywords?: number; notes?: string; created_at: string;
  clients?: { name: string };
}
interface Client { id: string; name: string; }

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

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filterClient !== "all") p.set("clientId", filterClient);
    fetch(`/api/competitors?${p}`)
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setCompetitors(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/clients").then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setClients(Array.isArray(d) ? d : []));
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

  const filtered = competitors.filter(c => {
    const mq = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.website.toLowerCase().includes(search.toLowerCase());
    return mq;
  });

  const clientCompetitorMap = new Map<string, Competitor[]>();
  for (const c of filtered) {
    const key = c.client_id;
    if (!clientCompetitorMap.has(key)) clientCompetitorMap.set(key, []);
    clientCompetitorMap.get(key)!.push(c);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Competitor Analysis</h1>
          <p className="text-slate-500 text-sm mt-1">Track competitor websites per client</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <Plus size={16} /> Add Competitor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
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

      {/* Cards grouped by client */}
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
          {filtered.map(comp => (
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
                  <div className="flex gap-4 mb-3">
                    {comp.da != null && (
                      <div className="text-center">
                        <p className={`text-xl font-black ${comp.da >= 50?"text-green-600":comp.da>=30?"text-amber-500":"text-slate-500"}`}>{comp.da}</p>
                        <p className="text-xs text-slate-400">DA</p>
                      </div>
                    )}
                    {comp.keywords != null && (
                      <div className="text-center">
                        <p className="text-xl font-black text-blue-600">{comp.keywords.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">Keywords</p>
                      </div>
                    )}
                  </div>
                  {comp.notes && (
                    <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-xl p-3 line-clamp-3">{comp.notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
