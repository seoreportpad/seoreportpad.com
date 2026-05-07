"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Search, RefreshCw, ChevronRight,
  CheckCircle2, XCircle, Clock, Crown, Zap, UserX,
} from "lucide-react";

interface Subscription {
  plan: string; status: string;
  trial_ends_at?: string; current_period_end?: string;
}
interface Agency { agency_name?: string; logo_url?: string; }
interface User {
  id: string; email: string; created_at: string;
  last_sign_in?: string; email_confirmed: boolean;
  subscription: Subscription | null;
  agency: Agency | null;
}

function planBadge(sub: Subscription | null) {
  if (!sub) return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-800 text-slate-400">Free</span>;
  if (sub.status === "trialing") {
    const expired = sub.trial_ends_at && new Date(sub.trial_ends_at) < new Date();
    return expired
      ? <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-900/50 text-red-400">Trial Expired</span>
      : <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-900/40 text-amber-400 flex items-center gap-1"><Clock size={10} /> Trialing</span>;
  }
  if (sub.status === "active" && sub.plan === "pro")
    return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-900/40 text-green-400 flex items-center gap-1"><Crown size={10} /> Pro</span>;
  if (sub.status === "canceled")
    return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-800 text-slate-500">Canceled</span>;
  return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-800 text-slate-400 capitalize">{sub.plan ?? "Free"}</span>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "lastLogin">("newest");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.status === 401) { router.push("/admin/login"); return; }
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !search || u.email?.toLowerCase().includes(q) || u.agency?.agency_name?.toLowerCase().includes(q);
      const sub = u.subscription;
      const isPro = sub?.status === "active" && sub?.plan === "pro";
      const isTrialing = sub?.status === "trialing" && sub?.trial_ends_at && new Date(sub.trial_ends_at) > new Date();
      const isFree = !sub || (!isPro && !isTrialing);
      const matchPlan =
        filterPlan === "all" ? true :
        filterPlan === "pro" ? isPro :
        filterPlan === "trialing" ? !!isTrialing :
        filterPlan === "free" ? isFree : true;
      return matchSearch && matchPlan;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "lastLogin") return new Date(b.last_sign_in ?? 0).getTime() - new Date(a.last_sign_in ?? 0).getTime();
      return 0;
    });

  const counts = {
    all: users.length,
    pro: users.filter(u => u.subscription?.status === "active" && u.subscription?.plan === "pro").length,
    trialing: users.filter(u => u.subscription?.status === "trialing" && u.subscription?.trial_ends_at && new Date(u.subscription.trial_ends_at) > new Date()).length,
    free: users.filter(u => !u.subscription || (u.subscription.status !== "active" && u.subscription.status !== "trialing")).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Users</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} total accounts</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-slate-700">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Users", value: counts.all, color: "bg-slate-800 border-slate-700", text: "text-white" },
          { label: "Pro", value: counts.pro, color: "bg-green-900/30 border-green-800/40", text: "text-green-400" },
          { label: "Trialing", value: counts.trialing, color: "bg-amber-900/20 border-amber-800/30", text: "text-amber-400" },
          { label: "Free", value: counts.free, color: "bg-slate-800/60 border-slate-700", text: "text-slate-400" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search email or agency…"
            className="pl-9 pr-4 py-2 text-sm bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 w-56" />
        </div>
        <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
          {(["all","pro","trialing","free"] as const).map(p => (
            <button key={p} onClick={() => setFilterPlan(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filterPlan === p ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"}`}>
              {p} {counts[p as keyof typeof counts] > 0 && <span className="opacity-60">({counts[p as keyof typeof counts]})</span>}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="lastLogin">Last active</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-48 mb-2" />
              <div className="h-3 bg-slate-800/60 rounded w-32" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <Link key={u.id} href={`/admin/users/${u.id}`}
              className="flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl px-5 py-4 transition-all group">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center shrink-0 text-sm font-bold text-slate-300">
                {u.email?.[0]?.toUpperCase() ?? "?"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-white truncate">{u.email}</p>
                  {u.email_confirmed
                    ? <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                    : <XCircle size={13} className="text-slate-600 shrink-0" />}
                  {u.agency?.agency_name && (
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{u.agency.agency_name}</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Joined {new Date(u.created_at).toLocaleDateString()}
                  {u.last_sign_in && ` · Last login ${new Date(u.last_sign_in).toLocaleDateString()}`}
                </p>
              </div>

              {/* Plan badge */}
              <div className="shrink-0">
                {planBadge(u.subscription)}
              </div>

              {/* Trial expiry */}
              {u.subscription?.status === "trialing" && u.subscription.trial_ends_at && (
                <div className="hidden md:block shrink-0 text-right">
                  <p className="text-xs text-slate-500">Trial ends</p>
                  <p className={`text-xs font-semibold ${new Date(u.subscription.trial_ends_at) < new Date() ? "text-red-400" : "text-amber-400"}`}>
                    {new Date(u.subscription.trial_ends_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              <ChevronRight size={15} className="text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
