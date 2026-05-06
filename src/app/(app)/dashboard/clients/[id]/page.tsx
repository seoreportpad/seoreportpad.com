"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Globe, Mail, Phone, Building2, Pencil,
  FileText, StickyNote, Plus, TrendingUp, TrendingDown,
  ExternalLink, Calendar, BarChart3, ChevronRight, Trash2,
} from "lucide-react";

interface Client {
  id: string; name: string; email: string; website: string;
  phone?: string; company?: string;
}
interface Report {
  id: string; month: string; year: number; status: string;
  metrics?: { organic_traffic?: number; prev_traffic?: number };
}
interface Note {
  id: string; title: string; content: string; created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  sent:  { label: "Sent",  cls: "bg-green-100 text-green-700" },
  ready: { label: "Ready", cls: "bg-blue-100 text-blue-700" },
  draft: { label: "Draft", cls: "bg-amber-100 text-amber-700" },
};

const COLORS = ["from-blue-500 to-blue-600","from-violet-500 to-violet-600","from-teal-500 to-teal-600","from-orange-500 to-orange-600","from-pink-500 to-pink-600","from-green-500 to-green-600"];
const colorFor = (id: string) => COLORS[id.charCodeAt(0) % COLORS.length];
const initials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safe = (url: string) => fetch(url).then(r => r.ok ? r.json() : null).catch(() => null);
    Promise.all([
      safe(`/api/clients/${id}`),
      safe(`/api/reports?clientId=${id}`),
      safe(`/api/notes?clientId=${id}`),
    ]).then(([c, r, n]) => {
      if (c && !c.error) setClient(c);
      setReports(Array.isArray(r) ? r : []);
      setNotes(Array.isArray(n) ? n : []);
      setLoading(false);
    });
  }, [id]);

  const delReport = async (rid: string) => {
    if (!confirm("Delete this report?")) return;
    await fetch(`/api/reports/${rid}`, { method: "DELETE" });
    setReports(prev => prev.filter(r => r.id !== rid));
  };

  const delNote = async (nid: string) => {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${nid}`, { method: "DELETE" });
    setNotes(prev => prev.filter(n => n.id !== nid));
  };

  if (loading) return (
    <div className="animate-fade-in">
      <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse mb-8" />
      <div className="h-40 bg-slate-100 rounded-2xl animate-pulse mb-6" />
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  if (!client) return (
    <div className="text-center py-20">
      <p className="text-slate-400 text-lg font-medium">Client not found</p>
      <Link href="/dashboard/clients" className="text-blue-600 text-sm mt-2 inline-block hover:underline">← Back to Clients</Link>
    </div>
  );

  const totalTraffic = reports.reduce((s, r) => s + (r.metrics?.organic_traffic ?? 0), 0);
  const sentCount = reports.filter(r => r.status === "sent").length;

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to Clients
      </button>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className={`h-2 bg-gradient-to-r ${colorFor(client.id)}`} />
        <div className="p-6 flex flex-col md:flex-row gap-5">
          <div className={`w-20 h-20 bg-gradient-to-br ${colorFor(client.id)} rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-sm`}>
            {initials(client.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-black text-slate-800">{client.name}</h1>
                {client.company && (
                  <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                    <Building2 size={13} /> {client.company}
                  </p>
                )}
              </div>
              <Link href={`/dashboard/clients/${id}/edit`}
                className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                <Pencil size={14} /> Edit Client
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <a href={client.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                <Globe size={14} className="text-slate-400" />
                {client.website}
                <ExternalLink size={11} className="text-slate-300" />
              </a>
              <a href={`mailto:${client.email}`}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                <Mail size={14} className="text-slate-400" /> {client.email}
              </a>
              {client.phone && (
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400" /> {client.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 border-t border-slate-50">
          {[
            { label: "Total Reports", value: reports.length, icon: FileText, color: "text-blue-600" },
            { label: "Reports Sent", value: sentCount, icon: BarChart3, color: "text-green-600" },
            { label: "Total Traffic", value: totalTraffic > 0 ? totalTraffic.toLocaleString() : "—", icon: TrendingUp, color: "text-violet-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="py-4 px-6 text-center">
              <Icon size={16} className={`${color} mx-auto mb-1.5`} />
              <p className="text-xl font-black text-slate-800">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reports */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              <h2 className="font-bold text-slate-700">Reports ({reports.length})</h2>
            </div>
            <Link href={`/dashboard/reports/new?clientId=${id}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={12} /> New Report
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="py-12 text-center">
              <FileText size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm font-medium">No reports yet</p>
              <Link href={`/dashboard/reports/new?clientId=${id}`}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold mt-3 hover:underline">
                <Plus size={12} /> Create first report
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {reports.map(r => {
                const sc = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.draft;
                const traffic = r.metrics?.organic_traffic;
                const prev = r.metrics?.prev_traffic;
                const diff = traffic != null && prev != null ? traffic - prev : null;
                return (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 group transition-colors">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 text-sm">{r.month} {r.year}</p>
                      {diff !== null && (
                        <span className={`flex items-center gap-0.5 text-xs font-medium ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {diff >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {diff >= 0 ? "+" : ""}{diff.toLocaleString()} traffic
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sc.cls}`}>{sc.label}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/dashboard/reports/${r.id}`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <ChevronRight size={14} />
                      </Link>
                      <button onClick={() => delReport(r.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <StickyNote size={16} className="text-violet-600" />
              <h2 className="font-bold text-slate-700">Notes ({notes.length})</h2>
            </div>
            <Link href={`/dashboard/notes?clientId=${id}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={12} /> Add Note
            </Link>
          </div>

          {notes.length === 0 ? (
            <div className="py-12 text-center">
              <StickyNote size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm font-medium">No notes yet</p>
              <Link href={`/dashboard/notes?clientId=${id}`}
                className="inline-flex items-center gap-1.5 text-xs text-violet-600 font-semibold mt-3 hover:underline">
                <Plus size={12} /> Add first note
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {notes.map(n => (
                <div key={n.id} className="px-5 py-3.5 hover:bg-slate-50/60 group transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-700 text-sm truncate">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.content}</p>
                      <p className="text-xs text-slate-300 mt-1.5 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(n.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <button onClick={() => delNote(n.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/dashboard/reports/new?clientId=${id}`}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <Plus size={15} /> New Report
        </Link>
        <Link href={`/dashboard/notes?clientId=${id}`}
          className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200">
          <StickyNote size={15} /> Add Note
        </Link>
        <a href={client.website} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
          <Globe size={15} /> Visit Website
        </a>
        <a href={`mailto:${client.email}`}
          className="flex items-center gap-2 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
          <Mail size={15} /> Email Client
        </a>
      </div>
    </div>
  );
}
