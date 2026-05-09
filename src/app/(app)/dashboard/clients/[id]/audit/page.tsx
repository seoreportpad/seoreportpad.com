"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, AlertCircle, XCircle, 
  Settings, Search, Globe, Zap, Layers, MapPin, 
  Save, Loader2, Info
} from "lucide-react";

interface AuditCategory {
  id: string;
  label: string;
  icon: any;
  items: AuditItem[];
}

interface AuditItem {
  id: string;
  label: string;
  description: string;
}

const AUDIT_SCHEMA: AuditCategory[] = [
  {
    id: "technical",
    label: "Technical SEO",
    icon: Settings,
    items: [
      { id: "robots", label: "Robots.txt", description: "Robots.txt file exists and is correctly configured." },
      { id: "sitemap", label: "XML Sitemap", description: "Sitemap exists and is submitted to Search Console." },
      { id: "https", label: "HTTPS / SSL", description: "Website is served over a secure connection." },
      { id: "canonical", label: "Canonical Tags", description: "Every page has a self-referencing canonical tag." },
      { id: "redirects", label: "Redirects (301/302)", description: "No broken redirects or redirect chains." },
      { id: "crawl_errors", label: "Crawl Errors (404s)", description: "No critical 404 errors in Search Console." },
      { id: "indexing", label: "Indexing Status", description: "Main pages are indexed; noindex used correctly on admin/private pages." },
    ]
  },
  {
    id: "onpage",
    label: "On-Page SEO",
    icon: Search,
    items: [
      { id: "h1", label: "H1 Tags", description: "Each page has exactly one H1 tag with target keyword." },
      { id: "titles", label: "Title Tags", description: "Unique and descriptive titles within 50-60 chars." },
      { id: "metas", label: "Meta Descriptions", description: "Unique meta descriptions within 120-160 chars." },
      { id: "images", label: "Image Alt Text", description: "All informative images have descriptive alt attributes." },
      { id: "internal_links", label: "Internal Linking", description: "Logical internal link structure with optimized anchor text." },
      { id: "content_quality", label: "Content Quality", description: "No thin or duplicate content across main pages." },
    ]
  },
  {
    id: "speed",
    label: "Performance & UX",
    icon: Zap,
    items: [
      { id: "lcp", label: "Largest Contentful Paint (LCP)", description: "Main content loads in under 2.5 seconds." },
      { id: "cls", label: "Cumulative Layout Shift (CLS)", description: "Visual stability maintained (score < 0.1)." },
      { id: "mobile_friendly", label: "Mobile Usability", description: "Website passes Google Mobile-Friendly test." },
      { id: "caching", label: "Browser Caching", description: "Static assets have long-term cache headers." },
      { id: "compression", label: "GSC / Brotli", description: "Assets are compressed to reduce file size." },
    ]
  },
  {
    id: "local",
    label: "Local & Schema",
    icon: MapPin,
    items: [
      { id: "gbp", label: "Google Business Profile", description: "GBP is claimed, verified, and fully optimized." },
      { id: "nap", label: "NAP Consistency", description: "Name, Address, Phone consistent across all directories." },
      { id: "schema_local", label: "LocalBusiness Schema", description: "Correct LocalBusiness JSON-LD markup implemented." },
      { id: "schema_org", label: "Organization Schema", description: "Organization and Website schema added to homepage." },
    ]
  }
];

type ItemStatus = "fixed" | "pending" | "issue" | "not_applicable";

export default function AuditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [results, setResults] = useState<Record<string, ItemStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/clients/${id}`).then(r => r.json()),
      fetch(`/api/audit?clientId=${id}`).then(r => r.json()),
    ]).then(([c, a]) => {
      setClient(c);
      if (a && a.checks) setResults(a.checks);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const updateStatus = async (itemId: string, status: ItemStatus) => {
    const newResults = { ...results, [itemId]: status };
    setResults(newResults);
    
    // Auto-save logic
    setSaving(true);
    try {
      await fetch("/api/audit", {
        method: "POST",
        body: JSON.stringify({ clientId: id, checks: newResults }),
      });
    } catch (e) {
      console.error("Save failed", e);
    }
    setSaving(false);
  };

  const getStats = () => {
    const total = AUDIT_SCHEMA.reduce((acc, cat) => acc + cat.items.length, 0);
    const fixed = Object.values(results).filter(s => s === "fixed").length;
    const issues = Object.values(results).filter(s => s === "issue").length;
    const pending = Object.values(results).filter(s => s === "pending").length;
    const score = total > 0 ? Math.round((fixed / total) * 100) : 0;
    return { total, fixed, issues, pending, score };
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading audit checklist...</div>;

  const stats = getStats();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm transition-colors">
          <ArrowLeft size={16} /> Back to Client
        </button>
        <div className="flex items-center gap-3">
          {saving && <span className="flex items-center gap-1.5 text-xs text-slate-400"><Loader2 size={12} className="animate-spin" /> Saving changes...</span>}
          {!saving && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><Save size={12} /> All changes saved</span>}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-8">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">SEO AUDIT DASHBOARD</p>
              <h1 className="text-3xl font-black">{client?.name}</h1>
              <p className="text-slate-400 text-sm mt-1">{client?.website}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[44px] font-black leading-none">{stats.score}%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Optimization Score</p>
              </div>
              <div className="h-12 w-px bg-slate-800" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-xs font-bold">{stats.fixed} Fixed</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-xs font-bold">{stats.issues} Issues</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-xs font-bold">{stats.pending} Pending</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-500" /><span className="text-xs font-bold">{stats.total - (stats.fixed + stats.issues + stats.pending)} Open</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-10">
          {AUDIT_SCHEMA.map(category => (
            <div key={category.id}>
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <category.icon size={20} />
                </div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{category.label}</h2>
              </div>

              <div className="grid gap-4">
                {category.items.map(item => {
                  const status = results[item.id] || "open";
                  return (
                    <div key={item.id} className={`group border rounded-2xl p-4 transition-all duration-300 ${
                      status === "fixed" ? "bg-emerald-50/30 border-emerald-100" : 
                      status === "issue" ? "bg-red-50/30 border-red-100" :
                      status === "pending" ? "bg-amber-50/30 border-amber-100" : "bg-white border-slate-100 hover:border-slate-200"
                    }`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-800 text-sm">{item.label}</h3>
                            <div className="relative group/info">
                              <Info size={12} className="text-slate-300 cursor-help" />
                              <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-20">
                                {item.description}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                        </div>
                        
                        <div className="flex bg-white/50 p-1 rounded-xl border border-slate-100 shrink-0">
                          {[
                            { id: "fixed", icon: CheckCircle2, label: "Fixed", color: "text-emerald-600 bg-emerald-50" },
                            { id: "issue", icon: XCircle, label: "Issue", color: "text-red-600 bg-red-50" },
                            { id: "pending", icon: AlertCircle, label: "Pending", color: "text-amber-600 bg-amber-50" },
                          ].map(s => (
                            <button
                              key={s.id}
                              onClick={() => updateStatus(item.id, s.id as ItemStatus)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                status === s.id ? s.color : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <s.icon size={12} />
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
