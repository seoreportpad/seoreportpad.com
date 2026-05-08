"use client";
import { useState, useEffect } from "react";
import { 
  Plus, Search, Filter, MoreVertical, CheckCircle2, 
  Circle, Clock, AlertCircle, Trash2, Layout, List
} from "lucide-react";

interface Client { id: string; name: string; }
interface Task {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  category: string;
  client_id: string;
}

export default function RoadmapPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClient, setActiveClient] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [newTask, setNewTask] = useState({ title: "", priority: "medium", category: "Technical SEO" });

  useEffect(() => {
    fetch("/api/clients").then(r => r.ok ? r.json() : []).then(d => {
      setClients(d);
      if (d.length > 0) setActiveClient(d[0].id);
    });
  }, []);

  useEffect(() => {
    if (activeClient) {
      setLoading(true);
      fetch(`/api/tasks?clientId=${activeClient}`)
        .then(r => r.ok ? r.json() : [])
        .then(d => setTasks(d))
        .finally(() => setLoading(false));
    }
  }, [activeClient]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !newTask.title) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, client_id: activeClient, status: "todo" }),
    });
    const task = await res.json();
    setTasks([task, ...tasks]);
    setNewTask({ title: "", priority: "medium", category: "Technical SEO" });
  };

  const updateStatus = async (id: string, status: Task["status"]) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const deleteTask = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  };

  const CATEGORIES = ["Technical SEO", "On-Page SEO", "Link Building", "Content", "Local SEO", "Reporting"];
  const STATUSES = [
    { id: "todo", label: "To Do", icon: Circle, color: "text-slate-400" },
    { id: "in-progress", label: "In Progress", icon: Clock, color: "text-amber-500" },
    { id: "completed", label: "Completed", icon: CheckCircle2, color: "text-emerald-500" },
  ] as const;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">SEO Roadmap</h1>
          <p className="text-slate-500 text-sm mt-1">Manage tasks and strategy for your clients</p>
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
          <select 
            value={activeClient} 
            onChange={(e) => setActiveClient(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* New Task Bar */}
      <form onSubmit={addTask} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input 
            type="text" 
            placeholder="What needs to be done?..." 
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full bg-transparent border-none text-sm font-medium focus:ring-0 placeholder:text-slate-300"
          />
        </div>
        <select 
          value={newTask.category}
          onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
          className="bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-600 px-3 py-1.5 focus:ring-0"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select 
          value={newTask.priority}
          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
          className={`border-none rounded-lg text-xs font-bold px-3 py-1.5 focus:ring-0 ${
            newTask.priority === "high" ? "bg-red-50 text-red-600" : newTask.priority === "medium" ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-600"
          }`}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={20} />
        </button>
      </form>

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">Loading roadmap...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 h-full items-start">
          {STATUSES.map(status => (
            <div key={status.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <status.icon size={16} className={status.color} />
                  <h3 className="font-bold text-slate-700 text-sm">{status.label}</h3>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {tasks.filter(t => t.status === status.id).length}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 min-h-[300px] bg-slate-50/50 rounded-2xl p-2 border border-slate-100/50">
                {tasks.filter(t => t.status === status.id).map(task => (
                  <div 
                    key={task.id} 
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {task.category}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {status.id !== "completed" && (
                          <button onClick={() => updateStatus(task.id, status.id === "todo" ? "in-progress" : "completed")} className="p-1 text-slate-400 hover:text-emerald-500">
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-snug">{task.title}</p>
                    <div className="flex items-center justify-between mt-4">
                       <span className={`text-[10px] font-black uppercase ${
                         task.priority === "high" ? "text-red-500" : task.priority === "medium" ? "text-blue-500" : "text-slate-400"
                       }`}>
                         {task.priority} Priority
                       </span>
                    </div>
                  </div>
                ))}
                
                {tasks.filter(t => t.status === status.id).length === 0 && (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-300 font-medium italic">Empty</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
