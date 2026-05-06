"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus, Trash2, Pencil, Save, X, Calendar, Filter,
  CheckCircle2, Clock, Link2, FileText, Wrench,
  BarChart3, Globe, Search, ChevronDown, Download,
} from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CATEGORIES = [
  { value: "Backlinks",     label: "Backlinks",      icon: Link2,        color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "Technical SEO", label: "Technical SEO",  icon: Wrench,       color: "bg-red-100 text-red-700 border-red-200" },
  { value: "On-Page SEO",   label: "On-Page SEO",    icon: FileText,     color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "Content",       label: "Content",        icon: FileText,     color: "bg-teal-100 text-teal-700 border-teal-200" },
  { value: "Local SEO",     label: "Local SEO",      icon: Globe,        color: "bg-green-100 text-green-700 border-green-200" },
  { value: "GSC / Analytics", label: "GSC / Analytics", icon: BarChart3, color: "bg-violet-100 text-violet-700 border-violet-200" },
  { value: "Reporting",     label: "Reporting",      icon: FileText,     color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "Other",         label: "Other",          icon: Clock,        color: "bg-slate-100 text-slate-600 border-slate-200" },
];

interface WorkLog {
  id: string;
  client_id: string;
  log_date: string;
  month: string;
  year: number;
  category: string;
  task: string;
  status: string;
  clients?: { name: string; website: string };
}
interface Client { id: string; name: string; website: string; }

const catConfig = (cat: string) => CATEGORIES.find(c => c.value === cat) ?? CATEGORIES[CATEGORIES.length - 1];

const today = () => new Date().toISOString().slice(0, 10);
const nowMonth = () => MONTHS[new Date().getMonth()];
const nowYear = () => new Date().getFullYear();

