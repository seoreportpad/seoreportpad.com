"use client";
import { useEffect, useState } from "react";
import {
  Plus, Trash2, TrendingUp, TrendingDown, Minus,
  Search, Download, Target, ChevronUp, ChevronDown,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface RankEntry {
  id: string; client_id: string; keyword: string; ranking: number;
  search_volume?: number; url?: string; month: string; year: number;
  tracked_at: string; clients?: { name: string };
}
interface Client { id: string; name: string; }

type GroupedKeyword = {
  keyword: string;
  url?: string;
  search_volume?: number;
  history: { month: string; year: number; ranking: number; label: string }[];
  latest: number;
  prev: number;
  diff: number;
};

function groupKeywords(entries: RankEntry[]): GroupedKeyword[] {
  const map = new Map<string, RankEntry[]>();
  for (const e of entries) {
    if (!map.has(e.keyword)) map.set(e.keyword, []);
    map.get(e.keyword)!.push(e);
  }
  return Array.from(map.entries()).map(([keyword, rows]) => {
    const sorted = [...rows].sort((a, b) =>
      a.year !== b.year ? a.year - b.year : MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month)
    );
    const history = sorted.map(r => ({
      month: r.month, year: r.year, ranking: r.ranking,
      label: `${r.month.slice(0,3)} ${r.year}`,
    }));
    const latest = sorted[sorted.length - 1]?.ranking ?? 0;
    const prev = sorted[sorted.length - 2]?.ranking ?? latest;
    return {
      keyword,
      url: rows[0]?.url,
      search_volume: rows[0]?.search_volume,
      history,
      latest,
      prev,
      diff: prev - latest, // positive = improved (lower rank number is better)
    };
  }).sort((a, b) => a.latest - b.latest);
}

