"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Save, X, Search, Download, Link2, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";

const TYPES = ["Guest Post","Web 2.0","Directory","Forum","Social","Press Release","Niche Edit","PBN","Other"];
const STATUSES = [
  { value: "live",    label: "Live",    color: "bg-green-100 text-green-700 border-green-200" },
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "lost",    label: "Lost",    color: "bg-red-100 text-red-700 border-red-200" },
];

interface Backlink {
  id: string; client_id: string; source_url: string; target_url: string;
  anchor_text: string; da?: number; type: string; status: string;
  added_date: string; notes?: string; clients?: { name: string };
}
interface Client { id: string; name: string; }

export default function BacklinksPage() {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClient, setFilterClient] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Backlink>>({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    client_id: "", source_url: "", target_url: "", anchor_text: "",
    da: "", type: "Guest Post", status: "live",
    added_date: new Date().toISOString().slice(0, 10), notes: "",
  });

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filterClient !== "all") p.set("clientId", filterClient);
    fetch(`/api/backlinks?${p}`)
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setBacklinks(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/clients").then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setClients(Array.isArray(d) ? d : []));
  }, []);
  useEffect(() => { load(); }, [filterClient]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await fetch("/api/backlinks", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, da: form.da ? Number(form.da) : null }),
    });
    setSaving(false); setShowForm(false);
    setForm(f => ({ ...f, source_url: "", target_url: "", anchor_text: "", da: "", notes: "" }));
    load();
  };

  const update = async (id: string) => {
    await fetch(`/api/backlinks/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editData, da: editData.da ? Number(editData.da) : null }),
    });
    setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this backlink?")) return;
    await fetch(`/api/backlinks/${id}`, { method: "DELETE" }); load();
  };

  const exportCSV = () => {
    const rows = [["Source URL","Target URL","Anchor","DA","Type","Status","Date Added","Client","Notes"]];
    for (const b of backlinks) rows.push([b.source_url,b.target_url,b.anchor_text,String(b.da??''),b.type,b.status,b.added_date,b.clients?.name??'',b.notes??'']);
    const csv = rows.map(r=>r.map(c=>`"${c.replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `Backlinks-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const filtered = backlinks.filter(b => {
    const ms = filterStatus === "all" || b.status === filterStatus;
    const mt = filterType === "all" || b.type === filterType;
    const mq = !search || b.source_url.toLowerCase().includes(search.toLowerCase()) ||
      b.anchor_text.toLowerCase().includes(search.toLowerCase()) ||
      (b.clients?.name ?? "").toLowerCase().includes(search.toLowerCase());
    return ms && mt && mq;
  });

  const live = backlinks.filter(b => b.status === "live").length;
  const lost = backlinks.filter(b => b.status === "lost").length;
  const avgDA = backlinks.length ? Math.round(backlinks.reduce((s, b) => s + (b.da ?? 0), 0) / backlinks.length) : 0;

  const statusConfig = (s: string) => STATUSES.find(x => x.value === s) ?? STATUSES[0];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Backlink Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Track every backlink you build — source, DA, anchor, status</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <Plus size={16} /> Add Backlink
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Backlinks", value: backlinks.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Live", value: live, color: "text-green-600", bg: "bg-green-50" },
          { label: "Lost", value: lost, color: "text-red-500", bg: "bg-red-50" },
          { label: "Avg DA", value: avgDA || "—", color: "text-violet-600", bg: "bg-violet-50" },
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
            <h2 className="font-bold text-slate-700">Add Backlink</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
          </div>
          <form onSubmit={save} className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Source URL *</label>
                <input required value={form.source_url} onChange={e => setForm({...form, source_url: e.target.value})}
                  placeholder="https://guestblog.com/your-article"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">DA Score</label>
                <input type="number" min="0" max="100" value={form.da} onChange={e => setForm({...form, da: e.target.value})}
                  placeholder="e.g. 35"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Target URL *</label>
                <input required value={form.target_url} onChange={e => setForm({...form, target_url: e.target.value})}
                  placeholder="https://yourclient.com/page"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Anchor Text *</label>
                <input required value={form.anchor_text} onChange={e => setForm({...form, anchor_text: e.target.value})}
                  placeholder="e.g. seo services pakistan"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Client *</label>
                <select required value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- Select --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Date Added</label>
                <input type="date" value={form.added_date} onChange={e => setForm({...form, added_date: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Notes</label>
              <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                placeholder="Any extra notes..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : "Save Backlink"}
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search backlinks..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm w-48" />
        </div>
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white shadow-sm">
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {["all","live","pending","lost"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filterStatus === s ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
              {s === "all" ? `All (${backlinks.length})` : `${s} (${backlinks.filter(b=>b.status===s).length})`}
            </button>
          ))}
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white shadow-sm">
          <option value="all">All Types</option>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Link2 size={36} className="mx-auto text-slate-200 mb-3" />
          <h3 className="text-slate-600 font-bold text-lg mb-2">No backlinks yet</h3>
          <p className="text-slate-400 text-sm mb-6">Start tracking backlinks you build for clients</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Add First Backlink
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {["Source","Anchor","DA","Type","Status","Client","Date",""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(b => {
                  const sc = statusConfig(b.status);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 group transition-colors">
                      {editing === b.id ? (
                        <td colSpan={8} className="p-4">
                          <div className="grid grid-cols-4 gap-3 mb-3">
                            <input value={editData.source_url ?? ""} onChange={e=>setEditData({...editData,source_url:e.target.value})} placeholder="Source URL"
                              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"/>
                            <input value={editData.anchor_text ?? ""} onChange={e=>setEditData({...editData,anchor_text:e.target.value})} placeholder="Anchor"
                              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            <input type="number" value={editData.da ?? ""} onChange={e=>setEditData({...editData,da:Number(e.target.value)})} placeholder="DA"
                              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            <select value={editData.type ?? ""} onChange={e=>setEditData({...editData,type:e.target.value})}
                              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                              {TYPES.map(t=><option key={t}>{t}</option>)}
                            </select>
                            <select value={editData.status ?? ""} onChange={e=>setEditData({...editData,status:e.target.value})}
                              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                              {STATUSES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                            <input value={editData.notes ?? ""} onChange={e=>setEditData({...editData,notes:e.target.value})} placeholder="Notes"
                              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"/>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => update(b.id)}
                              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
                              <Save size={13}/> Save
                            </button>
                            <button onClick={() => setEditing(null)}
                              className="flex items-center gap-1.5 border border-slate-200 px-4 py-2 rounded-xl text-sm hover:bg-slate-50">
                              <X size={13}/> Cancel
                            </button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="px-4 py-3 max-w-[180px]">
                            <a href={b.source_url} target="_blank" rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 truncate text-xs">
                              <ExternalLink size={10} className="shrink-0"/>
                              <span className="truncate">{b.source_url.replace(/^https?:\/\/(www\.)?/,"")}</span>
                            </a>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium max-w-[120px] truncate">{b.anchor_text}</td>
                          <td className="px-4 py-3">
                            {b.da != null ? (
                              <span className={`font-bold text-sm ${b.da >= 50 ? "text-green-600" : b.da >= 30 ? "text-amber-500" : "text-slate-500"}`}>
                                {b.da}
                              </span>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{b.type}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${sc.color}`}>
                              {b.status === "live" ? <CheckCircle2 size={10} className="inline mr-0.5"/> : b.status === "lost" ? <XCircle size={10} className="inline mr-0.5"/> : <Clock size={10} className="inline mr-0.5"/>}
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{b.clients?.name}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{b.added_date}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditing(b.id); setEditData(b); }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Pencil size={13}/>
                              </button>
                              <button onClick={() => del(b.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={13}/>
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
