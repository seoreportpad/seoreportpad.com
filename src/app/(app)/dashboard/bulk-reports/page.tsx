"use client";
import { useState, useEffect } from "react";
import { Zap, CheckCircle, Loader2, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Client { id: string; name: string; website: string; }
interface CreatedReport { id: string; client_id: string; month: string; year: number; }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function BulkReportsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [month, setMonth] = useState(MONTHS[0]);
  const [year, setYear] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [created, setCreated] = useState<CreatedReport[]>([]);

  useEffect(() => {
    const now = new Date();
    setMonth(MONTHS[now.getMonth()]);
    setYear(now.getFullYear());
    fetch("/api/clients").then(r => r.ok ? r.json() : []).then(d => {
      if (Array.isArray(d)) { setClients(d); setSelected(d.map((c: Client) => c.id)); }
      setLoading(false);
    });
  }, []);

  const toggleClient = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === clients.length ? [] : clients.map(c => c.id));

  const generate = async () => {
    if (!selected.length) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/bulk-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, clientIds: selected }),
      });
      const data = await res.json();
      if (data.reports) setCreated(data.reports);
    } finally { setGenerating(false); }
  };

  const selectCls = "border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">Bulk Report Generation</h1>
        <p className="text-slate-500 text-sm mt-1">Create draft reports for multiple clients at once — fill in metrics later</p>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Month/year picker */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-700 mb-4">Report Period</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Month</label>
              <select value={month} onChange={e => setMonth(e.target.value)} className={`${selectCls} w-full`}>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="w-32">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Year</label>
              <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                min={2020} max={2030} className={`${selectCls} w-full`} />
            </div>
          </div>
        </div>

        {/* Client selection */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h2 className="font-bold text-slate-700">Select Clients</h2>
            <button onClick={toggleAll} className="text-xs font-semibold text-blue-600 hover:underline">
              {selected.length === clients.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : clients.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No clients found. <Link href="/dashboard/clients/new" className="text-blue-600 font-semibold hover:underline">Add a client</Link></div>
          ) : (
            <div className="divide-y divide-slate-50">
              {clients.map(c => (
                <label key={c.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/60 cursor-pointer transition-colors">
                  <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleClient(c.id)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.website}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Generate button */}
        <button onClick={generate} disabled={generating || selected.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm shadow-blue-200">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          {generating ? "Generating…" : `Generate ${selected.length} Draft Report${selected.length === 1 ? "" : "s"} for ${month} ${year}`}
        </button>

        {/* Results */}
        {created.length > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-green-600" />
              <p className="font-bold text-green-700">{created.length} draft report{created.length === 1 ? "" : "s"} created!</p>
            </div>
            <p className="text-sm text-green-600 mb-4">Click a report to fill in the metrics and send to your client.</p>
            <div className="space-y-2">
              {created.map(r => {
                const client = clients.find(c => c.id === r.client_id);
                return (
                  <Link key={r.id} href={`/dashboard/reports/${r.id}/edit`}
                    className="flex items-center gap-3 bg-white border border-green-100 rounded-xl px-4 py-3 hover:border-green-300 transition-colors">
                    <FileText size={15} className="text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 flex-1">{client?.name ?? r.client_id} · {r.month} {r.year}</span>
                    <ArrowRight size={14} className="text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