export default function KeywordsPage() {
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClient, setFilterClient] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_id: "", keyword: "", ranking: "", search_volume: "",
    url: "", month: MONTHS[new Date().getMonth()], year: new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filterClient !== "all") p.set("clientId", filterClient);
    fetch(`/api/rank-history?${p}`)
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setEntries(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/clients").then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setClients(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => { load(); }, [filterClient]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/rank-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        ranking: Number(form.ranking),
        search_volume: form.search_volume ? Number(form.search_volume) : null,
        tracked_at: new Date().toISOString(),
      }),
    });
    setSaving(false);
    setShowForm(false);
    setForm(f => ({ ...f, keyword: "", ranking: "", search_volume: "", url: "" }));
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/rank-history/${id}`, { method: "DELETE" });
    load();
  };

  const exportCSV = () => {
    const rows = [["Keyword", "Month", "Year", "Ranking", "Volume", "URL", "Client"]];
    for (const e of entries) {
      rows.push([e.keyword, e.month, String(e.year), String(e.ranking), String(e.search_volume ?? ""), e.url ?? "", e.clients?.name ?? ""]);
    }
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `Keywords-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const filtered = entries.filter(e => {
    const matchSearch = !search || e.keyword.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const grouped = groupKeywords(filtered);
  const selectedKw = grouped.find(g => g.keyword === selected);

  const improved = grouped.filter(g => g.diff > 0).length;
  const dropped = grouped.filter(g => g.diff < 0).length;
  const top10 = grouped.filter(g => g.latest <= 10).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Keyword Rank Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Track keyword positions month by month</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <Plus size={16} /> Add Ranking
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Keywords Tracked", value: grouped.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Top 10", value: top10, color: "text-green-600", bg: "bg-green-50" },
          { label: "Improved", value: improved, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Dropped", value: dropped, color: "text-red-500", bg: "bg-red-50" },
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
            <h2 className="font-bold text-slate-700">Add Keyword Ranking</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
          </div>
          <form onSubmit={save} className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Client *</label>
                <select required value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- Select --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Keyword *</label>
                <input required value={form.keyword} onChange={e => setForm({ ...form, keyword: e.target.value })}
                  placeholder="e.g. seo agency lahore"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Position *</label>
                <input required type="number" min="1" value={form.ranking} onChange={e => setForm({ ...form, ranking: e.target.value })}
                  placeholder="e.g. 7"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Month</label>
                <select value={form.month} onChange={e => setForm({ ...form, month: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Year</label>
                <input type="number" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Search Volume</label>
                <input type="number" value={form.search_volume} onChange={e => setForm({ ...form, search_volume: e.target.value })}
                  placeholder="e.g. 1200"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Target URL</label>
              <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                placeholder="https://example.com/page"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : "Save Ranking"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keywords..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm w-48" />
        </div>
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm">
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Main layout — table + chart */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Keyword table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-50 bg-slate-50/50">
            <p className="font-bold text-slate-700 text-sm">{grouped.length} keywords</p>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
            </div>
          ) : grouped.length === 0 ? (
            <div className="py-16 text-center">
              <Target size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm font-medium">No keywords tracked yet</p>
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold mt-3 hover:underline">
                <Plus size={12} /> Add first keyword
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {grouped.map(g => (
                <button key={g.keyword} onClick={() => setSelected(selected === g.keyword ? null : g.keyword)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50/60 transition-colors ${selected === g.keyword ? "bg-blue-50/60 border-l-2 border-blue-500" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{g.keyword}</p>
                    {g.search_volume && <p className="text-xs text-slate-400 mt-0.5">{g.search_volume.toLocaleString()} searches/mo</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-lg font-black ${g.latest <= 3 ? "text-green-600" : g.latest <= 10 ? "text-teal-600" : g.latest <= 20 ? "text-amber-500" : "text-slate-500"}`}>
                      #{g.latest}
                    </p>
                    {g.diff !== 0 && (
                      <span className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${g.diff > 0 ? "text-green-600" : "text-red-500"}`}>
                        {g.diff > 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {Math.abs(g.diff)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chart panel */}
        <div className="lg:col-span-3 space-y-4">
          {selectedKw ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">{selectedKw.keyword}</h2>
                  {selectedKw.url && (
                    <a href={selectedKw.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block mt-0.5">{selectedKw.url}</a>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-slate-800">#{selectedKw.latest}</p>
                  {selectedKw.diff !== 0 && (
                    <span className={`flex items-center justify-end gap-1 text-sm font-semibold ${selectedKw.diff > 0 ? "text-green-600" : "text-red-500"}`}>
                      {selectedKw.diff > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {selectedKw.diff > 0 ? "+" : ""}{selectedKw.diff} positions
                    </span>
                  )}
                  {selectedKw.diff === 0 && <span className="flex items-center justify-end gap-1 text-sm text-slate-400"><Minus size={12} /> No change</span>}
                </div>
              </div>

              {selectedKw.history.length >= 2 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={[...selectedKw.history].reverse()} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis reversed tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={["auto","auto"]} />
                    <Tooltip
                      formatter={(v) => [`#${v}`, "Position"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="ranking" stroke="#3b82f6" strokeWidth={2.5}
                      dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} name="Position" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center bg-slate-50 rounded-xl">
                  <p className="text-slate-400 text-sm">Add more monthly entries to see trend chart</p>
                </div>
              )}

              {/* History table */}
              <div className="mt-4 border-t border-slate-50 pt-4">
                <p className="text-xs font-semibold text-slate-500 mb-3">Monthly History</p>
                <div className="space-y-2">
                  {[...selectedKw.history].reverse().map((h, i, arr) => {
                    const prev = arr[i + 1];
                    const diff = prev ? prev.ranking - h.ranking : 0;
                    return (
                      <div key={`${h.month}-${h.year}`} className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">{h.label}</span>
                        <div className="flex items-center gap-3">
                          {diff !== 0 && (
                            <span className={`text-xs font-semibold ${diff > 0 ? "text-green-600" : "text-red-500"}`}>
                              {diff > 0 ? "↑" : "↓"}{Math.abs(diff)}
                            </span>
                          )}
                          <span className="font-bold text-slate-800">#{h.ranking}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delete entries */}
              <div className="mt-4 pt-3 border-t border-slate-50">
                <p className="text-xs font-semibold text-slate-400 mb-2">Raw entries</p>
                <div className="space-y-1">
                  {entries.filter(e => e.keyword === selectedKw.keyword).map(e => (
                    <div key={e.id} className="flex items-center justify-between text-xs text-slate-500 group">
                      <span>{e.month} {e.year} — #{e.ranking}</span>
                      <button onClick={() => del(e.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center h-full flex flex-col items-center justify-center">
              <Target size={40} className="text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium">Select a keyword to see trend chart</p>
              <p className="text-slate-300 text-sm mt-1">Click any keyword from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
