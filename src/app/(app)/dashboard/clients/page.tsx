"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus, Globe, Mail, Phone, FileText, Trash2, Pencil, Users, Search,
  Building2, Tag, DollarSign, Calendar, Clock, Upload, Filter,
  SortAsc, ChevronDown, ExternalLink, CheckSquare, Square, X,
  AlertCircle, CheckCircle2, Minus,
} from "lucide-react";

interface Client {
  id: string; name: string; email: string; website: string;
  phone?: string; company?: string;
  reports?: { count: number }[];
  // extended fields stored in localStorage
  tags?: string[];
  monthly_budget?: number;
  contract_expiry?: string;
  niche?: string;
  last_note?: string;
  portal_token?: string;
}

const NICHE_OPTIONS = ["E-commerce","Local Business","SaaS","Blog","Healthcare","Real Estate","Education","Restaurant","Agency","Other"];
const TAG_COLORS: Record<string,string> = {
  "E-commerce":"bg-blue-100 text-blue-700",
  "Local Business":"bg-green-100 text-green-700",
  "SaaS":"bg-violet-100 text-violet-700",
  "Blog":"bg-amber-100 text-amber-700",
  "Healthcare":"bg-teal-100 text-teal-700",
  "Real Estate":"bg-orange-100 text-orange-700",
  "Education":"bg-pink-100 text-pink-700",
  "Restaurant":"bg-red-100 text-red-700",
  "Agency":"bg-indigo-100 text-indigo-700",
  "Other":"bg-slate-100 text-slate-600",
};

