"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, FileText, Pencil, Trash2, Download, Eye, TrendingUp, TrendingDown, Search } from "lucide-react";

interface Report {
  id: string; month: string; year: number; status: string;
  clients: { id: string; name: string; website: string };
  metrics?: { organic_traffic?: number; prev_traffic?: number };
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  sent: { label: "Sent", cls: "bg-green-100 text-green-700 border-green-200" },
  ready: { label: "Ready", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  draft: { label: "Draft", cls: "bg-amber-100 text-amber-700 border-amber-200" },
};

function ReportsList() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const load = () =>
    fetch(`/api/reports${clientId ? `?clientId=${clientId}` : ""}`)
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setReports(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [clientId]);

  const del = async (id: string) => {
    if (!confirm("Delete this report? This cannot be undone.")) return;
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = reports.filter(r => {
    const matchSearch = !search ||
      r.clients?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.month.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = { all: reports.length, sent: reports.filter(r => r.status === "sent").length, ready: reports.filter(r => r.status === "ready").length, draft: reports.filter(r => r.status === "draft").length };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Reports</h1>
          <p className="text-slate-500 text-sm mt-1">{reports.length} total report{reports.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href={clientId ? `/dashboard/reports/new?clientId=${clientId}` : "/dashboard/reports/new"}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <Plus size={16} /> New Report
        </Link>
      </div>

      {/* Filters bar */}
      {reports.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm w-48" />
          </div>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {(["all","sent","ready","draft"] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filterStatus === s ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                {s} {counts[s] > 0 && <span className="opacity-60">({counts[s]})</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 rounded w-40 mb-2" />
                  <div className="h-3 bg-slate-50 rounded w-28" />
                </div>
                <div className="h-7 w-16 bg-slate-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <FileText size={36} className="text-slate-300" />
          </div>
          <h3 className="text-slate-600 font-bold text-lg mb-2">{search ? "No reports found" : "No reports yet"}</h3>
          <p className="text-slate-400 text-sm mb-6">{search ? "Try a different search term" : "Create your first monthly SEO report"}</p>
          {!search && (
            <Link href="/dashboard/reports/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus size={15} /> Create First Report
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const traffic = r.metrics?.organic_traffic;
            const prev = r.metrics?.prev_traffic;
            const diff = traffic != null && prev != null ? traffic - prev : null;
            const sc = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.draft;
            return (
              <div key={r.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Icon */}
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <FileText size={17} className="text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-bold text-slate-700">{r.clients?.name}</p>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {r.month} {r.year} · {r.clients?.website}
                    </p>
                  </div>

                  {/* Traffic delta */}
                  {diff !== null && (
                    <div className={`hidden md:flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-lg ${diff >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                      {diff >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {diff >= 0 ? "+" : ""}{diff.toLocaleString()}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Link href={`/dashboard/reports/${r.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors">
                      <Eye size={13} /> View
                    </Link>
                    <a href={`/dashboard/reports/${r.id}`}
                      target="_blank" rel="noreferrer"
                      onClick={e => { e.preventDefault(); const w = window.open(`/dashboard/reports/${r.id}`, "_blank"); w?.addEventListener("load", () => { setTimeout(() => w.print(), 400); }); }}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors" title="Print / Save PDF">
                      <Download size={15} />
                    </a>
                    <Link href={`/dashboard/reports/${r.id}/edit`}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                      <Pencil size={15} />
                    </Link>
                    <button onClick={() => del(r.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading...</div>}>
      <ReportsList />
    </Suspense>
  );
}
