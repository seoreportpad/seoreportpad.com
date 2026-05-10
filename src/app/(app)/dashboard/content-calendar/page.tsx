"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Plus, Trash2, Pencil, Save, X, Search, Calendar,
  ChevronLeft, ChevronRight, FileText, Download, Filter,
  Bell, CheckSquare, Square, AlertTriangle, LayoutGrid,
  List, Columns, Star, Target, BookOpen, Zap,
} from "lucide-react";

interface ContentPost {
  id: string;
  title: string;
  keyword: string;
  client: string;
  type: string;
  status: "idea" | "assigned" | "writing" | "review" | "scheduled" | "published";
  assignee: string;
  publish_date: string;
  notes: string;
  url: string;
  word_count: number;
  target_words: number;
  priority: "high" | "medium" | "low";
  brief_url: string;
  brief_status: "none" | "pending" | "ready";
  created_at: string;
}

const TYPES = ["Blog Post", "Service Page", "Location Page", "Homepage", "Product Page", "Landing Page", "GMB Post", "Social Post", "Other"];

const STATUSES = [
  { value: "idea",       label: "Idea",       color: "text-slate-500 bg-slate-100 border-slate-200",   col: "bg-slate-50" },
  { value: "assigned",   label: "Assigned",   color: "text-blue-600 bg-blue-50 border-blue-200",       col: "bg-blue-50/40" },
  { value: "writing",    label: "Writing",    color: "text-amber-600 bg-amber-50 border-amber-200",    col: "bg-amber-50/40" },
  { value: "review",     label: "Review",     color: "text-violet-600 bg-violet-50 border-violet-200", col: "bg-violet-50/40" },
  { value: "scheduled",  label: "Scheduled",  color: "text-teal-600 bg-teal-50 border-teal-200",       col: "bg-teal-50/40" },
  { value: "published",  label: "Published",  color: "text-green-600 bg-green-50 border-green-200",    col: "bg-green-50/40" },
];

const PRIORITIES = [
  { value: "high",   label: "High",   color: "text-red-600 bg-red-50 border-red-200" },
  { value: "medium", label: "Medium", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "low",    label: "Low",    color: "text-slate-500 bg-slate-100 border-slate-200" },
];

const BRIEF_STATUSES = [
  { value: "none",    label: "No Brief",   color: "text-slate-400" },
  { value: "pending", label: "Pending",    color: "text-amber-500" },
  { value: "ready",   label: "Brief Ready", color: "text-green-600" },
];

