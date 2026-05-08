"use client";
import { useState } from "react";
import { 
  Sparkles, FileText, Layout, List, 
  Search, Copy, Check, Loader2, ArrowRight
} from "lucide-react";

export default function ContentBriefPage() {
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateBrief = async () => {
    if (!topic || !keyword) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/content-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, keyword }),
      });
      const data = await res.json();
      setBrief(data.brief);
    } finally {
      setLoading(false);
    }
  };

  const copyBrief = () => {
    navigator.clipboard.writeText(JSON.stringify(brief, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 font-outfit">AI Content Briefs</h1>
        <p className="text-slate-500 text-sm mt-1">Generate SEO-optimized outlines for your content writers.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <Sparkles size={16} className="text-violet-600" /> Input Parameters
            </h2>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Topic / Title</label>
              <input 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Best SEO Strategies for 2026"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Target Keyword</label>
              <input 
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="e.g. seo strategies"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>
            <button 
              onClick={generateBrief}
              disabled={loading || !topic || !keyword}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-violet-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? "Generating..." : "Generate Brief"}
            </button>
          </div>

          <div className="bg-violet-50 rounded-3xl p-6 border border-violet-100">
             <h3 className="text-violet-800 font-bold text-sm mb-2">Pro Tip</h3>
             <p className="text-xs text-violet-600 leading-relaxed">
               A good brief helps writers stay focused on search intent. Share this with your team to ensure consistency.
             </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!brief && !loading ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 h-[400px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <FileText size={32} className="text-slate-200" />
              </div>
              <h3 className="text-slate-400 font-bold">No Brief Generated Yet</h3>
              <p className="text-slate-300 text-xs mt-1">Fill in the parameters and let AI do the work.</p>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-8 h-[400px] flex flex-col items-center justify-center space-y-4">
               <div className="relative">
                  <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
                  <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-600" />
               </div>
               <p className="text-slate-400 font-medium animate-pulse">AI is crafting your SEO strategy...</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-slide-up">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-800">{brief.title}</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5 tracking-wide uppercase">Primary Keyword: {keyword}</p>
                </div>
                <button onClick={copyBrief} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <div className="p-8 space-y-8">
                <section>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Search size={14} className="text-violet-500" /> Search Intent & Audience
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                    {brief.intent}
                  </p>
                </section>

                <section>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layout size={14} className="text-blue-500" /> Recommended Outline
                  </h4>
                  <div className="space-y-3">
                    {brief.outline.map((h: any, i: number) => (
                      <div key={i} className="flex gap-4">
                        <span className="text-[10px] font-black text-slate-300 mt-1">{h.tag}</span>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{h.text}</p>
                          {h.notes && <p className="text-xs text-slate-400 mt-1">{h.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <List size={14} className="text-emerald-500" /> LSI & Semantic Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {brief.lsi.map((k: string) => (
                      <span key={k} className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-100">
                        {k}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