const META_KEY = "seo_client_meta";
function getMeta(): Record<string,{tags?:string[];monthly_budget?:number;contract_expiry?:string;niche?:string;last_note?:string;portal_token?:string}> {
  try { return JSON.parse(localStorage.getItem(META_KEY)||"{}"); } catch { return {}; }
}
function saveMeta(d: ReturnType<typeof getMeta>) { localStorage.setItem(META_KEY, JSON.stringify(d)); }

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterNiche, setFilterNiche] = useState("all");
  const [sortKey, setSortKey] = useState<"name"|"reports"|"budget"|"expiry">("name");
  const [showFilters, setShowFilters] = useState(false);
  const [metaModal, setMetaModal] = useState<Client|null>(null);
  const [metaForm, setMetaForm] = useState({ tags:[] as string[], monthly_budget:"", contract_expiry:"", niche:"", last_note:"", portal_token:"" });
  const [importModal, setImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [reportDates, setReportDates] = useState<Record<string,{month:string;year:number;status:string}>>({});

  const load = () =>
    fetch("/api/clients")
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then((d: Client[]) => {
        if (!Array.isArray(d)) { setClients([]); return; }
        const meta = getMeta();
        const enriched = d.map(c => ({ ...c, ...(meta[c.id] ?? {}) }));
        setClients(enriched);
      })
      .catch(() => setClients([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // Load latest report date per client
    fetch("/api/reports").then(r=>r.ok?r.json():[]).catch(()=>[]).then((reps: {client_id?:string;clients?:{id:string};month:string;year:number;status:string}[]) => {
      if (!Array.isArray(reps)) return;
      const map: Record<string,{month:string;year:number;status:string}> = {};
      for (const r of reps) {
        const cid = r.client_id ?? r.clients?.id;
        if (cid && !map[cid]) map[cid] = { month: r.month, year: r.year, status: r.status };
      }
      setReportDates(map);
    });
  }, []);

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? All reports will also be deleted.`)) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    load();
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} clients?`)) return;
    await Promise.all([...selected].map(id => fetch(`/api/clients/${id}`, { method: "DELETE" })));
    setSelected(new Set());
    load();
  };

  const openMeta = (c: Client) => {
    setMetaModal(c);
    setMetaForm({
      tags: c.tags ?? [],
      monthly_budget: c.monthly_budget ? String(c.monthly_budget) : "",
      contract_expiry: c.contract_expiry ?? "",
      niche: c.niche ?? "",
      last_note: c.last_note ?? "",
      portal_token: c.portal_token ?? "",
    });
  };

  const saveMeta2 = () => {
    if (!metaModal) return;
    const meta = getMeta();
    meta[metaModal.id] = {
      tags: metaForm.tags,
      monthly_budget: metaForm.monthly_budget ? Number(metaForm.monthly_budget) : undefined,
      contract_expiry: metaForm.contract_expiry || undefined,
      niche: metaForm.niche || undefined,
      last_note: metaForm.last_note || undefined,
      portal_token: metaForm.portal_token || undefined,
    };
    saveMeta(meta);
    setMetaModal(null);
    load();
  };

  const handleCSVImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    const lines = importText.trim().split("\n").filter(l => l.trim());
    const header = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g,""));
    const nameIdx = header.findIndex(h => h.includes("name"));
    const emailIdx = header.findIndex(h => h.includes("email"));
    const websiteIdx = header.findIndex(h => h.includes("website") || h.includes("url") || h.includes("domain"));
    const phoneIdx = header.findIndex(h => h.includes("phone"));
    const companyIdx = header.findIndex(h => h.includes("company"));

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g,""));
      const name = nameIdx >= 0 ? cols[nameIdx] : cols[0];
      const email = emailIdx >= 0 ? cols[emailIdx] : "";
      const website = websiteIdx >= 0 ? cols[websiteIdx] : "";
      if (!name) continue;
      await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email||"", website: website||"", phone: phoneIdx>=0?cols[phoneIdx]:"", company: companyIdx>=0?cols[companyIdx]:"" }),
      }).catch(()=>{});
    }
    setImporting(false);
    setImportModal(false);
    setImportText("");
    load();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImportText((ev.target?.result as string) || "");
    reader.readAsText(file);
  };

  const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const getHealthStatus = (c: Client): "green"|"amber"|"red" => {
    const rep = reportDates[c.id];
    if (!rep) return "red";
    if (rep.status === "sent") return "green";
    return "amber";
  };

  const getDaysUntilExpiry = (expiry?: string) => {
    if (!expiry) return null;
    const diff = new Date(expiry).getTime() - Date.now();
    return Math.ceil(diff / (1000*60*60*24));
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.website.toLowerCase().includes(q) || (c.company ?? "").toLowerCase().includes(q);
    const matchNiche = filterNiche === "all" || c.niche === filterNiche;
    return matchSearch && matchNiche;
  }).sort((a, b) => {
    if (sortKey === "name") return a.name.localeCompare(b.name);
    if (sortKey === "reports") return (b.reports?.[0]?.count ?? 0) - (a.reports?.[0]?.count ?? 0);
    if (sortKey === "budget") return (b.monthly_budget ?? 0) - (a.monthly_budget ?? 0);
    if (sortKey === "expiry") {
      const ea = a.contract_expiry ? new Date(a.contract_expiry).getTime() : Infinity;
      const eb = b.contract_expiry ? new Date(b.contract_expiry).getTime() : Infinity;
      return ea - eb;
    }
    return 0;
  });

  const initials = (name?: string) => {
    if (!name) return "CL";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };
  const colors = ["from-blue-500 to-blue-600","from-violet-500 to-violet-600","from-teal-500 to-teal-600","from-orange-500 to-orange-600","from-pink-500 to-pink-600","from-green-500 to-green-600"];
  const colorFor = (id: string) => colors[id.charCodeAt(0) % colors.length];
  const allSelected = filtered.length > 0 && filtered.every(c => selected.has(c.id));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">{clients.length} total client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setImportModal(true)}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm">
            <Upload size={15} /> Import CSV
          </button>
          <Link href="/dashboard/clients/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <Plus size={16} /> Add Client
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      {clients.length > 0 && (
        <div className="mb-5 space-y-3">
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full max-w-sm pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" />
            </div>
            <button onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border shadow-sm transition-colors ${showFilters?"bg-blue-600 text-white border-blue-600":"bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              <Filter size={14} /> Filters <ChevronDown size={13} className={`transition-transform ${showFilters?"rotate-180":""}`} />
            </button>
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {(["name","reports","budget","expiry"] as const).map(k => (
                <button key={k} onClick={() => setSortKey(k)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${sortKey===k?"bg-slate-800 text-white":"text-slate-500 hover:bg-slate-50"}`}>
                  <SortAsc size={11}/> {k}
                </button>
              ))}
            </div>
          </div>
          {showFilters && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Niche</label>
                <select value={filterNiche} onChange={e => setFilterNiche(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Niches</option>
                  {NICHE_OPTIONS.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              {(filterNiche !== "all") && (
                <button onClick={() => setFilterNiche("all")} className="mt-4 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                  <X size={12}/> Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-bold text-blue-800">{selected.size} selected</span>
          <button onClick={bulkDelete} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-600 flex items-center gap-1">
            <Trash2 size={12}/> Delete Selected
          </button>
          <button onClick={()=>setSelected(new Set())} className="ml-auto text-xs text-blue-600 hover:underline font-semibold">Deselect all</button>
        </div>
      )}

      {/* Select all row */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-3 mb-2 px-1">
          <button onClick={() => {
            if (allSelected) setSelected(new Set());
            else setSelected(new Set(filtered.map(c => c.id)));
          }} className="text-slate-400 hover:text-slate-700 transition-colors">
            {allSelected ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16}/>}
          </button>
          <span className="text-xs text-slate-400 font-semibold">{filtered.length} client{filtered.length!==1?"s":""} shown</span>
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
            const health = getHealthStatus(c);
            const healthDot = health==="green"?"bg-green-500":health==="amber"?"bg-amber-400":"bg-red-500";
            const healthLabel = health==="green"?"Active":health==="amber"?"Pending":"No Report";
            const repDate = reportDates[c.id];
            const expiryDays = getDaysUntilExpiry(c.contract_expiry);
            const isSelected = selected.has(c.id);

            return (
              <div key={c.id}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group ${isSelected?"border-blue-300 ring-1 ring-blue-200":"border-slate-100"}`}>
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    {/* Select */}
                    <button onClick={() => setSelected(prev => {
                      const s = new Set(prev);
                      if (s.has(c.id)) s.delete(c.id); else s.add(c.id);
                      return s;
                    })} className="text-slate-300 hover:text-blue-600 transition-colors mt-1 shrink-0">
                      {isSelected ? <CheckSquare size={15} className="text-blue-600"/> : <Square size={15}/>}
                    </button>

                    {/* Avatar + health dot */}
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 bg-gradient-to-br ${colorFor(c.id)} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-110 transition-transform`}>
                        {initials(c.name)}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${healthDot}`} title={healthLabel} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/clients/${c.id}`} className="font-bold text-slate-800 truncate hover:text-blue-600 transition-colors block">{c.name}</Link>
                      {c.company && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 size={10} /> {c.company}
                        </p>
                      )}
                      {/* Tags */}
                      {(c.tags?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {c.tags!.map(t => (
                            <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${TAG_COLORS[t] ?? "bg-slate-100 text-slate-600"}`}>{t}</span>
                          ))}
                        </div>
                      )}
                      {c.niche && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 mt-1 inline-block">{c.niche}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openMeta(c)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit client meta">
                        <Tag size={13} />
                      </button>
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
                  <div className="mt-4 space-y-2 ml-7">
                    <a href={c.website} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors">
                      <Globe size={12} className="shrink-0" />
                      <span className="truncate">{c.website}</span>
                      <ExternalLink size={10} className="shrink-0 opacity-50"/>
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

                    {/* Extra meta */}
                    <div className="flex flex-wrap gap-3 pt-1">
                      {c.monthly_budget && (
                        <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                          <DollarSign size={10}/> ${c.monthly_budget.toLocaleString()}/mo
                        </span>
                      )}
                      {repDate && (
                        <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                          <FileText size={10}/> {repDate.month} {repDate.year}
                        </span>
                      )}
                      {expiryDays !== null && (
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${expiryDays < 14?"bg-red-50 text-red-700":expiryDays < 30?"bg-amber-50 text-amber-700":"bg-slate-50 text-slate-600"}`}>
                          <Calendar size={10}/>
                          {expiryDays < 0 ? "Expired" : expiryDays === 0 ? "Expires today" : `Expires in ${expiryDays}d`}
                        </span>
                      )}
                    </div>

                    {/* Last note snippet */}
                    {c.last_note && (
                      <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 line-clamp-2 italic mt-1">
                        "{c.last_note}"
                      </p>
                    )}

                    {/* Health badge */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${health==="green"?"bg-green-50 text-green-700":health==="amber"?"bg-amber-50 text-amber-700":"bg-red-50 text-red-700"}`}>
                        {health==="green"?<CheckCircle2 size={10}/>:health==="amber"?<Clock size={10}/>:<AlertCircle size={10}/>}
                        {healthLabel}
                      </span>
                    </div>
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
                    {c.portal_token && (
                      <a href={`/portal/${c.portal_token}`} target="_blank" rel="noreferrer"
                        className="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-1">
                        Portal <ExternalLink size={9}/>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Meta Modal */}
      {metaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">Client Details — {metaModal.name}</h3>
              <button onClick={()=>setMetaModal(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                <X size={18}/>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Niche / Industry</label>
                <select value={metaForm.niche} onChange={e=>setMetaForm({...metaForm,niche:e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- Select Niche --</option>
                  {NICHE_OPTIONS.map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Tags (comma-separated)</label>
                <input value={metaForm.tags.join(",")} onChange={e=>setMetaForm({...metaForm,tags:e.target.value.split(",").map(t=>t.trim()).filter(Boolean)})}
                  placeholder="E-commerce, Local Business..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Monthly Budget ($)</label>
                  <input type="number" value={metaForm.monthly_budget} onChange={e=>setMetaForm({...metaForm,monthly_budget:e.target.value})}
                    placeholder="e.g. 500"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Contract Expiry</label>
                  <input type="date" value={metaForm.contract_expiry} onChange={e=>setMetaForm({...metaForm,contract_expiry:e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Last Note Snippet</label>
                <textarea rows={2} value={metaForm.last_note} onChange={e=>setMetaForm({...metaForm,last_note:e.target.value})}
                  placeholder="Short note about this client..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Client Portal Token</label>
                <div className="flex gap-2">
                  <input value={metaForm.portal_token} onChange={e=>setMetaForm({...metaForm,portal_token:e.target.value})}
                    placeholder="auto-generated token"
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={()=>setMetaForm({...metaForm,portal_token:Math.random().toString(36).slice(2,10)})}
                    className="px-3 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200">
                    Generate
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setMetaModal(null)} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={saveMeta2} className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700">Save Details</button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {importModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">Import Clients from CSV</h3>
              <button onClick={()=>{setImportModal(false);setImportText("")}} className="text-slate-400 hover:text-slate-700"><X size={18}/></button>
            </div>
            <p className="text-xs text-slate-500 mb-3">CSV headers: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">name, email, website, phone, company</code></p>
            <div className="mb-4">
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden"/>
              <button onClick={()=>fileRef.current?.click()}
                className="flex items-center gap-2 border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 w-full justify-center hover:border-blue-300 hover:text-blue-600 transition-colors mb-3">
                <Upload size={16}/> Upload CSV file
              </button>
              <textarea rows={6} value={importText} onChange={e=>setImportText(e.target.value)}
                placeholder={"name,email,website\nJohn Doe,john@example.com,https://example.com\n..."}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={()=>{setImportModal(false);setImportText("")}} className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={handleCSVImport} disabled={importing||!importText.trim()}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
