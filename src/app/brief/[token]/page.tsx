"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import { Globe, FileText, CheckCircle2, Type, List, Link as LinkIcon, Info, Loader2 } from "lucide-react";

interface PublicBrief {
  title: string;
  primary_keyword: string;
  secondary_keywords: string;
  word_count: string;
  tone: string;
  outline: string;
  competitor_links: string;
  internal_links: string;
  instructions: string;
  nlp_terms: string;
  semantic_entities: string;
  status: string;
  clients: { name: string; website?: string };
  agency: { agency_name: string; logo_url?: string; primary_color?: string } | null;
}

export default function PublicBriefPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<PublicBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/briefs/public?token=${token}`)
      .then(r => r.ok ? r.json() : Promise.reject("Not found"))
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Brief not found or expired");
        setLoading(false);
      });
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
        <Info size={24} />
      </div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">Unavailable</h1>
      <p className="text-slate-500 max-w-sm">{error || "This content brief is not available."}</p>
    </div>
  );

  const StatusBadge = () => {
    const s = data.status;
    if (s === "completed") return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Completed</span>;
    if (s === "in-progress") return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">In Progress</span>;
    if (s === "ready") return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Ready to Write</span>;
    return <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Draft</span>;
  };

  const color = data.agency?.primary_color || "#3b82f6";

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 print:relative print:border-none">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.agency?.logo_url ? (
              <img src={data.agency.logo_url} alt={data.agency.agency_name} className="h-8 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black" style={{ background: color }}>
                {data.agency?.agency_name?.slice(0, 2).toUpperCase() || "SR"}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400">{data.agency?.agency_name || "Content Team"}</p>
              <p className="text-sm font-bold text-slate-700">{data.clients.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge />
            <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all print:hidden shadow-sm">
              <FileText size={14} /> Print Brief
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-10 space-y-8">
        
        {/* Title & Core Meta */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full" style={{ background: color }} />
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-6 leading-tight">
            {data.title}
          </h1>
          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <Type size={16} className="text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Word Count</p>
                <p className="text-sm font-bold text-slate-700">{data.word_count}</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Primary Keyword</p>
                <p className="text-sm font-bold text-slate-700">{data.primary_keyword}</p>
              </div>
            </div>
            {data.clients.website && (
              <a href={data.clients.website} target="_blank" rel="noreferrer" className="bg-slate-50 hover:bg-blue-50 hover:border-blue-100 border border-slate-100 px-4 py-2.5 rounded-2xl flex items-center gap-3 transition-colors group">
                <Globe size={16} className="text-blue-500 group-hover:text-blue-600" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Client Website</p>
                  <p className="text-sm font-bold text-blue-700">View Website</p>
                </div>
              </a>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Content Specs */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4">
                <List className="text-emerald-500" /> Article Outline & Structure
              </h2>
              <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap font-medium text-slate-600">
                {data.outline}
              </div>
            </div>

            {data.instructions && (
              <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
                <h2 className="text-lg font-black text-amber-800 flex items-center gap-2 mb-4">
                  <Info className="text-amber-500" /> Writer Instructions
                </h2>
                <p className="text-amber-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {data.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Specs */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
               <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">Tone of Voice</h3>
               <p className="text-sm font-bold text-slate-700">{data.tone}</p>
            </div>

            {data.secondary_keywords && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                  LSI / Secondary Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.secondary_keywords.split(",").map(k => k.trim()).filter(Boolean).map((k, i) => (
                    <span key={i} className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(data.nlp_terms || data.semantic_entities) && (
              <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100 shadow-sm">
                <h3 className="text-xs font-black uppercase text-indigo-500 tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 size={12} /> Semantic SEO
                </h3>
                
                {data.nlp_terms && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase font-bold text-indigo-400 mb-2">NLP Terms to Include</p>
                    <div className="flex flex-wrap gap-2">
                      {data.nlp_terms.split(",").map(k => k.trim()).filter(Boolean).map((k, i) => (
                        <span key={i} className="bg-white text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {data.semantic_entities && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-indigo-400 mb-2">Entities (Places/Concepts)</p>
                    <div className="flex flex-wrap gap-2">
                      {data.semantic_entities.split(",").map(k => k.trim()).filter(Boolean).map((k, i) => (
                        <span key={i} className="bg-white text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(data.competitor_links || data.internal_links) && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <LinkIcon size={12} /> Reference Links
                </h3>
                
                {data.competitor_links && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Review Competitors</p>
                    <div className="space-y-2">
                      {data.competitor_links.split("\n").filter(Boolean).map((link, i) => (
                        <a key={i} href={link.trim()} target="_blank" rel="noreferrer" className="block text-xs text-blue-600 hover:underline truncate">
                          {link.trim()}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {data.internal_links && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Include These Links</p>
                    <div className="space-y-2">
                      {data.internal_links.split("\n").filter(Boolean).map((link, i) => (
                        <a key={i} href={link.trim()} target="_blank" rel="noreferrer" className="block text-xs text-emerald-600 hover:underline truncate">
                          {link.trim()}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
