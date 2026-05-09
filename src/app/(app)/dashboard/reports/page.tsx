"use client";
import { useEffect, useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  Plus, FileText, Pencil, Trash2, Download, Eye,
  TrendingUp, TrendingDown, Search, Send, Copy,
  CheckSquare, Square, SortAsc, SortDesc, AlertTriangle,
  Loader2, Check, ChevronDown, Users, BarChart3,
} from "lucide-react";

interface Report {
  id: string;
  month: string;
  year: number;
  status: string;
  clients: { id: string; name: string; website: string; email: string };
  metrics?: { organic_traffic?: number; prev_traffic?: number };
  keywords?: { id: string }[];
  work_done?: { id: string }[];
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STATUS_CONFIG: Record<string, { label: string; cls: string; next: string; nextLabel: string }> = {
  draft: { label: "Draft",  cls: "bg-amber-100 text-amber-700 border-amber-200",  next: "ready", nextLabel: "Mark Ready" },
  ready: { label: "Ready",  cls: "bg-blue-100 text-blue-700 border-blue-200",    next: "sent",  nextLabel: "Mark Sent"  },
  sent:  { label: "Sent",   cls: "bg-green-100 text-green-700 border-green-200", next: "draft", nextLabel: "Reset Draft" },
};

type SortKey = "date" | "client" | "status" | "traffic";
type SortDir = "asc" | "desc";

function ReportsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = searchParams.get("clientId");

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterClient, setFilterClient] = useState(clientId ?? "all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [cloneLoading, setCloneLoading] = useState<string | null>(null);
  const [sendModal, setSendModal] = useState<Report | null>(null);
  const [sendMsg, setSendMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sentId, setSentId] = useState<string | null>(null);
  const [cloneModal, setCloneModal] = useState<Report | null>(null);
  const [cloneMonth, setCloneMonth] = useState(MONTHS[0]);
  const [cloneYear, setCloneYear] = useState(0);
  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState("");
  const [currentYear, setCurrentYear] = useState(0);

  const load = () => {
    setLoading(true);
    fetch(`/api/reports${clientId ? `?clientId=${clientId}` : ""}`)
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setReports(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const now = new Date();
    setCurrentMonth(MONTHS[now.getMonth()]);
    setCurrentYear(now.getFullYear());
    setCloneMonth(MONTHS[now.getMonth()]);
    setCloneYear(now.getFullYear());
  }, []);

  useEffect(() => { load(); }, [clientId]);

  // Duplicate detection
  const isDuplicate = (cId: string, month: string, year: number, excludeId?: string) =>
    reports.some(r => r.clients?.id === cId && r.month === month && r.year === year && r.id !== excludeId);

  // Quick status toggle
  const cycleStatus = async (r: Report) => {
    const next = STATUS_CONFIG[r.status]?.next ?? "draft";
    setStatusLoading(r.id);
    await fetch(`/api/reports/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setReports(prev => prev.map(x => x.id === r.id ? { ...x, status: next } : x));
    setStatusLoading(null);
  };

  // Clone
  const openClone = (r: Report) => {
    setDupWarning(null);
    setCloneModal(r);
  };

  const doClone = async () => {
    if (!cloneModal) return;
    if (isDuplicate(cloneModal.clients.id, cloneMonth, cloneYear)) {
      setDupWarning(`A report for ${cloneModal.clients.name} — ${cloneMonth} ${cloneYear} already exists.`);
      return;
    }
    setCloneLoading(cloneModal.id);
    const res = await fetch("/api/reports/clone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: cloneModal.id, month: cloneMonth, year: cloneYear }),
    });
    const data = await res.json();
    setCloneLoading(null);
    setCloneModal(null);
    if (data.id) router.push(`/dashboard/reports/${data.id}/edit`);
  };

  // Delete single
  const del = async (id: string) => {
    if (!confirm("Delete this report? This cannot be undone.")) return;
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    setReports(prev => prev.filter(r => r.id !== id));
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  // Bulk delete
  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} report(s)? This cannot be undone.`)) return;
    setBulkLoading(true);
    await Promise.all([...selected].map(id => fetch(`/api/reports/${id}`, { method: "DELETE" })));
    setReports(prev => prev.filter(r => !selected.has(r.id)));
    setSelected(new Set());
    setBulkLoading(false);
  };

  // Bulk status
  const bulkStatus = async (status: string) => {
    setBulkLoading(true);
    await Promise.all([...selected].map(id =>
      fetch(`/api/reports/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    ));
    setReports(prev => prev.map(r => selected.has(r.id) ? { ...r, status } : r));
    setSelected(new Set());
    setBulkLoading(false);
  };

  // Quick send
  const quickSend = async () => {
    if (!sendModal) return;
    setSending(true);
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: sendModal.clients.email,
        subject: `SEO Report — ${sendModal.month} ${sendModal.year}`,
        html: sendMsg ? `<p>${sendMsg.replace(/\n/g, "<br>")}</p>` : `<p>Please find your SEO report for ${sendModal.month} ${sendModal.year} attached.</p>`,
        reportId: sendModal.id,
        month: sendModal.month,
        year: sendModal.year,
        clientName: sendModal.clients.name,
      }),
    });
    setSending(false);
    if (res.ok) {
      setSentId(sendModal.id);
      setReports(prev => prev.map(r => r.id === sendModal.id ? { ...r, status: "sent" } : r));
      setTimeout(() => { setSendModal(null); setSendMsg(""); setSentId(null); }, 1500);
    } else {
      alert("Failed to send email. Check your email settings in Settings.");
    }
  };

  // PDF print
  const printReport = (id: string) => {
    const w = window.open(`/dashboard/reports/${id}?print=1`, "_blank");
    w?.addEventListener("load", () => setTimeout(() => w.print(), 600));
  };

  // Sort
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  // Derived data
  const years = useMemo(() => [...new Set(reports.map(r => String(r.year)))].sort((a, b) => Number(b) - Number(a)), [reports]);
  const clientList = useMemo(() => {
    const map = new Map<string, string>();
    reports.forEach(r => { if (r.clients?.id) map.set(r.clients.id, r.clients.name); });
    return [...map.entries()];
  }, [reports]);

  const clientsWithoutThisMonth = useMemo(() => {
    if (!currentMonth || !currentYear) return [];
    const ids = new Set(reports.filter(r => r.month === currentMonth && r.year === currentYear).map(r => r.clients?.id));
    return clientList.filter(([id]) => !ids.has(id));
  }, [reports, clientList, currentMonth, currentYear]);

  const filtered = useMemo(() => {
    let list = reports.filter(r => {
      if (search && !r.clients?.name.toLowerCase().includes(search.toLowerCase()) && !r.month.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterYear !== "all" && String(r.year) !== filterYear) return false;
      if (filterMonth !== "all" && r.month !== filterMonth) return false;
      if (filterClient !== "all" && r.clients?.id !== filterClient) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = (MONTHS.indexOf(a.month) + a.year * 12) - (MONTHS.indexOf(b.month) + b.year * 12);
      else if (sortKey === "client") cmp = (a.clients?.name ?? "").localeCompare(b.clients?.name ?? "");
      else if (sortKey === "status") cmp = (a.status ?? "").localeCompare(b.status ?? "");
      else if (sortKey === "traffic") cmp = (a.metrics?.organic_traffic ?? 0) - (b.metrics?.organic_traffic ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [reports, search, filterStatus, filterYear, filterMonth, filterClient, sortKey, sortDir]);

  const counts = { all: reports.length, sent: reports.filter(r => r.status === "sent").length, ready: reports.filter(r => r.status === "ready").length, draft: reports.filter(r => r.status === "draft").length };
  const allFilteredSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? (sortDir === "asc" ? <SortAsc size={12} className="text-blue-600" /> : <SortDesc size={12} className="text-blue-600" />)
    : <SortAsc size={12} className="text-slate-300" />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Reports</h1>
          <p className="text-slate-500 text-sm mt-1">{reports.length} total report{reports.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href={clientId ? `/dashboard/reports/new?clientId=${clientId}` : "/dashboard/reports/new"}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          <Plus size={16} /> New Report
        </Link>
      </div>

      {/* Summary stats */}
      {reports.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Reports", value: reports.length, icon: <FileText size={16} className="text-blue-500" />, bg: "bg-blue-50" },
            { label: "Sent This Month", value: reports.filter(r => r.status === "sent" && r.month === currentMonth && r.year === currentYear).length, icon: <Send size={16} className="text-green-500" />, bg: "bg-green-50" },
            { label: "Keywords Tracked", value: reports.reduce((acc, r) => acc + (r.keywords?.length ?? 0), 0), icon: <BarChart3 size={16} className="text-violet-500" />, bg: "bg-violet-50" },
            { label: "Tasks Completed", value: reports.reduce((acc, r) => acc + (r.work_done?.length ?? 0), 0), icon: <Check size={16} className="text-emerald-500" />, bg: "bg-emerald-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl px-4 py-3 flex items-center gap-3`}>
              <div className="shrink-0">{s.icon}</div>
              <div>
                <p className="text-xl font-black text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Missing-this-month warning */}
      {clientsWithoutThisMonth.length > 0 && !clientId && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">No report this month for:</p>
            <p className="text-xs text-amber-600 mt-0.5">{clientsWithoutThisMonth.map(([, name]) => name).join(" · ")}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      {reports.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search client or month..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm w-48" />
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {(["all","sent","ready","draft"] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filterStatus === s ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                {s} {counts[s as keyof typeof counts] > 0 && <span className="opacity-60">({counts[s as keyof typeof counts]})</span>}
              </button>
            ))}
          </div>

          {/* Client filter */}
          {clientList.length > 1 && (
            <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
              <option value="all">All Clients</option>
              {clientList.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          )}

          {/* Year */}
          {years.length > 1 && (
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
              <option value="all">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}

          {/* Month */}
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700">
            <option value="all">All Months</option>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {/* Clear */}
          {(filterStatus !== "all" || filterYear !== "all" || filterMonth !== "all" || filterClient !== "all" || search) && (
            <button onClick={() => { setFilterStatus("all"); setFilterYear("all"); setFilterMonth("all"); setFilterClient("all"); setSearch(""); }}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 shadow-sm">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Sort bar */}
      {filtered.length > 1 && (
        <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
          <span className="font-semibold">Sort:</span>
          {([["date", "Date"], ["client", "Client"], ["status", "Status"], ["traffic", "Traffic"]] as [SortKey, string][]).map(([k, label]) => (
            <button key={k} onClick={() => toggleSort(k)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${sortKey === k ? "border-blue-300 bg-blue-50 text-blue-700 font-semibold" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
              {label} <SortIcon k={k} />
            </button>
          ))}
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-blue-800">{selected.size} selected</span>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => bulkStatus("ready")} disabled={bulkLoading}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              Mark Ready
            </button>
            <button onClick={() => bulkStatus("sent")} disabled={bulkLoading}
              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
              Mark Sent
            </button>
            <button onClick={() => bulkStatus("draft")} disabled={bulkLoading}
              className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-50">
              Reset Draft
            </button>
            <button onClick={bulkDelete} disabled={bulkLoading}
              className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center gap-1">
              {bulkLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
            </button>
          </div>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-semibold">Deselect all</button>
        </div>
      )}

      {/* Table header (select all) */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-2 mb-1">
          <button onClick={() => {
            if (allFilteredSelected) setSelected(new Set());
            else setSelected(new Set(filtered.map(r => r.id)));
          }} className="text-slate-400 hover:text-slate-700 transition-colors">
            {allFilteredSelected ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
          </button>
          <span className="text-xs text-slate-400 font-semibold">{filtered.length} report{filtered.length !== 1 ? "s" : ""} shown</span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                <div className="flex-1"><div className="h-4 bg-slate-100 rounded w-40 mb-2" /><div className="h-3 bg-slate-50 rounded w-28" /></div>
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
        <div className="space-y-2">
          {filtered.map(r => {
            const traffic = r.metrics?.organic_traffic;
            const prev = r.metrics?.prev_traffic;
            const diff = traffic != null && prev != null ? traffic - prev : null;
            const sc = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.draft;
            const isSelected = selected.has(r.id);
            const keywordCount = r.keywords?.length ?? 0;
            const workCount = r.work_done?.length ?? 0;
            const isDup = isDuplicate(r.clients?.id, r.month, r.year, r.id);

            return (
              <div key={r.id}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all group ${isSelected ? "border-blue-300 ring-1 ring-blue-200" : "border-slate-100"}`}>
                <div className="flex items-center gap-3 px-4 py-3.5">

                  {/* Checkbox */}
                  <button onClick={() => setSelected(prev => {
                    const s = new Set(prev);
                    if (s.has(r.id)) s.delete(r.id); else s.add(r.id);
                    return s;
                  })} className="text-slate-300 hover:text-blue-600 transition-colors shrink-0">
                    {isSelected ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                  </button>

                  {/* Icon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <FileText size={16} className="text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-700 text-sm">{r.clients?.name}</p>
                      {isDup && (
                        <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">duplicate</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-400">{r.month} {r.year}</span>
                      {keywordCount > 0 && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <BarChart3 size={10} /> {keywordCount} keyword{keywordCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {workCount > 0 && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Check size={10} /> {workCount} task{workCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {traffic != null && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Users size={10} /> {traffic.toLocaleString()} visits
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Traffic delta */}
                  {diff !== null && (
                    <div className={`hidden md:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${diff >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                      {diff >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {diff >= 0 ? "+" : ""}{diff.toLocaleString()}
                    </div>
                  )}

                  {/* Status badge — clickable to cycle */}
                  <button
                    onClick={() => cycleStatus(r)}
                    disabled={statusLoading === r.id}
                    title={sc.nextLabel}
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-all hover:opacity-80 shrink-0 flex items-center gap-1 ${sc.cls}`}
                  >
                    {statusLoading === r.id ? <Loader2 size={10} className="animate-spin" /> : null}
                    {sc.label}
                    <ChevronDown size={10} className="opacity-60" />
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/dashboard/reports/${r.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl transition-colors">
                      <Eye size={12} /> View
                    </Link>

                    {/* Send */}
                    <button onClick={() => { setSendModal(r); setSendMsg(""); }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors" title="Send report by email">
                      <Send size={14} />
                    </button>

                    {/* PDF */}
                    <button onClick={() => printReport(r.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors" title="Print / Save PDF">
                      <Download size={14} />
                    </button>

                    {/* Clone */}
                    <button onClick={() => openClone(r)}
                      disabled={cloneLoading === r.id}
                      className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors" title="Duplicate report">
                      {cloneLoading === r.id ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                    </button>

                    {/* Edit */}
                    <Link href={`/dashboard/reports/${r.id}/edit`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                      <Pencil size={14} />
                    </Link>

                    {/* Delete */}
                    <button onClick={() => del(r.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Send Modal */}
      {sendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Send Report</h3>
            <p className="text-sm text-slate-500 mb-4">
              Sending to <strong>{sendModal.clients.name}</strong> at <span className="text-blue-600">{sendModal.clients.email}</span>
            </p>
            {!sendModal.clients.email && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                This client has no email address. <Link href={`/dashboard/clients`} className="underline font-semibold">Add one first.</Link>
              </div>
            )}
            <textarea
              rows={4}
              value={sendMsg}
              onChange={e => setSendMsg(e.target.value)}
              placeholder="Optional personal message to client... (leave blank for default)"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setSendModal(null); setSendMsg(""); }}
                className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={quickSend} disabled={sending || !sendModal.clients.email}
                className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? <Loader2 size={14} className="animate-spin" /> : sentId === sendModal.id ? <Check size={14} /> : <Send size={14} />}
                {sending ? "Sending…" : sentId === sendModal.id ? "Sent!" : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone Modal */}
      {cloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Duplicate Report</h3>
            <p className="text-sm text-slate-500 mb-4">
              Cloning <strong>{cloneModal.clients.name} — {cloneModal.month} {cloneModal.year}</strong> into a new draft.
            </p>
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Month</label>
                <select value={cloneMonth} onChange={e => { setCloneMonth(e.target.value); setDupWarning(null); }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="w-28">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Year</label>
                <input type="number" value={cloneYear} onChange={e => { setCloneYear(Number(e.target.value)); setDupWarning(null); }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            {dupWarning && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {dupWarning}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setCloneModal(null); setDupWarning(null); }}
                className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={doClone} disabled={!!cloneLoading}
                className="flex-1 bg-violet-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {cloneLoading ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                {cloneLoading ? "Cloning…" : "Clone & Edit"}
              </button>
            </div>
          </div>
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
