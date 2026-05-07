"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend } from "recharts";
import { Users, FileText, Crown, Zap, TrendingUp, RefreshCw } from "lucide-react";

interface Stats {
  totals: { users: number; confirmed: number; reports: number; clients: number; pro: number; trialing: number; };
  planBreakdown: { free: number; pro: number; trialing: number; expired: number; };
  signupsChart: { date: string; signups: number }[];
  reportsChart: { date: string; reports: number }[];
}

const PIE_COLORS = { pro: "#22c55e", trialing: "#f59e0b", free: "#64748b", expired: "#ef4444" };

export default function AdminStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/stats");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const d = await res.json();
    setStats(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading || !stats) return (
    <div className="space-y-5">
      <div className="h-8 w-32 bg-slate-800 rounded animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-800 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  const pieData = [
    { name: "Pro", value: stats.planBreakdown.pro, color: PIE_COLORS.pro },
    { name: "Trialing", value: stats.planBreakdown.trialing, color: PIE_COLORS.trialing },
    { name: "Free", value: stats.planBreakdown.free, color: PIE_COLORS.free },
    { name: "Expired", value: stats.planBreakdown.expired, color: PIE_COLORS.expired },
  ].filter(d => d.value > 0);

  const conversionRate = stats.totals.users > 0
    ? Math.round((stats.totals.pro / stats.totals.users) * 100) : 0;
  const confirmRate = stats.totals.users > 0
    ? Math.round((stats.totals.confirmed / stats.totals.users) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Stats & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Platform overview</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-slate-700">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total Users", value: stats.totals.users, icon: Users, color: "text-white", bg: "bg-slate-800" },
          { label: "Pro Users", value: stats.totals.pro, icon: Crown, color: "text-green-400", bg: "bg-green-900/20" },
          { label: "Trialing", value: stats.totals.trialing, icon: Zap, color: "text-amber-400", bg: "bg-amber-900/20" },
          { label: "Conversion", value: `${conversionRate}%`, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-900/20" },
          { label: "Reports", value: stats.totals.reports, icon: FileText, color: "text-violet-400", bg: "bg-violet-900/20" },
          { label: "Email Confirmed", value: `${confirmRate}%`, icon: Users, color: "text-slate-400", bg: "bg-slate-800" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-slate-800 rounded-2xl p-4`}>
            <s.icon size={16} className={`${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-5">
        {/* Plan breakdown pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4">Plan Breakdown</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "#fff" }} />
                <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-600 text-sm py-8 text-center">No data</p>}
          <div className="space-y-2 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-slate-400">{d.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signups chart */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-4">New Signups — Last 30 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.signupsChart} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false}
                tickFormatter={v => v.slice(5)} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "#fff" }}
                labelFormatter={v => `Date: ${v}`} />
              <Bar dataKey="signups" fill="#ef4444" radius={[4,4,0,0]} name="Signups" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="font-bold text-white mb-4">Reports Created — Last 30 Days</h2>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={stats.reportsChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false}
              tickFormatter={v => v.slice(5)} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "#fff" }} />
            <Line type="monotone" dataKey="reports" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Reports" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
