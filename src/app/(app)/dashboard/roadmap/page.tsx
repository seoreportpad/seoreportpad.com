"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Plus, CheckCircle2, Circle, Clock, Trash2, Layout, List,
  Pencil, Save, X, Search, Filter, Download, Flag,
  ChevronRight, AlertTriangle, BarChart3, Sparkles, Copy,
  CalendarDays, Tag,
} from "lucide-react";

interface RoadmapTask {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  category: string;
  client: string;
  due_date: string;
  notes: string;
  created_at: string;
}

const LS_KEY = "seo_roadmap_v1";
function load(): RoadmapTask[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function persist(d: RoadmapTask[]) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function today() { return new Date().toISOString().slice(0, 10); }
function isOverdue(due: string) { return !!due && due < today() ; }

const CATEGORIES = ["Technical SEO", "On-Page SEO", "Link Building", "Content", "Local SEO", "Reporting", "Research", "Other"];

const STATUSES = [
  { id: "todo" as const,        label: "To Do",       icon: Circle,       color: "text-slate-400",   bg: "bg-slate-50",   border: "border-slate-200", dot: "bg-slate-400" },
  { id: "in-progress" as const, label: "In Progress", icon: Clock,        color: "text-amber-500",   bg: "bg-amber-50",   border: "border-amber-200", dot: "bg-amber-400" },
  { id: "completed" as const,   label: "Completed",   icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
];

const PRIORITY_CFG: Record<string, { cls: string; dot: string; label: string }> = {
  high:   { cls: "text-red-600 bg-red-50 border-red-200",     dot: "bg-red-500",    label: "High" },
  medium: { cls: "text-amber-600 bg-amber-50 border-amber-200", dot: "bg-amber-400", label: "Medium" },
  low:    { cls: "text-slate-500 bg-slate-100 border-slate-200", dot: "bg-slate-400", label: "Low" },
};

const CAT_COLOR: Record<string, string> = {
  "Technical SEO": "bg-blue-50 text-blue-700",
  "On-Page SEO":   "bg-violet-50 text-violet-700",
  "Link Building": "bg-orange-50 text-orange-700",
  "Content":       "bg-emerald-50 text-emerald-700",
  "Local SEO":     "bg-pink-50 text-pink-700",
  "Reporting":     "bg-cyan-50 text-cyan-700",
  "Research":      "bg-yellow-50 text-yellow-700",
  "Other":         "bg-slate-100 text-slate-600",
};

// Preset task templates
const TEMPLATES: { name: string; tasks: Partial<RoadmapTask>[] }[] = [
  {
    name: "Month 1 — Foundation",
    tasks: [
      { title: "Technical SEO Audit (Screaming Frog)", category: "Technical SEO", priority: "high" },
      { title: "Fix crawl errors & broken links", category: "Technical SEO", priority: "high" },
      { title: "Google Search Console setup & verify", category: "Technical SEO", priority: "high" },
      { title: "GA4 setup & goal tracking", category: "Technical SEO", priority: "high" },
      { title: "Keyword research — primary targets", category: "Research", priority: "high" },
      { title: "Optimize homepage title tag & meta", category: "On-Page SEO", priority: "high" },
      { title: "Competitor analysis — top 3", category: "Research", priority: "medium" },
      { title: "Google Business Profile optimization", category: "Local SEO", priority: "medium" },
    ],
  },
  {
    name: "Month 2 — On-Page",
    tasks: [
      { title: "Service pages title & meta optimization", category: "On-Page SEO", priority: "high" },
      { title: "Internal linking audit & improvement", category: "On-Page SEO", priority: "high" },
      { title: "Schema markup — LocalBusiness & FAQ", category: "Technical SEO", priority: "medium" },
      { title: "Image optimization & alt tags", category: "On-Page SEO", priority: "medium" },
      { title: "Page speed optimization (Core Web Vitals)", category: "Technical SEO", priority: "high" },
      { title: "Publish 2 blog posts", category: "Content", priority: "medium" },
      { title: "Citation building — top 20 directories", category: "Local SEO", priority: "medium" },
    ],
  },
  {
    name: "Month 3 — Authority",
    tasks: [
      { title: "Link building outreach — 50 prospects", category: "Link Building", priority: "high" },
      { title: "Guest post — 1 high-DA site", category: "Link Building", priority: "high" },
      { title: "Publish 3 blog posts", category: "Content", priority: "medium" },
      { title: "Google review campaign", category: "Local SEO", priority: "medium" },
      { title: "Update old blog posts for freshness", category: "Content", priority: "low" },
      { title: "Monthly SEO report", category: "Reporting", priority: "high" },
    ],
  },
];

const emptyForm = (): Omit<RoadmapTask, "id" | "created_at" | "status"> =>
  ({ title: "", priority: "medium", category: "Technical SEO", client: "", due_date: "", notes: "" });

export default function RoadmapPage() {
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [form, setForm] = useState(emptyForm());
  const [showFormFull, setShowFormFull] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<RoadmapTask>>({});
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateClient, setTemplateClient] = useState("");

  useEffect(() => { setTasks(load()); }, []);

  const save = (d: RoadmapTask[]) => { setTasks(d); persist(d); };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    save([{ ...form, id: uid(), status: "todo", created_at: new Date().toISOString() }, ...tasks]);
    setForm(emptyForm());
    setShowFormFull(false);
  };

  const updateStatus = (id: string, status: RoadmapTask["status"]) =>
    save(tasks.map(t => t.id === id ? { ...t, status } : t));

  const cycleStatus = (id: string, current: RoadmapTask["status"]) => {
    const next: Record<string, RoadmapTask["status"]> = { "todo": "in-progress", "in-progress": "completed", "completed": "todo" };
    updateStatus(id, next[current]);
  };

  const deleteTask = (id: string) => {
    if (!confirm("Remove this task?")) return;
    save(tasks.filter(t => t.id !== id));
    setSelected(p => { const s = new Set(p); s.delete(id); return s; });
  };

  const startEdit = (t: RoadmapTask) => {
    setEditId(t.id);
    setEditData({ title: t.title, priority: t.priority, category: t.category, client: t.client, due_date: t.due_date, notes: t.notes });
  };
  const saveEdit = (id: string) => { save(tasks.map(t => t.id === id ? { ...t, ...editData } : t)); setEditId(null); };

  const duplicateTask = (t: RoadmapTask) =>
    save([{ ...t, id: uid(), title: t.title + " (copy)", status: "todo", created_at: new Date().toISOString() }, ...tasks]);

  // Bulk actions
  const bulkDelete = () => {
    if (!confirm(`Delete ${selected.size} task(s)?`)) return;
    save(tasks.filter(t => !selected.has(t.id)));
    setSelected(new Set());
  };
  const bulkStatus = (status: RoadmapTask["status"]) => {
    save(tasks.map(t => selected.has(t.id) ? { ...t, status } : t));
    setSelected(new Set());
  };
  const bulkComplete = () => bulkStatus("completed");
  const bulkTodo = () => bulkStatus("todo");

  // Load template
  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    const newTasks: RoadmapTask[] = tpl.tasks.map(t => ({
      id: uid(), title: t.title ?? "", priority: t.priority ?? "medium",
      category: t.category ?? "Other", client: templateClient,
      due_date: "", notes: "", status: "todo", created_at: new Date().toISOString(),
    }));
    save([...newTasks, ...tasks]);
    setShowTemplates(false);
    setTemplateClient("");
  };

  // Export CSV
  const exportCSV = () => {
    const rows = [["Title", "Client", "Category", "Priority", "Status", "Due Date", "Notes", "Created"]];
    filtered.forEach(t => rows.push([t.title, t.client, t.category, t.priority, t.status, t.due_date, t.notes, t.created_at.slice(0, 10)]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "seo-roadmap.csv";
    a.click();
  };

  // Derived
  const clients = useMemo(() => ["all", ...Array.from(new Set(tasks.map(t => t.client).filter(Boolean)))], [tasks]);
  const usedCats = useMemo(() => ["all", ...Array.from(new Set(tasks.map(t => t.category)))], [tasks]);

  const filtered = useMemo(() => tasks.filter(t => {
    if (filterClient !== "all" && t.client !== filterClient) return false;
    if (filterCat !== "all" && t.category !== filterCat) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [tasks, filterClient, filterCat, filterPriority, search]);

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    overdue: tasks.filter(t => isOverdue(t.due_date) && t.status !== "completed").length,
    pct: tasks.length ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) : 0,
  }), [tasks]);

  const allSelected = filtered.length > 0 && filtered.every(t => selected.has(t.id));

  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">SEO Roadmap</h1>
          <p className="text-slate-500 text-sm mt-1">Plan and track SEO strategy for all clients</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowTemplates(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-2 rounded-xl transition-colors">
            <Sparkles size={15} /> Templates
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-colors shadow-sm">
            <Download size={15} /> Export
          </button>
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button onClick={() => setView("kanban")} className={`p-1.5 rounded-lg transition-colors ${view === "kanban" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}>
              <Layout size={17} />
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded-lg transition-colors ${view === "list" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}>
              <List size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total", value: stats.total, color: "text-slate-700", bg: "bg-white" },
            { label: "To Do", value: stats.todo, color: "text-slate-500", bg: "bg-white" },
            { label: "In Progress", value: stats.inProgress, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Completed", value: stats.completed, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Overdue", value: stats.overdue, color: "text-red-600", bg: stats.overdue > 0 ? "bg-red-50" : "bg-white" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-100 shadow-sm px-4 py-3 text-center`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-3 mb-6 flex items-center gap-4">
          <span className="text-xs font-bold text-slate-500 shrink-0">Overall Progress</span>
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.pct}%` }} />
          </div>
          <span className="text-sm font-black text-slate-700 shrink-0">{stats.pct}%</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-44" />
        </div>
        {clients.length > 1 && (
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none text-slate-700">
            {clients.map(c => <option key={c} value={c}>{c === "all" ? "All Clients" : c}</option>)}
          </select>
        )}
        {usedCats.length > 2 && (
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none text-slate-700">
            {usedCats.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
          </select>
        )}
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none text-slate-700">
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {(search || filterClient !== "all" || filterCat !== "all" || filterPriority !== "all") && (
          <button onClick={() => { setSearch(""); setFilterClient("all"); setFilterCat("all"); setFilterPriority("all"); }}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl bg-white hover:bg-slate-50">
            Clear
          </button>
        )}
      </div>

      {/* Add task bar */}
      <form onSubmit={addTask} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <input type="text" placeholder="Add a task..." value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            onFocus={() => setShowFormFull(true)}
            className="flex-1 min-w-[200px] bg-transparent border-none text-sm font-medium focus:ring-0 placeholder:text-slate-300" />
          {!showFormFull && (
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shrink-0">
              <Plus size={18} />
            </button>
          )}
        </div>
        {showFormFull && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-end">
            <input type="text" placeholder="Client" value={form.client}
              onChange={e => setForm({ ...form, client: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-36" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as RoadmapTask["priority"] })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2">
              <CalendarDays size={13} className="text-slate-400" />
              <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                className="text-sm focus:outline-none bg-transparent text-slate-600" />
            </div>
            <input type="text" placeholder="Notes (optional)" value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 min-w-[140px]" />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center gap-1.5">
                <Plus size={14} /> Add Task
              </button>
              <button type="button" onClick={() => { setShowFormFull(false); setForm(emptyForm()); }}
                className="border border-slate-200 text-slate-500 px-3 py-2 rounded-xl text-sm hover:bg-slate-50">
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-blue-800">{selected.size} selected</span>
          <button onClick={bulkComplete} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-700">Mark Completed</button>
          <button onClick={bulkTodo} className="text-xs bg-slate-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-700">Reset To Do</button>
          <button onClick={bulkDelete} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-600 flex items-center gap-1"><Trash2 size={11} /> Delete</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-blue-600 font-semibold">Deselect all</button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <BarChart3 size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">{search ? "No tasks match your search" : "No tasks yet — add one above or use a Template"}</p>
        </div>
      )}

      {/* ── KANBAN ── */}
      {view === "kanban" && filtered.length > 0 && (
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {STATUSES.map(status => {
            const col = filtered.filter(t => t.status === status.id);
            return (
              <div key={status.id} className="flex flex-col gap-3">
                {/* Column header */}
                <div className="flex items-center gap-2 px-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                  <h3 className="font-bold text-slate-700 text-sm">{status.label}</h3>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full ml-auto">{col.length}</span>
                </div>

                {/* Column body */}
                <div className={`flex flex-col gap-2 min-h-[180px] rounded-2xl p-2 border ${status.bg} ${status.border}`}>
                  {col.map(task => {
                    const overdue = isOverdue(task.due_date) && status.id !== "completed";
                    const pcfg = PRIORITY_CFG[task.priority];
                    const isEditing = editId === task.id;

                    return (
                      <div key={task.id}
                        className={`bg-white rounded-xl border shadow-sm transition-all group cursor-pointer ${overdue ? "border-red-200" : "border-slate-100"} hover:shadow-md`}>
                        {isEditing ? (
                          <div className="p-3 space-y-2">
                            <input value={editData.title || ""} onChange={e => setEditData({ ...editData, title: e.target.value })}
                              className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400" autoFocus />
                            <div className="flex gap-2">
                              <select value={editData.category || ""} onChange={e => setEditData({ ...editData, category: e.target.value })}
                                className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none">
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                              </select>
                              <select value={editData.priority || "medium"} onChange={e => setEditData({ ...editData, priority: e.target.value as RoadmapTask["priority"] })}
                                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none">
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                              </select>
                            </div>
                            <input type="text" value={editData.client || ""} onChange={e => setEditData({ ...editData, client: e.target.value })}
                              placeholder="Client" className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none" />
                            <input type="date" value={editData.due_date || ""} onChange={e => setEditData({ ...editData, due_date: e.target.value })}
                              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none" />
                            <textarea value={editData.notes || ""} onChange={e => setEditData({ ...editData, notes: e.target.value })}
                              placeholder="Notes..." rows={2}
                              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none resize-none" />
                            <div className="flex gap-2">
                              <button onClick={() => saveEdit(task.id)} className="flex-1 text-xs bg-blue-600 text-white rounded-lg py-1.5 hover:bg-blue-700 flex items-center justify-center gap-1"><Save size={11} />Save</button>
                              <button onClick={() => setEditId(null)} className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50"><X size={11} /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3">
                            {/* Top row */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${CAT_COLOR[task.category] ?? "bg-slate-100 text-slate-600"}`}>
                                  {task.category}
                                </span>
                                {overdue && (
                                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                    <AlertTriangle size={9} />Overdue
                                  </span>
                                )}
                              </div>
                              {/* Checkbox */}
                              <button onClick={() => setSelected(p => { const s = new Set(p); s.has(task.id) ? s.delete(task.id) : s.add(task.id); return s; })}
                                className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selected.has(task.id) ? "bg-blue-600 border-blue-600" : "border-slate-300 hover:border-blue-400"}`}>
                                {selected.has(task.id) && <span className="text-white text-[9px] font-black">✓</span>}
                              </button>
                            </div>

                            {/* Title */}
                            <p className={`text-sm font-semibold leading-snug mb-2 ${status.id === "completed" ? "line-through text-slate-400" : "text-slate-700"}`}>
                              {task.title}
                            </p>

                            {/* Meta */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {task.client && (
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md font-medium">{task.client}</span>
                              )}
                              {task.due_date && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium flex items-center gap-0.5 ${overdue ? "text-red-600 bg-red-50" : "text-slate-500 bg-slate-100"}`}>
                                  <CalendarDays size={9} />{task.due_date}
                                </span>
                              )}
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${pcfg.cls}`}>
                                {pcfg.label}
                              </span>
                            </div>

                            {/* Notes toggle */}
                            {task.notes && (
                              <button onClick={() => setExpandedNotes(expandedNotes === task.id ? null : task.id)}
                                className="text-[10px] text-blue-500 hover:text-blue-700 font-semibold mb-1 flex items-center gap-0.5">
                                <Tag size={9} /> {expandedNotes === task.id ? "Hide" : "Notes"}
                              </button>
                            )}
                            {expandedNotes === task.id && task.notes && (
                              <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-2 py-1.5 mb-2">{task.notes}</p>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => cycleStatus(task.id, task.status)} title="Advance status"
                                className="p-1 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50">
                                <ChevronRight size={13} />
                              </button>
                              <button onClick={() => startEdit(task)} className="p-1 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Pencil size={12} /></button>
                              <button onClick={() => duplicateTask(task)} className="p-1 text-slate-400 hover:text-violet-500 rounded-lg hover:bg-violet-50"><Copy size={12} /></button>
                              <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 ml-auto"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {col.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl min-h-[80px]">
                      <p className="text-xs text-slate-300 italic">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LIST ── */}
      {view === "list" && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Select all header */}
          <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-100">
            <button onClick={() => allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(t => t.id)))}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${allSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
              {allSelected && <span className="text-white text-[9px] font-black">✓</span>}
            </button>
            <span className="text-xs text-slate-500 font-semibold">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</span>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-left w-8" />
                <th className="px-3 py-3 text-left">Task</th>
                <th className="px-3 py-3 text-left">Client</th>
                <th className="px-3 py-3 text-left">Category</th>
                <th className="px-3 py-3 text-left">Priority</th>
                <th className="px-3 py-3 text-left">Due</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(task => {
                const overdue = isOverdue(task.due_date) && task.status !== "completed";
                const pcfg = PRIORITY_CFG[task.priority];
                return (
                  <tr key={task.id} className={`hover:bg-slate-50 transition-colors group ${overdue ? "bg-red-50/30" : ""}`}>
                    <td className="px-5 py-3">
                      <button onClick={() => setSelected(p => { const s = new Set(p); s.has(task.id) ? s.delete(task.id) : s.add(task.id); return s; })}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selected.has(task.id) ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                        {selected.has(task.id) && <span className="text-white text-[9px] font-black">✓</span>}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <p className={`font-semibold ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-700"}`}>{task.title}</p>
                      {task.notes && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{task.notes}</p>}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">{task.client || "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${CAT_COLOR[task.category] ?? "bg-slate-100 text-slate-600"}`}>{task.category}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pcfg.cls}`}>{pcfg.label}</span>
                    </td>
                    <td className="px-3 py-3">
                      {task.due_date
                        ? <span className={`text-xs font-medium flex items-center gap-1 ${overdue ? "text-red-600" : "text-slate-500"}`}>
                            {overdue && <AlertTriangle size={10} />}{task.due_date}
                          </span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-3">
                      <select value={task.status} onChange={e => updateStatus(task.id, e.target.value as RoadmapTask["status"])}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                        {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(task)} className="p-1 text-slate-400 hover:text-blue-500"><Pencil size={13} /></button>
                        <button onClick={() => duplicateTask(task)} className="p-1 text-slate-400 hover:text-violet-500"><Copy size={13} /></button>
                        <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TEMPLATES MODAL ── */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Task Templates</h3>
                <p className="text-sm text-slate-500 mt-0.5">Load a preset SEO roadmap — all tasks added as To Do</p>
              </div>
              <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <div className="p-5 border-b border-slate-100">
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Client Name (optional)</label>
              <input value={templateClient} onChange={e => setTemplateClient(e.target.value)}
                placeholder="e.g. ABC Plumbing"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {TEMPLATES.map(tpl => (
                <div key={tpl.name} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{tpl.name}</p>
                      <p className="text-xs text-slate-500">{tpl.tasks.length} tasks</p>
                    </div>
                    <button onClick={() => applyTemplate(tpl)}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-1">
                      <Plus size={12} /> Load
                    </button>
                  </div>
                  <div className="px-4 py-3 space-y-1">
                    {tpl.tasks.map((t, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_CFG[t.priority ?? "medium"].dot}`} />
                        <span className="text-xs text-slate-600">{t.title}</span>
                        <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${CAT_COLOR[t.category ?? "Other"] ?? "bg-slate-100 text-slate-600"}`}>{t.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
