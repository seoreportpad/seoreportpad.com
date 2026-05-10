"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  Plus, Trash2, Save, X, Search, TrendingUp, TrendingDown,
  Minus, Calendar, Globe, Download, Upload, Target,
  BarChart3, Table2, Bell, StickyNote, ChevronDown,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";

interface RankEntry {
  id: string;
  keyword: string;
  client: string;
  url: string;
  target_url: string;
  goal: number | null;
  notes: string;
  alert: boolean;
  positions: Record<string, number | null>;
  created_at: string;
}

const LS_KEY = "seo_rank_tracker_v1";
function load(): RankEntry[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
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
  if (pos <= 3) return "text-green-600 font-black";
  if (pos <= 10) return "text-blue-600 font-bold";
  if (pos <= 20) return "text-amber-600 font-semibold";
  return "text-slate-500";
}
function posBg(pos: number | null) {
  if (pos === null) return "bg-slate-50";
  if (pos <= 3) return "bg-green-50";
  if (pos <= 10) return "bg-blue-50";
  if (pos <= 20) return "bg-amber-50";
  return "bg-slate-50";
}

function getTrend(positions: Record<string, number | null>, weeks: string[]) {
  const vals = weeks.map(w => positions[w]).filter(v => v !== null && v !== undefined) as number[];
  if (vals.length < 2) return null;
  return vals[vals.length - 1] - vals[vals.length - 2];
}

function getBest(positions: Record<string, number | null>) {
  const vals = Object.values(positions).filter(v => v !== null) as number[];
  return vals.length ? Math.min(...vals) : null;
}

function getLatest(positions: Record<string, number | null>, weeks: string[]) {
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (positions[weeks[i]] != null) return positions[weeks[i]];
  }
  return null;
}

const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316","#ec4899"];

