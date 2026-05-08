"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import {
  Globe, TrendingUp, TrendingDown, CheckCircle2, FileText,
  BarChart3, Link2, Calendar, ExternalLink, ChevronUp, ChevronDown,
  Activity, Target, Layers, Shield,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell,
} from "recharts";

interface PortalData {
  token: string;
  reports: {
    id: string; month: string; year: number; status: string;
    clients: { name: string; email: string; website: string; company?: string };
    keywords: { keyword: string; prev_ranking: number; curr_ranking: number; search_volume?: number; url?: string }[];
    work_done: { category: string; task: string }[];
    metrics: {
      organic_traffic?: number; prev_traffic?: number;
      backlinks?: number; prev_backlinks?: number;
      domain_authority?: number; prev_da?: number;
      impressions?: number; clicks?: number; avg_position?: number;
      technical_fixed?: number; pages_indexed?: number;
      notes?: string; recommendations?: string;
    } | null;
    on_page_seo?: { on_page_score?: number };
    local_seo?: { local_seo_score?: number };
    technical_seo?: { technical_score?: number };
    schema_seo?: { schema_score?: string };
    backlinks: { source_url: string; target_url: string; anchor_text?: string; da?: number; status?: string }[];
    competitors: { name: string; website: string; da?: number; keywords?: string }[];
    rank_history: { keyword: string; position: number; month: string; year: number }[];
    agency: { agency_name: string; logo_url?: string; primary_color?: string } | null;
  };
  history: { id: string; month: string; year: number; token: string }[];
  tasks: { id: string; title: string; status: string; category: string }[];
}

