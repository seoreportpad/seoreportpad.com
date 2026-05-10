"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  Plus, Trash2, Pencil, Save, X, Search, Link2,
  ExternalLink, Filter, ChevronDown, ChevronUp, Download,
  CheckCircle2, Clock, XCircle, Mail, Globe, Upload,
  BarChart3, CheckSquare, Square, Star, RefreshCw,
  TrendingUp, AlertTriangle, Copy,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

interface LinkProspect {
  id: string;
  domain: string;
  target_page: string;
  da: string;
  dr: string;
  type: string;
  status: "prospect" | "outreached" | "negotiating" | "acquired" | "rejected";
  contact_email: string;
  anchor_text: string;
  notes: string;
  client: string;
  price: string;
  priority: "high" | "medium" | "low";
  follow_up_date: string;
  date_outreached: string;
  date_acquired: string;
  created_at: string;
}

const TYPES = ["Guest Post", "Niche Edit", "Resource Link", "Directory", "Sponsor", "PR / News", "Forum / Community", "Other"];

const STATUSES = [
  { value: "prospect",    label: "Prospect",    color: "text-slate-600 bg-slate-100 border-slate-200",   icon: Globe },
  { value: "outreached",  label: "Outreached",  color: "text-blue-600 bg-blue-50 border-blue-200",       icon: Mail },
  { value: "negotiating", label: "Negotiating", color: "text-amber-600 bg-amber-50 border-amber-200",    icon: Clock },
  { value: "acquired",    label: "Acquired",    color: "text-green-600 bg-green-50 border-green-200",    icon: CheckCircle2 },
  { value: "rejected",    label: "Rejected",    color: "text-red-500 bg-red-50 border-red-200",          icon: XCircle },
];

const PRIORITIES = [
  { value: "high",   label: "High",   color: "text-red-600 bg-red-50 border-red-200" },
  { value: "medium", label: "Medium", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "low",    label: "Low",    color: "text-slate-500 bg-slate-100 border-slate-200" },
];

