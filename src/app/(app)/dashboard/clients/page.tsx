"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Globe, Mail, Phone, FileText, Trash2, Pencil, Users, Search, Building2 } from "lucide-react";

interface Client {
  id: string; name: string; email: string; website: string;
  phone?: string; company?: string;
  reports?: { count: number }[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () =>
    fetch("/api/clients")
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setClients(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? All reports will also be deleted.`)) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.website.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["from-blue-500 to-blue-600","from-violet-500 to-violet-600","from-teal-500 to-teal-600","from-orange-500 to-orange-600","from-pink-500 to-pink-600","from-green-500 to-green-600"];
  const colorFor = (id: string) => colors[id.charCodeAt(0) % colors.length];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">{clients.length} total client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/clients/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <Plus size={16} /> Add Client
        </Link>
      </div>

      {/* Search */}
      {clients.length > 0 && (
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full max-w-sm pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" />
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                <div>
                  <div className="h-4 bg-slate-100 rounded w-32 mb-2" />
                  <div className="h-3 bg-slate-50 rounded w-24" />
                </div>
              </div>
              <div className="h-3 bg-slate-50 rounded w-full mb-2" />
              <div className="h-3 bg-slate-50 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Users size={36} className="text-slate-300" />
          </div>
          <h3 className="text-slate-600 font-bold text-lg mb-2">{search ? "No clients found" : "No clients yet"}</h3>
          <p className="text-slate-400 text-sm mb-6">{search ? "Try a different search" : "Add your first SEO client to get started"}</p>
          {!search && (
            <Link href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus size={15} /> Add First Client
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((c) => {
            const reportCount = c.reports?.[0]?.count ?? 0;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${colorFor(c.id)} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                      {initials(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/clients/${c.id}`} className="font-bold text-slate-800 truncate hover:text-blue-600 transition-colors block">{c.name}</Link>
                      {c.company && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 size={10} /> {c.company}
                        </p>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/dashboard/clients/${c.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => del(c.id, c.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-4 space-y-2">
                    <a href={c.website} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors">
                      <Globe size={12} className="shrink-0" />
                      <span className="truncate">{c.website}</span>
                    </a>
                    <a href={`mailto:${c.email}`}
                      className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors">
                      <Mail size={12} className="shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </a>
                    {c.phone && (
                      <p className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone size={12} className="shrink-0" /> {c.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-50 px-5 py-3 flex items-center justify-between">
                  <Link href={`/dashboard/reports?clientId=${c.id}`}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium">
                    <FileText size={12} />
                    {reportCount} report{reportCount !== 1 ? "s" : ""}
                  </Link>
                  <div className="flex gap-3">
                    <Link href={`/dashboard/reports/new?clientId=${c.id}`}
                      className="text-xs text-blue-600 font-semibold hover:underline">
                      + Report
                    </Link>
                    <Link href={`/dashboard/notes?clientId=${c.id}`}
                      className="text-xs text-violet-600 font-semibold hover:underline">
                      Notes
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
