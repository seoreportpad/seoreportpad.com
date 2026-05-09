"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Plus, Trash2, Pencil, Save, X, Search, Calendar,
  ChevronLeft, ChevronRight, FileText, CheckCircle2,
  Clock, Circle, Download, Filter,
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
  created_at: string;
}

const TYPES = ["Blog Post", "Service Page", "Location Page", "Homepage", "Product Page", "Landing Page", "GMB Post", "Social Post", "Other"];

const STATUSES = [
  { value: "idea",       label: "Idea",       color: "text-slate-500 bg-slate-100 border-slate-200" },
  { value: "assigned",   label: "Assigned",   color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "writing",    label: "Writing",    color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "review",     label: "Review",     color: "text-violet-600 bg-violet-50 border-violet-200" },
  { value: "scheduled",  label: "Scheduled",  color: "text-teal-600 bg-teal-50 border-teal-200" },
  { value: "published",  label: "Published",  color: "text-green-600 bg-green-50 border-green-200" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const LS_KEY = "seo_content_calendar_v1";
function load(): ContentPost[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function persist(d: ContentPost[]) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const stCfg = (v: string) => STATUSES.find(s => s.value === v) ?? STATUSES[0];

const emptyForm = (defaultDate?: string): Omit<ContentPost, "id" | "created_at"> => ({
  title: "", keyword: "", client: "", type: "Blog Post", status: "idea",
  assignee: "", publish_date: defaultDate || "", notes: "", url: "",
});

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function ContentCalendarPage() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ContentPost>>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClient, setFilterClient] = useState("all");

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
  };

  const updatePost = (id: string) => {
    save(posts.map(p => p.id === id ? { ...p, ...editData } : p));
    setEditing(null);
  };

  const deletePost = (id: string) => {
    if (!confirm("Remove this post?")) return;
    save(posts.filter(p => p.id !== id));
  };

  const allClients = useMemo(() => [...new Set(posts.map(p => p.client).filter(Boolean))], [posts]);

  const filtered = useMemo(() => posts.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.title.toLowerCase().includes(q) || p.keyword.toLowerCase().includes(q) || p.client.toLowerCase().includes(q))
      && (filterStatus === "all" || p.status === filterStatus)
      && (filterClient === "all" || p.client === filterClient);
  }), [posts, search, filterStatus, filterClient]);

  const exportCSV = () => {
    const rows = [["Title", "Keyword", "Client", "Type", "Status", "Assignee", "Publish Date", "URL", "Notes"]];
    for (const p of filtered) rows.push([p.title, p.keyword, p.client, p.type, p.status, p.assignee, p.publish_date, p.url, p.notes]);
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "content-calendar.csv";
    a.click();
  };

  // Calendar grid
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const calPrefix = `${calYear}-${String(calMonth + 1).padStart(2, "0")}`;

  const postsForDay = (day: number) => {
    const dateStr = `${calPrefix}-${String(day).padStart(2, "0")}`;
    return posts.filter(p => p.publish_date === dateStr);
  };

  const published = posts.filter(p => p.status === "published").length;
  const scheduled = posts.filter(p => p.status === "scheduled").length;
  const inProgress = posts.filter(p => ["writing", "review", "assigned"].includes(p.status)).length;

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white";
  const labelCls = "text-xs font-semibold text-slate-600 block mb-1.5";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Content Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">Plan, schedule, and track all content across clients</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => setView("calendar")} className={`px-4 py-2 text-sm font-medium transition-colors ${view === "calendar" ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
              Calendar
            </button>
            <button onClick={() => setView("list")} className={`px-4 py-2 text-sm font-medium transition-colors ${view === "list" ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
              List
            </button>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm">
            <Download size={15} /> Export
          </button>
          <button onClick={() => { setShowForm(true); setForm(emptyForm()); }}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200">
            <Plus size={16} /> Add Post
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Posts",  value: posts.length,  color: "text-slate-700",  bg: "bg-slate-50" },
          { label: "In Progress",  value: inProgress,    color: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Scheduled",    value: scheduled,     color: "text-teal-600",   bg: "bg-teal-50" },
          { label: "Published",    value: published,     color: "text-green-600",  bg: "bg-green-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-5 py-4`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

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
                <input value={form.keyword} onChange={e => setForm({ ...form, keyword: e.target.value })}
                  placeholder="e.g. best plumber Dubai" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Client</label>
                <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}
                  placeholder="Client name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Assignee</label>
                <input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })}
                  placeholder="Writer name" className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <label className={labelCls}><Calendar size={11} className="inline mr-1" />Publish Date</label>
                <input type="date" value={form.publish_date} onChange={e => setForm({ ...form, publish_date: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>URL (once published)</label>
                <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Brief link, special instructions..." className={inputCls} />
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
          {/* Month nav */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft size={16} /></button>
            <h2 className="text-base font-bold text-slate-800">{MONTHS[calMonth]} {calYear}</h2>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronRight size={16} /></button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="px-2 py-2 text-center text-xs font-bold text-slate-400 uppercase">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[90px] border-r border-b border-slate-50 bg-slate-50/30" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dayPosts = postsForDay(day);
              const today = new Date();
              const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate();
              return (
                <div key={day} className={`min-h-[90px] border-r border-b border-slate-50 p-1.5 ${isToday ? "bg-teal-50/40" : "hover:bg-slate-50/50"} transition-colors`}>
                  <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-teal-600 text-white" : "text-slate-500"}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 3).map(p => {
                      const st = stCfg(p.status);
                      return (
                        <div key={p.id} className={`text-xs px-1.5 py-0.5 rounded font-medium truncate cursor-pointer border ${st.color}`}
                          title={p.title}>
                          {p.title}
                        </div>
                      );
                    })}
                    {dayPosts.length > 3 && (
                      <div className="text-xs text-slate-400 px-1">+{dayPosts.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-5">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, keyword, client..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
                <option value="all">All Statuses</option>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {allClients.length > 0 && (
                <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
                  <option value="all">All Clients</option>
                  {allClients.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              <span className="text-xs text-slate-400 ml-auto">{filtered.length} posts</span>
            </div>
          </div>

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
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Title / Keyword</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Assignee</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Publish Date</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(p => {
                    const st = stCfg(p.status);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        {editing === p.id ? (
                          <td colSpan={6} className="px-5 py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                              <input value={editData.title ?? ""} onChange={e => setEditData({ ...editData, title: e.target.value })}
                                placeholder="Title" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 col-span-2 sm:col-span-1" />
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
                              <input type="date" value={editData.publish_date ?? ""} onChange={e => setEditData({ ...editData, publish_date: e.target.value })}
                                className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => updatePost(p.id)}
                                className="flex items-center gap-1.5 text-sm bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700">
                                <Save size={13} /> Save
                              </button>
                              <button onClick={() => setEditing(null)}
                                className="flex items-center gap-1.5 text-sm border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">
                                <X size={13} /> Cancel
                              </button>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800 text-sm">{p.title}</p>
                              {p.keyword && <p className="text-xs text-slate-400 mt-0.5">{p.keyword}</p>}
                              {p.client && <p className="text-xs text-slate-400">{p.client}</p>}
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-sm text-slate-600">{p.type}</span>
                            </td>
                            <td className="px-5 py-4">
                              <select value={p.status}
                                onChange={e => {
                                  save(posts.map(x => x.id === p.id ? { ...x, status: e.target.value as ContentPost["status"] } : x));
                                }}
                                className={`text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${st.color}`}>
                                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-sm text-slate-600">{p.assignee || "—"}</span>
                            </td>
                            <td className="px-5 py-4">
                              {p.publish_date
                                ? <span className="text-sm text-slate-600">{new Date(p.publish_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                : <span className="text-slate-300 text-sm">—</span>}
                            </td>
                            <td className="px-5 py-4 text-right">
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
    </div>
  );
}
