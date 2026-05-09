"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2,
  Circle, Users, Search, X, Save, Pencil,
} from "lucide-react";

interface OnboardCheck {
  id: string;
  label: string;
  done: boolean;
  notes: string;
}

interface OnboardClient {
  id: string;
  name: string;
  website: string;
  start_date: string;
  package: string;
  notes: string;
  checks: OnboardCheck[];
  created_at: string;
}

const DEFAULT_CHECKS: Omit<OnboardCheck, "done" | "notes">[] = [
  // Discovery & Access
  { id: "ob-01", label: "Kick-off call completed" },
  { id: "ob-02", label: "Client questionnaire / brief received and reviewed" },
  { id: "ob-03", label: "Google Search Console access granted" },
  { id: "ob-04", label: "Google Analytics / GA4 access granted" },
  { id: "ob-05", label: "Google My Business access granted (if local SEO)" },
  { id: "ob-06", label: "Website CMS / backend access received" },
  { id: "ob-07", label: "Hosting / cPanel access received (if needed)" },
  { id: "ob-08", label: "Social media account access received (if needed)" },
  // Research
  { id: "ob-09", label: "Website technical audit completed" },
  { id: "ob-10", label: "Keyword research completed — primary and secondary keywords finalized" },
  { id: "ob-11", label: "Competitor research completed — top 5 competitors identified" },
  { id: "ob-12", label: "Current keyword rankings documented (baseline)" },
  { id: "ob-13", label: "Backlink profile analyzed" },
  { id: "ob-14", label: "Content audit completed — existing pages reviewed" },
  { id: "ob-15", label: "Local SEO setup checked — NAP consistency verified" },
  // Strategy
  { id: "ob-16", label: "SEO strategy document prepared" },
  { id: "ob-17", label: "3-month roadmap created and shared with client" },
  { id: "ob-18", label: "Priority issues list created (quick wins identified)" },
  { id: "ob-19", label: "Content plan / calendar created" },
  { id: "ob-20", label: "Reporting schedule agreed — monthly / bi-weekly" },
  // Setup
  { id: "ob-21", label: "GSC property verified and sitemap submitted" },
  { id: "ob-22", label: "GA4 tracking code verified as working" },
  { id: "ob-23", label: "Rank tracking set up for target keywords" },
  { id: "ob-24", label: "Client added to dashboard / project management tool" },
  { id: "ob-25", label: "Welcome email / onboarding document sent to client" },
  // First Month
  { id: "ob-26", label: "Critical technical SEO issues fixed (broken links, crawl errors)" },
  { id: "ob-27", label: "Title tags and meta descriptions optimized for priority pages" },
  { id: "ob-28", label: "First content piece / blog post assigned or published" },
  { id: "ob-29", label: "Internal linking structure reviewed and improved" },
  { id: "ob-30", label: "First monthly report sent to client" },
];

