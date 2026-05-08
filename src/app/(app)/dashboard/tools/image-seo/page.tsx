"use client";
import { useState } from "react";
import { 
  Image as ImageIcon, Sparkles, Copy, 
  Check, Loader2, Globe, ListChecks,
  AlertCircle, Info
} from "lucide-react";

interface ImageResult {
  url: string;
  suggestedAlt: string;
  context?: string;
}

export default function ImageSEOPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImageResult[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const analyze = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/image-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setResults(data.images || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyAlt = (alt: string) => {
    navigator.clipboard.writeText(alt);
    setCopied(alt);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">AI Image Alt Text Generator</h1>
        <p className="text-slate-500 text-sm mt-1">Boost Accessibility and SEO with AI-powered Alt Text suggestions</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Input */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Analyze Website Page</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/services"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <button 
              onClick={analyze}
              disabled={loading || !url}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? "Analyzing..." : "Generate Alt Texts"}
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
            <AlertCircle size={14} />
            <p className="text-[10px] font-medium">This will fetch all images from the page and suggest SEO-optimized Alt tags.</p>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <ListChecks size={18} className="text-blue-600" />
                Found {results.length} Images
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((img, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    <img src={img.url} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2">
                      <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 shadow-sm">Img #{idx + 1}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Suggested Alt Text</label>
                    <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 relative">
                      <p className="text-sm text-slate-700 font-medium leading-relaxed pr-8">
                        {img.suggestedAlt}
                      </p>
                      <button 
                        onClick={() => copyAlt(img.suggestedAlt)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {copied === img.suggestedAlt ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={32} className="text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700">Ready to Optimize?</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">Enter a URL to analyze images and generate AI Alt descriptions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