function Diff({ curr, prev, reverse = false }: { curr?: number; prev?: number; reverse?: boolean }) {
  if (curr == null || prev == null) return null;
  const diff = curr - prev;
  const positive = reverse ? diff < 0 : diff > 0;
  if (diff === 0) return <span className="text-slate-400 text-xs font-medium">±0</span>;
  return (
    <span className={`text-xs font-semibold flex items-center gap-0.5 ${positive ? "text-green-600" : "text-red-500"}`}>
      {positive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      {Math.abs(diff).toLocaleString()}
    </span>
  );
}

function MetricCard({ label, value, prev, unit = "", reverse = false, color = "text-blue-600", bg = "bg-blue-50" }: {
  label: string; value?: number; prev?: number; unit?: string; reverse?: boolean; color?: string; bg?: string;
}) {
  if (value == null) return null;
  return (
    <div className={`${bg} rounded-2xl px-5 py-4 border border-slate-100`}>
      <p className={`text-2xl font-black ${color}`}>{value.toLocaleString()}{unit}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {prev != null && (
        <div className="mt-1">
          <Diff curr={value} prev={prev} reverse={reverse} />
        </div>
      )}
    </div>
  );
}

export default function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/portal?token=${token}`)
      .then(r => r.ok ? r.json() : r.json().then((e: { error?: string }) => Promise.reject(e.error || "Not found")))
      .then(d => setData(d))
      .catch(e => setError(typeof e === "string" ? e : "Invalid or expired link"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Loading your SEO report...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText size={28} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-700 mb-2">Link Not Found</h1>
        <p className="text-slate-400">{error || "This report link is invalid or has expired."}</p>
      </div>
    </div>
  );

  const r = data.reports;
  const m = r.metrics;
  const client = r.clients;

  const WORK_CATEGORIES = [
    "Backlinks", "Technical SEO", "On-Page SEO", "Content",
    "Local SEO", "GSC / Analytics", "Reporting", "Other",
  ];
  const workByCategory = WORK_CATEGORIES.reduce<Record<string, string[]>>((acc, cat) => {
    const tasks = r.work_done.filter(w => w.category === cat).map(w => w.task);
    if (tasks.length) acc[cat] = tasks;
    return acc;
  }, {});

  const improved = r.keywords.filter(k => k.curr_ranking < k.prev_ranking).length;
  const dropped = r.keywords.filter(k => k.curr_ranking > k.prev_ranking).length;
  const top10 = r.keywords.filter(k => k.curr_ranking <= 10).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {r.agency?.logo_url ? (
              <img src={r.agency.logo_url} alt={r.agency.agency_name} className="h-8 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black" 
                style={{ background: r.agency?.primary_color || "#2563eb" }}>
                {r.agency?.agency_name?.slice(0, 2).toUpperCase() || "SR"}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400">{r.agency?.agency_name || "SEO Report"}</p>
              <p className="text-sm font-bold text-slate-700">{client.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Calendar size={13} />
              <span>{r.month} {r.year}</span>
            </div>
            
            {data.history.length > 1 && (
              <div className="relative group">
                <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                  Report History <ChevronDown size={14} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                   <div className="p-3 bg-slate-50 border-b border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Past Reports</p>
                   </div>
                   <div className="max-h-60 overflow-y-auto">
                     {data.history.map(h => (
                       <Link key={h.id} href={`/portal/${h.token}`} className={`block px-4 py-3 text-xs font-medium hover:bg-slate-50 transition-colors ${h.id === r.id ? "text-blue-600 bg-blue-50/50" : "text-slate-600"}`}>
                         {h.month} {h.year} {h.id === r.id && "•"}
                       </Link>
                     ))}
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="rounded-3xl p-8 text-white shadow-lg shadow-blue-100"
          style={{ background: `linear-gradient(135deg, ${r.agency?.primary_color || "#2563eb"}, ${r.agency?.primary_color ? r.agency.primary_color + "dd" : "#1d4ed8"})` }}>
          <p className="text-white/70 text-sm font-semibold uppercase tracking-wide mb-1">Monthly SEO Report</p>
          <h1 className="text-3xl font-black mb-1">{r.month} {r.year}</h1>
          <p className="text-white/80 text-base">{client.name}</p>
          {client.website && (
            <a href={client.website} target="_blank" rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors">
              <Globe size={13} /> {client.website.replace(/^https?:\/\/(www\.)?/, "")}
              <ExternalLink size={11} />
            </a>
          )}
          {client.company && <p className="text-white/60 text-sm mt-1">{client.company}</p>}
        </div>

        {/* SEO Scores Radar & Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Activity size={16} className="text-blue-600" /> SEO Category Scores
            </h2>
            {(() => {
              const scores = [
                { subject: "On-Page", A: r.on_page_seo?.on_page_score ?? 0, fullMark: 100 },
                { subject: "Local", A: r.local_seo?.local_seo_score ?? 0, fullMark: 100 },
                { subject: "Technical", A: r.technical_seo?.technical_score ? Number(r.technical_seo.technical_score) : 0, fullMark: 100 },
                { subject: "Schema", A: r.schema_seo?.schema_score ? Number(r.schema_seo.schema_score) : 0, fullMark: 100 },
              ];
              return (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={scores}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <TrendingUp size={16} className="text-green-600" /> Improvement Stats
            </h2>
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400">Monthly Traffic Growth</p>
                  <p className="text-2xl font-black text-slate-800">
                    {m?.organic_traffic && m?.prev_traffic 
                      ? `${Math.round(((m.organic_traffic - m.prev_traffic) / (m.prev_traffic || 1)) * 100)}%`
                      : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Keywords in Top 10</p>
                  <p className="text-2xl font-black text-slate-800">{top10}</p>
                </div>
              </div>
              <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Backlink Growth</p>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (m?.backlinks || 0) / ((m?.prev_backlinks || 1) / 100))}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                  <span>PREV: {m?.prev_backlinks || 0}</span>
                  <span className="text-blue-600">NOW: {m?.backlinks || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {m && (
          <div>
            <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-600" /> Performance Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MetricCard label="Organic Traffic" value={m.organic_traffic} prev={m.prev_traffic} color="text-blue-600" bg="bg-blue-50" />
              <MetricCard label="Backlinks" value={m.backlinks} prev={m.prev_backlinks} color="text-violet-600" bg="bg-violet-50" />
              <MetricCard label="Domain Authority" value={m.domain_authority} prev={m.prev_da} color="text-teal-600" bg="bg-teal-50" />
              <MetricCard label="Impressions" value={m.impressions} color="text-orange-600" bg="bg-orange-50" />
              <MetricCard label="Clicks (GSC)" value={m.clicks} color="text-pink-600" bg="bg-pink-50" />
              {m.avg_position != null && (
                <div className="bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
                  <p className="text-2xl font-black text-slate-700">{m.avg_position.toFixed(1)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Avg Position</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rank History Trends */}
        {r.rank_history.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-700 mb-5 flex items-center gap-2 text-sm uppercase tracking-wider">
              <TrendingUp size={16} className="text-blue-600" /> Keyword Position Trends
            </h2>
            {(() => {
              const byKeyword: Record<string, { month: string; position: number }[]> = {};
              r.rank_history.forEach(rh => {
                if (!byKeyword[rh.keyword]) byKeyword[rh.keyword] = [];
                byKeyword[rh.keyword].push({ month: `${rh.month} ${rh.year}`, position: rh.position });
              });
              const keywords = Object.keys(byKeyword).slice(0, 5);
              const monthSet = [...new Set(r.rank_history.map(rh => `${rh.month} ${rh.year}`))];
              const chartData = monthSet.map(m => {
                const row: any = { month: m };
                keywords.forEach(kw => {
                  const entry = byKeyword[kw]?.find(e => e.month === m);
                  if (entry) row[kw] = entry.position;
                });
                return row;
              });
              const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
              return (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis reversed tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "20px" }} />
                      {keywords.map((kw, i) => (
                        <Line key={kw} type="monotone" dataKey={kw} stroke={colors[i % colors.length]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name={kw} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>
        )}

        {/* Keywords */}
        {r.keywords.length > 0 && (
          <div>
            <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-600" /> Keyword Rankings
            </h2>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {[
                { label: "Top 10", value: top10, color: "text-teal-600", bg: "bg-teal-50" },
                { label: "Improved", value: improved, color: "text-green-600", bg: "bg-green-50" },
                { label: "Dropped", value: dropped, color: "text-red-500", bg: "bg-red-50" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-2xl px-4 py-3 border border-slate-100 text-center`}>
                  <p className={`text-xl font-black ${color}`}>{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Keyword</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Previous</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Current</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {r.keywords.map((kw, i) => {
                    const diff = kw.prev_ranking - kw.curr_ranking;
                    const rankColor = kw.curr_ranking <= 3 ? "text-green-600" : kw.curr_ranking <= 10 ? "text-teal-600" : kw.curr_ranking <= 20 ? "text-amber-600" : "text-slate-500";
                    return (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3 font-medium text-slate-700">{kw.keyword}</td>
                        <td className="px-4 py-3 text-center text-slate-400">#{kw.prev_ranking}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${rankColor}`}>#{kw.curr_ranking}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {diff > 0 ? (
                            <span className="flex items-center justify-center gap-0.5 text-green-600 text-xs font-semibold">
                              <TrendingUp size={11} /> +{diff}
                            </span>
                          ) : diff < 0 ? (
                            <span className="flex items-center justify-center gap-0.5 text-red-500 text-xs font-semibold">
                              <TrendingDown size={11} /> {diff}
                            </span>
                          ) : <span className="text-slate-300 text-xs">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Work Done */}
        {r.work_done.length > 0 && (
          <div>
            <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-600" /> Work Completed This Month
            </h2>
            <div className="space-y-3">
              {Object.entries(workByCategory).map(([cat, tasks]) => (
                <div key={cat} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-50">
                    <p className="text-sm font-bold text-slate-700">{cat}</p>
                  </div>
                  <ul className="divide-y divide-slate-50">
                    {tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-3 px-5 py-3">
                        <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategy Roadmap */}
        {data.tasks.length > 0 && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Activity size={24} className="text-blue-600" /> Strategy Roadmap
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Real-time status of your SEO campaign</p>
              </div>
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                {["todo", "in-progress", "completed"].map(s => (
                  <div key={s} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {s.replace("-", " ")}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {(["todo", "in-progress", "completed"] as const).map(status => (
                <div key={status} className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 px-1">
                    <span className={`w-2 h-2 rounded-full ${status === "completed" ? "bg-emerald-500" : status === "in-progress" ? "bg-amber-500" : "bg-slate-300"}`} />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{status.replace("-", " ")}</span>
                  </div>
                  <div className="space-y-3">
                    {data.tasks.filter(t => t.status === status).map(task => (
                      <div key={task.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 hover:border-slate-200 transition-colors">
                         <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-2">{task.category}</span>
                         <p className="text-sm font-bold text-slate-700 leading-snug">{task.title}</p>
                      </div>
                    ))}
                    {data.tasks.filter(t => t.status === status).length === 0 && (
                      <div className="h-20 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase">No Tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Backlinks & Competitors */}
        <div className="grid md:grid-cols-2 gap-6">
          {r.backlinks.length > 0 && (
            <div>
              <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Link2 size={16} className="text-blue-600" /> New Backlinks
              </h2>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {r.backlinks.slice(0, 5).map((bl, i) => (
                    <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                      <p className="text-sm font-bold text-slate-700 truncate">{bl.source_url}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">DA {bl.da || "?"}</span>
                        <span className="text-[10px] text-slate-400 truncate flex-1 italic">{bl.anchor_text || "No anchor text"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {r.competitors.length > 0 && (
            <div>
              <h2 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Target size={16} className="text-red-500" /> Competitors
              </h2>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {r.competitors.slice(0, 5).map((comp, i) => (
                    <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{comp.name}</p>
                        <p className="text-[10px] text-slate-400">{comp.website.replace(/^https?:\/\/(www\.)?/, "")}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-700">DA {comp.da || "?"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes & Recommendations */}
        {(m?.notes || m?.recommendations) && (
          <div className="grid md:grid-cols-2 gap-4">
            {m?.notes && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <h3 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                  <Link2 size={14} /> Notes
                </h3>
                <p className="text-blue-700 text-sm leading-relaxed whitespace-pre-line">{m.notes}</p>
              </div>
            )}
            {m?.recommendations && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <h3 className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-2">
                  <TrendingUp size={14} /> Recommendations
                </h3>
                <p className="text-amber-700 text-sm leading-relaxed whitespace-pre-line">{m.recommendations}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-10 border-t border-slate-200">
          {r.agency?.logo_url ? (
            <img src={r.agency.logo_url} alt={r.agency.agency_name} className="h-6 w-auto mx-auto mb-4 grayscale opacity-50" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black mx-auto mb-4">
              {r.agency?.agency_name?.slice(0, 2).toUpperCase() || "SR"}
            </div>
          )}
          <p className="text-sm font-bold text-slate-500 mb-1">{r.agency?.agency_name || "SEO Report Pad"}</p>
          <p className="text-xs text-slate-400">
            Professional SEO Reporting Dashboard · {r.month} {r.year}
          </p>
        </div>
      </div>
    </div>
  );
}