const TEMPLATES: Array<Partial<ContentPost> & { label: string; icon: string }> = [
  { label: "SEO Blog Post",      icon: "📝", type: "Blog Post",      target_words: 1500, priority: "medium", notes: "Include FAQ section, internal links, optimized H2s" },
  { label: "Service Page",       icon: "🛠️", type: "Service Page",   target_words: 800,  priority: "high",   notes: "Focus on local intent, add CTA, include schema markup" },
  { label: "Location Page",      icon: "📍", type: "Location Page",  target_words: 600,  priority: "high",   notes: "NAP consistency, embed map, local testimonials" },
  { label: "GMB Weekly Post",    icon: "📣", type: "GMB Post",       target_words: 150,  priority: "medium", notes: "Include CTA, seasonal offer, relevant image" },
  { label: "Product Description",icon: "🛒", type: "Product Page",   target_words: 500,  priority: "medium", notes: "Benefits-first, keyword-rich, structured data" },
  { label: "Landing Page",       icon: "🎯", type: "Landing Page",   target_words: 700,  priority: "high",   notes: "Above-fold CTA, social proof, clear H1" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const LS_KEY = "seo_content_calendar_v2";
function load(): ContentPost[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function persist(d: ContentPost[]) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const stCfg = (v: string) => STATUSES.find(s => s.value === v) ?? STATUSES[0];
const prCfg = (v: string) => PRIORITIES.find(p => p.value === v) ?? PRIORITIES[1];

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00"); d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function DateBadge({ dateStr }: { dateStr: string }) {
  const d = daysUntil(dateStr);
  if (d === null) return <span className="text-slate-300 text-sm">—</span>;
  if (d < 0)  return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Overdue {Math.abs(d)}d</span>;
  if (d === 0) return <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">Today</span>;
  if (d === 1) return <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Tomorrow</span>;
  if (d <= 7)  return <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">In {d}d</span>;
  return <span className="text-sm text-slate-600">{new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>;
}

const emptyForm = (overrides?: Partial<ContentPost>): Omit<ContentPost, "id" | "created_at"> => ({
  title: "", keyword: "", client: "", type: "Blog Post", status: "idea",
  assignee: "", publish_date: "", notes: "", url: "",
  word_count: 0, target_words: 1000, priority: "medium",
  brief_url: "", brief_status: "none",
  ...overrides,
});

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }

export default function ContentCalendarPage() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [view, setView] = useState<"calendar" | "list" | "kanban">("calendar");
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ContentPost>>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClient, setFilterClient] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [monthTarget, setMonthTarget] = useState(10);
  const [showTargetEdit, setShowTargetEdit] = useState(false);

  const [calYear, setCalYear] = useState(0);
  const [calMonth, setCalMonth] = useState(0);

  useEffect(() => {
    setPosts(load());
    const now = new Date();
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
  }, []);

  const save = (d: ContentPost[]) => { setPosts(d); persist(d); };

  const addPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    save([{ ...form, id: uid(), created_at: new Date().toISOString() }, ...posts]);
    setForm(emptyForm());
    setShowForm(false);
    setShowTemplates(false);
  };

  const updatePost = (id: string) => {
    save(posts.map(p => p.id === id ? { ...p, ...editData } : p));
    setEditing(null);
  };

  const deletePost = (id: string) => {
    if (!confirm("Remove this post?")) return;
    save(posts.filter(p => p.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const bulkDelete = () => {
    if (!confirm(`Delete ${selected.size} posts?`)) return;
    save(posts.filter(p => !selected.has(p.id)));
    setSelected(new Set());
  };

  const bulkStatus = (status: ContentPost["status"]) => {
    save(posts.map(p => selected.has(p.id) ? { ...p, status } : p));
    setSelected(new Set());
  };

  const allClients = useMemo(() => [...new Set(posts.map(p => p.client).filter(Boolean))], [posts]);

  const filtered = useMemo(() => posts.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.title.toLowerCase().includes(q) || p.keyword.toLowerCase().includes(q) || p.client.toLowerCase().includes(q))
      && (filterStatus === "all" || p.status === filterStatus)
      && (filterClient === "all" || p.client === filterClient)
      && (filterPriority === "all" || p.priority === filterPriority);
  }), [posts, search, filterStatus, filterClient, filterPriority]);

  const exportCSV = () => {
    const rows = [["Title","Keyword","Client","Type","Status","Priority","Assignee","Publish Date","Word Count","Target Words","URL","Brief URL","Brief Status","Notes"]];
    for (const p of filtered) rows.push([p.title,p.keyword,p.client,p.type,p.status,p.priority,p.assignee,p.publish_date,String(p.word_count),String(p.target_words),p.url,p.brief_url,p.brief_status,p.notes]);
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download = "content-calendar.csv"; a.click();
  };

  const exportTextReport = () => {
    const now = new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
    const lines: string[] = [`CONTENT CALENDAR REPORT — ${now}`, "=".repeat(50), ""];
    const byStatus: Record<string, ContentPost[]> = {};
    for (const s of STATUSES) byStatus[s.value] = filtered.filter(p => p.status === s.value);
    for (const s of STATUSES) {
      if (!byStatus[s.value].length) continue;
      lines.push(`${s.label.toUpperCase()} (${byStatus[s.value].length})`);
      lines.push("-".repeat(30));
      for (const p of byStatus[s.value]) {
        lines.push(`• ${p.title}`);
        if (p.keyword) lines.push(`  Keyword: ${p.keyword}`);
        if (p.client) lines.push(`  Client: ${p.client}`);
        if (p.publish_date) lines.push(`  Publish: ${p.publish_date}`);
        if (p.assignee) lines.push(`  Assignee: ${p.assignee}`);
        if (p.notes) lines.push(`  Notes: ${p.notes}`);
      }
      lines.push("");
    }
    lines.push(`TOTALS: ${posts.length} total | ${posts.filter(p=>p.status==="published").length} published | ${posts.filter(p=>p.status==="scheduled").length} scheduled`);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "content-report.txt"; a.click();
  };

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const calPrefix = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;
  const postsForDay = (day: number) => {
    const dateStr = `${calPrefix}-${String(day).padStart(2, "0")}`;
    return posts.filter(p => p.publish_date === dateStr);
  };

  const now = new Date();
  const curMonthPosts = posts.filter(p => {
    if (!p.publish_date) return false;
    const d = new Date(p.publish_date + "T00:00:00");
    return d.getMonth() === calMonth && d.getFullYear() === calYear;
  });
  const publishedThisMonth = curMonthPosts.filter(p => p.status === "published").length;
  const monthProgress = Math.min(100, Math.round((publishedThisMonth / (monthTarget || 1)) * 100));

  const overdue = posts.filter(p => {
    const d = daysUntil(p.publish_date);
    return d !== null && d < 0 && p.status !== "published";
  });

  const published = posts.filter(p => p.status === "published").length;
  const scheduled = posts.filter(p => p.status === "scheduled").length;
  const inProgress = posts.filter(p => ["writing", "review", "assigned"].includes(p.status)).length;

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white";
  const labelCls = "text-xs font-semibold text-slate-600 block mb-1.5";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Content Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">Plan, schedule, and track all content across clients</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {(["calendar","list","kanban"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-2 text-sm font-medium transition-colors capitalize flex items-center gap-1.5 ${view === v ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                {v === "calendar" && <Calendar size={13} />}
                {v === "list" && <List size={13} />}
                {v === "kanban" && <Columns size={13} />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm">
            <Download size={14} /> CSV
          </button>
          <button onClick={exportTextReport} className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm">
            <FileText size={14} /> Report
          </button>
          <button onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 border border-teal-200 bg-teal-50 text-teal-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-teal-100 shadow-sm">
            <Zap size={14} /> Templates
          </button>
          <button onClick={() => { setShowForm(true); setForm(emptyForm()); setShowTemplates(false); }}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200">
            <Plus size={15} /> Add Post
          </button>
        </div>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 mb-5 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {overdue.length} post{overdue.length > 1 ? "s" : ""} past their publish date and not yet published:&nbsp;
            <span className="font-semibold">{overdue.slice(0, 3).map(p => p.title).join(", ")}{overdue.length > 3 ? ` +${overdue.length - 3} more` : ""}</span>
          </p>
        </div>
      )}

      {/* Stats + monthly target */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
        {[
          { label: "Total Posts",  value: posts.length,  color: "text-slate-700",  bg: "bg-slate-50" },
          { label: "In Progress",  value: inProgress,    color: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Scheduled",    value: scheduled,     color: "text-teal-600",   bg: "bg-teal-50" },
          { label: "Published",    value: published,     color: "text-green-600",  bg: "bg-green-50" },
          { label: "Overdue",      value: overdue.length, color: overdue.length > 0 ? "text-red-600" : "text-slate-400", bg: overdue.length > 0 ? "bg-red-50" : "bg-slate-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-4 py-3`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Monthly target progress */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-teal-600" />
            <span className="text-sm font-semibold text-slate-700">{MONTHS[calMonth]} Publishing Target</span>
            <span className="text-sm text-slate-500">{publishedThisMonth} / {monthTarget} published</span>
          </div>
          <button onClick={() => setShowTargetEdit(!showTargetEdit)} className="text-xs text-teal-600 hover:underline">
            {showTargetEdit ? "Done" : "Set Target"}
          </button>
        </div>
        {showTargetEdit && (
          <div className="mb-3">
            <input type="number" min="1" max="100" value={monthTarget} onChange={e => setMonthTarget(Number(e.target.value))}
              className="w-24 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        )}
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full transition-all ${monthProgress >= 100 ? "bg-green-500" : monthProgress >= 60 ? "bg-teal-500" : "bg-amber-400"}`}
            style={{ width: `${monthProgress}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-1">{monthProgress}% of monthly target reached</p>
      </div>

      {/* Templates panel */}
      {showTemplates && (
        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm mb-5 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Zap size={14} className="text-teal-600" /> Quick Start Templates</h3>
            <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={14} /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TEMPLATES.map(t => (
              <button key={t.label} onClick={() => {
                setForm(emptyForm({ type: t.type, target_words: t.target_words, priority: t.priority, notes: t.notes }));
                setShowForm(true); setShowTemplates(false);
              }} className="text-left px-4 py-3 border border-slate-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-colors">
                <p className="text-base mb-1">{t.icon}</p>
                <p className="text-sm font-semibold text-slate-700">{t.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.target_words} words · {t.priority} priority</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-teal-50 to-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center gap-2"><FileText size={16} className="text-teal-600" />New Content</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={16} /></button>
          </div>
          <form onSubmit={addPost} className="p-6 space-y-4">
            <div>
              <label className={labelCls}>Title <span className="text-red-500">*</span></label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 10 Best Plumbers in Dubai" className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Target Keyword</label>
                <input value={form.keyword} onChange={e => setForm({ ...form, keyword: e.target.value })} placeholder="e.g. best plumber Dubai" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Client</label>
                <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Client name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Assignee</label>
                <input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} placeholder="Writer name" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Content Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputCls}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ContentPost["status"] })} className={inputCls}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as ContentPost["priority"] })} className={inputCls}>
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}><Calendar size={11} className="inline mr-1" />Publish Date</label>
                <input type="date" value={form.publish_date} onChange={e => setForm({ ...form, publish_date: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Target Words</label>
                <input type="number" min="0" value={form.target_words} onChange={e => setForm({ ...form, target_words: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Words Written</label>
                <input type="number" min="0" value={form.word_count} onChange={e => setForm({ ...form, word_count: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Brief Status</label>
                <select value={form.brief_status} onChange={e => setForm({ ...form, brief_status: e.target.value as ContentPost["brief_status"] })} className={inputCls}>
                  {BRIEF_STATUSES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Brief URL</label>
                <input value={form.brief_url} onChange={e => setForm({ ...form, brief_url: e.target.value })} placeholder="Google Docs link..." className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Published URL</label>
                <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Brief link, special instructions..." className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors">
                <Save size={14} /> Save Post
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === "calendar" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft size={16} /></button>
            <div className="text-center">
              <h2 className="text-base font-bold text-slate-800">{MONTHS[calMonth]} {calYear}</h2>
              <p className="text-xs text-slate-400">{curMonthPosts.length} scheduled</p>
            </div>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-100">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="px-2 py-2 text-center text-xs font-bold text-slate-400 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[90px] border-r border-b border-slate-50 bg-slate-50/30" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dayPosts = postsForDay(day);
              const today = new Date();
              const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate();
              return (
                <div key={day} onClick={() => { setForm(emptyForm({ publish_date: `${calPrefix}-${String(day).padStart(2,"0")}` })); setShowForm(true); }}
                  className={`min-h-[90px] border-r border-b border-slate-50 p-1.5 cursor-pointer ${isToday ? "bg-teal-50/40" : "hover:bg-slate-50/50"} transition-colors`}>
                  <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-teal-600 text-white" : "text-slate-500"}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 3).map(p => {
                      const st = stCfg(p.status);
                      const pr = prCfg(p.priority);
                      return (
                        <div key={p.id} onClick={e => { e.stopPropagation(); setEditing(p.id); setEditData({ ...p }); }}
                          className={`text-xs px-1.5 py-0.5 rounded font-medium truncate cursor-pointer border ${st.color} flex items-center gap-1`} title={p.title}>
                          {p.priority === "high" && <Star size={9} className="flex-shrink-0 text-red-500 fill-red-400" />}
                          <span className="truncate">{p.title}</span>
                        </div>
                      );
                    })}
                    {dayPosts.length > 3 && <div className="text-xs text-slate-400 px-1">+{dayPosts.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KANBAN VIEW */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map(st => {
            const colPosts = filtered.filter(p => p.status === st.value);
            return (
              <div key={st.value} className="flex-shrink-0 w-64">
                <div className={`rounded-2xl border border-slate-100 shadow-sm overflow-hidden`}>
                  <div className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between ${st.col}`}>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                    <span className="text-xs text-slate-400 font-medium">{colPosts.length}</span>
                  </div>
                  <div className="bg-white p-2 space-y-2 min-h-[200px]">
                    {colPosts.map(p => {
                      const pr = prCfg(p.priority);
                      const bs = BRIEF_STATUSES.find(b => b.value === p.brief_status) ?? BRIEF_STATUSES[0];
                      return (
                        <div key={p.id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-semibold text-slate-800 leading-tight">{p.title}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full border flex-shrink-0 ${pr.color}`}>{pr.label}</span>
                          </div>
                          {p.keyword && <p className="text-xs text-slate-400 mb-1">{p.keyword}</p>}
                          {p.client && <p className="text-xs text-slate-500 font-medium mb-2">{p.client}</p>}
                          <div className="flex items-center justify-between">
                            {p.publish_date
                              ? <DateBadge dateStr={p.publish_date} />
                              : <span className="text-xs text-slate-300">No date</span>}
                            <span className={`text-xs font-medium ${bs.color}`}>{bs.label}</span>
                          </div>
                          {p.target_words > 0 && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                                <span>Words</span>
                                <span>{p.word_count}/{p.target_words}</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-teal-500 transition-all"
                                  style={{ width: `${Math.min(100, Math.round((p.word_count / p.target_words) * 100))}%` }} />
                              </div>
                            </div>
                          )}
                          <div className="flex gap-1 mt-2">
                            <button onClick={() => { setEditing(p.id); setEditData({ ...p }); }}
                              className="flex-1 text-xs text-slate-400 hover:text-teal-600 py-1 rounded-lg hover:bg-teal-50 transition-colors">
                              <Pencil size={11} className="mx-auto" />
                            </button>
                            <button onClick={() => deletePost(p.id)}
                              className="flex-1 text-xs text-slate-400 hover:text-red-500 py-1 rounded-lg hover:bg-red-50 transition-colors">
                              <Trash2 size={11} className="mx-auto" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <button onClick={() => { setForm(emptyForm({ status: st.value as ContentPost["status"] })); setShowForm(true); }}
                      className="w-full text-xs text-slate-400 hover:text-teal-600 py-2 border border-dashed border-slate-200 rounded-xl hover:border-teal-300 transition-colors flex items-center justify-center gap-1">
                      <Plus size={11} /> Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, keyword, client..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
                <option value="all">All Statuses</option>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
                <option value="all">All Priorities</option>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              {allClients.length > 0 && (
                <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
                  <option value="all">All Clients</option>
                  {allClients.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              <span className="text-xs text-slate-400 ml-auto">{filtered.length} posts</span>
            </div>
          </div>

          {/* Bulk actions bar */}
          {selected.size > 0 && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-3 mb-4 flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-teal-700">{selected.size} selected</span>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map(s => (
                  <button key={s.value} onClick={() => bulkStatus(s.value as ContentPost["status"])}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${s.color}`}>{s.label}</button>
                ))}
                <button onClick={bulkDelete} className="text-xs px-3 py-1.5 rounded-lg border font-medium text-red-600 bg-red-50 border-red-200 hover:bg-red-100">
                  <Trash2 size={11} className="inline mr-1" /> Delete
                </button>
              </div>
              <button onClick={() => setSelected(new Set())} className="ml-auto text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white">
                <X size={14} />
              </button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Calendar size={40} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-slate-600 font-bold text-lg mb-2">No content yet</h3>
              <p className="text-slate-400 text-sm mb-6">Start planning your content pipeline</p>
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700">
                <Plus size={15} /> Add First Post
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="px-4 py-3 w-8">
                      <button onClick={() => {
                        if (selected.size === filtered.length) setSelected(new Set());
                        else setSelected(new Set(filtered.map(p => p.id)));
                      }} className="text-slate-400 hover:text-teal-600">
                        {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Title / Keyword</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Words</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Brief</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Publish Date</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(p => {
                    const st = stCfg(p.status);
                    const pr = prCfg(p.priority);
                    const bs = BRIEF_STATUSES.find(b => b.value === p.brief_status) ?? BRIEF_STATUSES[0];
                    const wordPct = p.target_words > 0 ? Math.min(100, Math.round((p.word_count / p.target_words) * 100)) : 0;
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors group ${selected.has(p.id) ? "bg-teal-50/30" : ""}`}>
                        {editing === p.id ? (
                          <td colSpan={9} className="px-5 py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                              <input value={editData.title ?? ""} onChange={e => setEditData({ ...editData, title: e.target.value })}
                                placeholder="Title" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 col-span-2" />
                              <input value={editData.keyword ?? ""} onChange={e => setEditData({ ...editData, keyword: e.target.value })}
                                placeholder="Keyword" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                              <input value={editData.client ?? ""} onChange={e => setEditData({ ...editData, client: e.target.value })}
                                placeholder="Client" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                              <input value={editData.assignee ?? ""} onChange={e => setEditData({ ...editData, assignee: e.target.value })}
                                placeholder="Assignee" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                              <select value={editData.status ?? "idea"} onChange={e => setEditData({ ...editData, status: e.target.value as ContentPost["status"] })}
                                className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                              <select value={editData.priority ?? "medium"} onChange={e => setEditData({ ...editData, priority: e.target.value as ContentPost["priority"] })}
                                className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                                {PRIORITIES.map(px => <option key={px.value} value={px.value}>{px.label}</option>)}
                              </select>
                              <input type="date" value={editData.publish_date ?? ""} onChange={e => setEditData({ ...editData, publish_date: e.target.value })}
                                className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                              <input type="number" min="0" value={editData.word_count ?? 0} onChange={e => setEditData({ ...editData, word_count: Number(e.target.value) })}
                                placeholder="Words written" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                              <input type="number" min="0" value={editData.target_words ?? 1000} onChange={e => setEditData({ ...editData, target_words: Number(e.target.value) })}
                                placeholder="Target words" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                              <select value={editData.brief_status ?? "none"} onChange={e => setEditData({ ...editData, brief_status: e.target.value as ContentPost["brief_status"] })}
                                className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                                {BRIEF_STATUSES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                              </select>
                              <input value={editData.brief_url ?? ""} onChange={e => setEditData({ ...editData, brief_url: e.target.value })}
                                placeholder="Brief URL" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                              <input value={editData.url ?? ""} onChange={e => setEditData({ ...editData, url: e.target.value })}
                                placeholder="Published URL" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                              <input value={editData.notes ?? ""} onChange={e => setEditData({ ...editData, notes: e.target.value })}
                                placeholder="Notes" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => updatePost(p.id)} className="flex items-center gap-1.5 text-sm bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700">
                                <Save size={13} /> Save
                              </button>
                              <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 text-sm border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">
                                <X size={13} /> Cancel
                              </button>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="px-4 py-3">
                              <button onClick={() => toggleSelect(p.id)} className="text-slate-400 hover:text-teal-600">
                                {selected.has(p.id) ? <CheckSquare size={14} className="text-teal-600" /> : <Square size={14} />}
                              </button>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-semibold text-slate-800 text-sm">{p.title}</p>
                              {p.keyword && <p className="text-xs text-slate-400 mt-0.5">{p.keyword}</p>}
                              {p.client && <p className="text-xs text-slate-500">{p.client}</p>}
                            </td>
                            <td className="px-4 py-4"><span className="text-sm text-slate-600">{p.type}</span></td>
                            <td className="px-4 py-4">
                              <select value={p.status}
                                onChange={e => save(posts.map(x => x.id === p.id ? { ...x, status: e.target.value as ContentPost["status"] } : x))}
                                className={`text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${st.color}`}>
                                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${pr.color}`}>{pr.label}</span>
                            </td>
                            <td className="px-4 py-4">
                              {p.target_words > 0 ? (
                                <div className="w-24">
                                  <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                                    <span>{p.word_count}</span><span>{p.target_words}</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${wordPct}%` }} />
                                  </div>
                                </div>
                              ) : <span className="text-slate-300 text-sm">—</span>}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`text-xs font-medium ${bs.color}`}>{bs.label}</span>
                              {p.brief_url && (
                                <a href={p.brief_url} target="_blank" rel="noreferrer" className="block text-xs text-teal-500 hover:underline mt-0.5" onClick={e => e.stopPropagation()}>
                                  <BookOpen size={10} className="inline mr-0.5" />Open
                                </a>
                              )}
                            </td>
                            <td className="px-4 py-4"><DateBadge dateStr={p.publish_date} /></td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditing(p.id); setEditData({ ...p }); }}
                                  className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => deletePost(p.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Inline edit modal for calendar view */}
      {editing && view === "calendar" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Edit Post</h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              <input value={editData.title ?? ""} onChange={e => setEditData({ ...editData, title: e.target.value })}
                placeholder="Title" className={inputCls} />
              <div className="grid grid-cols-2 gap-3">
                <input value={editData.keyword ?? ""} onChange={e => setEditData({ ...editData, keyword: e.target.value })} placeholder="Keyword" className={inputCls} />
                <input value={editData.client ?? ""} onChange={e => setEditData({ ...editData, client: e.target.value })} placeholder="Client" className={inputCls} />
                <select value={editData.status ?? "idea"} onChange={e => setEditData({ ...editData, status: e.target.value as ContentPost["status"] })} className={inputCls}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <select value={editData.priority ?? "medium"} onChange={e => setEditData({ ...editData, priority: e.target.value as ContentPost["priority"] })} className={inputCls}>
                  {PRIORITIES.map(px => <option key={px.value} value={px.value}>{px.label}</option>)}
                </select>
                <input type="date" value={editData.publish_date ?? ""} onChange={e => setEditData({ ...editData, publish_date: e.target.value })} className={inputCls} />
                <input value={editData.assignee ?? ""} onChange={e => setEditData({ ...editData, assignee: e.target.value })} placeholder="Assignee" className={inputCls} />
                <input type="number" value={editData.word_count ?? 0} onChange={e => setEditData({ ...editData, word_count: Number(e.target.value) })} placeholder="Words written" className={inputCls} />
                <input type="number" value={editData.target_words ?? 1000} onChange={e => setEditData({ ...editData, target_words: Number(e.target.value) })} placeholder="Target words" className={inputCls} />
              </div>
              <input value={editData.notes ?? ""} onChange={e => setEditData({ ...editData, notes: e.target.value })} placeholder="Notes" className={inputCls} />
              <input value={editData.url ?? ""} onChange={e => setEditData({ ...editData, url: e.target.value })} placeholder="Published URL" className={inputCls} />
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={() => { if (editing) updatePost(editing); }}
                className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700">
                <Save size={14} /> Save
              </button>
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={() => { if (editing) { deletePost(editing); setEditing(null); } }}
                className="ml-auto px-4 py-2.5 text-red-500 border border-red-200 rounded-xl text-sm hover:bg-red-50">
                <Trash2 size={14} className="inline" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
