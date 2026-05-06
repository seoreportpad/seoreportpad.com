"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, StickyNote, Trash2, Pencil, Save, X, Search, Calendar, User } from "lucide-react";

interface Note {
  id: string; client_id: string; title: string; content: string; created_at: string;
  clients?: { name: string };
}
interface Client { id: string; name: string; }

const NOTE_COLORS = [
  "border-l-blue-400 bg-blue-50/30",
  "border-l-violet-400 bg-violet-50/30",
  "border-l-teal-400 bg-teal-50/30",
  "border-l-orange-400 bg-orange-50/30",
  "border-l-pink-400 bg-pink-50/30",
  "border-l-green-400 bg-green-50/30",
];
const noteColor = (id: string) => NOTE_COLORS[id.charCodeAt(0) % NOTE_COLORS.length];

function NotesList() {
  const searchParams = useSearchParams();
  const filterClientId = searchParams.get("clientId");
  const [notes, setNotes] = useState<Note[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ client_id: filterClientId ?? "", title: "", content: "" });
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState({ title: "", content: "" });
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState(filterClientId ?? "all");

  const safeFetch = (url: string) =>
    fetch(url).then(r => (r.ok ? r.json() : [])).catch(() => []);

  const load = () =>
    safeFetch("/api/notes")
      .then(d => setNotes(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    safeFetch("/api/clients").then(d => setClients(Array.isArray(d) ? d : []));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ client_id: filterClientId ?? "", title: "", content: "" });
    setShowForm(false);
    load();
  };

  const update = async (id: string) => {
    await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setEditing(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = notes.filter(n => {
    const matchClient = filterClient === "all" || n.client_id === filterClient;
    const matchSearch = !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    return matchClient && matchSearch;
  });

  const activeClient = clients.find(c => c.id === filterClient);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">SEO Notes</h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeClient ? `Notes for ${activeClient.name}` : `${notes.length} total note${notes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <Plus size={16} /> Add Note
        </button>
      </div>

      {/* Filters */}
      {notes.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm w-48" />
          </div>
          {clients.length > 0 && (
            <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm">
              <option value="all">All Clients</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>
      )}

      {/* Add Note Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6 animate-fade-in">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700">New Note</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={save} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Client <span className="text-red-500">*</span></label>
                <select required value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- Select Client --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Title <span className="text-red-500">*</span></label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Technical Issues Found"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Content <span className="text-red-500">*</span></label>
              <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                rows={4} placeholder="Write your SEO notes here..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                <Save size={14} /> Save Note
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
              <div className="h-4 bg-slate-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-slate-50 rounded w-full mb-2" />
              <div className="h-3 bg-slate-50 rounded w-4/5 mb-2" />
              <div className="h-3 bg-slate-50 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <StickyNote size={36} className="text-slate-300" />
          </div>
          <h3 className="text-slate-600 font-bold text-lg mb-2">{search || filterClient !== "all" ? "No notes found" : "No notes yet"}</h3>
          <p className="text-slate-400 text-sm mb-6">{search || filterClient !== "all" ? "Try adjusting your filters" : "Save important SEO findings, issues, and recommendations"}</p>
          {!search && filterClient === "all" && (
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus size={15} /> Add First Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(note => (
            <div key={note.id}
              className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all border-l-4 ${noteColor(note.id)} group overflow-hidden`}>
              {editing === note.id ? (
                <div className="p-5 space-y-3">
                  <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <textarea value={editData.content} onChange={e => setEditData({ ...editData, content: e.target.value })}
                    rows={4} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => update(note.id)}
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
                      <h3 className="font-bold text-slate-800 truncate">{note.title}</h3>
                      {note.clients?.name && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <User size={10} /> {note.clients.name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                      <button onClick={() => { setEditing(note.id); setEditData({ title: note.title, content: note.content }); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => del(note.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed line-clamp-4">{note.content}</p>
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(note.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={
      <div className="grid md:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-2/3 mb-3" />
            <div className="h-3 bg-slate-50 rounded w-full mb-2" />
            <div className="h-3 bg-slate-50 rounded w-4/5" />
          </div>
        ))}
      </div>
    }>
      <NotesList />
    </Suspense>
  );
}
