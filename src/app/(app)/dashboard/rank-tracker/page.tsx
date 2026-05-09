"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Plus, Trash2, Save, X, Search, TrendingUp, TrendingDown,
  Minus, Calendar, Globe, ChevronDown, ChevronUp, Download,
} from "lucide-react";

interface RankEntry {
  id: string;
  keyword: string;
  client: string;
  url: string;
  target_url: string;
  positions: Record<string, number | null>; // ISO date -> position
  created_at: string;
}

const LS_KEY = "seo_rank_tracker_v1";

function load(): RankEntry[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function persist(data: RankEntry[]) { localStorage.setItem(LS_KEY, JSON.stringify(data)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function weekLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function lastNWeeks(n: number): string[] {
  const weeks: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    weeks.push(d.toISOString().slice(0, 10));
  }
  return weeks;
}

function posColor(pos: number | null) {
  if (pos === null) return "text-slate-300";
  if (pos <= 3)  return "text-green-600 font-black";
  if (pos <= 10) return "text-blue-600 font-bold";
  if (pos <= 20) return "text-amber-600 font-semibold";
  return "text-slate-500";
}

function posBg(pos: number | null) {
  if (pos === null) return "bg-slate-50";
  if (pos <= 3)  return "bg-green-50";
  if (pos <= 10) return "bg-blue-50";
  if (pos <= 20) return "bg-amber-50";
  return "bg-slate-50";
}

function getTrend(positions: Record<string, number | null>, weeks: string[]) {
  const vals = weeks.map(w => positions[w]).filter(v => v !== null && v !== undefined) as number[];
  if (vals.length < 2) return null;
  return vals[vals.length - 1] - vals[vals.length - 2];
}

export default function RankTrackerPage() {
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ keyword: "", client: "", target_url: "" });
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("all");
  const [weeksCount] = useState(8);
  const weeks = useMemo(() => lastNWeeks(weeksCount), [weeksCount]);

  // Inline position editing
  const [editing, setEditing] = useState<{ id: string; week: string } | null>(null);
  const [editVal, setEditVal] = useState("");

  useEffect(() => { setEntries(load()); }, []);

  const save = (data: RankEntry[]) => { setEntries(data); persist(data); };

  const addKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.keyword.trim()) return;
    const entry: RankEntry = {
      id: uid(),
      keyword: form.keyword.trim(),
      client: form.client.trim(),
      url: "",
      target_url: form.target_url.trim(),
      positions: {},
      created_at: new Date().toISOString(),
    };
    save([entry, ...entries]);
    setForm({ keyword: "", client: "", target_url: "" });
    setShowForm(false);
  };

  const savePosition = (id: string, week: string) => {
    const val = editVal.trim();
    const pos = val === "" || val === "-" ? null : parseInt(val, 10);
    if (val !== "" && val !== "-" && (isNaN(pos!) || pos! < 1)) return;
    save(entries.map(e => e.id === id ? { ...e, positions: { ...e.positions, [week]: pos } } : e));
    setEditing(null);
    setEditVal("");
  };

  const deleteEntry = (id: string) => {
    if (!confirm("Remove this keyword?")) return;
    save(entries.filter(e => e.id !== id));
  };

  const allClients = useMemo(() => [...new Set(entries.map(e => e.client).filter(Boolean))], [entries]);

  const filtered = useMemo(() => entries.filter(e => {
    const q = search.toLowerCase();
    return (!q || e.keyword.toLowerCase().includes(q) || e.client.toLowerCase().includes(q))
      && (filterClient === "all" || e.client === filterClient);
  }), [entries, search, filterClient]);

  const exportCSV = () => {
    const rows = [["Keyword", "Client", "Target URL", ...weeks.map(weekLabel)]];
    for (const e of filtered) {
      rows.push([e.keyword, e.client, e.target_url, ...weeks.map(w => String(e.positions[w] ?? ""))]);
    }
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "rank-tracker.csv";
    a.click();
  };

  const top3 = entries.filter(e => {
    const latest = weeks[weeks.length - 1];
    const pos = e.positions[latest];
    return pos !== null && pos !== undefined && pos <= 3;
  }).length;

  const top10 = entries.filter(e => {
    const latest = weeks[weeks.length - 1];
    const pos = e.positions[latest];
    return pos !== null && pos !== undefined && pos <= 10;
  }).length;

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Rank Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Log keyword positions weekly — track progress over time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <Plus size={16} /> Add Keyword
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Keywords Tracked", value: entries.length,  color: "text-blue-600",  bg: "bg-blue-50" },
          { label: "Top 3",            value: top3,            color: "text-green-600", bg: "bg-green-50" },
          { label: "Top 10",           value: top10,           color: "text-teal-600",  bg: "bg-teal-50" },
          { label: "Clients",          value: allClients.length, color: "text-violet-600", bg: "bg-violet-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-5 py-4`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Add keyword form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-blue-50 to-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center gap-2"><Plus size={16} className="text-blue-600" />Add Keyword</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={16} /></button>
          </div>
          <form onSubmit={addKeyword} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Keyword <span className="text-red-500">*</span></label>
                <input required value={form.keyword} onChange={e => setForm({ ...form, keyword: e.target.value })}
                  placeholder="e.g. best plumber in Dubai" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Client</label>
                <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}
                  placeholder="Client name" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5"><Globe size={11} className="inline mr-1" />Target URL</label>
                <input value={form.target_url} onChange={e => setForm({ ...form, target_url: e.target.value })}
                  placeholder="https://..." className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                <Save size={14} /> Add Keyword
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keywords or clients..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        {allClients.length > 0 && (
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
            <option value="all">All Clients</option>
            {allClients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <span className="text-xs text-slate-400">{filtered.length} keywords</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <TrendingUp size={36} className="text-slate-300" />
          </div>
          <h3 className="text-slate-600 font-bold text-lg mb-2">No keywords tracked yet</h3>
          <p className="text-slate-400 text-sm mb-6">Add keywords and log their positions each week</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
            <Plus size={15} /> Add First Keyword
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[200px]">Keyword</th>
                  {weeks.map(w => (
                    <th key={w} className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-center min-w-[70px]">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar size={10} />{weekLabel(w)}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Trend</th>
                  <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(entry => {
                  const trend = getTrend(entry.positions, weeks);
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 text-sm">{entry.keyword}</p>
                        {entry.client && <p className="text-xs text-slate-400 mt-0.5">{entry.client}</p>}
                        {entry.target_url && (
                          <a href={entry.target_url} target="_blank" rel="noreferrer"
                            className="text-xs text-blue-500 hover:underline truncate block max-w-[180px] mt-0.5">
                            {entry.target_url.replace(/^https?:\/\/(www\.)?/, "")}
                          </a>
                        )}
                      </td>
                      {weeks.map(week => {
                        const pos = entry.positions[week];
                        const isEditing = editing?.id === entry.id && editing?.week === week;
                        return (
                          <td key={week} className="px-3 py-4 text-center">
                            {isEditing ? (
                              <div className="flex flex-col items-center gap-1">
                                <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                                  onKeyDown={e => { if (e.key === "Enter") savePosition(entry.id, week); if (e.key === "Escape") setEditing(null); }}
                                  className="w-14 text-center text-sm border border-blue-400 rounded-lg px-1 py-1 focus:outline-none" placeholder="#" />
                                <div className="flex gap-1">
                                  <button onClick={() => savePosition(entry.id, week)}
                                    className="text-green-600 hover:bg-green-50 p-0.5 rounded text-xs"><Save size={11} /></button>
                                  <button onClick={() => setEditing(null)}
                                    className="text-slate-400 hover:bg-slate-100 p-0.5 rounded text-xs"><X size={11} /></button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => { setEditing({ id: entry.id, week }); setEditVal(pos != null ? String(pos) : ""); }}
                                className={`w-10 h-8 rounded-lg text-sm cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all ${posBg(pos ?? null)}`}>
                                <span className={posColor(pos ?? null)}>{pos ?? "—"}</span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-4 text-center">
                        {trend === null ? (
                          <span className="text-slate-300 text-xs">—</span>
                        ) : trend < 0 ? (
                          <span className="flex items-center justify-center gap-1 text-green-600 text-xs font-bold">
                            <TrendingUp size={13} />+{Math.abs(trend)}
                          </span>
                        ) : trend > 0 ? (
                          <span className="flex items-center justify-center gap-1 text-red-500 text-xs font-bold">
                            <TrendingDown size={13} />-{trend}
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-slate-400 text-xs">
                            <Minus size={13} />0
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <button onClick={() => deleteEntry(entry.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 px-5 py-3 border-t border-slate-50">
            Click any cell to log the position for that week. Green = Top 3 · Blue = Top 10 · Amber = Top 20
          </p>
        </div>
      )}
    </div>
  );
}
