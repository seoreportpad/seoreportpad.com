"use client";
import { useState, useEffect } from "react";
import { Network, Search, Loader2, Save, ExternalLink, Users, CheckCircle } from "lucide-react";

interface SemanticMap {
  pillar: string;
  searchIntent: string;
  audience: string;
  clusters: {
    topic: string;
    longTailKeywords: string[];
    suggestedTitle: string;
  }[];
}

export default function SemanticMapPage() {
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [map, setMap] = useState<SemanticMap | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients).catch(() => {});
  }, []);

  const generateMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed.trim()) return;
    
    setLoading(true);
    setError("");
    setMap(null);
    setSaved(false);

    try {
      const res = await fetch("/api/ai/semantic-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seedKeyword: seed }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate map");
      
      setMap(data.map);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveToNotes = async () => {
    if (!map || !selectedClientId) return;
    setSaving(true);
    try {
      const content = `
# Semantic Strategy: ${map.pillar}
**Search Intent:** ${map.searchIntent}
**Target Audience:** ${map.audience}

## Content Clusters
${map.clusters.map((c, i) => `
### ${i + 1}. ${c.suggestedTitle}
- **Topic:** ${c.topic}
- **Keywords:** ${c.longTailKeywords.join(", ")}
`).join("\n")}
      `;

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: selectedClientId,
          title: `Semantic Strategy: ${map.pillar}`,
          content: content.trim()
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Network className="text-indigo-600" /> AI Semantic Topical Map
          </h1>
          <p className="text-slate-500 mt-1">Generate comprehensive SEO content architectures for any niche or seed keyword.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <form onSubmit={generateMap} className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Enter seed keyword (e.g. 'local seo for dentists')"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !seed.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : "Generate Map"}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        </form>
      </div>

      {loading && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Network size={32} className="text-indigo-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Building Semantic Architecture</h3>
          <p className="text-slate-500 max-w-md mx-auto">Analyzing intent, mapping clusters, and extracting long-tail entities. This takes about 10-15 seconds.</p>
        </div>
      )}

      {map && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xl text-slate-900">Map Result</h3>
            <div className="flex items-center gap-3">
              <div className="relative w-48">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={selectedClientId} 
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                >
                  <option value="">Select Client to Save</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={saveToNotes}
                disabled={!selectedClientId || saving || saved}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  saved ? "bg-green-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                }`}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
                {saved ? "Saved to Strategy" : "Save to Strategy"}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
            <Network className="absolute -right-10 -bottom-10 text-indigo-500/20 w-64 h-64" />
            <div className="relative z-10">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-500/30 mb-4 inline-block">
                Pillar Architecture
              </span>
              <h2 className="text-3xl font-black mb-6">{map.pillar}</h2>
              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Search Intent</p>
                  <p className="font-medium text-white">{map.searchIntent}</p>
                </div>
                <div>
                  <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Target Audience</p>
                  <p className="font-medium text-white">{map.audience}</p>
                </div>
              </div>
            </div>
          </div>

          <h3 className="font-black text-xl text-slate-900 mt-10 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              {map.clusters.length}
            </div>
            Content Clusters
          </h3>

          <div className="grid md:grid-cols-2 gap-5">
            {map.clusters.map((cluster, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black text-lg mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  {i + 1}
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-2">{cluster.suggestedTitle}</h4>
                <p className="text-sm text-slate-500 font-medium mb-4">Topic: {cluster.topic}</p>
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Long-Tail Targets</p>
                  <div className="flex flex-wrap gap-2">
                    {cluster.longTailKeywords.map((kw, j) => (
                      <span key={j} className="text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
