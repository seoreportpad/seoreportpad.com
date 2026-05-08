"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, FileText, TrendingUp, TrendingDown, Plus,
  ArrowRight, ClipboardCheck, AlertCircle, CheckCircle2,
  Lightbulb, Calendar, BarChart3, StickyNote,
  BookOpen, Zap, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface RecentReport {
  id: string; month: string; year: number; status: string;
  clients: { name: string; website: string };
  metrics?: { organic_traffic?: number; prev_traffic?: number };
}

interface ClientHealth {
  id: string; name: string; website: string;
  latestReport?: { month: string; year: number; status: string };
  traffic?: number; prevTraffic?: number;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface AuditScore { found: number; fixed: number; checked: number; total: number; }

function HealthRing({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
      <circle cx="50" cy="50" r={r} fill="none" strokeWidth="10"
        stroke={color} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }} />
    </svg>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ clients: 0, reports: 0, notes: 0, prompts: 0 });
  const [recent, setRecent] = useState<RecentReport[]>([]);
  const [audit, setAudit] = useState<AuditScore>({ found: 0, fixed: 0, checked: 0, total: 180 });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ month: string; traffic: number }[]>([]);
  const [clientHealth, setClientHealth] = useState<ClientHealth[]>([]);

  useEffect(() => {
    const safe = (url: string) =>
      fetch(url).then(r => r.ok ? r.json() : []).catch(() => []);

    // Fetch audit data from API instead of localStorage
    fetch("/api/audit/results")
      .then(r => r.json())
      .then(data => {
        const vals = Object.values(data || {}) as string[];
        setAudit({
          found: vals.filter(v => v === "found").length,
          fixed: vals.filter(v => v === "fixed").length,
          checked: vals.filter(v => v !== "none").length,
          total: 180,
        });
      })
      .catch(() => {});

    Promise.all([
      safe("/api/clients"),
      safe("/api/reports"),
      safe("/api/notes"),
      safe("/api/prompts"),
    ]).then(([clients, reports, notes, prompts]) => {
      setStats({
        clients: Array.isArray(clients) ? clients.length : 0,
        reports: Array.isArray(reports) ? reports.length : 0,
        notes: Array.isArray(notes) ? notes.length : 0,
        prompts: Array.isArray(prompts) ? prompts.length : 0,
      });
      const allReports: RecentReport[] = Array.isArray(reports) ? reports : [];
      setRecent(allReports.slice(0, 5));

      // Build client health scores from reports data
      if (Array.isArray(clients)) {
        const reportsByClient: Record<string, RecentReport[]> = {};
        for (const r of allReports) {
          const cid = (r as RecentReport & { client_id?: string }).client_id ?? r.clients?.name;
          if (cid) {
            if (!reportsByClient[cid]) reportsByClient[cid] = [];
            reportsByClient[cid].push(r);
          }
        }
        const healthList: ClientHealth[] = (clients as { id: string; name: string; website: string }[]).slice(0, 6).map(c => {
          const clientReports = reportsByClient[c.id] ?? [];
          const latest = clientReports[0];
          return {
            id: c.id, name: c.name, website: c.website,
            latestReport: latest ? { month: latest.month, year: latest.year, status: latest.status } : undefined,
            traffic: latest?.metrics?.organic_traffic,
            prevTraffic: latest?.metrics?.prev_traffic,
          };
        });
        setClientHealth(healthList);
      }

      // Build monthly traffic trend (aggregate across all clients)
      const byMonth: Record<string, number> = {};
      for (const r of allReports) {
        if (r.metrics?.organic_traffic) {
          const key = `${r.year}-${MONTHS.indexOf(r.month) + 1}`;
          byMonth[key] = (byMonth[key] ?? 0) + (r.metrics.organic_traffic ?? 0);
        }
      }
      const sorted = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-8)
        .map(([key, traffic]) => {
          const [yr, mo] = key.split("-");
          return { month: `${MONTHS[Number(mo) - 1]} '${yr.slice(2)}`, traffic };
        });
      setChartData(sorted);

      setLoading(false);
    });
  }, []);

  const health = Math.max(0, Math.round(100 - (audit.found / audit.total) * 100));
  const healthLabel = health >= 80 ? "Excellent" : health >= 60 ? "Good" : health >= 40 ? "Needs Work" : "Critical";
  const healthColor = health >= 80 ? "text-green-600" : health >= 60 ? "text-amber-500" : "text-red-500";

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    { label: "Total Clients", value: stats.clients, icon: Users, gradient: "from-blue-500 to-blue-600", href: "/dashboard/clients", sub: "Active clients" },
    { label: "Reports Sent", value: stats.reports, icon: FileText, gradient: "from-violet-500 to-violet-600", href: "/dashboard/reports", sub: "All time" },
    { label: "SEO Notes", value: stats.notes, icon: StickyNote, gradient: "from-teal-500 to-teal-600", href: "/dashboard/notes", sub: "Saved notes" },
    { label: "Templates", value: stats.prompts, icon: BookOpen, gradient: "from-orange-500 to-orange-600", href: "/dashboard/prompts", sub: "Saved prompts" },
  ];

  const quickActions = [
    { href: "/dashboard/reports/new", icon: FileText, label: "New Report", desc: "Create monthly report", color: "bg-blue-600 hover:bg-blue-700 text-white" },
    { href: "/dashboard/clients/new", icon: Users, label: "Add Client", desc: "Register new client", color: "bg-violet-600 hover:bg-violet-700 text-white" },
    { href: "/dashboard/audit", icon: ClipboardCheck, label: "SEO Audit", desc: "Run SF checklist", color: "bg-teal-600 hover:bg-teal-700 text-white" },
    { href: "/dashboard/prompts", icon: Lightbulb, label: "Templates", desc: "View saved prompts", color: "bg-slate-700 hover:bg-slate-800 text-white" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-slate-400 mb-1 flex items-center gap-1.5">
            <Calendar size={13} />
            {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-3xl font-black text-slate-800">{greeting}, Ismail! 👋</h1>
          <p className="text-slate-500 mt-1">Here's your SEO workspace overview.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/clients/new" className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Plus size={15} /> Client
          </Link>
          <Link href="/dashboard/reports/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <Plus size={15} /> New Report
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, gradient, href, sub }) => (
          <Link key={label} href={href}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 rounded-full translate-x-8 -translate-y-8`} />
            <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
              <Icon size={18} className="text-white" />
            </div>
            {loading ? (
              <div className="h-8 w-12 bg-slate-100 rounded-lg animate-pulse mb-1" />
            ) : (
              <p className="text-3xl font-black text-slate-800">{value}</p>
            )}
            <p className="text-sm font-semibold text-slate-600 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: Recent Reports (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Recent Reports card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <BarChart3 size={17} className="text-blue-600" />
                <h2 className="font-bold text-slate-700">Recent Reports</h2>
              </div>
              <Link href="/dashboard/reports" className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:underline">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-3.5 bg-slate-100 rounded w-32 mb-2" />
                      <div className="h-3 bg-slate-50 rounded w-24" />
                    </div>
                    <div className="h-6 w-14 bg-slate-100 rounded-full" />
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium mb-1">No reports yet</p>
                <p className="text-slate-300 text-sm mb-5">Create your first monthly SEO report</p>
                <Link href="/dashboard/reports/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Plus size={15} /> Create Report
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recent.map((r) => {
                  const traffic = r.metrics?.organic_traffic;
                  const prev = r.metrics?.prev_traffic;
                  const diff = traffic != null && prev != null ? traffic - prev : null;
                  const statusConfig: Record<string, string> = {
                    sent: "bg-green-100 text-green-700",
                    ready: "bg-blue-100 text-blue-700",
                    draft: "bg-amber-100 text-amber-700",
                  };
                  return (
                    <Link key={r.id} href={`/dashboard/reports/${r.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors group">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <FileText size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-700 text-sm truncate">{r.clients?.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{r.month} {r.year} · {r.clients?.website}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {diff !== null && (
                          <span className={`flex items-center gap-0.5 text-xs font-semibold ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {diff >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {diff >= 0 ? "+" : ""}{diff.toLocaleString()}
                          </span>
                        )}
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${statusConfig[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {r.status}
                        </span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Traffic Trend Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <TrendingUp size={17} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700">Organic Traffic Trend</h2>
                </div>
                <span className="text-xs text-slate-400">Last {chartData.length} months</span>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                      formatter={(v) => [Number(v).toLocaleString(), "Visits"]}
                    />
                    <Area type="monotone" dataKey="traffic" stroke="#3b82f6" strokeWidth={2} fill="url(#trafficGrad)" dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-orange-500" />
              <h2 className="font-bold text-slate-700">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ href, icon: Icon, label, desc, color }) => (
                <Link key={href} href={href}
                  className={`${color} rounded-xl p-4 flex items-start gap-3 transition-all hover:scale-[1.02] shadow-sm`}>
                  <Icon size={20} className="shrink-0 mt-0.5 opacity-90" />
                  <div>
                    <p className="font-bold text-sm">{label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Client Health Scores */}
          {clientHealth.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  <h2 className="font-bold text-slate-700">Client Health</h2>
                </div>
                <Link href="/dashboard/clients" className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:underline">
                  All <ArrowRight size={12} />
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {clientHealth.map(c => {
                  const diff = c.traffic != null && c.prevTraffic != null ? c.traffic - c.prevTraffic : null;
                  const pct = diff != null && c.prevTraffic ? Math.round((diff / c.prevTraffic) * 100) : null;
                  const status = !c.latestReport ? "red" : c.latestReport.status === "sent" ? "green" : pct !== null && pct < -10 ? "red" : "amber";
                  const dot = status === "green" ? "bg-green-500" : status === "amber" ? "bg-amber-400" : "bg-red-500";
                  return (
                    <Link key={c.id} href={`/dashboard/clients/${c.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{c.name}</p>
                        <p className="text-xs text-slate-400 truncate">{c.latestReport ? `${c.latestReport.month} ${c.latestReport.year}` : "No reports"}</p>
                      </div>
                      {pct !== null && (
                        <span className={`text-xs font-bold ${pct >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {pct >= 0 ? "+" : ""}{pct}%
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Audit Health */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <ClipboardCheck size={17} className="text-teal-600" />
              <h2 className="font-bold text-slate-700">Audit Health</h2>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <HealthRing score={health} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${healthColor}`}>{health}</span>
                  <span className="text-xs text-slate-400 -mt-1">/ 100</span>
                </div>
              </div>
              <div className="flex-1">
                <p className={`font-bold text-lg ${healthColor}`}>{healthLabel}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500"><AlertCircle size={11} className="text-red-500" /> Found</span>
                    <span className="font-bold text-red-600">{audit.found}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500"><CheckCircle2 size={11} className="text-green-500" /> Fixed</span>
                    <span className="font-bold text-green-600">{audit.fixed}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500"><ClipboardCheck size={11} className="text-blue-500" /> Checked</span>
                    <span className="font-bold text-blue-600">{audit.checked}/{audit.total}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${health >= 80 ? "bg-green-500" : health >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${(audit.checked / audit.total) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Progress</span>
                <span>{Math.round((audit.checked / audit.total) * 100)}% checked</span>
              </div>
            </div>
            <Link href="/dashboard/audit" className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl py-2.5 transition-colors">
              Open Full Audit <ArrowRight size={14} />
            </Link>
          </div>

          {/* This month */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">Current Month</p>
            <p className="text-2xl font-black">{now.toLocaleString("default", { month: "long" })} {now.getFullYear()}</p>
            <p className="text-blue-200 text-sm mt-2">Time to send your monthly reports!</p>
            <Link href="/dashboard/reports/new"
              className="mt-4 flex items-center justify-center gap-2 bg-white text-blue-600 font-bold text-sm py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
              <Plus size={15} /> Create Report
            </Link>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-amber-500" />
              <h3 className="font-bold text-amber-800 text-sm">Pro Tip</h3>
            </div>
            <p className="text-amber-700 text-sm leading-relaxed">
              Run the SEO Audit Checklist before creating a report. It helps you document exactly what issues you found and fixed for the client.
            </p>
            <Link href="/dashboard/audit" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline">
              Start audit <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
