"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Plus, Trash2, Pencil, Save, X, Search, Link2,
  ExternalLink, Filter, ChevronDown, ChevronUp, Download,
  CheckCircle2, Clock, XCircle, Mail, Globe,
} from "lucide-react";

interface LinkProspect {
  id: string;
  domain: string;
  target_page: string;
  da: string;
  type: string;
  status: "prospect" | "outreached" | "negotiating" | "acquired" | "rejected";
  contact_email: string;
  anchor_text: string;
  notes: string;
  client: string;
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

const LS_KEY = "seo_link_building_v1";
function load(): LinkProspect[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function persist(d: LinkProspect[]) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const stCfg = (v: string) => STATUSES.find(s => s.value === v) ?? STATUSES[0];

const emptyForm = (): Omit<LinkProspect, "id" | "created_at"> => ({
  domain: "", target_page: "", da: "", type: "Guest Post", status: "prospect",
  contact_email: "", anchor_text: "", notes: "", client: "",
  date_outreached: "", date_acquired: "",
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
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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
  };

  const allClients = useMemo(() => [...new Set(prospects.map(p => p.client).filter(Boolean))], [prospects]);

  const filtered = useMemo(() => prospects.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.domain.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.anchor_text.toLowerCase().includes(q))
      && (filterStatus === "all" || p.status === filterStatus)
      && (filterType === "all" || p.type === filterType)
      && (filterClient === "all" || p.client === filterClient);
  }), [prospects, search, filterStatus, filterType, filterClient]);

  const exportCSV = () => {
    const rows = [["Domain", "Client", "DA", "Type", "Status", "Anchor Text", "Contact", "Date Outreached", "Date Acquired", "Notes"]];
    for (const p of filtered) rows.push([p.domain, p.client, p.da, p.type, p.status, p.anchor_text, p.contact_email, p.date_outreached, p.date_acquired, p.notes]);
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "link-building.csv";
    a.click();
  };

  const acquired = prospects.filter(p => p.status === "acquired").length;
  const outreached = prospects.filter(p => p.status === "outreached").length;
  const negotiating = prospects.filter(p => p.status === "negotiating").length;

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white";
  const labelCls = "text-xs font-semibold text-slate-600 block mb-1.5";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Link Building Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Track outreach prospects, negotiations, and acquired backlinks</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => { setShowForm(true); setForm(emptyForm()); }}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200">
            <Plus size={16} /> Add Prospect
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Prospects", value: prospects.length, color: "text-slate-700",   bg: "bg-slate-50" },
          { label: "Outreached",      value: outreached,       color: "text-blue-600",    bg: "bg-blue-50" },
          { label: "Negotiating",     value: negotiating,      color: "text-amber-600",   bg: "bg-amber-50" },
          { label: "Links Acquired",  value: acquired,         color: "text-green-600",   bg: "bg-green-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-5 py-4`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline strip */}
      {prospects.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-5 flex flex-wrap gap-3">
          {STATUSES.map(st => {
            const count = prospects.filter(p => p.status === st.value).length;
            const StatusIcon = st.icon;
            return (
              <button key={st.value} onClick={() => setFilterStatus(filterStatus === st.value ? "all" : st.value)}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border font-medium transition-colors ${
                  filterStatus === st.value ? "bg-slate-800 text-white border-slate-800" : `${st.color} hover:opacity-80`
                }`}>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Domain <span className="text-red-500">*</span></label>
                <input required value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}
                  placeholder="example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Client</label>
                <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}
                  placeholder="Client name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>DA / DR Score</label>
                <input value={form.da} onChange={e => setForm({ ...form, da: e.target.value })}
                  placeholder="e.g. 45" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <label className={labelCls}>Contact Email</label>
                <input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })}
                  placeholder="editor@example.com" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Target Page (your URL to link to)</label>
                <input value={form.target_page} onChange={e => setForm({ ...form, target_page: e.target.value })}
                  placeholder="https://yourclient.com/services" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Anchor Text</label>
                <input value={form.anchor_text} onChange={e => setForm({ ...form, anchor_text: e.target.value })}
                  placeholder="e.g. best SEO services" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2} placeholder="Contact details, pricing, requirements, follow-up notes..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
                <Save size={14} /> Save Prospect
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search domains, clients, anchor text..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
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
            {allClients.length > 0 && (
              <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
                <option value="all">All Clients</option>
                {allClients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <button onClick={() => { setFilterStatus("all"); setFilterType("all"); setFilterClient("all"); setSearch(""); }}
              className="text-xs text-slate-500 hover:text-red-500 underline px-2">Clear</button>
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Domain</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Type / DA</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Anchor</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => {
                  const st = stCfg(p.status);
                  const StIcon = st.icon;
                  const isExpanded = expandedRow === p.id;
                  return (
                    <>
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        {editing === p.id ? (
                          <td colSpan={6} className="px-5 py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                              <input value={editData.domain ?? ""} onChange={e => setEditData({ ...editData, domain: e.target.value })}
                                placeholder="Domain" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                              <input value={editData.client ?? ""} onChange={e => setEditData({ ...editData, client: e.target.value })}
                                placeholder="Client" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                              <input value={editData.da ?? ""} onChange={e => setEditData({ ...editData, da: e.target.value })}
                                placeholder="DA/DR" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                              <select value={editData.status ?? "prospect"} onChange={e => setEditData({ ...editData, status: e.target.value as LinkProspect["status"] })}
                                className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                              <input value={editData.anchor_text ?? ""} onChange={e => setEditData({ ...editData, anchor_text: e.target.value })}
                                placeholder="Anchor text" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                              <input type="email" value={editData.contact_email ?? ""} onChange={e => setEditData({ ...editData, contact_email: e.target.value })}
                                placeholder="Contact email" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
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
                            <td className="px-5 py-4">
                              <div>
                                <a href={`https://${p.domain}`} target="_blank" rel="noreferrer"
                                  className="font-semibold text-slate-800 text-sm hover:text-blue-600 flex items-center gap-1">
                                  {p.domain} <ExternalLink size={11} className="opacity-50" />
                                </a>
                                {p.client && <p className="text-xs text-slate-400 mt-0.5">{p.client}</p>}
                                {(p.notes || p.target_page) && (
                                  <button onClick={() => setExpandedRow(isExpanded ? null : p.id)}
                                    className="text-xs text-blue-500 hover:text-blue-700 mt-1 flex items-center gap-1">
                                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                    {isExpanded ? "Hide" : "Details"}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm text-slate-700 font-medium">{p.type}</p>
                              {p.da && <p className="text-xs text-slate-400">DA/DR: {p.da}</p>}
                            </td>
                            <td className="px-5 py-4">
                              <select value={p.status}
                                onChange={e => {
                                  const updated = prospects.map(x => x.id === p.id ? { ...x, status: e.target.value as LinkProspect["status"] } : x);
                                  save(updated);
                                }}
                                className={`text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${st.color}`}>
                                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm text-slate-600">{p.anchor_text || "—"}</p>
                            </td>
                            <td className="px-5 py-4">
                              {p.contact_email ? (
                                <a href={`mailto:${p.contact_email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                  <Mail size={12} />{p.contact_email}
                                </a>
                              ) : <span className="text-slate-300 text-sm">—</span>}
                              {p.date_outreached && <p className="text-xs text-slate-400 mt-0.5">Sent: {new Date(p.date_outreached).toLocaleDateString()}</p>}
                              {p.date_acquired && <p className="text-xs text-green-600 mt-0.5 font-medium">Acquired: {new Date(p.date_acquired).toLocaleDateString()}</p>}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditing(p.id); setEditData({ ...p }); }}
                                  className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => deleteProspect(p.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                      {isExpanded && !editing && (
                        <tr key={`${p.id}-expanded`} className="bg-slate-50/50">
                          <td colSpan={6} className="px-5 pb-4 pt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                              {p.target_page && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 mb-1">Target Page</p>
                                  <a href={p.target_page} target="_blank" rel="noreferrer"
                                    className="text-xs text-blue-600 hover:underline break-all">{p.target_page}</a>
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
      )}
    </div>
  );
}
