"use client";
import { useEffect, useState, useRef } from "react";
import {
  Plus, Trash2, TrendingUp, TrendingDown, Minus,
  Search, Download, Target, ChevronUp, ChevronDown,
  Upload, Star, Bell, BellOff, Flag, Tag,
  AlertCircle, CheckCircle2, Globe, X,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
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
  clientName?: string;
  client_id?: string;
};

// Keyword meta stored in localStorage
const KW_META_KEY = "seo_kw_meta";
interface KwMeta { group?: string; featured_snippet?: boolean; alert?: boolean; difficulty?: number; }
function getKwMeta(): Record<string, KwMeta> {
  try { return JSON.parse(localStorage.getItem(KW_META_KEY)||"{}"); } catch { return {}; }
}
function saveKwMeta(d: Record<string, KwMeta>) { localStorage.setItem(KW_META_KEY, JSON.stringify(d)); }

function groupKeywords(entries: RankEntry[]): GroupedKeyword[] {
  const map = new Map<string, RankEntry[]>();
  for (const e of entries) {
    const key = `${e.client_id}::${e.keyword}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries()).map(([, rows]) => {
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
      keyword: rows[0].keyword,
      url: rows[0]?.url,
      search_volume: rows[0]?.search_volume,
      history,
      latest,
      prev,
      diff: prev - latest,
      clientName: rows[0]?.clients?.name,
      client_id: rows[0]?.client_id,
    };
  }).sort((a, b) => a.latest - b.latest);
}

export default function KeywordsPage() {
  const [entries, setEntries] = useState<RankEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClient, setFilterClient] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterRange, setFilterRange] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_id: "", keyword: "", ranking: "", search_volume: "",
    url: "", month: MONTHS[new Date().getMonth()], year: new Date().getFullYear(),
    group: "", featured_snippet: false, difficulty: "",
  });
  const [saving, setSaving] = useState(false);
  const [kwMeta, setKwMeta] = useState<Record<string, KwMeta>>({});
  const [importModal, setImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [metaPopover, setMetaPopover] = useState<string|null>(null);
  const [metaEdit, setMetaEdit] = useState<KwMeta>({});
  const fileRef = useRef<HTMLInputElement>(null);

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
    setKwMeta(getKwMeta());
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
    // Save meta
    if (form.group || form.featured_snippet || form.difficulty) {
      const meta = getKwMeta();
      meta[form.keyword] = { group: form.group||undefined, featured_snippet: form.featured_snippet||undefined, difficulty: form.difficulty?Number(form.difficulty):undefined };
      saveKwMeta(meta);
      setKwMeta(meta);
    }
    setSaving(false);
    setShowForm(false);
    setForm(f => ({ ...f, keyword: "", ranking: "", search_volume: "", url: "", group: "", featured_snippet: false, difficulty: "" }));
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/rank-history/${id}`, { method: "DELETE" });
    load();
  };

  const exportCSV = () => {
    const rows = [["Keyword", "Month", "Year", "Ranking", "Volume", "URL", "Client", "Group", "Difficulty"]];
    for (const e of entries) {
      const meta = kwMeta[e.keyword] ?? {};
      rows.push([e.keyword, e.month, String(e.year), String(e.ranking), String(e.search_volume ?? ""), e.url ?? "", e.clients?.name ?? "", meta.group ?? "", String(meta.difficulty ?? "")]);
    }
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `Keywords-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const handleCSVImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    const lines = importText.trim().split("\n");
    const header = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g,""));
    const kwIdx = header.findIndex(h => h.includes("keyword"));
    const rankIdx = header.findIndex(h => h.includes("rank") || h.includes("position"));
    const volIdx = header.findIndex(h => h.includes("volume") || h.includes("vol"));
    const urlIdx = header.findIndex(h => h.includes("url") || h.includes("page"));
    const clientIdx = header.findIndex(h => h.includes("client"));
    const monthIdx = header.findIndex(h => h.includes("month"));
    const yearIdx = header.findIndex(h => h.includes("year"));

    const defaultClient = filterClient !== "all" ? filterClient : clients[0]?.id ?? "";

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g,""));
      const keyword = kwIdx >= 0 ? cols[kwIdx] : cols[0];
      const ranking = rankIdx >= 0 ? Number(cols[rankIdx]) : Number(cols[1]);
      if (!keyword || isNaN(ranking)) continue;

      let cid = defaultClient;
      if (clientIdx >= 0 && cols[clientIdx]) {
        const found = clients.find(c => c.name.toLowerCase() === cols[clientIdx].toLowerCase());
        if (found) cid = found.id;
      }

      const now2 = new Date();
      await fetch("/api/rank-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: cid,
          keyword,
          ranking,
          search_volume: volIdx >= 0 ? Number(cols[volIdx]) || null : null,
          url: urlIdx >= 0 ? cols[urlIdx] : "",
          month: monthIdx >= 0 ? cols[monthIdx] : MONTHS[now2.getMonth()],
          year: yearIdx >= 0 ? Number(cols[yearIdx]) : now2.getFullYear(),
          tracked_at: new Date().toISOString(),
        }),
      }).catch(()=>{});
    }
    setImporting(false);
    setImportModal(false);
    setImportText("");
    load();
  };

  const toggleAlert = (keyword: string) => {
    const meta = getKwMeta();
    meta[keyword] = { ...(meta[keyword]??{}), alert: !meta[keyword]?.alert };
    saveKwMeta(meta);
    setKwMeta({...meta});
  };

  const toggleSnippet = (keyword: string) => {
    const meta = getKwMeta();
    meta[keyword] = { ...(meta[keyword]??{}), featured_snippet: !meta[keyword]?.featured_snippet };
    saveKwMeta(meta);
    setKwMeta({...meta});
  };

  const openMeta = (keyword: string) => {
    setMetaPopover(keyword);
    setMetaEdit({ ...(kwMeta[keyword] ?? {}) });
  };

  const saveMeta = (keyword: string) => {
    const meta = getKwMeta();
    meta[keyword] = metaEdit;
    saveKwMeta(meta);
    setKwMeta({...meta});
    setMetaPopover(null);
  };

  // Derived
  const allGroups = [...new Set(Object.values(kwMeta).map(m => m.group).filter(Boolean))] as string[];

  const filtered = entries.filter(e => {
    const matchSearch = !search || e.keyword.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const grouped = groupKeywords(filtered).filter(g => {
    if (filterGroup !== "all" && kwMeta[g.keyword]?.group !== filterGroup) return false;
    if (filterRange === "top3" && g.latest > 3) return false;
    if (filterRange === "top10" && g.latest > 10) return false;
    if (filterRange === "top20" && g.latest > 20) return false;
    if (filterRange === "dropped" && g.diff >= 0) return false;
    if (filterRange === "improved" && g.diff <= 0) return false;
    return true;
  });

  const selectedKw = grouped.find(g => g.keyword === selected);

  const improved = grouped.filter(g => g.diff > 0).length;
  const dropped = grouped.filter(g => g.diff < 0).length;
  const top10 = grouped.filter(g => g.latest <= 10).length;
  const top3 = grouped.filter(g => g.latest <= 3).length;
  const snippetCount = grouped.filter(g => kwMeta[g.keyword]?.featured_snippet).length;

  const posColor = (n: number) => n <= 3 ? "text-green-600" : n <= 10 ? "text-teal-600" : n <= 20 ? "text-amber-500" : "text-slate-400";
  const difficultyColor = (d?: number) => {
    if (!d) return "bg-slate-100 text-slate-500";
    if (d <= 30) return "bg-green-100 text-green-700";
    if (d <= 60) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Keyword Rank Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Track keyword positions month by month</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setImportModal(true)}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Upload size={15} /> Import CSV
          </button>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Tracked", value: grouped.length, color: "text-blue-600", bg: "bg-blue-50", filter: "all" },
          { label: "Top 3", value: top3, color: "text-green-600", bg: "bg-green-50", filter: "top3" },
          { label: "Top 10", value: top10, color: "text-teal-600", bg: "bg-teal-50", filter: "top10" },
          { label: "Improved", value: improved, color: "text-emerald-600", bg: "bg-emerald-50", filter: "improved" },
          { label: "Dropped", value: dropped, color: "text-red-500", bg: "bg-red-50", filter: "dropped" },
        ].map(({ label, value, color, bg, filter }) => (
          <button key={label} onClick={() => setFilterRange(filterRange===filter?"all":filter)}
            className={`${bg} rounded-2xl border shadow-sm px-5 py-4 text-left transition-all hover:-translate-y-0.5 ${filterRange===filter?"ring-2 ring-blue-400":""}`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Featured Snippet count */}
      {snippetCount > 0 && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Star size={15} className="text-amber-500 shrink-0"/>
          <p className="text-sm font-semibold text-amber-800">{snippetCount} keyword{snippetCount!==1?"s":""} with Featured Snippet</p>
        </div>
      )}

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
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Keyword Group</label>
                <input value={form.group} onChange={e => setForm({ ...form, group: e.target.value })}
                  placeholder="e.g. Local, Services, Blog"
                  list="group-list"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <datalist id="group-list">{allGroups.map(g => <option key={g} value={g}/>)}</datalist>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Difficulty (1-100)</label>
                <input type="number" min="1" max="100" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                  placeholder="e.g. 45"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="mb-4 flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Target URL</label>
                <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="https://example.com/page"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured_snippet} onChange={e => setForm({...form, featured_snippet: e.target.checked})} className="w-4 h-4 rounded"/>
                  <span className="text-sm font-semibold text-amber-700 flex items-center gap-1"><Star size={13}/> Featured Snippet</span>
                </label>
              </div>
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
        {allGroups.length > 0 && (
          <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm">
            <option value="all">All Groups</option>
            {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        )}
        {(filterRange !== "all" || filterGroup !== "all") && (
          <button onClick={() => { setFilterRange("all"); setFilterGroup("all"); }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl px-3 py-2 bg-white shadow-sm">
            <X size={12}/> Clear
          </button>
        )}
      </div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Keyword table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <p className="font-bold text-slate-700 text-sm">{grouped.length} keywords</p>
            {filterRange !== "all" && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold capitalize">{filterRange}</span>
            )}
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
              {grouped.map(g => {
                const meta = kwMeta[g.keyword] ?? {};
                return (
                  <div key={`${g.client_id}::${g.keyword}`}
                    className={`flex items-center gap-2 px-4 py-3 hover:bg-slate-50/60 transition-colors cursor-pointer ${selected === g.keyword ? "bg-blue-50/60 border-l-2 border-blue-500" : ""}`}
                    onClick={() => setSelected(selected === g.keyword ? null : g.keyword)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-slate-700 truncate">{g.keyword}</p>
                        {meta.featured_snippet && <span title="Featured Snippet"><Star size={11} className="text-amber-400 shrink-0" /></span>}
                        {meta.alert && <span title="Alert on"><Bell size={11} className="text-blue-400 shrink-0" /></span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {g.search_volume && <p className="text-xs text-slate-400">{g.search_volume.toLocaleString()}/mo</p>}
                        {meta.group && <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-semibold">{meta.group}</span>}
                        {meta.difficulty != null && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${difficultyColor(meta.difficulty)}`}>KD {meta.difficulty}</span>
                        )}
                        {g.clientName && <span className="text-[10px] text-slate-400">{g.clientName}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-lg font-black ${posColor(g.latest)}`}>#{g.latest}</p>
                      {g.diff !== 0 && (
                        <span className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${g.diff > 0 ? "text-green-600" : "text-red-500"}`}>
                          {g.diff > 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {Math.abs(g.diff)}
                        </span>
                      )}
                    </div>
                    {/* Quick meta actions */}
                    <div className="flex flex-col gap-1 ml-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleSnippet(g.keyword)} title="Toggle Featured Snippet"
                        className={`p-1 rounded-lg transition-colors ${meta.featured_snippet?"text-amber-500 bg-amber-50":"text-slate-300 hover:text-amber-400"}`}>
                        <Star size={11}/>
                      </button>
                      <button onClick={() => toggleAlert(g.keyword)} title="Toggle Rank Alert"
                        className={`p-1 rounded-lg transition-colors ${meta.alert?"text-blue-500 bg-blue-50":"text-slate-300 hover:text-blue-400"}`}>
                        {meta.alert ? <Bell size={11}/> : <BellOff size={11}/>}
                      </button>
                      <button onClick={() => openMeta(g.keyword)} title="Edit group/difficulty"
                        className="p-1 rounded-lg text-slate-300 hover:text-violet-500 transition-colors">
                        <Tag size={11}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart panel */}
        <div className="lg:col-span-3 space-y-4">
          {selectedKw ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-slate-800 text-lg">{selectedKw.keyword}</h2>
                    {kwMeta[selectedKw.keyword]?.featured_snippet && (
                      <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                        <Star size={10}/> Featured Snippet
                      </span>
                    )}
                    {kwMeta[selectedKw.keyword]?.group && (
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
                        {kwMeta[selectedKw.keyword].group}
                      </span>
                    )}
                  </div>
                  {selectedKw.url && (
                    <a href={selectedKw.url} target="_blank" rel="noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                      <Globe size={10}/> {selectedKw.url}
                    </a>
                  )}
                  {selectedKw.clientName && (
                    <p className="text-xs text-slate-400 mt-0.5">Client: {selectedKw.clientName}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-black text-slate-800`}>#{selectedKw.latest}</p>
                  {selectedKw.diff !== 0 && (
                    <span className={`flex items-center justify-end gap-1 text-sm font-semibold ${selectedKw.diff > 0 ? "text-green-600" : "text-red-500"}`}>
                      {selectedKw.diff > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {selectedKw.diff > 0 ? "+" : ""}{selectedKw.diff} positions
                    </span>
                  )}
                  {selectedKw.diff === 0 && <span className="flex items-center justify-end gap-1 text-sm text-slate-400"><Minus size={12} /> No change</span>}
                  {kwMeta[selectedKw.keyword]?.difficulty != null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block ${difficultyColor(kwMeta[selectedKw.keyword].difficulty)}`}>
                      KD {kwMeta[selectedKw.keyword].difficulty}
                    </span>
                  )}
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

              {/* Monthly History */}
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
                          <span className={`font-bold ${posColor(h.ranking)}`}>#{h.ranking}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Target URL mapping */}
              {!selectedKw.url && (
                <div className="mt-4 pt-3 border-t border-slate-50">
                  <p className="text-xs text-amber-600 flex items-center gap-1"><AlertCircle size={11}/> No target URL mapped for this keyword</p>
                </div>
              )}

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

      {/* Meta Popover */}
      {metaPopover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Keyword Details</h3>
              <button onClick={()=>setMetaPopover(null)} className="text-slate-400 hover:text-slate-700"><X size={16}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Keyword Group</label>
                <input value={metaEdit.group??""} onChange={e=>setMetaEdit({...metaEdit,group:e.target.value})}
                  placeholder="e.g. Local, Services"
                  list="group-list2"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <datalist id="group-list2">{allGroups.map(g=><option key={g} value={g}/>)}</datalist>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Keyword Difficulty (1-100)</label>
                <input type="number" min="1" max="100" value={metaEdit.difficulty??""} onChange={e=>setMetaEdit({...metaEdit,difficulty:Number(e.target.value)})}
                  placeholder="e.g. 45"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!metaEdit.featured_snippet} onChange={e=>setMetaEdit({...metaEdit,featured_snippet:e.target.checked})} className="w-4 h-4"/>
                  <span className="text-sm text-amber-700 flex items-center gap-1"><Star size={13}/> Featured Snippet</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!metaEdit.alert} onChange={e=>setMetaEdit({...metaEdit,alert:e.target.checked})} className="w-4 h-4"/>
                  <span className="text-sm text-blue-700 flex items-center gap-1"><Bell size={13}/> Alert</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setMetaPopover(null)} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={()=>saveMeta(metaPopover)} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {importModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Import Keywords from CSV</h3>
              <button onClick={()=>{setImportModal(false);setImportText("")}} className="text-slate-400 hover:text-slate-700"><X size={18}/></button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              CSV headers: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">keyword, ranking, search_volume, url, month, year, client</code>
            </p>
            <div className="mb-4">
              <input ref={fileRef} type="file" accept=".csv" onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>setImportText((ev.target?.result as string)||"");r.readAsText(f);}} className="hidden"/>
              <button onClick={()=>fileRef.current?.click()}
                className="flex items-center gap-2 border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 w-full justify-center hover:border-blue-300 hover:text-blue-600 transition-colors mb-3">
                <Upload size={16}/> Upload CSV file
              </button>
              <textarea rows={5} value={importText} onChange={e=>setImportText(e.target.value)}
                placeholder={"keyword,ranking,search_volume\nseo agency lahore,5,1200\ndigital marketing pakistan,12,800"}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none" />
              {filterClient === "all" && clients.length > 0 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><AlertCircle size={11}/> Select a client filter above to auto-assign imported keywords</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={()=>{setImportModal(false);setImportText("")}} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={handleCSVImport} disabled={importing||!importText.trim()}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {importing ? "Importing..." : "Import Keywords"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
