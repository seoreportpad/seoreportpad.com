"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Plus, Trash2, Pencil, Save, X, Search, Download,
  Link2, CheckCircle2, XCircle, Clock, ExternalLink,
  BarChart3, PieChart, Users, AlertTriangle, Mail,
  CheckSquare, Square, TrendingUp, Globe,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend,
} from "recharts";

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

// Outreach tracker stored in localStorage
const OUTREACH_KEY = "seo_outreach";
interface OutreachItem { id: string; site: string; contact?: string; status: "contacted"|"replied"|"published"|"rejected"; date: string; notes?: string; client_id?: string; }
function getOutreach(): OutreachItem[] { try { return JSON.parse(localStorage.getItem(OUTREACH_KEY)||"[]"); } catch { return []; } }
function saveOutreach(d: OutreachItem[]) { localStorage.setItem(OUTREACH_KEY, JSON.stringify(d)); }
function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2); }

const ANCHOR_COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4"];
const PIE_COLORS = ["#22c55e","#f59e0b","#ef4444"];
const OUTREACH_STATUS_CONFIG: Record<string,string> = {
  contacted: "bg-blue-100 text-blue-700",
  replied: "bg-amber-100 text-amber-700",
  published: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"backlinks"|"outreach"|"charts">("backlinks");
  const [form, setForm] = useState({
    client_id: "", source_url: "", target_url: "", anchor_text: "",
    da: "", type: "Guest Post", status: "live",
    added_date: new Date().toISOString().slice(0, 10), notes: "",
  });
  const [outreach, setOutreach] = useState<OutreachItem[]>([]);
  const [outreachForm, setOutreachForm] = useState({ site:"", contact:"", status:"contacted" as OutreachItem["status"], date:new Date().toISOString().slice(0,10), notes:"", client_id:"" });
  const [showOutreachForm, setShowOutreachForm] = useState(false);

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
    setOutreach(getOutreach());
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

  const bulkUpdateStatus = async (status: string) => {
    setBulkLoading(true);
    await Promise.all([...selected].map(id =>
      fetch(`/api/backlinks/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    ));
    setSelected(new Set()); setBulkLoading(false); load();
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
  const pending = backlinks.filter(b => b.status === "pending").length;
  const avgDA = backlinks.length ? Math.round(backlinks.reduce((s, b) => s + (b.da ?? 0), 0) / backlinks.length) : 0;

  const statusConfig = (s: string) => STATUSES.find(x => x.value === s) ?? STATUSES[0];
  const allSelected = filtered.length > 0 && filtered.every(b => selected.has(b.id));

  // Charts data
  const anchorData = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of backlinks) {
      const anchor = b.anchor_text?.toLowerCase();
      let category = "Other";
      if (!anchor || anchor === b.clients?.name?.toLowerCase()) category = "Branded";
      else if (/^https?:\/\//i.test(anchor)) category = "Naked URL";
      else if (anchor.length < 20) category = "Keyword";
      else category = "Generic";
      map.set(category, (map.get(category)??0)+1);
    }
    return Array.from(map.entries()).map(([name,value]) => ({name, value}));
  }, [backlinks]);

  const typeData = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of backlinks) map.set(b.type, (map.get(b.type)??0)+1);
    return Array.from(map.entries()).map(([name,value]) => ({name, value})).sort((a,b)=>b.value-a.value).slice(0,6);
  }, [backlinks]);

  const topDomains = useMemo(() => {
    const map = new Map<string, {count:number;avgDA:number;totalDA:number}>();
    for (const b of backlinks) {
      try {
        const domain = new URL(b.source_url).hostname.replace(/^www\./,"");
        const existing = map.get(domain) ?? {count:0,avgDA:0,totalDA:0};
        map.set(domain, {count:existing.count+1, totalDA:existing.totalDA+(b.da??0), avgDA:0});
      } catch {}
    }
    return Array.from(map.entries())
      .map(([domain,d]) => ({domain, count:d.count, avgDA:d.count?Math.round(d.totalDA/d.count):0}))
      .sort((a,b)=>b.count-a.count).slice(0,8);
  }, [backlinks]);

  const monthlyData = useMemo(() => {
    const map = new Map<string,number>();
    for (const b of backlinks) {
      if (b.added_date) {
        const key = b.added_date.slice(0,7);
        map.set(key, (map.get(key)??0)+1);
      }
    }
    return Array.from(map.entries()).sort(([a],[b])=>a.localeCompare(b)).slice(-8).map(([k,v])=>({month:k,count:v}));
  }, [backlinks]);

  const addOutreach = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [{ ...outreachForm, id: uid() }, ...outreach];
    setOutreach(updated); saveOutreach(updated);
    setShowOutreachForm(false);
    setOutreachForm(f => ({...f, site:"", contact:"", notes:""}));
  };

  const delOutreach = (id: string) => {
    const updated = outreach.filter(o => o.id !== id);
    setOutreach(updated); saveOutreach(updated);
  };

  const updateOutreachStatus = (id: string, status: OutreachItem["status"]) => {
    const updated = outreach.map(o => o.id===id?{...o,status}:o);
    setOutreach(updated); saveOutreach(updated);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
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

      {/* Lost links alert */}
      {lost > 0 && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={15} className="text-red-500 shrink-0"/>
          <p className="text-sm font-semibold text-red-800">{lost} backlink{lost!==1?"s":""} lost — check and reclaim</p>
          <button onClick={() => setFilterStatus("lost")} className="ml-auto text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-xl hover:bg-red-200">View Lost</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm mb-5 w-fit">
        {(["backlinks","charts","outreach"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${activeTab===tab?"bg-slate-800 text-white":"text-slate-500 hover:bg-slate-50"}`}>
            {tab === "charts" ? "Charts & Stats" : tab.charAt(0).toUpperCase()+tab.slice(1)}
          </button>
        ))}
      </div>

      {/* === BACKLINKS TAB === */}
      {activeTab === "backlinks" && (
        <>
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
          <div className="flex flex-wrap gap-3 mb-4">
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

          {/* Bulk bar */}
          {selected.size > 0 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
              <span className="text-sm font-bold text-blue-800">{selected.size} selected</span>
              {STATUSES.map(s => (
                <button key={s.value} onClick={() => bulkUpdateStatus(s.value)} disabled={bulkLoading}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold border disabled:opacity-50 ${s.color}`}>
                  Mark {s.label}
                </button>
              ))}
              <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-blue-600 hover:underline font-semibold">Deselect all</button>
            </div>
          )}

          {/* Select all */}
          {filtered.length > 0 && (
            <div className="flex items-center gap-3 mb-2 px-1">
              <button onClick={() => { if(allSelected) setSelected(new Set()); else setSelected(new Set(filtered.map(b=>b.id))); }}
                className="text-slate-400 hover:text-slate-700">
                {allSelected ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16}/>}
              </button>
              <span className="text-xs text-slate-400 font-semibold">{filtered.length} backlinks shown</span>
            </div>
          )}

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
                      <th className="px-4 py-3 w-8"></th>
                      {["Source","Anchor","DA","Type","Status","Client","Date",""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map(b => {
                      const sc = statusConfig(b.status);
                      const isSelected = selected.has(b.id);
                      return (
                        <tr key={b.id} className={`hover:bg-slate-50/60 group transition-colors ${isSelected?"bg-blue-50/40":""}`}>
                          {editing === b.id ? (
                            <td colSpan={9} className="p-4">
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
                                <button onClick={() => update(b.id)} className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"><Save size={13}/> Save</button>
                                <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 border border-slate-200 px-4 py-2 rounded-xl text-sm hover:bg-slate-50"><X size={13}/> Cancel</button>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="px-3 py-3">
                                <button onClick={() => setSelected(prev => { const s=new Set(prev); if(s.has(b.id))s.delete(b.id);else s.add(b.id); return s; })}
                                  className="text-slate-300 hover:text-blue-600">
                                  {isSelected?<CheckSquare size={14} className="text-blue-600"/>:<Square size={14}/>}
                                </button>
                              </td>
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
                                  <span className={`font-bold text-sm ${b.da >= 50 ? "text-green-600" : b.da >= 30 ? "text-amber-500" : "text-slate-500"}`}>{b.da}</span>
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
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={13}/></button>
                                  <button onClick={() => del(b.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
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
        </>
      )}

      {/* === CHARTS TAB === */}
      {activeTab === "charts" && (
        <div className="space-y-5">
          {/* Monthly backlink count */}
          {monthlyData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-blue-600"/>
                <h2 className="font-bold text-slate-700">Backlinks Added per Month</h2>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize:11, fill:"#94a3b8" }} tickLine={false} axisLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false}/>
                  <Tooltip contentStyle={{ borderRadius:"12px", border:"1px solid #e2e8f0", fontSize:"12px" }} formatter={(v)=>[v,"Links"]}/>
                  <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            {/* Anchor text distribution */}
            {anchorData.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart size={16} className="text-violet-600"/>
                  <h2 className="font-bold text-slate-700">Anchor Text Distribution</h2>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <RPieChart>
                    <Pie data={anchorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({name,percent})=>`${name} ${((percent??0)*100).toFixed(0)}%`} labelLine={false}>
                      {anchorData.map((_, idx) => <Cell key={idx} fill={ANCHOR_COLORS[idx%ANCHOR_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius:"12px", border:"1px solid #e2e8f0", fontSize:"12px" }}/>
                  </RPieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top referring domains */}
            {topDomains.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={16} className="text-teal-600"/>
                  <h2 className="font-bold text-slate-700">Top Referring Domains</h2>
                </div>
                <div className="space-y-2">
                  {topDomains.map((d, i) => (
                    <div key={d.domain} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-4 shrink-0">#{i+1}</span>
                      <p className="text-xs font-semibold text-slate-700 flex-1 truncate">{d.domain}</p>
                      <span className="text-xs text-slate-500">{d.count} link{d.count!==1?"s":""}</span>
                      {d.avgDA > 0 && (
                        <span className={`text-xs font-bold ${d.avgDA>=50?"text-green-600":d.avgDA>=30?"text-amber-500":"text-slate-500"}`}>DA {d.avgDA}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Type breakdown */}
          {typeData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-orange-500"/>
                <h2 className="font-bold text-slate-700">Backlinks by Type</h2>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={typeData} margin={{ top:5, right:10, left:-20, bottom:0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                  <XAxis type="number" tick={{ fontSize:11, fill:"#94a3b8" }} tickLine={false} axisLine={false}/>
                  <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:"#94a3b8" }} tickLine={false} axisLine={false} width={80}/>
                  <Tooltip contentStyle={{ borderRadius:"12px", border:"1px solid #e2e8f0", fontSize:"12px" }} formatter={(v)=>[v,"Links"]}/>
                  <Bar dataKey="value" fill="#f59e0b" radius={[0,4,4,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Status breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-700 mb-4">Status Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              {[{label:"Live",value:live,color:"text-green-600",bg:"bg-green-50"},{label:"Pending",value:pending,color:"text-amber-600",bg:"bg-amber-50"},{label:"Lost",value:lost,color:"text-red-600",bg:"bg-red-50"}].map(s=>(
                <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.label==="Live"?"bg-green-500":s.label==="Pending"?"bg-amber-500":"bg-red-500"}`}
                      style={{width:`${backlinks.length?Math.round(s.value/backlinks.length*100):0}%`}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === OUTREACH TAB === */}
      {activeTab === "outreach" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-700">Outreach Tracker</h2>
              <p className="text-slate-400 text-sm mt-0.5">Track sites you've contacted for backlinks</p>
            </div>
            <button onClick={() => setShowOutreachForm(v=>!v)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-200">
              <Plus size={15}/> Add Outreach
            </button>
          </div>

          {/* Outreach stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {(["contacted","replied","published","rejected"] as const).map(s => {
              const count = outreach.filter(o => o.status===s).length;
              const colors: Record<string,string> = { contacted:"bg-blue-50 text-blue-700", replied:"bg-amber-50 text-amber-700", published:"bg-green-50 text-green-700", rejected:"bg-red-50 text-red-700" };
              return (
                <div key={s} className={`${colors[s]} rounded-2xl px-4 py-3 text-center`}>
                  <p className="text-xl font-black">{count}</p>
                  <p className="text-xs font-semibold capitalize mt-0.5">{s}</p>
                </div>
              );
            })}
          </div>

          {showOutreachForm && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5 animate-fade-in">
              <form onSubmit={addOutreach}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Site / Domain *</label>
                    <input required value={outreachForm.site} onChange={e=>setOutreachForm({...outreachForm,site:e.target.value})} placeholder="https://site.com"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Contact Email</label>
                    <input value={outreachForm.contact} onChange={e=>setOutreachForm({...outreachForm,contact:e.target.value})} placeholder="editor@site.com"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Status</label>
                    <select value={outreachForm.status} onChange={e=>setOutreachForm({...outreachForm,status:e.target.value as OutreachItem["status"]})}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="contacted">Contacted</option>
                      <option value="replied">Replied</option>
                      <option value="published">Published</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Date</label>
                    <input type="date" value={outreachForm.date} onChange={e=>setOutreachForm({...outreachForm,date:e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Client</label>
                    <select value={outreachForm.client_id} onChange={e=>setOutreachForm({...outreachForm,client_id:e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">-- Select --</option>
                      {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Notes</label>
                    <input value={outreachForm.notes} onChange={e=>setOutreachForm({...outreachForm,notes:e.target.value})} placeholder="Follow-up notes..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">Save</button>
                  <button type="button" onClick={()=>setShowOutreachForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {outreach.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Mail size={32} className="mx-auto text-slate-200 mb-3"/>
              <p className="text-slate-400 font-medium">No outreach tracked yet</p>
              <p className="text-slate-300 text-sm mt-1">Add sites you've contacted for guest posts or links</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {["Site","Contact","Client","Status","Date","Notes",""].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {outreach.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/50 group">
                      <td className="px-4 py-3 max-w-[160px]">
                        <a href={o.site} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1 truncate">
                          <ExternalLink size={10}/><span className="truncate">{o.site.replace(/^https?:\/\/(www\.)?/,"")}</span>
                        </a>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{o.contact||"—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{clients.find(c=>c.id===o.client_id)?.name||"—"}</td>
                      <td className="px-4 py-3">
                        <select value={o.status} onChange={e=>updateOutreachStatus(o.id, e.target.value as OutreachItem["status"])}
                          className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${OUTREACH_STATUS_CONFIG[o.status]}`}>
                          <option value="contacted">Contacted</option>
                          <option value="replied">Replied</option>
                          <option value="published">Published</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{o.date}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[150px] truncate">{o.notes||"—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={()=>delOutreach(o.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={13}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
