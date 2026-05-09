"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Plus, Trash2, Pencil, Save, X, Search, Filter,
  CheckCircle2, Clock, AlertCircle, Calendar, User,
  Flag, ChevronDown, ChevronUp, Circle, Loader2,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  client: string;
  due_date: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in-progress" | "done";
  category: string;
  created_at: string;
}

const PRIORITIES = [
  { value: "high",   label: "High",   color: "text-red-600 bg-red-50 border-red-200",     dot: "bg-red-500" },
  { value: "medium", label: "Medium", color: "text-amber-600 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  { value: "low",    label: "Low",    color: "text-green-600 bg-green-50 border-green-200", dot: "bg-green-500" },
];

const STATUSES = [
  { value: "todo",        label: "To Do",       icon: Circle,       color: "text-slate-500 bg-slate-50 border-slate-200" },
  { value: "in-progress", label: "In Progress", icon: Clock,        color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "done",        label: "Done",        icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-200" },
];

const CATEGORIES = ["On-Page SEO", "Technical SEO", "Content", "Backlinks", "Local SEO", "Reporting", "Other"];

const LS_KEY = "seo_tasks_v1";

function loadTasks(): Task[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function saveTasks(tasks: Task[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(tasks));
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function today() { return new Date().toISOString().slice(0, 10); }
function isOverdue(date: string) { return date && date < today(); }

const priCfg = (v: string) => PRIORITIES.find(p => p.value === v) ?? PRIORITIES[1];
const stCfg  = (v: string) => STATUSES.find(s => s.value === v) ?? STATUSES[0];

const empty = (): Omit<Task, "id" | "created_at"> => ({
  title: "", description: "", assignee: "", client: "",
  due_date: "", priority: "medium", status: "todo", category: "On-Page SEO",
});

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty());
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Task>>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setTasks(loadTasks()); }, []);

  const persist = (t: Task[]) => { setTasks(t); saveTasks(t); };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const newTask: Task = { ...form, id: uid(), created_at: new Date().toISOString() };
    persist([newTask, ...tasks]);
    setForm(empty());
    setShowForm(false);
    setSaving(false);
  };

  const updateTask = (id: string) => {
    persist(tasks.map(t => t.id === id ? { ...t, ...editData } : t));
    setEditing(null);
  };

  const deleteTask = (id: string) => {
    if (!confirm("Delete this task?")) return;
    persist(tasks.filter(t => t.id !== id));
  };

  const cycleStatus = (id: string) => {
    const order: Task["status"][] = ["todo", "in-progress", "done"];
    persist(tasks.map(t => {
      if (t.id !== id) return t;
      const next = order[(order.indexOf(t.status) + 1) % order.length];
      return { ...t, status: next };
    }));
  };

  const filtered = useMemo(() => tasks.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q)
      || t.client.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    return matchQ
      && (filterStatus === "all" || t.status === filterStatus)
      && (filterPriority === "all" || t.priority === filterPriority)
      && (filterCategory === "all" || t.category === filterCategory);
  }), [tasks, search, filterStatus, filterPriority, filterCategory]);

  const byStatus = (s: string) => filtered.filter(t => t.status === s);
  const totalDone = tasks.filter(t => t.status === "done").length;
  const overdue = tasks.filter(t => t.status !== "done" && isOverdue(t.due_date)).length;
  const inProgress = tasks.filter(t => t.status === "in-progress").length;

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white";
  const labelCls = "text-xs font-semibold text-slate-600 block mb-1.5";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Task Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Assign tasks, set deadlines, track progress across your SEO team</p>
        </div>
        <button onClick={() => { setShowForm(true); setForm(empty()); }}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200 self-start">
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Tasks",   value: tasks.length,  color: "text-violet-600", bg: "bg-violet-50",  Icon: Flag },
          { label: "In Progress",   value: inProgress,    color: "text-amber-600",  bg: "bg-amber-50",   Icon: Clock },
          { label: "Completed",     value: totalDone,     color: "text-green-600",  bg: "bg-green-50",   Icon: CheckCircle2 },
          { label: "Overdue",       value: overdue,       color: "text-red-600",    bg: "bg-red-50",     Icon: AlertCircle },
        ].map(({ label, value, color, bg, Icon }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3`}>
            <Icon size={20} className={`${color} shrink-0 opacity-70`} />
            <div>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add task form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-violet-50 to-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-violet-600" />
              <h2 className="font-bold text-slate-700">New Task</h2>
            </div>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={addTask} className="p-6 space-y-4">
            <div>
              <label className={labelCls}>Task Title <span className="text-red-500">*</span></label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Fix broken links on homepage" className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Assignee</label>
                <input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })}
                  placeholder="Team member name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Client</label>
                <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}
                  placeholder="Client name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}><Calendar size={11} className="inline mr-1" />Due Date</label>
                <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                  className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Task["priority"] })} className={inputCls}>
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Task["status"] })} className={inputCls}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Description (optional)</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2} placeholder="Task details, context, links..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Task
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks, assignee, client..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border transition-colors ${showFilters ? "bg-slate-800 text-white border-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Filter size={13} /> More {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} tasks</span>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
              <option value="all">All Priorities</option>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => { setFilterStatus("all"); setFilterPriority("all"); setFilterCategory("all"); setSearch(""); }}
              className="text-xs text-slate-500 hover:text-red-500 underline px-2">Clear</button>
          </div>
        )}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {STATUSES.map(st => {
          const colTasks = byStatus(st.value);
          const StatusIcon = st.icon;
          return (
            <div key={st.value} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon size={14} className={st.value === "done" ? "text-green-600" : st.value === "in-progress" ? "text-amber-600" : "text-slate-400"} />
                  <span className="text-sm font-bold text-slate-700">{st.label}</span>
                </div>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">{colTasks.length}</span>
              </div>

              <div className="p-3 space-y-3 min-h-[200px]">
                {colTasks.length === 0 && (
                  <p className="text-xs text-slate-300 text-center py-8">No tasks</p>
                )}
                {colTasks.map(task => {
                  const pri = priCfg(task.priority);
                  const overdueflag = task.status !== "done" && isOverdue(task.due_date);
                  return (
                    <div key={task.id} className="bg-slate-50 rounded-xl border border-slate-100 p-3 group hover:border-violet-200 hover:bg-violet-50/20 transition-all">
                      {editing === task.id ? (
                        <div className="space-y-2">
                          <input value={editData.title ?? ""} onChange={e => setEditData({ ...editData, title: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                          <input value={editData.assignee ?? ""} onChange={e => setEditData({ ...editData, assignee: e.target.value })}
                            placeholder="Assignee" className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                          <input value={editData.client ?? ""} onChange={e => setEditData({ ...editData, client: e.target.value })}
                            placeholder="Client" className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                          <input type="date" value={editData.due_date ?? ""} onChange={e => setEditData({ ...editData, due_date: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                          <select value={editData.priority ?? "medium"} onChange={e => setEditData({ ...editData, priority: e.target.value as Task["priority"] })}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                          </select>
                          <textarea value={editData.description ?? ""} onChange={e => setEditData({ ...editData, description: e.target.value })}
                            rows={2} placeholder="Description" className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => updateTask(task.id)}
                              className="flex items-center gap-1 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700">
                              <Save size={11} /> Save
                            </button>
                            <button onClick={() => setEditing(null)}
                              className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <button onClick={() => cycleStatus(task.id)} title="Click to advance status"
                              className="mt-0.5 shrink-0">
                              {task.status === "done"
                                ? <CheckCircle2 size={16} className="text-green-500" />
                                : task.status === "in-progress"
                                ? <Clock size={16} className="text-amber-500" />
                                : <Circle size={16} className="text-slate-300 hover:text-violet-400" />}
                            </button>
                            <p className={`text-sm font-semibold flex-1 leading-tight ${task.status === "done" ? "line-through text-slate-400" : "text-slate-700"}`}>
                              {task.title}
                            </p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditing(task.id); setEditData({ ...task }); }}
                                className="p-1 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                                <Pencil size={11} />
                              </button>
                              <button onClick={() => deleteTask(task.id)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-400 mb-2 leading-relaxed line-clamp-2">{task.description}</p>
                          )}

                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${pri.color}`}>{pri.label}</span>
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{task.category}</span>
                            {task.assignee && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <User size={10} />{task.assignee}
                              </span>
                            )}
                            {task.client && (
                              <span className="text-xs text-slate-400">{task.client}</span>
                            )}
                          </div>

                          {task.due_date && (
                            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${overdueflag ? "text-red-500" : "text-slate-400"}`}>
                              {overdueflag && <AlertCircle size={10} />}
                              <Calendar size={10} />
                              {overdueflag ? "Overdue · " : "Due "}
                              {new Date(task.due_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
