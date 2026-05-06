"use client";
import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus, Trash2, Pencil, Save, X, Calendar, Search, Download,
  CheckCircle2, Clock, Link2, FileText, Wrench, BarChart3, Globe,
  AlertCircle, ChevronDown, ChevronUp, Paperclip, Image, Timer,
  User, Flag, StickyNote, Loader2, ExternalLink, Filter,
} from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CATEGORIES = [
  { value: "On-Page SEO",     icon: FileText,  color: "bg-blue-100 text-blue-700 border-blue-200",     dot: "bg-blue-500" },
  { value: "Technical SEO",   icon: Wrench,    color: "bg-red-100 text-red-700 border-red-200",         dot: "bg-red-500" },
  { value: "Backlinks",       icon: Link2,     color: "bg-orange-100 text-orange-700 border-orange-200",dot: "bg-orange-500" },
  { value: "Content",         icon: FileText,  color: "bg-teal-100 text-teal-700 border-teal-200",      dot: "bg-teal-500" },
  { value: "Local SEO",       icon: Globe,     color: "bg-green-100 text-green-700 border-green-200",   dot: "bg-green-500" },
  { value: "GSC / Analytics", icon: BarChart3, color: "bg-violet-100 text-violet-700 border-violet-200",dot: "bg-violet-500" },
  { value: "Reporting",       icon: FileText,  color: "bg-indigo-100 text-indigo-700 border-indigo-200",dot: "bg-indigo-500" },
  { value: "Other",           icon: Clock,     color: "bg-slate-100 text-slate-600 border-slate-200",   dot: "bg-slate-400" },
];

const PRIORITIES = [
  { value: "high",   label: "High",   color: "text-red-600 bg-red-50 border-red-200",     icon: "🔴" },
  { value: "medium", label: "Medium", color: "text-amber-600 bg-amber-50 border-amber-200",icon: "🟡" },
  { value: "low",    label: "Low",    color: "text-green-600 bg-green-50 border-green-200",icon: "🟢" },
];

const STATUSES = [
  { value: "done",        label: "Done",        icon: "✅", color: "bg-green-50 text-green-700 border-green-200" },
  { value: "in-progress", label: "In Progress", icon: "🔄", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "pending",     label: "Pending",     icon: "⏳", color: "bg-slate-50 text-slate-600 border-slate-200" },
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
  priority: string;
  time_spent: number | null;
  employee_name: string | null;
  notes: string | null;
  file_urls: string[];
  draft: boolean;
  clients?: { name: string; website: string };
}
interface Client { id: string; name: string; website: string; }

const catConfig = (cat: string) => CATEGORIES.find(c => c.value === cat) ?? CATEGORIES[CATEGORIES.length - 1];
const priConfig = (p: string) => PRIORITIES.find(x => x.value === p) ?? PRIORITIES[1];
const stConfig  = (s: string) => STATUSES.find(x => x.value === s) ?? STATUSES[0];
const today = () => new Date().toISOString().slice(0, 10);
const nowMonth = () => MONTHS[new Date().getMonth()];
const nowYear = () => new Date().getFullYear();