const LS_KEY = "seo_onboarding_v1";
function load(): OnboardClient[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function persist(d: OnboardClient[]) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function newChecks(): OnboardCheck[] {
  return DEFAULT_CHECKS.map(c => ({ ...c, done: false, notes: "" }));
}

const PHASES = [
  { label: "Discovery & Access", ids: ["ob-01","ob-02","ob-03","ob-04","ob-05","ob-06","ob-07","ob-08"] },
  { label: "Research & Analysis",  ids: ["ob-09","ob-10","ob-11","ob-12","ob-13","ob-14","ob-15"] },
  { label: "Strategy & Planning",  ids: ["ob-16","ob-17","ob-18","ob-19","ob-20"] },
  { label: "Technical Setup",      ids: ["ob-21","ob-22","ob-23","ob-24","ob-25"] },
  { label: "First Month Actions",  ids: ["ob-26","ob-27","ob-28","ob-29","ob-30"] },
];

export default function OnboardingPage() {
  const [clients, setClients] = useState<OnboardClient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", website: "", start_date: "", package: "", notes: "" });
  const [selected, setSelected] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", website: "", package: "", notes: "" });
  const [noteEditing, setNoteEditing] = useState<string | null>(null);
  const [noteVal, setNoteVal] = useState("");

  useEffect(() => { setClients(load()); }, []);

  const save = (d: OnboardClient[]) => { setClients(d); persist(d); };

  const addClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const c: OnboardClient = {
      id: uid(), name: form.name, website: form.website,
      start_date: form.start_date, package: form.package, notes: form.notes,
      checks: newChecks(), created_at: new Date().toISOString(),
    };
    const updated = [c, ...clients];
    save(updated);
    setSelected(c.id);
    setShowForm(false);
    setForm({ name: "", website: "", start_date: "", package: "", notes: "" });
  };

  const toggleCheck = (clientId: string, checkId: string) => {
    save(clients.map(c => c.id !== clientId ? c : {
      ...c, checks: c.checks.map(ch => ch.id === checkId ? { ...ch, done: !ch.done } : ch)
    }));
  };

  const saveNote = (clientId: string, checkId: string) => {
    save(clients.map(c => c.id !== clientId ? c : {
      ...c, checks: c.checks.map(ch => ch.id === checkId ? { ...ch, notes: noteVal } : ch)
    }));
    setNoteEditing(null);
    setNoteVal("");
  };

  const deleteClient = (id: string) => {
    if (!confirm("Remove this client's onboarding?")) return;
    const updated = clients.filter(c => c.id !== id);
    save(updated);
    if (selected === id) setSelected(null);
  };

  const updateClient = (id: string) => {
    save(clients.map(c => c.id !== id ? c : { ...c, ...editForm }));
    setEditingClient(null);
  };

  const current = clients.find(c => c.id === selected);
  const filteredClients = useMemo(() => clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.website.toLowerCase().includes(search.toLowerCase())
  ), [clients, search]);

  const getProgress = (c: OnboardClient) => {
    const done = c.checks.filter(ch => ch.done).length;
    return { done, total: c.checks.length, pct: Math.round((done / c.checks.length) * 100) };
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
  const labelCls = "text-xs font-semibold text-slate-600 block mb-1.5";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Client Onboarding</h1>
          <p className="text-slate-500 text-sm mt-1">30-step onboarding checklist for every new SEO client</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 self-start">
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Add client form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-indigo-50 to-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center gap-2"><Users size={16} className="text-indigo-600" />New Client Onboarding</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={16} /></button>
          </div>
          <form onSubmit={addClient} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Client Name <span className="text-red-500">*</span></label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. ABC Plumbing Dubai" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}
                  placeholder="https://..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Start Date</label>
                <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Package</label>
                <input value={form.package} onChange={e => setForm({ ...form, package: e.target.value })}
                  placeholder="e.g. Local SEO Pro — $800/mo" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2} placeholder="Important context, special requirements..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700">
                <Save size={14} /> Start Onboarding
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Client list */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Users size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No clients yet</p>
            </div>
          )}

          {filteredClients.map(c => {
            const { done, total, pct } = getProgress(c);
            const isSelected = selected === c.id;
            return (
              <div key={c.id}
                onClick={() => setSelected(isSelected ? null : c.id)}
                className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all ${isSelected ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-100 hover:border-indigo-200"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{c.name}</p>
                    {c.website && <p className="text-xs text-slate-400 truncate mt-0.5">{c.website.replace(/^https?:\/\/(www\.)?/, "")}</p>}
                    {c.package && <p className="text-xs text-indigo-600 font-medium mt-0.5">{c.package}</p>}
                    {c.start_date && <p className="text-xs text-slate-400 mt-0.5">Started: {new Date(c.start_date + "T00:00:00").toLocaleDateString()}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-lg font-black ${pct === 100 ? "text-green-600" : "text-indigo-600"}`}>{pct}%</p>
                    <p className="text-xs text-slate-400">{done}/{total}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct === 100 ? "bg-green-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checklist panel */}
        <div className="lg:col-span-2">
          {!current ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col items-center justify-center">
              <Users size={40} className="text-slate-200 mb-4" />
              <p className="text-slate-500 font-semibold">Select a client to view their onboarding checklist</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Client header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 to-slate-50">
                {editingClient === current.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Name" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      <input value={editForm.website} onChange={e => setEditForm({ ...editForm, website: e.target.value })}
                        placeholder="Website" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                      <input value={editForm.package} onChange={e => setEditForm({ ...editForm, package: e.target.value })}
                        placeholder="Package" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                      <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={1} placeholder="Notes" className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateClient(current.id)} className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
                        <Save size={12} /> Save
                      </button>
                      <button onClick={() => setEditingClient(null)} className="text-sm border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-800">{current.name}</h2>
                      {current.website && <p className="text-sm text-slate-500">{current.website}</p>}
                      {current.package && <p className="text-xs text-indigo-600 font-semibold mt-1">{current.package}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingClient(current.id); setEditForm({ name: current.name, website: current.website, package: current.package, notes: current.notes }); }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteClient(current.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
                {/* Overall progress */}
                {!editingClient && (() => {
                  const { done, total, pct } = getProgress(current);
                  return (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span>{done} of {total} steps completed</span>
                        <span className="font-bold text-indigo-600">{pct}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-green-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Phases */}
              <div className="divide-y divide-slate-50">
                {PHASES.map(phase => {
                  const phaseChecks = current.checks.filter(ch => phase.ids.includes(ch.id));
                  const donePh = phaseChecks.filter(ch => ch.done).length;
                  const isOpen = expandedPhase === phase.label;
                  return (
                    <div key={phase.label}>
                      <button onClick={() => setExpandedPhase(isOpen ? null : phase.label)}
                        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {donePh === phaseChecks.length
                            ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                            : <Circle size={16} className="text-slate-300 shrink-0" />}
                          <span className="font-semibold text-slate-700 text-sm">{phase.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${donePh === phaseChecks.length ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}>
                            {donePh}/{phaseChecks.length}
                          </span>
                        </div>
                        {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4 space-y-2">
                          {phaseChecks.map(ch => (
                            <div key={ch.id} className="group">
                              <div className="flex items-start gap-3 py-2">
                                <button onClick={() => toggleCheck(current.id, ch.id)} className="mt-0.5 shrink-0">
                                  {ch.done
                                    ? <CheckCircle2 size={17} className="text-green-500" />
                                    : <Circle size={17} className="text-slate-200 hover:text-indigo-400 transition-colors" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm leading-snug ${ch.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                                    {ch.label}
                                  </p>
                                  {ch.notes && noteEditing !== ch.id && (
                                    <p className="text-xs text-slate-400 mt-0.5 italic">{ch.notes}</p>
                                  )}
                                  {noteEditing === ch.id && (
                                    <div className="flex gap-2 mt-1.5">
                                      <input autoFocus value={noteVal} onChange={e => setNoteVal(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") saveNote(current.id, ch.id); if (e.key === "Escape") setNoteEditing(null); }}
                                        placeholder="Add a note..." className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                                      <button onClick={() => saveNote(current.id, ch.id)}
                                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-lg hover:bg-indigo-700"><Save size={11} /></button>
                                      <button onClick={() => setNoteEditing(null)}
                                        className="text-xs border border-slate-200 px-2 py-1 rounded-lg hover:bg-slate-50"><X size={11} /></button>
                                    </div>
                                  )}
                                </div>
                                {noteEditing !== ch.id && (
                                  <button onClick={() => { setNoteEditing(ch.id); setNoteVal(ch.notes); }}
                                    className="shrink-0 opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-indigo-600 px-2 py-0.5 rounded-lg hover:bg-indigo-50 transition-all">
                                    note
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