function groupByDate(logs: WorkLog[]) {
  const map = new Map<string, WorkLog[]>();
  for (const log of logs) {
    const key = log.log_date;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(log);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const todayStr = today();
  const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);
  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function DailyLogContent() {
  const searchParams = useSearchParams();
  const initClientId = searchParams.get("clientId") ?? "";

  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState({ category: "", task: "", log_date: "", status: "done" });
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState(initClientId || "all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterMonth, setFilterMonth] = useState(nowMonth());
  const [filterYear, setFilterYear] = useState(nowYear());
  const [form, setForm] = useState({
    client_id: initClientId || "",
    log_date: today(),
    month: nowMonth(),
    year: nowYear(),
    category: "On-Page SEO",
    task: "",
    status: "done",
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterClient !== "all") params.set("clientId", filterClient);
    params.set("month", filterMonth);
    params.set("year", String(filterYear));
    fetch(`/api/work-logs?${params}`)
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setLogs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/clients").then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setClients(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => { load(); }, [filterClient, filterMonth, filterYear]);

  // Auto-set month/year when date changes
  const handleDateChange = (date: string) => {
    const d = new Date(date + "T00:00:00");
    setForm(f => ({ ...f, log_date: date, month: MONTHS[d.getMonth()], year: d.getFullYear() }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.task.trim()) return;
    setSaving(true);
    await fetch("/api/work-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setForm(f => ({ ...f, task: "" }));
    setShowForm(false);
    load();
  };

  const update = async (id: string) => {
    await fetch(`/api/work-logs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setEditing(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this log entry?")) return;
    await fetch(`/api/work-logs/${id}`, { method: "DELETE" });
    load();
  };

  const exportCSV = () => {
    const visible = filtered();
    if (!visible.length) { alert("No entries to export."); return; }
    const rows = [["Date", "Client", "Category", "Task", "Status"]];
    for (const log of visible) {
      rows.push([log.log_date, log.clients?.name ?? "", log.category, log.task, log.status]);
    }
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Daily-SEO-Log-${filterMonth}-${filterYear}.csv`;
    a.click();
  };

  const filtered = () => logs.filter(l => {
    const matchSearch = !search ||
      l.task.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase()) ||
      (l.clients?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || l.category === filterCat;
    return matchSearch && matchCat;
  });

  const grouped = groupByDate(filtered());
  const totalToday = logs.filter(l => l.log_date === today()).length;
  const totalThisMonth = logs.length;
  const catCounts = CATEGORIES.map(c => ({ ...c, count: logs.filter(l => l.category === c.value).length }))
    .filter(c => c.count > 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Daily SEO Work Log</h1>
          <p className="text-slate-500 text-sm mt-1">Track every task you do — builds into monthly reports automatically</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <Plus size={16} /> Log Work
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Tasks", value: totalToday, color: "text-blue-600", bg: "bg-blue-50" },
          { label: `${filterMonth} Total`, value: totalThisMonth, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Categories Used", value: catCounts.length, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Days Active", value: new Set(logs.map(l => l.log_date)).size, color: "text-orange-600", bg: "bg-orange-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-5 py-4`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6 animate-fade-in">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700">Log Today&apos;s Work</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
          </div>
          <form onSubmit={save} className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Client <span className="text-red-500">*</span></label>
                <select required value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- Select --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Date</label>
                <input type="date" value={form.log_date} onChange={e => handleDateChange(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="done">✅ Done</option>
                  <option value="in-progress">🔄 In Progress</option>
                  <option value="pending">⏳ Pending</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Task Description <span className="text-red-500">*</span></label>
              <textarea required value={form.task} onChange={e => setForm({ ...form, task: e.target.value })}
                rows={3} placeholder="e.g. Submitted 3 guest posts to DA30+ sites, fixed 404 on /services, updated meta descriptions for 5 pages..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                <Save size={14} /> {saving ? "Saving..." : "Save Entry"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-5 flex flex-wrap gap-3 items-center">
        {/* Month / Year picker */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
          <Calendar size={14} className="text-slate-400" />
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
            className="text-sm bg-transparent focus:outline-none text-slate-700 font-medium">
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          <input type="number" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
            className="w-16 text-sm bg-transparent focus:outline-none text-slate-700 font-medium" />
        </div>

        {/* Client filter */}
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {/* Category filter */}
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>

        <span className="text-xs text-slate-400 ml-auto">{filtered().length} entries</span>
      </div>

      {/* Category breakdown pills */}
      {catCounts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {catCounts.map(c => (
            <button key={c.value} onClick={() => setFilterCat(filterCat === c.value ? "all" : c.value)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                filterCat === c.value ? "bg-slate-800 text-white border-slate-800" : `${c.color} hover:opacity-80`
              }`}>
              {c.label} · {c.count}
            </button>
          ))}
        </div>
      )}

      {/* Log entries grouped by date */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-32 mb-4" />
              <div className="space-y-3">
                {[1,2].map(j => <div key={j} className="h-12 bg-slate-50 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Calendar size={36} className="text-slate-300" />
          </div>
          <h3 className="text-slate-600 font-bold text-lg mb-2">No work logged for {filterMonth} {filterYear}</h3>
          <p className="text-slate-400 text-sm mb-6">Start logging your daily SEO tasks — they&apos;ll build into monthly reports</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Log First Task
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, entries]) => (
            <div key={date} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Date header */}
              <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="font-bold text-slate-700 text-sm">{formatDate(date)}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400">{date}</span>
                </div>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {entries.length} task{entries.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Entries */}
              <div className="divide-y divide-slate-50">
                {entries.map(log => {
                  const cat = catConfig(log.category);
                  const CatIcon = cat.icon;
                  return (
                    <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/50 group transition-colors">
                      {editing === log.id ? (
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <select value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })}
                              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                            <input type="date" value={editData.log_date} onChange={e => setEditData({ ...editData, log_date: e.target.value })}
                              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}
                              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="done">✅ Done</option>
                              <option value="in-progress">🔄 In Progress</option>
                              <option value="pending">⏳ Pending</option>
                            </select>
                          </div>
                          <textarea value={editData.task} onChange={e => setEditData({ ...editData, task: e.target.value })}
                            rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => update(log.id)}
                              className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
                              <Save size={13} /> Save
                            </button>
                            <button onClick={() => setEditing(null)}
                              className="flex items-center gap-1.5 text-sm border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                              <X size={13} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Category icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cat.color}`}>
                            <CatIcon size={15} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cat.color}`}>
                                {log.category}
                              </span>
                              {log.clients?.name && (
                                <span className="text-xs text-slate-400 font-medium">{log.clients.name}</span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                log.status === "done" ? "bg-green-50 text-green-600" :
                                log.status === "in-progress" ? "bg-amber-50 text-amber-600" :
                                "bg-slate-100 text-slate-500"
                              }`}>
                                {log.status === "done" ? "✅ Done" : log.status === "in-progress" ? "🔄 In Progress" : "⏳ Pending"}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{log.task}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => { setEditing(log.id); setEditData({ category: log.category, task: log.task, log_date: log.log_date, status: log.status }); }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => del(log.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DailyLogPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-32 mb-4" />
            <div className="h-12 bg-slate-50 rounded-xl" />
          </div>
        ))}
      </div>
    }>
      <DailyLogContent />
    </Suspense>
  );
}
