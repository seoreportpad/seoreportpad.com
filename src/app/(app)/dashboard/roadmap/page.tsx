"use client";
import { useState, useEffect } from "react";
import {
  Plus, CheckCircle2, Circle, Clock, Trash2, Layout, List, Pencil, Save, X
} from "lucide-react";

interface RoadmapTask {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  category: string;
  client: string;
  created_at: string;
}

const LS_KEY = "seo_roadmap_v1";
function load(): RoadmapTask[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function persist(d: RoadmapTask[]) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const CATEGORIES = ["Technical SEO", "On-Page SEO", "Link Building", "Content", "Local SEO", "Reporting", "Other"];
const STATUSES = [
  { id: "todo" as const,        label: "To Do",       icon: Circle,       color: "text-slate-400",  bg: "bg-slate-50",  border: "border-slate-200" },
  { id: "in-progress" as const, label: "In Progress", icon: Clock,        color: "text-amber-500",  bg: "bg-amber-50",  border: "border-amber-200" },
  { id: "completed" as const,   label: "Completed",   icon: CheckCircle2, color: "text-emerald-500",bg: "bg-emerald-50",border: "border-emerald-200" },
];
const PRIORITY_COLOR: Record<string, string> = {
  high:   "text-red-500 bg-red-50",
  medium: "text-blue-500 bg-blue-50",
  low:    "text-slate-400 bg-slate-100",
};

const emptyForm = (): { title: string; priority: RoadmapTask["priority"]; category: string; client: string } =>
  ({ title: "", priority: "medium", category: "Technical SEO", client: "" });

export default function RoadmapPage() {
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<RoadmapTask>>({});
  const [filterClient, setFilterClient] = useState("all");

  useEffect(() => { setTasks(load()); }, []);

  const save = (d: RoadmapTask[]) => { setTasks(d); persist(d); };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    save([{ ...form, id: uid(), status: "todo", created_at: new Date().toISOString() }, ...tasks]);
    setForm(emptyForm());
  };

  const updateStatus = (id: string, status: RoadmapTask["status"]) => {
    save(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTask = (id: string) => {
    if (!confirm("Remove this task?")) return;
    save(tasks.filter(t => t.id !== id));
  };

  const startEdit = (t: RoadmapTask) => { setEditId(t.id); setEditData({ title: t.title, priority: t.priority, category: t.category, client: t.client }); };
  const saveEdit = (id: string) => { save(tasks.map(t => t.id === id ? { ...t, ...editData } : t)); setEditId(null); };

  const clients = ["all", ...Array.from(new Set(tasks.map(t => t.client).filter(Boolean)))];
  const filtered = filterClient === "all" ? tasks : tasks.filter(t => t.client === filterClient);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">SEO Roadmap</h1>
          <p className="text-slate-500 text-sm mt-1">Plan and track SEO strategy tasks for all clients</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button onClick={() => setView("kanban")} className={`p-1.5 rounded-lg transition-colors ${view === "kanban" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}>
              <Layout size={18} />
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded-lg transition-colors ${view === "list" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}>
              <List size={18} />
            </button>
          </div>
          {clients.length > 1 && (
            <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {clients.map(c => <option key={c} value={c}>{c === "all" ? "All Clients" : c}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Add task form */}
      <form onSubmit={addTask} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8 flex items-center gap-3 flex-wrap">
        <input
          type="text" placeholder="Add a task..." value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="flex-1 min-w-[200px] bg-transparent border-none text-sm font-medium focus:ring-0 placeholder:text-slate-300"
        />
        <input
          type="text" placeholder="Client (optional)" value={form.client}
          onChange={e => setForm({ ...form, client: e.target.value })}
          className="bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-600 px-3 py-1.5 focus:ring-0 w-36"
        />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
          className="bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-600 px-3 py-1.5 focus:ring-0">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as RoadmapTask["priority"] })}
          className={`border-none rounded-lg text-xs font-bold px-3 py-1.5 focus:ring-0 ${PRIORITY_COLOR[form.priority]}`}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={20} />
        </button>
      </form>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400 text-sm">No tasks yet — add your first roadmap task above.</div>
      )}

      {/* Kanban view */}
      {view === "kanban" && filtered.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {STATUSES.map(status => {
            const col = filtered.filter(t => t.status === status.id);
            return (
              <div key={status.id} className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-2">
                  <status.icon size={16} className={status.color} />
                  <h3 className="font-bold text-slate-700 text-sm">{status.label}</h3>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">{col.length}</span>
                </div>
                <div className={`flex flex-col gap-3 min-h-[200px] rounded-2xl p-2 border ${status.bg} ${status.border}`}>
                  {col.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                      {editId === task.id ? (
                        <div className="space-y-2">
                          <input value={editData.title || ""} onChange={e => setEditData({ ...editData, title: e.target.value })}
                            className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" autoFocus />
                          <div className="flex gap-2">
                            <select value={editData.category || ""} onChange={e => setEditData({ ...editData, category: e.target.value })}
                              className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none">
                              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                            <select value={editData.priority || "medium"} onChange={e => setEditData({ ...editData, priority: e.target.value as RoadmapTask["priority"] })}
                              className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none">
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(task.id)} className="flex-1 text-xs bg-blue-600 text-white rounded-lg py-1 hover:bg-blue-700"><Save size={12} className="inline mr-1" />Save</button>
                            <button onClick={() => setEditId(null)} className="text-xs border border-slate-200 rounded-lg px-3 py-1 hover:bg-slate-50"><X size={12} /></button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-3">
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">{task.category}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEdit(task)} className="p-1 text-slate-400 hover:text-blue-500"><Pencil size={13} /></button>
                              {status.id !== "completed" && (
                                <button onClick={() => updateStatus(task.id, status.id === "todo" ? "in-progress" : "completed")} className="p-1 text-slate-400 hover:text-emerald-500"><CheckCircle2 size={13} /></button>
                              )}
                              {status.id === "completed" && (
                                <button onClick={() => updateStatus(task.id, "todo")} className="p-1 text-slate-400 hover:text-amber-500"><Circle size={13} /></button>
                              )}
                              <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-slate-700 leading-snug">{task.title}</p>
                          {task.client && <p className="text-xs text-slate-400 mt-1">{task.client}</p>}
                          <div className="flex items-center justify-between mt-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}>{task.priority} priority</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {col.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl min-h-[100px]">
                      <p className="text-xs text-slate-300 font-medium italic">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === "list" && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Task</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(task => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3 font-medium text-slate-700">{task.title}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{task.client || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{task.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={task.status} onChange={e => updateStatus(task.id, e.target.value as RoadmapTask["status"])}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                      {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