function groupByDate(logs: WorkLog[]) {
  const map = new Map<string, WorkLog[]>();
  for (const log of logs) {
    if (!map.has(log.log_date)) map.set(log.log_date, []);
    map.get(log.log_date)!.push(log);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00");
  const t = today();
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yStr = y.toISOString().slice(0, 10);
  if (d === t) return "Today";
  if (d === yStr) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}

function isImage(url: string) {
  return /\.(png|jpg|jpeg|webp|gif)$/i.test(url);
}

function FileChip({ url }: { url: string }) {
  const name = decodeURIComponent(url.split("/").pop()?.split("?")[0] ?? "file").replace(/^\d+-[a-z0-9]+\./, "");
  return (
    <a href={url} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-lg transition-colors border border-slate-200 max-w-[160px]">
      {isImage(url) ? <Image size={11} /> : <Paperclip size={11} />}
      <span className="truncate">{name}</span>
      <ExternalLink size={9} className="shrink-0 opacity-60" />
    </a>
  );
}

const DRAFT_KEY = "daily_log_draft";

function DailyLogContent() {
  const searchParams = useSearchParams();
  const initClientId = searchParams.get("clientId") ?? "";

  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState(initClientId || "all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterMonth, setFilterMonth] = useState(nowMonth());
  const [filterYear, setFilterYear] = useState(nowYear());
  const [showFilters, setShowFilters] = useState(false);

  // Editing
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<WorkLog>>({});
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const emptyForm = useCallback(() => ({
    client_id: initClientId || "",
    log_date: today(),
    month: nowMonth(),
    year: nowYear(),
    category: "On-Page SEO",
    task: "",
    status: "done",
    priority: "medium",
    time_spent: "",
    employee_name: "",
    notes: "",
    file_urls: [] as string[],
  }), [initClientId]);

  const [form, setForm] = useState(emptyForm);

  // Auto-save draft
  useEffect(() => {
    if (!showForm) return;
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }, 800);
    return () => clearTimeout(t);
  }, [form, showForm]);

  // Load draft on open
  const openForm = () => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) { try { setForm({ ...emptyForm(), ...JSON.parse(saved) }); } catch { setForm(emptyForm()); } }
    else setForm(emptyForm());
    setShowForm(true);
  };

  const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filterClient !== "all") p.set("clientId", filterClient);
    p.set("month", filterMonth);
    p.set("year", String(filterYear));
    fetch(`/api/work-logs?${p}`)
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setLogs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [filterClient, filterMonth, filterYear]);

  useEffect(() => {
    fetch("/api/clients").then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setClients(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDateChange = (date: string) => {
    const d = new Date(date + "T00:00:00");
    setForm(f => ({ ...f, log_date: date, month: MONTHS[d.getMonth()], year: d.getFullYear() }));
  };

  // File upload
  const uploadFiles = async (files: FileList, currentUrls: string[]): Promise<string[]> => {
    setUploading(true);
    const urls = [...currentUrls];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    setUploading(false);
    return urls;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const urls = await uploadFiles(e.target.files, form.file_urls);
    setForm(f => ({ ...f, file_urls: urls }));
    e.target.value = "";
  };

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const urls = await uploadFiles(e.target.files, editData.file_urls ?? []);
    setEditData(d => ({ ...d, file_urls: urls }));
    e.target.value = "";
  };

  const removeFile = (url: string) => setForm(f => ({ ...f, file_urls: f.file_urls.filter(u => u !== url) }));
  const removeEditFile = (url: string) => setEditData(d => ({ ...d, file_urls: (d.file_urls ?? []).filter(u => u !== url) }));

  const save = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    if (!form.client_id || !form.task.trim()) return;
    setSaving(true);
    await fetch("/api/work-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        time_spent: form.time_spent ? Number(form.time_spent) : null,
        draft: asDraft,
      }),
    });
    setSaving(false);
    clearDraft();
    setForm(emptyForm());
    if (!asDraft) setShowForm(false);
    load();
  };

  const update = async (id: string) => {
    await fetch(`/api/work-logs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editData,
        time_spent: editData.time_spent ? Number(editData.time_spent) : null,
      }),
    });
    setEditing(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/work-logs/${id}`, { method: "DELETE" });
    load();
  };

  const toggleStatus = async (log: WorkLog) => {
    const next = log.status === "done" ? "pending" : log.status === "pending" ? "in-progress" : "done";
    await fetch(`/api/work-logs/${log.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    load();
  };

  const exportCSV = () => {
    const vis = filtered();
    if (!vis.length) return;
    const rows = [["Date","Client","Category","Task","Status","Priority","Time (hrs)","Employee","Notes"]];
    for (const l of vis) rows.push([
      l.log_date, l.clients?.name ?? "", l.category, l.task,
      l.status, l.priority ?? "medium", String(l.time_spent ?? ""),
      l.employee_name ?? "", l.notes ?? "",
    ]);
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `SEO-Log-${filterMonth}-${filterYear}.csv`;
    a.click();
  };

  const filtered = () => logs.filter(l => {
    const q = search.toLowerCase();
    const matchS = !q || l.task.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)
      || (l.clients?.name ?? "").toLowerCase().includes(q) || (l.notes ?? "").toLowerCase().includes(q)
      || (l.employee_name ?? "").toLowerCase().includes(q);
    const matchC = filterCat === "all" || l.category === filterCat;
    const matchSt = filterStatus === "all" || l.status === filterStatus;
    const matchP = filterPriority === "all" || (l.priority ?? "medium") === filterPriority;
    return matchS && matchC && matchSt && matchP;
  });

  const grouped = groupByDate(filtered());
  const totalToday = logs.filter(l => l.log_date === today()).length;
  const totalHours = logs.reduce((s, l) => s + (l.time_spent ?? 0), 0);
  const doneCount = logs.filter(l => l.status === "done").length;
  const draftCount = logs.filter(l => l.draft).length;
  const catCounts = CATEGORIES.map(c => ({ ...c, count: logs.filter(l => l.category === c.value).length })).filter(c => c.count > 0);

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const labelCls = "text-xs font-semibold text-slate-600 block mb-1.5";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Daily SEO Work Log</h1>
          <p className="text-slate-500 text-sm mt-1">Track every task — time, priority, files, and notes all in one place</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={openForm}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <Plus size={16} /> Log Work
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Tasks",   value: totalToday,                      suffix: "",    color: "text-blue-600",   bg: "bg-blue-50",   icon: Calendar },
          { label: "Hours This Month",value: totalHours.toFixed(1),           suffix: "h",   color: "text-violet-600", bg: "bg-violet-50", icon: Timer },
          { label: "Tasks Completed", value: doneCount,                       suffix: "",    color: "text-green-600",  bg: "bg-green-50",  icon: CheckCircle2 },
          { label: "Drafts Saved",    value: draftCount,                      suffix: "",    color: "text-amber-600",  bg: "bg-amber-50",  icon: StickyNote },
        ].map(({ label, value, suffix, color, bg, icon: Icon }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3`}>
            <Icon size={20} className={`${color} shrink-0 opacity-70`} />
            <div>
              <p className={`text-2xl font-black ${color}`}>{value}{suffix}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Log Work Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-blue-50 to-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-blue-600" />
              <h2 className="font-bold text-slate-700">Log New Task</h2>
              <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">Auto-saved as draft</span>
            </div>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={save} className="p-6 space-y-5">
            {/* Row 1 — Client, Date, Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Client <span className="text-red-500">*</span></label>
                <select required value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className={inputCls}>
                  <option value="">Select client…</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input type="date" value={form.log_date} onChange={e => handleDateChange(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2 — Status, Priority, Time, Employee */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={inputCls}>
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}><Timer size={11} className="inline mr-1" />Time Spent (hrs)</label>
                <input type="number" min="0" step="0.25" value={form.time_spent}
                  onChange={e => setForm({ ...form, time_spent: e.target.value })}
                  placeholder="e.g. 1.5" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}><User size={11} className="inline mr-1" />Employee</label>
                <input value={form.employee_name} onChange={e => setForm({ ...form, employee_name: e.target.value })}
                  placeholder="Your name" className={inputCls} />
              </div>
            </div>

            {/* Task description */}
            <div>
              <label className={labelCls}>Task Description <span className="text-red-500">*</span></label>
              <textarea required value={form.task} onChange={e => setForm({ ...form, task: e.target.value })}
                rows={3} placeholder="e.g. Fixed 3 broken links on /services, submitted guest post to DA40 site, updated title tags for 5 product pages..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}><StickyNote size={11} className="inline mr-1" />Notes / Comments (optional)</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2} placeholder="Additional context, client feedback, blockers, next steps..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            {/* File / Screenshot upload */}
            <div>
              <label className={labelCls}><Paperclip size={11} className="inline mr-1" />Attachments (screenshots, PDFs, reports)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.csv,.xlsx,.xls"
                  onChange={handleFileUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline disabled:opacity-50">
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {uploading ? "Uploading…" : "Add files or screenshots"}
                </button>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF, CSV, Excel · Max 10MB each</p>
                {form.file_urls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.file_urls.map(url => (
                      <div key={url} className="flex items-center gap-1">
                        <FileChip url={url} />
                        <button type="button" onClick={() => removeFile(url)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-0.5">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Image previews */}
                {form.file_urls.filter(isImage).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.file_urls.filter(isImage).map(url => (
                      <img key={url} src={url} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving…" : "Save Entry"}
              </button>
              <button type="button" onClick={(e) => save(e, true)} disabled={saving}
                className="flex items-center gap-2 border border-amber-200 text-amber-700 bg-amber-50 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-100 disabled:opacity-50 transition-colors">
                <StickyNote size={14} /> Save as Draft
              </button>
              <button type="button" onClick={() => { setShowForm(false); clearDraft(); setForm(emptyForm()); }}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                Discard
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Month/Year */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
            <Calendar size={13} className="text-slate-400" />
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
              className="text-sm bg-transparent focus:outline-none text-slate-700 font-medium">
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
            <input type="number" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
              className="w-16 text-sm bg-transparent focus:outline-none text-slate-700 font-medium" />
          </div>

          {/* Client */}
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="all">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-40">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks, notes, employee…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>

          {/* More filters toggle */}
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border transition-colors ${showFilters ? "bg-slate-800 text-white border-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Filter size={13} /> Filters {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          <span className="text-xs text-slate-400 ml-auto">{filtered().length} entries</span>
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="all">All Statuses</option>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="all">All Priorities</option>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
            </select>
            <button onClick={() => { setFilterCat("all"); setFilterStatus("all"); setFilterPriority("all"); setSearch(""); }}
              className="text-xs text-slate-500 hover:text-red-500 underline px-2">Clear filters</button>
          </div>
        )}
      </div>

      {/* Category breakdown pills */}
      {catCounts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {catCounts.map(c => (
            <button key={c.value} onClick={() => setFilterCat(filterCat === c.value ? "all" : c.value)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                filterCat === c.value ? "bg-slate-800 text-white border-slate-800" : `${c.color} hover:opacity-80`
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              {c.value} · {c.count}
            </button>
          ))}
        </div>
      )}

      {/* Log list */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-32 mb-4" />
              {[1,2].map(j => <div key={j} className="h-12 bg-slate-50 rounded-xl mb-3" />)}
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Calendar size={36} className="text-slate-300" />
          </div>
          <h3 className="text-slate-600 font-bold text-lg mb-2">No work logged for {filterMonth} {filterYear}</h3>
          <p className="text-slate-400 text-sm mb-6">Log your daily SEO tasks — they build into monthly reports automatically</p>
          <button onClick={openForm}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Log First Task
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, entries]) => {
            const dayHours = entries.reduce((s, l) => s + (l.time_spent ?? 0), 0);
            const doneN = entries.filter(l => l.status === "done").length;
            return (
              <div key={date} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Date header */}
                <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Calendar size={13} className="text-slate-400" />
                    <span className="font-bold text-slate-700 text-sm">{formatDate(date)}</span>
                    <span className="text-xs text-slate-400">{date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {dayHours > 0 && <span className="flex items-center gap-1"><Timer size={11} />{dayHours.toFixed(1)}h</span>}
                    <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-green-500" />{doneN}/{entries.length}</span>
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">{entries.length} task{entries.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-50">
                  {entries.map(log => {
                    const cat = catConfig(log.category);
                    const CatIcon = cat.icon;
                    const pri = priConfig(log.priority ?? "medium");
                    const st = stConfig(log.status);
                    const isExpanded = expandedLog === log.id;

                    return (
                      <div key={log.id} className={`${log.draft ? "bg-amber-50/30" : ""} group transition-colors`}>
                        {editing === log.id ? (
                          /* ── Edit Mode ── */
                          <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <select value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })}
                                className={inputCls}>
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                              </select>
                              <input type="date" value={editData.log_date} onChange={e => setEditData({ ...editData, log_date: e.target.value })}
                                className={inputCls} />
                              <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}
                                className={inputCls}>
                                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
                              </select>
                              <select value={editData.priority ?? "medium"} onChange={e => setEditData({ ...editData, priority: e.target.value })}
                                className={inputCls}>
                                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className={labelCls}><Timer size={10} className="inline mr-1" />Time (hrs)</label>
                                <input type="number" min="0" step="0.25" value={editData.time_spent ?? ""}
                                  onChange={e => setEditData({ ...editData, time_spent: e.target.value as unknown as number })}
                                  className={inputCls} placeholder="e.g. 1.5" />
                              </div>
                              <div>
                                <label className={labelCls}><User size={10} className="inline mr-1" />Employee</label>
                                <input value={editData.employee_name ?? ""}
                                  onChange={e => setEditData({ ...editData, employee_name: e.target.value })}
                                  className={inputCls} />
                              </div>
                            </div>
                            <textarea value={editData.task} onChange={e => setEditData({ ...editData, task: e.target.value })}
                              rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                            <textarea value={editData.notes ?? ""} onChange={e => setEditData({ ...editData, notes: e.target.value })}
                              rows={2} placeholder="Notes…" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                            {/* File upload in edit */}
                            <div>
                              <input ref={editFileRef} type="file" multiple accept="image/*,.pdf,.csv,.xlsx"
                                onChange={handleEditFileUpload} className="hidden" />
                              <button type="button" onClick={() => editFileRef.current?.click()}
                                disabled={uploading}
                                className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline disabled:opacity-50">
                                {uploading ? <Loader2 size={11} className="animate-spin" /> : <Paperclip size={11} />}
                                {uploading ? "Uploading…" : "Add files"}
                              </button>
                              {(editData.file_urls ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {(editData.file_urls ?? []).map(url => (
                                    <div key={url} className="flex items-center gap-1">
                                      <FileChip url={url} />
                                      <button type="button" onClick={() => removeEditFile(url)}
                                        className="text-slate-300 hover:text-red-500 p-0.5"><X size={11} /></button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
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
                          /* ── View Mode ── */
                          <div className="px-5 py-4">
                            <div className="flex items-start gap-3">
                              {/* Status toggle button */}
                              <button onClick={() => toggleStatus(log)} title="Click to change status"
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  log.status === "done" ? "bg-green-500 border-green-500 text-white" :
                                  log.status === "in-progress" ? "bg-amber-400 border-amber-400 text-white" :
                                  "border-slate-300 text-transparent hover:border-blue-400"
                                }`}>
                                {log.status === "done" && <CheckCircle2 size={13} />}
                                {log.status === "in-progress" && <Clock size={11} />}
                              </button>

                              {/* Category icon */}
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${cat.color}`}>
                                <CatIcon size={13} />
                              </div>

                              {/* Main content */}
                              <div className="flex-1 min-w-0">
                                {/* Badges row */}
                                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cat.color}`}>{log.category}</span>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.color}`}>{st.icon} {st.label}</span>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${pri.color}`}>
                                    <Flag size={9} />{pri.label}
                                  </span>
                                  {log.draft && <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">Draft</span>}
                                  {log.clients?.name && <span className="text-xs text-slate-400 font-medium">{log.clients.name}</span>}
                                  {log.employee_name && (
                                    <span className="text-xs text-slate-400 flex items-center gap-1"><User size={10} />{log.employee_name}</span>
                                  )}
                                  {log.time_spent != null && log.time_spent > 0 && (
                                    <span className="text-xs text-slate-400 flex items-center gap-1"><Timer size={10} />{log.time_spent}h</span>
                                  )}
                                </div>

                                {/* Task */}
                                <p className={`text-sm text-slate-700 leading-relaxed ${log.status === "done" ? "line-through text-slate-400" : ""}`}>
                                  {log.task}
                                </p>

                                {/* Expand for notes + files */}
                                {(log.notes || (log.file_urls ?? []).length > 0) && (
                                  <button onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-1.5 font-medium">
                                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                    {isExpanded ? "Hide details" : `Show details${log.notes ? " · Notes" : ""}${(log.file_urls ?? []).length > 0 ? ` · ${log.file_urls.length} file${log.file_urls.length > 1 ? "s" : ""}` : ""}`}
                                  </button>
                                )}

                                {isExpanded && (
                                  <div className="mt-3 space-y-3">
                                    {log.notes && (
                                      <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                                        <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1"><StickyNote size={11} /> Notes</p>
                                        <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-wrap">{log.notes}</p>
                                      </div>
                                    )}
                                    {(log.file_urls ?? []).length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1"><Paperclip size={11} /> Attachments</p>
                                        <div className="flex flex-wrap gap-2">
                                          {(log.file_urls ?? []).map(url => <FileChip key={url} url={url} />)}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {(log.file_urls ?? []).filter(isImage).map(url => (
                                            <a key={url} href={url} target="_blank" rel="noreferrer">
                                              <img src={url} alt="attachment" className="w-24 h-24 object-cover rounded-xl border border-slate-200 hover:opacity-90 transition-opacity" />
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button onClick={() => {
                                  setEditing(log.id);
                                  setEditData({ ...log });
                                  setExpandedLog(null);
                                }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => del(log.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
            <div className="h-12 bg-slate-50 rounded-xl mb-3" />
          </div>
        ))}
      </div>
    }>
      <DailyLogContent />
    </Suspense>
  );
}
