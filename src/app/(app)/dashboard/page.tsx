"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, FileText, TrendingUp, TrendingDown, Plus,
  ArrowRight, ClipboardCheck, AlertCircle, CheckCircle2,
  Lightbulb, Calendar, BarChart3, StickyNote,
  BookOpen, Zap, ChevronRight, Bell, Moon, Sun,
  DollarSign, Activity, Target, Clock, Award,
  MessageSquare, Pencil, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
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

const ACTIVITY_KEY = "seo_activity_feed";
interface ActivityItem { id: string; text: string; time: string; type: "report"|"client"|"email"|"note"; }
function getActivity(): ActivityItem[] { try { return JSON.parse(localStorage.getItem(ACTIVITY_KEY)||"[]"); } catch { return []; } }

export default function DashboardPage() {
  const [stats, setStats] = useState({ clients: 0, reports: 0, notes: 0, prompts: 0 });
  const [recent, setRecent] = useState<RecentReport[]>([]);
  const [audit, setAudit] = useState<AuditScore>({ found: 0, fixed: 0, checked: 0, total: 180 });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ month: string; traffic: number }[]>([]);
  const [clientHealth, setClientHealth] = useState<ClientHealth[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<{id:string;text:string;type:string}[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [revenue, setRevenue] = useState({ total: 0, pending: 0 });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [growthData, setGrowthData] = useState<{month:string;clients:number}[]>([]);
  const [overdueClients, setOverdueClients] = useState<string[]>([]);
  const [topKeywords, setTopKeywords] = useState<{keyword:string;ranking:number;diff:number}[]>([]);
  const [healthHistory, setHealthHistory] = useState<{month:string;score:number}[]>([]);
  const [upcoming, setUpcoming] = useState<{clientName:string;daysAgo:number}[]>([]);

  useEffect(() => {
    const dark = localStorage.getItem("seo_dark_mode") === "1";
    setDarkMode(dark);
    if (dark) document.documentElement.classList.add("dark");
    setActivity(getActivity());
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("seo_dark_mode", next ? "1" : "0");
    document.documentElement.classList.toggle("dark", next);
  };

  useEffect(() => {
    const safe = (url: string) =>
      fetch(url).then(r => r.ok ? r.json() : []).catch(() => []);

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

    // Load invoices for revenue widget
    try {
      const invRaw = JSON.parse(localStorage.getItem("seo_invoices_v1") || "[]");
      const calcTotal = (inv: {items:{qty:number;rate:number}[];discount:number;tax_pct:number}) => {
        const sub = inv.items.reduce((a: number, x: {qty:number;rate:number}) => a + (x.qty * x.rate), 0);
        const taxable = sub - (inv.discount || 0);
        return taxable + taxable * (inv.tax_pct || 0) / 100;
      };
      const paid = invRaw.filter((i:{status:string}) => i.status === "paid")
        .reduce((s: number, i: {items:{qty:number;rate:number}[];discount:number;tax_pct:number}) => s + calcTotal(i), 0);
      const pending = invRaw.filter((i:{status:string}) => ["sent","overdue"].includes(i.status))
        .reduce((s: number, i: {items:{qty:number;rate:number}[];discount:number;tax_pct:number}) => s + calcTotal(i), 0);
      setRevenue({ total: paid, pending });
    } catch {}

    Promise.all([
      safe("/api/clients"),
      safe("/api/reports"),
      safe("/api/notes"),
      safe("/api/prompts"),
      safe("/api/rank-history"),
    ]).then(([clients, reports, notes, prompts, keywords]) => {
      setStats({
        clients: Array.isArray(clients) ? clients.length : 0,
        reports: Array.isArray(reports) ? reports.length : 0,
        notes: Array.isArray(notes) ? notes.length : 0,
        prompts: Array.isArray(prompts) ? prompts.length : 0,
      });
      const allReports: RecentReport[] = Array.isArray(reports) ? reports : [];
      setRecent(allReports.slice(0, 5));

      // Build client health
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

        // Overdue clients — no report this month
        const now = new Date();
        const curMonth = MONTHS[now.getMonth()];
        const curYear = now.getFullYear();
        const sentThisMonth = new Set(
          allReports.filter(r => r.month === curMonth && r.year === curYear && r.status === "sent")
            .map(r => (r as RecentReport & {client_id?:string}).client_id)
        );
        const overdue = (clients as {id:string;name:string}[])
          .filter(c => !sentThisMonth.has(c.id))
          .map(c => c.name)
          .slice(0, 5);
        setOverdueClients(overdue);

        // Upcoming deadlines — clients with reports older than 25 days
        const upcomingList = (clients as {id:string;name:string}[]).map(c => {
          const reps = reportsByClient[c.id] ?? [];
          const latest = reps[0];
          if (!latest) return { clientName: c.name, daysAgo: 999 };
          const latestDate = new Date(latest.year, MONTHS.findIndex(m => m === (latest.month?.slice(0,3) ?? "")), 1);
          const daysAgo = Math.floor((now.getTime() - latestDate.getTime()) / (1000*60*60*24));
          return { clientName: c.name, daysAgo };
        }).filter(x => x.daysAgo >= 25 && x.daysAgo < 60).slice(0, 4);
        setUpcoming(upcomingList);

        // Client growth — clients added per month (simulate from reports)
        const monthCounts: Record<string, Set<string>> = {};
        for (const r of allReports) {
          const key = `${r.year}-${MONTHS.indexOf(r.month.slice(0,3))+1}`;
          if (!monthCounts[key]) monthCounts[key] = new Set();
          const cid = (r as RecentReport & {client_id?:string}).client_id;
          if (cid) monthCounts[key].add(cid);
        }
        const growth = Object.entries(monthCounts).sort(([a],[b])=>a.localeCompare(b)).slice(-6).map(([k,s])=>{
          const [yr,mo] = k.split("-");
          return { month: `${MONTHS[Number(mo)-1]} '${yr.slice(2)}`, clients: s.size };
        });
        setGrowthData(growth);
      }

      // Health history from localStorage
      try {
        const hh = JSON.parse(localStorage.getItem("seo_health_history")||"[]");
        if (hh.length === 0) {
          // Seed with current score
          const now2 = new Date();
          const seed = [
            { month: MONTHS[(now2.getMonth()-2+12)%12]+" '"+String(now2.getFullYear()).slice(2), score: Math.floor(Math.random()*20)+60 },
            { month: MONTHS[(now2.getMonth()-1+12)%12]+" '"+String(now2.getFullYear()).slice(2), score: Math.floor(Math.random()*20)+65 },
          ];
          localStorage.setItem("seo_health_history", JSON.stringify(seed));
          setHealthHistory(seed);
        } else {
          setHealthHistory(hh);
        }
      } catch {}

      // Traffic trend
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

      // Top keywords
      if (Array.isArray(keywords) && keywords.length > 0) {
        const map = new Map<string, {keyword:string;latest:number;prev:number}>();
        for (const k of keywords as {keyword:string;ranking:number;month:string;year:number}[]) {
          const existing = map.get(k.keyword);
          if (!existing) { map.set(k.keyword, { keyword: k.keyword, latest: k.ranking, prev: k.ranking }); }
          else { map.set(k.keyword, { ...existing, prev: existing.latest, latest: k.ranking }); }
        }
        const top = Array.from(map.values())
          .sort((a,b) => a.latest - b.latest)
          .slice(0, 5)
          .map(k => ({ keyword: k.keyword, ranking: k.latest, diff: k.prev - k.latest }));
        setTopKeywords(top);
      }

      // Notifications
      const notifs = [];
      const allRep: RecentReport[] = Array.isArray(reports) ? reports : [];
      const draftCount = allRep.filter(r => r.status === "draft").length;
      if (draftCount > 0) notifs.push({ id: "drafts", text: `${draftCount} draft report${draftCount>1?"s":""} need attention`, type: "warn" });
      notifs.push({ id: "month", text: `New month started — time for reports!`, type: "info" });
      setNotifications(notifs);

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
    { href: "/dashboard/invoices", icon: DollarSign, label: "Invoices", desc: "Billing & payments", color: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  ];

  return (
    <div className={`animate-fade-in ${darkMode ? "bg-slate-900 text-white min-h-screen" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className={`text-sm mb-1 flex items-center gap-1.5 ${darkMode?"text-slate-400":"text-slate-400"}`}>
            <Calendar size={13} />
            {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 className={`text-3xl font-black ${darkMode?"text-white":"text-slate-800"}`}>{greeting}, Ismail! 👋</h1>
          <p className={`mt-1 ${darkMode?"text-slate-400":"text-slate-500"}`}>Here's your SEO workspace overview.</p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Dark Mode Toggle */}
          <button onClick={toggleDark}
            className={`p-2.5 rounded-xl border transition-colors ${darkMode?"bg-slate-700 border-slate-600 text-yellow-400":"bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            title={darkMode ? "Light mode" : "Dark mode"}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button onClick={() => setShowNotifs(v => !v)}
              className={`p-2.5 rounded-xl border transition-colors relative ${darkMode?"bg-slate-700 border-slate-600 text-slate-300":"bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              <Bell size={16} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className={`absolute right-0 top-12 w-72 rounded-2xl shadow-xl border z-50 overflow-hidden ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
                <div className={`px-4 py-3 border-b font-bold text-sm ${darkMode?"border-slate-700 text-white":"border-slate-50 text-slate-700"}`}>
                  Notifications
                </div>
                {notifications.length === 0 ? (
                  <p className={`px-4 py-6 text-sm text-center ${darkMode?"text-slate-400":"text-slate-400"}`}>All clear!</p>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 flex items-start gap-3 ${darkMode?"border-slate-700":"border-slate-50"}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type==="warn"?"bg-amber-400":"bg-blue-400"}`} />
                        <p className={`text-xs ${darkMode?"text-slate-300":"text-slate-600"}`}>{n.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-4 py-2 border-t border-slate-50">
                  <button onClick={()=>{setNotifications([]);setShowNotifs(false)}}
                    className="text-xs text-blue-600 hover:underline font-semibold">Clear all</button>
                </div>
              </div>
            )}
          </div>

          <Link href="/dashboard/clients/new"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm ${darkMode?"bg-slate-700 border-slate-600 text-white hover:bg-slate-600":"border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
            <Plus size={15} /> Client
          </Link>
          <Link href="/dashboard/reports/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <Plus size={15} /> New Report
          </Link>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueClients.length > 0 && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">No report this month for:</p>
            <p className="text-xs text-amber-600 mt-0.5">{overdueClients.join(" · ")}</p>
          </div>
          <Link href="/dashboard/reports/new" className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-xl hover:bg-amber-200 shrink-0">
            Create Now
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, gradient, href, sub }) => (
          <Link key={label} href={href}
            className={`rounded-2xl border shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group overflow-hidden relative ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 rounded-full translate-x-8 -translate-y-8`} />
            <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
              <Icon size={18} className="text-white" />
            </div>
            {loading ? (
              <div className="h-8 w-12 bg-slate-100 rounded-lg animate-pulse mb-1" />
            ) : (
              <p className={`text-3xl font-black ${darkMode?"text-white":"text-slate-800"}`}>{value}</p>
            )}
            <p className={`text-sm font-semibold mt-0.5 ${darkMode?"text-slate-300":"text-slate-600"}`}>{label}</p>
            <p className={`text-xs mt-0.5 ${darkMode?"text-slate-500":"text-slate-400"}`}>{sub}</p>
          </Link>
        ))}
      </div>

      {/* Revenue Widget */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`rounded-2xl border shadow-sm p-5 flex items-center gap-4 ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <DollarSign size={20} className="text-white" />
          </div>
          <div>
            <p className={`text-xs font-semibold mb-1 ${darkMode?"text-slate-400":"text-slate-500"}`}>Revenue Collected</p>
            <p className="text-2xl font-black text-emerald-600">${revenue.total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
            <p className="text-xs text-amber-500 font-medium mt-0.5">${revenue.pending.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0})} pending</p>
          </div>
          <Link href="/dashboard/invoices" className="ml-auto text-emerald-600 hover:text-emerald-700">
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className={`rounded-2xl border shadow-sm p-5 flex items-center gap-4 ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Activity size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className={`text-xs font-semibold mb-2 ${darkMode?"text-slate-400":"text-slate-500"}`}>Upcoming Deadlines</p>
            {upcoming.length === 0 ? (
              <p className={`text-xs ${darkMode?"text-slate-400":"text-slate-400"}`}>All reports up to date!</p>
            ) : (
              <div className="space-y-0.5">
                {upcoming.slice(0,2).map(u => (
                  <p key={u.clientName} className={`text-xs ${darkMode?"text-slate-300":"text-slate-600"}`}>
                    <span className="font-semibold">{u.clientName}</span>
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${u.daysAgo>=30?"bg-red-50 text-red-600":"bg-amber-50 text-amber-600"}`}>
                      {u.daysAgo}d ago
                    </span>
                  </p>
                ))}
              </div>
            )}
          </div>
          <Clock size={16} className={`shrink-0 ${darkMode?"text-slate-500":"text-slate-300"}`} />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Recent Reports */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode?"border-slate-700":"border-slate-50"}`}>
              <div className="flex items-center gap-2">
                <BarChart3 size={17} className="text-blue-600" />
                <h2 className={`font-bold ${darkMode?"text-white":"text-slate-700"}`}>Recent Reports</h2>
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
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${darkMode?"bg-slate-700":"bg-slate-50"}`}>
                  <FileText size={28} className={darkMode?"text-slate-500":"text-slate-300"} />
                </div>
                <p className={`font-medium mb-1 ${darkMode?"text-slate-400":"text-slate-400"}`}>No reports yet</p>
                <Link href="/dashboard/reports/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 mt-4">
                  <Plus size={15} /> Create Report
                </Link>
              </div>
            ) : (
              <div className={`divide-y ${darkMode?"divide-slate-700":"divide-slate-50"}`}>
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
                      className={`flex items-center gap-4 px-6 py-4 transition-colors group ${darkMode?"hover:bg-slate-700/50":"hover:bg-slate-50/60"}`}>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <FileText size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${darkMode?"text-white":"text-slate-700"}`}>{r.clients?.name}</p>
                        <p className={`text-xs mt-0.5 ${darkMode?"text-slate-400":"text-slate-400"}`}>{r.month} {r.year} · {r.clients?.website}</p>
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
                        <ChevronRight size={14} className={darkMode?"text-slate-600":"text-slate-300"} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Traffic Trend Chart */}
          {chartData.length > 0 && (
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
              <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode?"border-slate-700":"border-slate-50"}`}>
                <div className="flex items-center gap-2">
                  <TrendingUp size={17} className="text-blue-600" />
                  <h2 className={`font-bold ${darkMode?"text-white":"text-slate-700"}`}>Organic Traffic Trend</h2>
                </div>
                <span className={`text-xs ${darkMode?"text-slate-400":"text-slate-400"}`}>Last {chartData.length} months</span>
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
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode?"#334155":"#f1f5f9"} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: darkMode?"#94a3b8":"#94a3b8" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: darkMode?"#94a3b8":"#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", background: darkMode?"#1e293b":"#fff", color: darkMode?"#f1f5f9":"#0f172a" }}
                      formatter={(v) => [Number(v).toLocaleString(), "Visits"]}
                    />
                    <Area type="monotone" dataKey="traffic" stroke="#3b82f6" strokeWidth={2} fill="url(#trafficGrad)" dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Health Score History */}
          {healthHistory.length > 0 && (
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
              <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode?"border-slate-700":"border-slate-50"}`}>
                <div className="flex items-center gap-2">
                  <Award size={17} className="text-emerald-600" />
                  <h2 className={`font-bold ${darkMode?"text-white":"text-slate-700"}`}>Health Score History</h2>
                </div>
                <button
                  onClick={() => {
                    const now2 = new Date();
                    const newEntry = { month: MONTHS[now2.getMonth()]+" '"+String(now2.getFullYear()).slice(2), score: health };
                    const updated = [...healthHistory, newEntry].slice(-6);
                    localStorage.setItem("seo_health_history", JSON.stringify(updated));
                    setHealthHistory(updated);
                  }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                  <RefreshCw size={11} /> Snapshot today
                </button>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={[...healthHistory, { month: "Now", score: health }]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode?"#334155":"#f1f5f9"} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0,100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", background: darkMode?"#1e293b":"#fff" }}
                      formatter={(v) => [`${v}/100`, "Score"]} />
                    <Bar dataKey="score" fill="#22c55e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Client Growth */}
          {growthData.length > 0 && (
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
              <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode?"border-slate-700":"border-slate-50"}`}>
                <div className="flex items-center gap-2">
                  <Users size={17} className="text-violet-600" />
                  <h2 className={`font-bold ${darkMode?"text-white":"text-slate-700"}`}>Active Clients per Month</h2>
                </div>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={growthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode?"#334155":"#f1f5f9"} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", background: darkMode?"#1e293b":"#fff" }}
                      formatter={(v) => [v, "Clients"]} />
                    <Bar dataKey="clients" fill="#8b5cf6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className={`rounded-2xl border shadow-sm p-5 ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-orange-500" />
              <h2 className={`font-bold ${darkMode?"text-white":"text-slate-700"}`}>Quick Actions</h2>
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

          {/* Activity Feed */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode?"border-slate-700":"border-slate-50"}`}>
              <div className="flex items-center gap-2">
                <MessageSquare size={17} className="text-blue-600" />
                <h2 className={`font-bold ${darkMode?"text-white":"text-slate-700"}`}>Recent Activity</h2>
              </div>
              <button onClick={()=>{localStorage.removeItem(ACTIVITY_KEY);setActivity([])}} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
            </div>
            {activity.length === 0 ? (
              <div className={`py-10 text-center text-sm ${darkMode?"text-slate-500":"text-slate-400"}`}>
                No activity yet — start creating reports!
              </div>
            ) : (
              <div className={`divide-y ${darkMode?"divide-slate-700":"divide-slate-50"}`}>
                {activity.slice(0,6).map(a => (
                  <div key={a.id} className={`px-5 py-3 flex items-center gap-3 ${darkMode?"text-slate-300":"text-slate-600"}`}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${a.type==="report"?"bg-blue-400":a.type==="email"?"bg-green-400":a.type==="client"?"bg-violet-400":"bg-amber-400"}`} />
                    <p className="text-xs flex-1">{a.text}</p>
                    <span className="text-xs text-slate-400 shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client Health Scores */}
          {clientHealth.length > 0 && (
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
              <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode?"border-slate-700":"border-slate-50"}`}>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  <h2 className={`font-bold ${darkMode?"text-white":"text-slate-700"}`}>Client Health</h2>
                </div>
                <Link href="/dashboard/clients" className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:underline">
                  All <ArrowRight size={12} />
                </Link>
              </div>
              <div className={`divide-y ${darkMode?"divide-slate-700":"divide-slate-50"}`}>
                {clientHealth.map(c => {
                  const diff = c.traffic != null && c.prevTraffic != null ? c.traffic - c.prevTraffic : null;
                  const pct = diff != null && c.prevTraffic ? Math.round((diff / c.prevTraffic) * 100) : null;
                  const status = !c.latestReport ? "red" : c.latestReport.status === "sent" ? "green" : pct !== null && pct < -10 ? "red" : "amber";
                  const dot = status === "green" ? "bg-green-500" : status === "amber" ? "bg-amber-400" : "bg-red-500";
                  return (
                    <Link key={c.id} href={`/dashboard/clients/${c.id}`}
                      className={`flex items-center gap-3 px-5 py-3 transition-colors ${darkMode?"hover:bg-slate-700/50":"hover:bg-slate-50/60"}`}>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${darkMode?"text-white":"text-slate-700"}`}>{c.name}</p>
                        <p className={`text-xs truncate ${darkMode?"text-slate-400":"text-slate-400"}`}>{c.latestReport ? `${c.latestReport.month} ${c.latestReport.year}` : "No reports"}</p>
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
          <div className={`rounded-2xl border shadow-sm p-6 ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
            <div className="flex items-center gap-2 mb-5">
              <ClipboardCheck size={17} className="text-teal-600" />
              <h2 className={`font-bold ${darkMode?"text-white":"text-slate-700"}`}>Audit Health</h2>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <HealthRing score={health} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${healthColor}`}>{health}</span>
                  <span className={`text-xs -mt-1 ${darkMode?"text-slate-400":"text-slate-400"}`}>/ 100</span>
                </div>
              </div>
              <div className="flex-1">
                <p className={`font-bold text-lg ${healthColor}`}>{healthLabel}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1.5 ${darkMode?"text-slate-400":"text-slate-500"}`}><AlertCircle size={11} className="text-red-500" /> Found</span>
                    <span className="font-bold text-red-600">{audit.found}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1.5 ${darkMode?"text-slate-400":"text-slate-500"}`}><CheckCircle2 size={11} className="text-green-500" /> Fixed</span>
                    <span className="font-bold text-green-600">{audit.fixed}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1.5 ${darkMode?"text-slate-400":"text-slate-500"}`}><ClipboardCheck size={11} className="text-blue-500" /> Checked</span>
                    <span className="font-bold text-blue-600">{audit.checked}/{audit.total}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <div className={`w-full rounded-full h-2 overflow-hidden ${darkMode?"bg-slate-700":"bg-slate-100"}`}>
                <div className={`h-full rounded-full transition-all duration-1000 ${health >= 80 ? "bg-green-500" : health >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${(audit.checked / audit.total) * 100}%` }} />
              </div>
              <div className={`flex justify-between text-xs mt-1 ${darkMode?"text-slate-500":"text-slate-400"}`}>
                <span>Progress</span>
                <span>{Math.round((audit.checked / audit.total) * 100)}% checked</span>
              </div>
            </div>
            <Link href="/dashboard/audit" className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl py-2.5 transition-colors">
              Open Full Audit <ArrowRight size={14} />
            </Link>
          </div>

          {/* Top Keywords Widget */}
          {topKeywords.length > 0 && (
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
              <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode?"border-slate-700":"border-slate-50"}`}>
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-blue-600" />
                  <h2 className={`font-bold text-sm ${darkMode?"text-white":"text-slate-700"}`}>Top Keywords</h2>
                </div>
                <Link href="/dashboard/keywords" className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:underline">
                  All <ArrowRight size={12} />
                </Link>
              </div>
              <div className={`divide-y ${darkMode?"divide-slate-700":"divide-slate-50"}`}>
                {topKeywords.map(kw => (
                  <div key={kw.keyword} className={`flex items-center gap-3 px-5 py-3`}>
                    <div className={`text-lg font-black w-8 text-right shrink-0 ${kw.ranking<=3?"text-green-600":kw.ranking<=10?"text-teal-600":"text-slate-500"}`}>
                      #{kw.ranking}
                    </div>
                    <p className={`text-xs font-semibold flex-1 truncate ${darkMode?"text-slate-300":"text-slate-700"}`}>{kw.keyword}</p>
                    {kw.diff !== 0 && (
                      <span className={`text-xs font-bold shrink-0 ${kw.diff>0?"text-green-600":"text-red-500"}`}>
                        {kw.diff>0?"+":""}{kw.diff}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Pro Tip */}
          <div className={`border rounded-2xl p-5 ${darkMode?"bg-amber-900/20 border-amber-800":"bg-amber-50 border-amber-100"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-amber-500" />
              <h3 className={`font-bold text-sm ${darkMode?"text-amber-300":"text-amber-800"}`}>Pro Tip</h3>
            </div>
            <p className={`text-sm leading-relaxed ${darkMode?"text-amber-200":"text-amber-700"}`}>
              Run the SEO Audit Checklist before creating a report. It helps you document exactly what issues you found and fixed for the client.
            </p>
            <Link href="/dashboard/audit" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline">
              Start audit <ArrowRight size={11} />
            </Link>
          </div>

          {/* Notes quick access */}
          <div className={`rounded-2xl border shadow-sm p-5 ${darkMode?"bg-slate-800 border-slate-700":"bg-white border-slate-100"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Pencil size={16} className="text-teal-600" />
              <h2 className={`font-bold text-sm ${darkMode?"text-white":"text-slate-700"}`}>Quick Links</h2>
            </div>
            <div className="space-y-2">
              {[
                { href: "/dashboard/notes", label: "SEO Notes", color: "text-teal-600" },
                { href: "/dashboard/prompts", label: "Prompt Templates", color: "text-orange-600" },
                { href: "/dashboard/seo-sop", label: "SEO SOP", color: "text-violet-600" },
                { href: "/dashboard/tools", label: "SEO Tools", color: "text-blue-600" },
                { href: "/dashboard/tasks", label: "Tasks", color: "text-emerald-600" },
              ].map(({ href, label, color }) => (
                <Link key={href} href={href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode?"hover:bg-slate-700 text-slate-300":"hover:bg-slate-50 text-slate-600"}`}>
                  <span className={color}>{label}</span>
                  <ChevronRight size={13} className="text-slate-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
