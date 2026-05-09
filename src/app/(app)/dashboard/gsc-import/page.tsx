"use client";
import { useEffect, useState, useRef } from "react";
import { Upload, BarChart3, TrendingUp, Eye, MousePointer, Search, Trash2, Download, AlertCircle, CheckCircle2 } from "lucide-react";

interface GSCRow { query: string; clicks: number; impressions: number; ctr: number; position: number; }
interface GARow { page: string; sessions: number; users: number; pageviews: number; bounce_rate: number; }
interface ImportSet {
  id: string; name: string; type: "gsc" | "ga"; date: string;
  gsc_rows: GSCRow[]; ga_rows: GARow[]; created_at: string;
}

const LS_KEY = "seo_gsc_imports_v1";
function load(): ImportSet[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function persist(d: ImportSet[]) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function parseCSV(text: string): string[][] {
  return text.trim().split("\n").map(line => {
    const cols: string[] = []; let cur = ""; let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    cols.push(cur.trim()); return cols;
  });
}

function parseGSC(text: string): GSCRow[] {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  const header = rows[0].map(h => h.toLowerCase().replace(/[^a-z]/g, ""));
  const qi = header.findIndex(h => h.includes("quer") || h.includes("keyword") || h.includes("search"));
  const cli = header.findIndex(h => h.includes("click"));
  const impi = header.findIndex(h => h.includes("imp"));
  const ctri = header.findIndex(h => h.includes("ctr"));
  const posi = header.findIndex(h => h.includes("pos") || h.includes("rank"));
  return rows.slice(1).map(r => ({
    query: r[qi >= 0 ? qi : 0] || "",
    clicks: Number((r[cli >= 0 ? cli : 1] || "0").replace(/[^0-9.]/g, "")) || 0,
    impressions: Number((r[impi >= 0 ? impi : 2] || "0").replace(/[^0-9.]/g, "")) || 0,
    ctr: parseFloat((r[ctri >= 0 ? ctri : 3] || "0").replace(/[^0-9.]/g, "")) || 0,
    position: parseFloat((r[posi >= 0 ? posi : 4] || "0").replace(/[^0-9.]/g, "")) || 0,
  })).filter(r => r.query);
}

function parseGA(text: string): GARow[] {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  const header = rows[0].map(h => h.toLowerCase().replace(/[^a-z]/g, ""));
  const pi = header.findIndex(h => h.includes("page") || h.includes("url") || h.includes("path"));
  const si = header.findIndex(h => h.includes("sess"));
  const ui = header.findIndex(h => h.includes("user"));
  const pvi = header.findIndex(h => h.includes("pageview") || h.includes("view"));
  const bi = header.findIndex(h => h.includes("bounce"));
  return rows.slice(1).map(r => ({
    page: r[pi >= 0 ? pi : 0] || "",
    sessions: Number((r[si >= 0 ? si : 1] || "0").replace(/[^0-9.]/g, "")) || 0,
    users: Number((r[ui >= 0 ? ui : 2] || "0").replace(/[^0-9.]/g, "")) || 0,
    pageviews: Number((r[pvi >= 0 ? pvi : 3] || "0").replace(/[^0-9.]/g, "")) || 0,
    bounce_rate: parseFloat((r[bi >= 0 ? bi : 4] || "0").replace(/[^0-9.]/g, "")) || 0,
  })).filter(r => r.page);
}

export default function GSCImportPage() {
  const [imports, setImports] = useState<ImportSet[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [importType, setImportType] = useState<"gsc" | "ga">("gsc");
  const [importName, setImportName] = useState("");
  const [importDate, setImportDate] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImports(load());
    setImportDate(new Date().toISOString().slice(0, 10));
  }, []);
  const save = (d: ImportSet[]) => { setImports(d); persist(d); };

  const processFile = (file: File) => {
    setError(""); setSuccess("");
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) { setError("Please upload a CSV file."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const name = importName || file.name.replace(/\.[^.]+$/, "");
      if (importType === "gsc") {
        const rows = parseGSC(text);
        if (!rows.length) { setError("Could not parse GSC data. Make sure the CSV has Query, Clicks, Impressions, CTR, Position columns."); return; }
        const entry: ImportSet = { id: uid(), name, type: "gsc", date: importDate, gsc_rows: rows, ga_rows: [], created_at: new Date().toISOString() };
        const updated = [entry, ...imports]; save(updated); setSelected(entry.id);
        setSuccess(`Imported ${rows.length} GSC rows successfully.`);
      } else {
        const rows = parseGA(text);
        if (!rows.length) { setError("Could not parse GA data. Make sure the CSV has Page, Sessions, Users, Pageviews columns."); return; }
        const entry: ImportSet = { id: uid(), name, type: "ga", date: importDate, gsc_rows: [], ga_rows: rows, created_at: new Date().toISOString() };
        const updated = [entry, ...imports]; save(updated); setSelected(entry.id);
        setSuccess(`Imported ${rows.length} GA rows successfully.`);
      }
      setImportName("");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const deleteImport = (id: string) => {
    if (!confirm("Delete this import?")) return;
    save(imports.filter(i => i.id !== id));
    if (selected === id) setSelected(null);
  };

  const current = imports.find(i => i.id === selected);
  const gscFiltered = (current?.gsc_rows || []).filter(r => !search || r.query.toLowerCase().includes(search.toLowerCase()));
  const gaFiltered = (current?.ga_rows || []).filter(r => !search || r.page.toLowerCase().includes(search.toLowerCase()));

  const gscTotals = (rows: GSCRow[]) => ({
    clicks: rows.reduce((s, r) => s + r.clicks, 0),
    impressions: rows.reduce((s, r) => s + r.impressions, 0),
    avgCtr: rows.length ? (rows.reduce((s, r) => s + r.ctr, 0) / rows.length) : 0,
    avgPos: rows.length ? (rows.reduce((s, r) => s + r.position, 0) / rows.length) : 0,
  });

  const exportCurrentCSV = () => {
    if (!current) return;
    let rows: string[][];
    if (current.type === "gsc") {
      rows = [["Query", "Clicks", "Impressions", "CTR", "Position"], ...current.gsc_rows.map(r => [r.query, String(r.clicks), String(r.impressions), String(r.ctr), String(r.position)])];
    } else {
      rows = [["Page", "Sessions", "Users", "Pageviews", "Bounce Rate"], ...current.ga_rows.map(r => [r.page, String(r.sessions), String(r.users), String(r.pageviews), String(r.bounce_rate)])];
    }
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${current.name}.csv`; a.click();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">GSC & GA Data Import</h1>
          <p className="text-slate-500 text-sm mt-1">Upload CSV exports from Google Search Console or Google Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Upload panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-700 mb-4">Import Data</h2>

            <div className="flex gap-2 mb-4">
              {(["gsc", "ga"] as const).map(t => (
                <button key={t} onClick={() => setImportType(t)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-colors ${importType === t ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {t === "gsc" ? "Search Console" : "Analytics"}
                </button>
              ))}
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Import Name</label>
                <input value={importName} onChange={e => setImportName(e.target.value)} placeholder="e.g. Client A - May 2025"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Report Date</label>
                <input type="date" value={importDate} onChange={e => setImportDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
            </div>

            <div
              onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}>
              <Upload size={28} className={`mx-auto mb-3 ${dragging ? "text-blue-500" : "text-slate-300"}`} />
              <p className="text-sm font-semibold text-slate-600 mb-1">Drop CSV here or click to upload</p>
              <p className="text-xs text-slate-400">Export from {importType === "gsc" ? "Google Search Console → Performance → Export" : "Google Analytics → Reports → Export"}</p>
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.target.value = ""; }} />
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="mt-3 flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-700">{success}</p>
              </div>
            )}

            <div className="mt-4 bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-600">How to export from GSC:</p>
              <p>1. Open Search Console → Performance</p>
              <p>2. Set date range → Click Export → CSV</p>
              <p className="font-semibold text-slate-600 mt-2">How to export from GA4:</p>
              <p>1. Reports → Pages and Screens</p>
              <p>2. Click share icon → Download CSV</p>
            </div>
          </div>

          {/* Import history */}
          {imports.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-700 text-sm">Import History</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {imports.map(imp => (
                  <div key={imp.id} onClick={() => setSelected(selected === imp.id ? null : imp.id)}
                    className={`px-4 py-3 cursor-pointer transition-colors group ${selected === imp.id ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{imp.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${imp.type === "gsc" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                            {imp.type === "gsc" ? "GSC" : "GA"}
                          </span>
                          <span className="text-xs text-slate-400">{imp.date}</span>
                          <span className="text-xs text-slate-400">{imp.type === "gsc" ? imp.gsc_rows.length : imp.ga_rows.length} rows</span>
                        </div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); deleteImport(imp.id); }}
                        className="p-1 text-slate-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data view */}
        <div className="lg:col-span-2">
          {!current ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <BarChart3 size={40} className="text-slate-200 mb-4" />
              <p className="text-slate-500 font-semibold">Upload a CSV or select an import to view data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {current.type === "gsc" && (() => {
                const t = gscTotals(current.gsc_rows);
                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Total Clicks", value: t.clicks.toLocaleString(), color: "text-blue-600", bg: "bg-blue-50", Icon: MousePointer },
                        { label: "Impressions", value: t.impressions.toLocaleString(), color: "text-violet-600", bg: "bg-violet-50", Icon: Eye },
                        { label: "Avg CTR", value: t.avgCtr.toFixed(2) + "%", color: "text-teal-600", bg: "bg-teal-50", Icon: TrendingUp },
                        { label: "Avg Position", value: t.avgPos.toFixed(1), color: "text-amber-600", bg: "bg-amber-50", Icon: Search },
                      ].map(({ label, value, color, bg, Icon }) => (
                        <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-4 py-3`}>
                          <div className="flex items-center gap-2 mb-1"><Icon size={14} className={`${color} opacity-70`} /></div>
                          <p className={`text-xl font-black ${color}`}>{value}</p>
                          <p className="text-xs text-slate-500">{label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                        <h3 className="font-bold text-slate-700">{current.name} — {current.gsc_rows.length} queries</h3>
                        <div className="flex gap-2">
                          <div className="relative">
                            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter queries..."
                              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-40" />
                          </div>
                          <button onClick={exportCurrentCSV} className="flex items-center gap-1.5 text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                            <Download size={12} /> Export
                          </button>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100">
                              <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest">Query</th>
                              <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Clicks</th>
                              <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Impressions</th>
                              <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">CTR</th>
                              <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Position</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {gscFiltered.slice(0, 200).map((r, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{r.query}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-blue-600 text-right">{r.clicks.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 text-right">{r.impressions.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-slate-600 text-right">{r.ctr}%</td>
                                <td className="px-4 py-3 text-sm text-right">
                                  <span className={`font-bold ${r.position <= 3 ? "text-green-600" : r.position <= 10 ? "text-blue-600" : r.position <= 20 ? "text-amber-600" : "text-slate-500"}`}>
                                    {r.position.toFixed(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {gscFiltered.length > 200 && <p className="text-xs text-slate-400 text-center py-3">Showing 200 of {gscFiltered.length} rows</p>}
                      </div>
                    </div>
                  </>
                );
              })()}

              {current.type === "ga" && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                    <h3 className="font-bold text-slate-700">{current.name} — {current.ga_rows.length} pages</h3>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter pages..."
                          className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-40" />
                      </div>
                      <button onClick={exportCurrentCSV} className="flex items-center gap-1.5 text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                        <Download size={12} /> Export
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-100">
                          <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest">Page</th>
                          <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Sessions</th>
                          <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Users</th>
                          <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Pageviews</th>
                          <th className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Bounce %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {gaFiltered.slice(0, 200).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{r.page}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">{r.sessions.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-slate-600 text-right">{r.users.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-slate-600 text-right">{r.pageviews.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <span className={`font-semibold ${r.bounce_rate > 70 ? "text-red-500" : r.bounce_rate > 50 ? "text-amber-600" : "text-green-600"}`}>
                                {r.bounce_rate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {gaFiltered.length > 200 && <p className="text-xs text-slate-400 text-center py-3">Showing 200 of {gaFiltered.length} rows</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
