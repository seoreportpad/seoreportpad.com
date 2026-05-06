"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Calendar, Users, FileText } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface Client { id: string; name: string; website: string; email: string; }
interface Result { clientId: string; clientName: string; reportId?: string; status: "created" | "exists" | "error"; message?: string; }

export default function AutoReportsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [template, setTemplate] = useState<"blank" | "copy_last">("blank");
  const [autoSend, setAutoSend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then(r => r.ok ? r.json() : []).then(d => {
      const list = Array.isArray(d) ? d : [];
      setClients(list);
      setSelected(new Set(list.map((c: Client) => c.id)));
    }).catch(() => {});
  }, []);

  const toggleAll = () => {
    if (selected.size === clients.length) setSelected(new Set());
    else setSelected(new Set(clients.map(c => c.id)));
  };

  const toggle = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const generate = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    setDone(false);
    setResults([]);

    const res = await fetch("/api/bulk-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientIds: [...selected],
        month,
        year,
        template,
      }),
    });
    const data = await res.json();
    setResults(Array.isArray(data.results) ? data.results : []);
    setDone(true);
    setLoading(false);

    // Auto-send emails if requested
    if (autoSend && Array.isArray(data.results)) {
      for (const r of data.results) {
        if (r.status === "created" && r.reportId) {
          const client = clients.find(c => c.id === r.clientId);
          if (client?.email) {
            await fetch("/api/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: client.email,
                subject: `${month} ${year} SEO Report — ${client.name}`,
                html: `<p>Hi <strong>${client.name}</strong>,</p><p>Your SEO report for ${month} ${year} is ready. Please find the details in the attached report.</p>`,
                reportId: r.reportId,
              }),
            });
          }
        }
      }
    }
  };

  const created = results.filter(r => r.status === "created").length;
  const errors = results.filter(r => r.status === "error").length;

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Zap size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800">Auto Report Generation</h1>
          <p className="text-slate-500 text-sm mt-0.5">Generate draft reports for multiple clients at once</p>
        </div>
      </div>

      {!done ? (
        <div className="space-y-5">
          {/* Period */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" /> Report Period
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Month</label>
                <select value={month} onChange={e => setMonth(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Year</label>
                <select value={year} onChange={e => setYear(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {[2023,2024,2025,2026].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-violet-500" /> Generation Options
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">Starting template</label>
                <div className="flex gap-2">
                  {([["blank","Blank Draft"],["copy_last","Copy from Last Month"]] as const).map(([val, lbl]) => (
                    <button key={val} onClick={() => setTemplate(val)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${template === val ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-10 h-5 rounded-full transition-colors relative ${autoSend ? "bg-blue-600" : "bg-slate-200"}`}
                  onClick={() => setAutoSend(!autoSend)}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoSend ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Auto-send emails after generation</p>
                  <p className="text-xs text-slate-400">Sends the report email to each client immediately</p>
                </div>
              </label>
            </div>
          </div>

          {/* Client selector */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <Users size={16} className="text-emerald-500" /> Select Clients
              </h2>
              <button onClick={toggleAll} className="text-xs font-semibold text-blue-600 hover:underline">
                {selected.size === clients.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            {clients.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">No clients found. <Link href="/dashboard/clients/new" className="text-blue-600 hover:underline">Add a client</Link> first.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {clients.map(c => (
                  <label key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selected.has(c.id) ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-100 hover:bg-slate-100"}`}>
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="w-4 h-4 accent-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700">{c.name}</p>
                      <p className="text-xs text-slate-400 truncate">{c.website}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{c.email}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button onClick={generate} disabled={loading || selected.size === 0}
            className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-200">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Generating {selected.size} reports…</> : <><Zap size={18} /> Generate {selected.size} Report{selected.size !== 1 ? "s" : ""} for {month} {year}</>}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-4">Generation Complete</h2>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-green-600">{created}</p>
                <p className="text-xs text-green-500 font-medium">Created</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-slate-500">{results.filter(r => r.status === "exists").length}</p>
                <p className="text-xs text-slate-400 font-medium">Already Exist</p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-red-500">{errors}</p>
                <p className="text-xs text-red-400 font-medium">Errors</p>
              </div>
            </div>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  r.status === "created" ? "bg-green-50 border-green-100"
                  : r.status === "exists" ? "bg-slate-50 border-slate-100"
                  : "bg-red-50 border-red-100"
                }`}>
                  {r.status === "created" ? <CheckCircle2 size={16} className="text-green-500 shrink-0" /> : <AlertCircle size={16} className="text-amber-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">{r.clientName}</p>
                    {r.message && <p className="text-xs text-slate-400">{r.message}</p>}
                  </div>
                  {r.status === "created" && r.reportId && (
                    <Link href={`/dashboard/reports/${r.reportId}/edit`}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline shrink-0">
                      Fill in <ChevronRight size={12} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setDone(false); setResults([]); }}
              className="flex-1 border border-slate-200 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Generate Another Batch
            </button>
            <Link href="/dashboard/reports"
              className="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-sm font-bold text-center hover:bg-blue-700 transition-colors">
              View All Reports
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
