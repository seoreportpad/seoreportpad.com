"use client";
import { useState } from "react";
import { 
  Target, Sparkles, Loader2, Globe, 
  ArrowRight, ShieldAlert, CheckCircle2,
  Trophy, AlertTriangle, Lightbulb
} from "lucide-react";

interface GapResult {
  keyword: string;
  competitorPos: string;
  clientPos: string;
  difficulty: "Easy" | "Medium" | "Hard";
  opportunity: string;
}

export default function GapAnalysisPage() {
  const [clientUrl, setClientUrl] = useState("");
  const [compUrl, setCompUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GapResult[]>([]);

  const runAnalysis = async () => {
    if (!clientUrl || !compUrl) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientUrl, compUrl }),
      });
      const data = await res.json();
      setResults(data.gaps || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">Competitor Gap Analysis</h1>
        <p className="text-slate-500 text-sm mt-1">Discover high-value keywords your competitors are ranking for, but you aren't.</p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Input */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Your Website</label>
              <div className="relative">
                <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                <input 
                  value={clientUrl}
                  onChange={e => setClientUrl(e.target.value)}
                  placeholder="e.g. mysite.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-slate-100 rounded-full items-center justify-center shadow-sm">
              <span className="text-[10px] font-black text-slate-400">VS</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Competitor Website</label>
              <div className="relative">
                <Target size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" />
                <input 
                  value={compUrl}
                  onChange={e => setCompUrl(e.target.value)}
                  placeholder="e.g. competitor.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={runAnalysis}
            disabled={loading || !clientUrl || !compUrl}
            className="w-full mt-8 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-blue-400" />}
            {loading ? "Analyzing Search Data..." : "Run AI Gap Analysis"}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Easy Wins</p>
                <p className="text-xl font-black text-emerald-800">{results.filter(r => r.difficulty === "Easy").length} Keywords</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">High Impact</p>
                <p className="text-xl font-black text-blue-800">{results.length} Total Gaps</p>
              </div>
              <div className="bg-violet-50 border border-violet-100 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-1">AI Opportunity</p>
                <p className="text-xl font-black text-violet-800">Ready to Rank</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keyword</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Competitor</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Difficulty</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opportunity / Strategy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {results.map((res, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-800">{res.keyword}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-black">POS {res.competitorPos}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                            res.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" : 
                            res.difficulty === "Medium" ? "bg-blue-100 text-blue-700" : 
                            "bg-red-100 text-red-700"
                          }`}>
                            {res.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-2">
                            <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{res.opportunity}</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="bg-blue-600 rounded-3xl p-10 text-white relative overflow-hidden text-center">
            <Trophy className="mx-auto mb-6 opacity-20" size={60} />
            <h2 className="text-2xl font-black mb-4">Outrank Your Competitors</h2>
            <p className="text-blue-100 text-sm max-w-md mx-auto leading-relaxed mb-8">
              Our AI analyzes semantic clusters and search intent to find where your competitors are vulnerable. 
              Start by entering two domains above.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-bold">
              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10">Find Hidden Keywords</div>
              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10">Analyze Content Gaps</div>
              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10">Boost Authority</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
