"use client";
import { useEffect, useState } from "react";
import { Plus, BookOpen, Trash2, Pencil, Copy, Save, X, Check, Search } from "lucide-react";

const CATEGORIES = ["On-Page SEO","Technical SEO","Link Building","Content","Local SEO","Client Communication","Reporting","Other"];

const CAT_COLORS: Record<string, string> = {
  "On-Page SEO":        "bg-blue-50 text-blue-700 border-blue-200",
  "Technical SEO":      "bg-violet-50 text-violet-700 border-violet-200",
  "Link Building":      "bg-orange-50 text-orange-700 border-orange-200",
  "Content":            "bg-teal-50 text-teal-700 border-teal-200",
  "Local SEO":          "bg-green-50 text-green-700 border-green-200",
  "Client Communication":"bg-pink-50 text-pink-700 border-pink-200",
  "Reporting":          "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Other":              "bg-slate-100 text-slate-600 border-slate-200",
};

interface Prompt { id: string; title: string; category: string; content: string; created_at: string; }

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", category: "On-Page SEO", content: "" });
  const [editData, setEditData] = useState({ title: "", category: "", content: "" });
  const [copied, setCopied] = useState<string | null>(null);

  const load = () =>
    fetch("/api/prompts")
      .then(r => (r.ok ? r.json() : []))
      .catch(() => [])
      .then(d => setPrompts(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/prompts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ title: "", category: "On-Page SEO", content: "" });
    setShowForm(false);
    load();
  };

  const update = async (id: string) => {
    await fetch(`/api/prompts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editData) });
    setEditing(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/prompts/${id}`, { method: "DELETE" });
    load();
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = prompts.filter(p => {
    const matchCat = filterCat === "All" || p.category === filterCat;
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const countByCat = (cat: string) => prompts.filter(p => p.category === cat).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Templates & Prompts</h1>
          <p className="text-slate-500 text-sm mt-1">{prompts.length} saved template{prompts.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <Plus size={16} /> Add Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {prompts.length > 0 && (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm w-48" />
          </div>
        )}
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterCat("All")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${filterCat === "All" ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            All {prompts.length > 0 && <span className="opacity-60 ml-0.5">({prompts.length})</span>}
          </button>
          {CATEGORIES.filter(c => countByCat(c) > 0).map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${filterCat === cat ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {cat} <span className="opacity-60 ml-0.5">({countByCat(cat)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6 animate-fade-in">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700">New Template</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
          </div>
          <form onSubmit={save} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Title <span className="text-red-500">*</span></label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Meta Description Audit"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Content <span className="text-red-500">*</span></label>
              <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                rows={5} placeholder="Write your template, prompt, or recommendation..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                <Save size={14} /> Save Template
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-5 w-20 bg-slate-100 rounded-full" />
                <div className="flex gap-1">
                  <div className="w-7 h-7 bg-slate-100 rounded-lg" />
                  <div className="w-7 h-7 bg-slate-100 rounded-lg" />
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-50 rounded w-full mb-2" />
              <div className="h-3 bg-slate-50 rounded w-4/5 mb-2" />
              <div className="h-3 bg-slate-50 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <BookOpen size={36} className="text-slate-300" />
          </div>
          <h3 className="text-slate-600 font-bold text-lg mb-2">{search || filterCat !== "All" ? "No templates found" : "No templates yet"}</h3>
          <p className="text-slate-400 text-sm mb-6">{search || filterCat !== "All" ? "Try adjusting your filters" : "Save your SEO prompts, email templates, and recommendations"}</p>
          {!search && filterCat === "All" && (
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus size={15} /> Add First Template
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
              {editing === p.id ? (
                <div className="p-5 space-y-3">
                  <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <textarea value={editData.content} onChange={e => setEditData({ ...editData, content: e.target.value })}
                    rows={5} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => update(p.id)}
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
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border mb-2 ${CAT_COLORS[p.category] ?? CAT_COLORS["Other"]}`}>
                        {p.category}
                      </span>
                      <h3 className="font-bold text-slate-800 leading-snug">{p.title}</h3>
                    </div>
                    <div className="flex gap-1 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => copyText(p.id, p.content)} title="Copy to clipboard"
                        className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        {copied === p.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                      <button onClick={() => { setEditing(p.id); setEditData({ title: p.title, category: p.category, content: p.content }); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => del(p.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed line-clamp-4">{p.content}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                    <p className="text-xs text-slate-400">
                      {new Date(p.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <button onClick={() => copyText(p.id, p.content)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${copied === p.id ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                      {copied === p.id ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