const PIPELINE_COLORS = ["#94a3b8", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

const LS_KEY = "seo_link_building_v1";
function load(): LinkProspect[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function persist(d: LinkProspect[]) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function today() { return new Date().toISOString().slice(0, 10); }

const stCfg = (v: string) => STATUSES.find(s => s.value === v) ?? STATUSES[0];
const priCfg = (v: string) => PRIORITIES.find(p => p.value === v) ?? PRIORITIES[1];

const emptyForm = (): Omit<LinkProspect, "id" | "created_at"> => ({
  domain: "", target_page: "", da: "", dr: "", type: "Guest Post", status: "prospect",
  contact_email: "", anchor_text: "", notes: "", client: "", price: "",
  priority: "medium", follow_up_date: "", date_outreached: "", date_acquired: "",
});

export default function LinkBuildingPage() {
  const [prospects, setProspects] = useState<LinkProspect[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<LinkProspect>>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterClient, setFilterClient] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"table" | "pipeline" | "charts">("table");
  const [importModal, setImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [emailTemplate, setEmailTemplate] = useState<LinkProspect | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setProspects(load()); }, []);

  const save = (d: LinkProspect[]) => { setProspects(d); persist(d); };

  const addProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.domain.trim()) return;
    save([{ ...form, id: uid(), created_at: new Date().toISOString() }, ...prospects]);
    setForm(emptyForm());
    setShowForm(false);
  };

  const updateProspect = (id: string) => {
    save(prospects.map(p => p.id === id ? { ...p, ...editData } : p));
    setEditing(null);
  };

  const deleteProspect = (id: string) => {
    if (!confirm("Remove this prospect?")) return;
    save(prospects.filter(p => p.id !== id));
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const bulkDelete = () => {
    if (!confirm(`Delete ${selected.size} prospect(s)?`)) return;
    save(prospects.filter(p => !selected.has(p.id)));
    setSelected(new Set());
  };

  const bulkStatus = (status: LinkProspect["status"]) => {
    save(prospects.map(p => selected.has(p.id) ? { ...p, status } : p));
    setSelected(new Set());
  };

  const importCSV = () => {
    const lines = importText.trim().split("\n").filter(Boolean);
    if (!lines.length) return;
    const start = lines[0].toLowerCase().includes("domain") ? 1 : 0;
    const newOnes: LinkProspect[] = [];
    for (const line of lines.slice(start)) {
      const c = line.split(",").map(x => x.replace(/^"|"$/g, "").trim());
      if (!c[0]) continue;
      newOnes.push({ ...emptyForm(), id: uid(), created_at: new Date().toISOString(), domain: c[0], client: c[1] || "", da: c[2] || "", type: c[3] || "Guest Post", contact_email: c[4] || "", notes: c[5] || "" });
    }
    save([...newOnes, ...prospects]);
    setImportText(""); setImportModal(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImportText(String(ev.target?.result || ""));
    reader.readAsText(file);
  };

  const exportCSV = () => {
    const rows = [["Domain", "Client", "DA", "DR", "Type", "Priority", "Status", "Anchor Text", "Contact", "Price", "Follow-Up", "Date Outreached", "Date Acquired", "Notes"]];
    for (const p of filtered) rows.push([p.domain, p.client, p.da, p.dr, p.type, p.priority, p.status, p.anchor_text, p.contact_email, p.price, p.follow_up_date, p.date_outreached, p.date_acquired, p.notes]);
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `link-building-${today()}.csv`;
    a.click();
  };

  const generateEmailTemplate = (p: LinkProspect) => {
    const subj = `Guest Post / Link Collaboration — ${p.domain}`;
    const body = `Hi,\n\nI came across ${p.domain} and noticed it would be a great fit for a collaboration.\n\nI'm working with a client in your niche and would love to explore a ${p.type.toLowerCase()} opportunity. The target page is: ${p.target_page || "[URL]"}\n\nWould you be open to discussing this?\n\nBest regards`;
    return { subj, body };
  };

  const allClients = useMemo(() => [...new Set(prospects.map(p => p.client).filter(Boolean))], [prospects]);

  const filtered = useMemo(() => prospects.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.domain.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.anchor_text.toLowerCase().includes(q))
      && (filterStatus === "all" || p.status === filterStatus)
      && (filterType === "all" || p.type === filterType)
      && (filterClient === "all" || p.client === filterClient)
      && (filterPriority === "all" || p.priority === filterPriority);
  }), [prospects, search, filterStatus, filterType, filterClient, filterPriority]);

  // Follow-up reminders
  const dueTodayFollowUps = prospects.filter(p => p.follow_up_date && p.follow_up_date <= today() && p.status !== "acquired" && p.status !== "rejected");

  // Stats
  const acquired = prospects.filter(p => p.status === "acquired").length;
  const outreached = prospects.filter(p => p.status === "outreached").length;
  const negotiating = prospects.filter(p => p.status === "negotiating").length;
  const conversionRate = outreached + acquired > 0 ? Math.round((acquired / (outreached + acquired)) * 100) : 0;
  const totalSpend = prospects.filter(p => p.status === "acquired" && p.price).reduce((s, p) => s + (parseFloat(p.price) || 0), 0);

  // Chart data
  const pipelineChartData = STATUSES.map(st => ({ name: st.label, value: prospects.filter(p => p.status === st.value).length }));
  const typeChartData = TYPES.map(t => ({ name: t, value: prospects.filter(p => p.type === t).length })).filter(x => x.value > 0);
  const clientChartData = allClients.map(c => ({ name: c, acquired: prospects.filter(p => p.client === c && p.status === "acquired").length, total: prospects.filter(p => p.client === c).length }));

  const allFilteredSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id));

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white";
  const labelCls = "text-xs font-semibold text-slate-600 block mb-1.5";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Link Building Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Track outreach prospects, negotiations, and acquired backlinks</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setImportModal(true)}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm">
            <Upload size={14} /> Import
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm">
            <Download size={14} /> Export
          </button>
          <button onClick={() => { setShowForm(true); setForm(emptyForm()); }}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200">
            <Plus size={16} /> Add Prospect
          </button>
        </div>
      </div>

      {/* Follow-up alert */}
      {dueTodayFollowUps.length > 0 && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Follow-up due today ({dueTodayFollowUps.length})</p>
            <p className="text-xs text-amber-600 mt-0.5">{dueTodayFollowUps.map(p => p.domain).join(" · ")}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
        {[
          { label: "Total Prospects", value: prospects.length,      color: "text-slate-700",  bg: "bg-slate-50" },
          { label: "Outreached",      value: outreached,            color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Negotiating",     value: negotiating,           color: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Links Acquired",  value: acquired,              color: "text-green-600",  bg: "bg-green-50" },
          { label: "Conversion Rate", value: `${conversionRate}%`,  color: "text-violet-600", bg: "bg-violet-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-5 py-4`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Spend summary */}
      {totalSpend > 0 && (
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm">
          <TrendingUp size={14} className="text-green-600" />
          <span className="font-semibold text-green-800">Total spend on acquired links:</span>
          <span className="text-green-700">${totalSpend.toLocaleString()}</span>
        </div>
      )}

      {/* Pipeline strip */}
      {prospects.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3 mb-5 flex flex-wrap gap-2">
          {STATUSES.map(st => {
            const count = prospects.filter(p => p.status === st.value).length;
            const StatusIcon = st.icon;
            return (
              <button key={st.value} onClick={() => setFilterStatus(filterStatus === st.value ? "all" : st.value)}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border font-medium transition-colors ${filterStatus === st.value ? "bg-slate-800 text-white border-slate-800" : `${st.color} hover:opacity-80`}`}>
                <StatusIcon size={13} />{st.label} · {count}
              </button>
            );
          })}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-orange-50 to-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center gap-2"><Link2 size={16} className="text-orange-500" />New Prospect</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={16} /></button>
          </div>
          <form onSubmit={addProspect} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Domain *</label>
                <input required value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}
                  placeholder="example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Client</label>
                <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}
                  placeholder="Client name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>DA Score</label>
                <input value={form.da} onChange={e => setForm({ ...form, da: e.target.value })}
                  placeholder="e.g. 45" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>DR Score</label>
                <input value={form.dr} onChange={e => setForm({ ...form, dr: e.target.value })}
                  placeholder="e.g. 52" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Link Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputCls}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as LinkProspect["status"] })} className={inputCls}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as LinkProspect["priority"] })} className={inputCls}>
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Price / Cost</label>
                <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 150" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Contact Email</label>
                <input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })}
                  placeholder="editor@example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Target Page (your URL)</label>
                <input value={form.target_page} onChange={e => setForm({ ...form, target_page: e.target.value })}
                  placeholder="https://yourclient.com/page" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Anchor Text</label>
                <input value={form.anchor_text} onChange={e => setForm({ ...form, anchor_text: e.target.value })}
                  placeholder="e.g. best SEO services" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Follow-Up Date</label>
                <input type="date" value={form.follow_up_date} onChange={e => setForm({ ...form, follow_up_date: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Date Outreached</label>
                <input type="date" value={form.date_outreached} onChange={e => setForm({ ...form, date_outreached: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Date Acquired</label>
                <input type="date" value={form.date_acquired} onChange={e => setForm({ ...form, date_acquired: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                placeholder="Contact details, pricing, requirements, follow-up notes..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600">
                <Save size={14} /> Save Prospect
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* View toggle + filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search domains, clients, anchor text..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
          </div>
          <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
            {(["table", "pipeline", "charts"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${view === v ? "bg-orange-500 text-white" : "text-slate-500 hover:bg-white"}`}>
                {v === "pipeline" ? "Pipeline" : v === "charts" ? "Charts" : "Table"}
              </button>
            ))}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border transition-colors ${showFilters ? "bg-slate-800 text-white border-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Filter size={13} /> Filters {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} prospects</span>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
              <option value="all">All Types</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
              <option value="all">All Priorities</option>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            {allClients.length > 0 && (
              <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
                <option value="all">All Clients</option>
                {allClients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <button onClick={() => { setFilterStatus("all"); setFilterType("all"); setFilterClient("all"); setFilterPriority("all"); setSearch(""); }}
              className="text-xs text-slate-500 hover:text-red-500 underline px-2">Clear</button>
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-orange-800">{selected.size} selected</span>
          <button onClick={() => bulkStatus("outreached")} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700">Mark Outreached</button>
          <button onClick={() => bulkStatus("acquired")} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700">Mark Acquired</button>
          <button onClick={() => bulkStatus("rejected")} className="text-xs bg-slate-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-600">Mark Rejected</button>
          <button onClick={bulkDelete} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-600 flex items-center gap-1">
            <Trash2 size={11} /> Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-orange-600 font-semibold">Deselect all</button>
        </div>
      )}

      {/* Charts view */}
      {view === "charts" && (
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-bold text-slate-700 mb-4">Pipeline Status</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pipelineChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}>
                  {pipelineChartData.map((_, i) => <Cell key={i} fill={PIPELINE_COLORS[i % PIPELINE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-bold text-slate-700 mb-4">Links by Type</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeChartData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {clientChartData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:col-span-2">
              <p className="text-sm font-bold text-slate-700 mb-4">Acquired vs Total by Client</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={clientChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Total" />
                  <Bar dataKey="acquired" fill="#10b981" radius={[4, 4, 0, 0]} name="Acquired" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Pipeline kanban view */}
      {view === "pipeline" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5">
          {STATUSES.map(st => {
            const colProspects = prospects.filter(p => p.status === st.value);
            const StatusIcon = st.icon;
            return (
              <div key={st.value} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className={`px-3 py-2.5 border-b border-slate-100 flex items-center justify-between`}>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon size={13} className={st.color.split(" ")[0]} />
                    <span className="text-xs font-bold text-slate-700">{st.label}</span>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{colProspects.length}</span>
                </div>
                <div className="p-2 space-y-2 min-h-[150px]">
                  {colProspects.length === 0 && <p className="text-xs text-slate-300 text-center py-6">Empty</p>}
                  {colProspects.map(p => (
                    <div key={p.id} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 hover:border-orange-200 transition-all group">
                      <a href={`https://${p.domain}`} target="_blank" rel="noreferrer"
                        className="text-xs font-semibold text-slate-700 hover:text-orange-600 flex items-center gap-1 truncate">
                        {p.domain} <ExternalLink size={9} className="opacity-50 shrink-0" />
                      </a>
                      {p.client && <p className="text-xs text-slate-400 mt-0.5">{p.client}</p>}
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {p.da && <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">DA {p.da}</span>}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border ${priCfg(p.priority).color}`}>{p.priority}</span>
                      </div>
                      {p.price && <p className="text-xs text-green-600 font-semibold mt-1">${p.price}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Link2 size={36} className="text-slate-300" />
            </div>
            <h3 className="text-slate-600 font-bold text-lg mb-2">No prospects yet</h3>
            <p className="text-slate-400 text-sm mb-6">Start adding outreach targets and track the full pipeline</p>
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600">
              <Plus size={15} /> Add First Prospect
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-2.5 border-b border-slate-50 flex items-center gap-3">
              <button onClick={() => allFilteredSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(p => p.id)))}
                className="text-slate-400 hover:text-orange-600">
                {allFilteredSelected ? <CheckSquare size={15} className="text-orange-500" /> : <Square size={15} />}
              </button>
              <span className="text-xs text-slate-400">{filtered.length} shown</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest w-8"></th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Domain</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Type / DA / DR</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Anchor</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact / Dates</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(p => {
                    const st = stCfg(p.status);
                    const isExpanded = expandedRow === p.id;
                    const isSelected = selected.has(p.id);
                    const followUpDue = p.follow_up_date && p.follow_up_date <= today() && p.status !== "acquired" && p.status !== "rejected";
                    return (
                      <>
                        <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors group ${isSelected ? "bg-orange-50/30" : ""}`}>
                          {editing === p.id ? (
                            <td colSpan={9} className="px-5 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                <input value={editData.domain ?? ""} onChange={e => setEditData({ ...editData, domain: e.target.value })}
                                  placeholder="Domain" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                                <input value={editData.client ?? ""} onChange={e => setEditData({ ...editData, client: e.target.value })}
                                  placeholder="Client" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                                <input value={editData.da ?? ""} onChange={e => setEditData({ ...editData, da: e.target.value })}
                                  placeholder="DA" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                                <input value={editData.dr ?? ""} onChange={e => setEditData({ ...editData, dr: e.target.value })}
                                  placeholder="DR" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                                <select value={editData.status ?? "prospect"} onChange={e => setEditData({ ...editData, status: e.target.value as LinkProspect["status"] })}
                                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                                <select value={editData.priority ?? "medium"} onChange={e => setEditData({ ...editData, priority: e.target.value as LinkProspect["priority"] })}
                                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                                  {PRIORITIES.map(pr => <option key={pr.value} value={pr.value}>{pr.label}</option>)}
                                </select>
                                <input value={editData.anchor_text ?? ""} onChange={e => setEditData({ ...editData, anchor_text: e.target.value })}
                                  placeholder="Anchor text" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                                <input type="email" value={editData.contact_email ?? ""} onChange={e => setEditData({ ...editData, contact_email: e.target.value })}
                                  placeholder="Contact email" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                                <input value={editData.price ?? ""} onChange={e => setEditData({ ...editData, price: e.target.value })}
                                  placeholder="Price" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                                <input type="date" value={editData.follow_up_date ?? ""} onChange={e => setEditData({ ...editData, follow_up_date: e.target.value })}
                                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                                <input type="date" value={editData.date_outreached ?? ""} onChange={e => setEditData({ ...editData, date_outreached: e.target.value })}
                                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                                <input type="date" value={editData.date_acquired ?? ""} onChange={e => setEditData({ ...editData, date_acquired: e.target.value })}
                                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                              </div>
                              <textarea value={editData.notes ?? ""} onChange={e => setEditData({ ...editData, notes: e.target.value })}
                                rows={2} placeholder="Notes" className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none resize-none mb-3" />
                              <div className="flex gap-2">
                                <button onClick={() => updateProspect(p.id)}
                                  className="flex items-center gap-1.5 text-sm bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600">
                                  <Save size={13} /> Save
                                </button>
                                <button onClick={() => setEditing(null)}
                                  className="flex items-center gap-1.5 text-sm border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">
                                  <X size={13} /> Cancel
                                </button>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="px-4 py-4">
                                <button onClick={() => setSelected(prev => { const s = new Set(prev); s.has(p.id) ? s.delete(p.id) : s.add(p.id); return s; })}
                                  className="text-slate-300 hover:text-orange-500">
                                  {isSelected ? <CheckSquare size={14} className="text-orange-500" /> : <Square size={14} />}
                                </button>
                              </td>
                              <td className="px-4 py-4">
                                <a href={`https://${p.domain}`} target="_blank" rel="noreferrer"
                                  className="font-semibold text-slate-800 text-sm hover:text-orange-600 flex items-center gap-1">
                                  {p.domain} <ExternalLink size={10} className="opacity-40" />
                                </a>
                                {p.client && <p className="text-xs text-slate-400 mt-0.5">{p.client}</p>}
                                {followUpDue && (
                                  <span className="text-xs text-amber-600 flex items-center gap-1 mt-0.5 font-medium">
                                    <RefreshCw size={9} /> Follow-up due
                                  </span>
                                )}
                                {(p.notes || p.target_page) && (
                                  <button onClick={() => setExpandedRow(isExpanded ? null : p.id)}
                                    className="text-xs text-blue-500 hover:text-blue-700 mt-1 flex items-center gap-1">
                                    {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                    {isExpanded ? "Less" : "Details"}
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <p className="text-sm text-slate-700 font-medium">{p.type}</p>
                                <p className="text-xs text-slate-400">
                                  {p.da && `DA ${p.da}`}{p.da && p.dr && " · "}{p.dr && `DR ${p.dr}`}
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priCfg(p.priority).color}`}>
                                  {priCfg(p.priority).label}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <select value={p.status}
                                  onChange={e => save(prospects.map(x => x.id === p.id ? { ...x, status: e.target.value as LinkProspect["status"] } : x))}
                                  className={`text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${st.color}`}>
                                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                              </td>
                              <td className="px-4 py-4">
                                <p className="text-sm text-slate-600">{p.anchor_text || "—"}</p>
                              </td>
                              <td className="px-4 py-4">
                                {p.contact_email ? (
                                  <a href={`mailto:${p.contact_email}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                    <Mail size={11} />{p.contact_email}
                                  </a>
                                ) : <span className="text-slate-300 text-xs">—</span>}
                                {p.date_outreached && <p className="text-xs text-slate-400 mt-0.5">Sent: {new Date(p.date_outreached).toLocaleDateString()}</p>}
                                {p.date_acquired && <p className="text-xs text-green-600 mt-0.5 font-medium">Acquired: {new Date(p.date_acquired).toLocaleDateString()}</p>}
                              </td>
                              <td className="px-4 py-4">
                                {p.price ? <span className="text-sm font-semibold text-green-600">${p.price}</span> : <span className="text-slate-300 text-sm">—</span>}
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => setEmailTemplate(p)} title="Copy email template"
                                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Copy size={13} /></button>
                                  <button onClick={() => { setEditing(p.id); setEditData({ ...p }); }}
                                    className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg"><Pencil size={13} /></button>
                                  <button onClick={() => deleteProspect(p.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                        {isExpanded && editing !== p.id && (
                          <tr key={`${p.id}-exp`} className="bg-slate-50/50">
                            <td colSpan={9} className="px-5 pb-4 pt-0">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                                {p.target_page && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-1">Target Page</p>
                                    <a href={p.target_page} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline break-all">{p.target_page}</a>
                                  </div>
                                )}
                                {p.notes && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-1">Notes</p>
                                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{p.notes}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Email Template Modal */}
      {emailTemplate && (() => {
        const { subj, body } = generateEmailTemplate(emailTemplate);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Outreach Email Template</h3>
                <button onClick={() => setEmailTemplate(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">Subject</p>
                <p className="text-sm bg-slate-50 rounded-lg px-3 py-2 text-slate-700">{subj}</p>
              </div>
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">Body</p>
                <pre className="text-xs bg-slate-50 rounded-lg px-3 py-2 text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">{body}</pre>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { navigator.clipboard.writeText(`Subject: ${subj}\n\n${body}`); setEmailTemplate(null); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700">
                  <Copy size={14} /> Copy to Clipboard
                </button>
                {emailTemplate.contact_email && (
                  <a href={`mailto:${emailTemplate.contact_email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-700">
                    <Mail size={14} /> Open in Mail
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Import Modal */}
      {importModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Import Prospects (CSV)</h3>
              <button onClick={() => setImportModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Columns: <code className="bg-slate-100 px-1 rounded">domain, client, da, type, contact_email, notes</code></p>
            <div className="mb-3">
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileImport} className="hidden" />
              <button onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-500 hover:border-orange-400 hover:text-orange-600 transition-colors">
                Choose CSV file
              </button>
            </div>
            <textarea rows={5} value={importText} onChange={e => setImportText(e.target.value)}
              placeholder={"domain,client,da,type\nexample.com,Client A,45,Guest Post\nblog.com,Client B,38,Niche Edit"}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setImportModal(false); setImportText(""); }} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={importCSV} className="flex-1 bg-orange-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-orange-600">Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
