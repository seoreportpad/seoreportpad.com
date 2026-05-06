"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import {
  Globe, TrendingUp, TrendingDown, CheckCircle2, FileText,
  BarChart3, Link2, Calendar, ExternalLink, ChevronUp, ChevronDown,
} from "lucide-react";

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
  };
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400">SEO Report</p>
              <p className="text-sm font-bold text-slate-700">{client.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar size={13} />
            <span>{r.month} {r.year}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-lg shadow-blue-200">
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide mb-1">Monthly SEO Report</p>
          <h1 className="text-3xl font-black mb-1">{r.month} {r.year}</h1>
          <p className="text-blue-200 text-base">{client.name}</p>
          {client.website && (
            <a href={client.website} target="_blank" rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm transition-colors">
              <Globe size={13} /> {client.website.replace(/^https?:\/\/(www\.)?/, "")}
              <ExternalLink size={11} />
            </a>
          )}
          {client.company && <p className="text-blue-300 text-sm mt-1">{client.company}</p>}
        </div>

        {/* Traffic Metrics */}
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
        <div className="text-center py-6 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Generated by SEO Report Manager · {r.month} {r.year} · {client.name}
          </p>
        </div>
      </div>
    </div>
  );
}