export default function RankTrackerPage() {
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ keyword: "", client: "", target_url: "", goal: "", notes: "", alert: false });
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("all");
  const [weeksCount, setWeeksCount] = useState(8);
  const [view, setView] = useState<"table" | "chart">("table");
  const [editing, setEditing] = useState<{ id: string; week: string } | null>(null);
  const [editVal, setEditVal] = useState("");
  const [noteModal, setNoteModal] = useState<RankEntry | null>(null);
  const [noteVal, setNoteVal] = useState("");
  const [importModal, setImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const weeks = useMemo(() => lastNWeeks(weeksCount), [weeksCount]);

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
      goal: form.goal ? parseInt(form.goal) : null,
      notes: form.notes.trim(),
      alert: form.alert,
      positions: {},
      created_at: new Date().toISOString(),
    };
    save([entry, ...entries]);
    setForm({ keyword: "", client: "", target_url: "", goal: "", notes: "", alert: false });
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

  const saveNote = () => {
    if (!noteModal) return;
    save(entries.map(e => e.id === noteModal.id ? { ...e, notes: noteVal } : e));
    setNoteModal(null);
  };

  const toggleAlert = (id: string) => {
    save(entries.map(e => e.id === id ? { ...e, alert: !e.alert } : e));
  };

  const allClients = useMemo(() => [...new Set(entries.map(e => e.client).filter(Boolean))], [entries]);

  const filtered = useMemo(() => entries.filter(e => {
    const q = search.toLowerCase();
    return (!q || e.keyword.toLowerCase().includes(q) || e.client.toLowerCase().includes(q))
      && (filterClient === "all" || e.client === filterClient);
  }), [entries, search, filterClient]);

  const exportCSV = () => {
    const rows = [["Keyword", "Client", "Target URL", "Goal", "Notes", "Best Position", ...weeks.map(weekLabel)]];
    for (const e of filtered) {
      rows.push([e.keyword, e.client, e.target_url, String(e.goal ?? ""), e.notes, String(getBest(e.positions) ?? ""), ...weeks.map(w => String(e.positions[w] ?? ""))]);
    }
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "rank-tracker.csv";
    a.click();
  };

  const importCSV = () => {
    const lines = importText.trim().split("\n").filter(Boolean);
    if (!lines.length) return;
    const newEntries: RankEntry[] = [];
    const start = lines[0].toLowerCase().includes("keyword") ? 1 : 0;
    for (const line of lines.slice(start)) {
      const cols = line.split(",").map(c => c.replace(/^"|"$/g, "").trim());
      if (!cols[0]) continue;
      newEntries.push({
        id: uid(),
        keyword: cols[0] || "",
        client: cols[1] || "",
        target_url: cols[2] || "",
        goal: cols[3] ? parseInt(cols[3]) || null : null,
        notes: cols[4] || "",
        alert: false,
        url: "",
        positions: {},
        created_at: new Date().toISOString(),
      });
    }
    save([...newEntries, ...entries]);
    setImportText("");
    setImportModal(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImportText(String(ev.target?.result || ""));
    reader.readAsText(file);
  };

  // Top movers
  const topMovers = useMemo(() => {
    return entries
      .map(e => ({ ...e, trend: getTrend(e.positions, weeks) }))
      .filter(e => e.trend !== null && e.trend !== 0)
      .sort((a, b) => Math.abs(b.trend!) - Math.abs(a.trend!))
      .slice(0, 5);
  }, [entries, weeks]);

  // Stats
  const top3 = entries.filter(e => { const p = getLatest(e.positions, weeks); return p !== null && p !== undefined && (p as number) <= 3; }).length;
  const top10 = entries.filter(e => { const p = getLatest(e.positions, weeks); return p !== null && p !== undefined && (p as number) <= 10; }).length;
  const goalHit = entries.filter(e => {
    if (!e.goal) return false;
    const p = getLatest(e.positions, weeks);
    return p !== null && p !== undefined && (p as number) <= e.goal;
  }).length;

  // Chart data
  const chartData = useMemo(() => weeks.map(w => {
    const obj: Record<string, string | number> = { week: weekLabel(w) };
    filtered.slice(0, 8).forEach(e => {
      const pos = e.positions[w];
      if (pos != null) obj[e.keyword] = pos;
    });
    return obj;
  }), [filtered, weeks]);

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Rank Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Log keyword positions weekly — track progress over time</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={weeksCount} onChange={e => setWeeksCount(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none">
            <option value={4}>4 weeks</option>
            <option value={8}>8 weeks</option>
            <option value={12}>12 weeks</option>
            <option value={24}>24 weeks</option>
          </select>
          <button onClick={() => setImportModal(true)}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Upload size={15} /> Import
          </button>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Tracked", value: entries.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Top 3", value: top3, color: "text-green-600", bg: "bg-green-50" },
          { label: "Top 10", value: top10, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Goal Hit", value: goalHit, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Clients", value: allClients.length, color: "text-orange-600", bg: "bg-orange-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-5 py-4`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Top Movers */}
      {topMovers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Top Movers This Week</p>
          <div className="flex flex-wrap gap-3">
            {topMovers.map(e => (
              <div key={e.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${e.trend! < 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                {e.trend! < 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{e.keyword}</span>
                <span className="opacity-70">{e.trend! < 0 ? "+" : ""}{Math.abs(e.trend!)} pos</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Keyword *</label>
                <input required value={form.keyword} onChange={e => setForm({ ...form, keyword: e.target.value })}
                  placeholder="e.g. best plumber Dubai" className={inputCls} />
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5"><Target size={11} className="inline mr-1" />Goal Position</label>
                <input type="number" min={1} max={100} value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}
                  placeholder="e.g. 3" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Notes</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional note" className={inputCls} />
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={form.alert} onChange={e => setForm({ ...form, alert: e.target.checked })} className="rounded" />
                  <Bell size={13} /> Alert on big change
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
                <Save size={14} /> Add Keyword
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters + view toggle */}
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
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button onClick={() => setView("table")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${view === "table" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
            <Table2 size={12} /> Table
          </button>
          <button onClick={() => setView("chart")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${view === "chart" ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
            <BarChart3 size={12} /> Chart
          </button>
        </div>
        <span className="text-xs text-slate-400">{filtered.length} keywords</span>
      </div>

      {/* Chart view */}
      {view === "chart" && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <p className="text-xs text-slate-400 mb-4">Position over time — lower is better. Showing up to 8 keywords.</p>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis reversed tick={{ fontSize: 11 }} domain={[1, "auto"]} />
              <Tooltip formatter={(v) => [`Position ${v}`, ""]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {filtered.slice(0, 8).map((e, i) => (
                <Line key={e.id} type="monotone" dataKey={e.keyword} stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2} dot={{ r: 3 }} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        filtered.length === 0 ? (
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
                        <div className="flex items-center justify-center gap-1"><Calendar size={10} />{weekLabel(w)}</div>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Best</th>
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Trend</th>
                    <th className="px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(entry => {
                    const trend = getTrend(entry.positions, weeks);
                    const best = getBest(entry.positions);
                    const latest = getLatest(entry.positions, weeks) as number | null;
                    const goalMet = entry.goal && latest !== null && latest <= entry.goal;
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-slate-800 text-sm">{entry.keyword}</p>
                                {entry.goal && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold border ${goalMet ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                                    <Target size={9} className="inline mr-0.5" />Goal: #{entry.goal}
                                  </span>
                                )}
                                {entry.alert && <Bell size={10} className="text-amber-500 shrink-0" />}
                              </div>
                              {entry.client && <p className="text-xs text-slate-400 mt-0.5">{entry.client}</p>}
                              {entry.target_url && (
                                <a href={entry.target_url} target="_blank" rel="noreferrer"
                                  className="text-xs text-blue-500 hover:underline truncate block max-w-[160px] mt-0.5">
                                  {entry.target_url.replace(/^https?:\/\/(www\.)?/, "")}
                                </a>
                              )}
                              {entry.notes && (
                                <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">{entry.notes}</p>
                              )}
                            </div>
                          </div>
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
                                    <button onClick={() => savePosition(entry.id, week)} className="text-green-600 hover:bg-green-50 p-0.5 rounded text-xs"><Save size={11} /></button>
                                    <button onClick={() => setEditing(null)} className="text-slate-400 hover:bg-slate-100 p-0.5 rounded text-xs"><X size={11} /></button>
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
                        {/* Best position */}
                        <td className="px-3 py-4 text-center">
                          {best !== null ? (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${posBg(best)}`}>
                              <span className={posColor(best)}>#{best}</span>
                            </span>
                          ) : <span className="text-slate-300 text-xs">—</span>}
                        </td>
                        {/* Trend */}
                        <td className="px-3 py-4 text-center">
                          {trend === null ? <span className="text-slate-300 text-xs">—</span>
                            : trend < 0 ? <span className="flex items-center justify-center gap-1 text-green-600 text-xs font-bold"><TrendingUp size={13} />+{Math.abs(trend)}</span>
                            : trend > 0 ? <span className="flex items-center justify-center gap-1 text-red-500 text-xs font-bold"><TrendingDown size={13} />-{trend}</span>
                            : <span className="flex items-center justify-center gap-1 text-slate-400 text-xs"><Minus size={13} />0</span>}
                        </td>
                        {/* Actions */}
                        <td className="px-3 py-4 text-right">
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setNoteModal(entry); setNoteVal(entry.notes || ""); }}
                              className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Notes">
                              <StickyNote size={13} />
                            </button>
                            <button onClick={() => toggleAlert(entry.id)}
                              className={`p-1.5 rounded-lg transition-colors ${entry.alert ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"}`} title="Alert toggle">
                              <Bell size={13} />
                            </button>
                            <button onClick={() => deleteEntry(entry.id)}
                              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 px-5 py-3 border-t border-slate-50">
              Click any cell to log the position. Green = Top 3 · Blue = Top 10 · Amber = Top 20
            </p>
          </div>
        )
      )}

      {/* Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Notes — {noteModal.keyword}</h3>
            <textarea rows={4} value={noteVal} onChange={e => setNoteVal(e.target.value)}
              placeholder="Add notes about this keyword, competitor strategy, observations..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setNoteModal(null)} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={saveNote} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700">Save Note</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Import Keywords (CSV)</h3>
              <button onClick={() => setImportModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Columns: <code className="bg-slate-100 px-1 rounded">keyword, client, target_url, goal, notes</code></p>
            <div className="mb-3">
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileImport} className="hidden" />
              <button onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                Choose CSV file
              </button>
            </div>
            <textarea rows={6} value={importText} onChange={e => setImportText(e.target.value)}
              placeholder={"keyword,client,target_url,goal\nbest plumber dubai,Client A,https://...,3\nseo services london,Client B,https://...,5"}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setImportModal(false); setImportText(""); }} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={importCSV} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700">Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
