"use client";
import { useState } from "react";
import { 
  MapPin, Sparkles, Copy, Check, 
  Loader2, MessageSquare, Megaphone,
  ShoppingBag, Calendar
} from "lucide-react";

export default function GMBToolPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState("");
  const [copied, setCopied] = useState(false);
  const [type, setType] = useState("Update");

  const generate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/gmb-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, type }),
      });
      const data = await res.json();
      setPost(data.post || "");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyPost = () => {
    navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <MapPin size={32} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">GMB Post Optimizer</h1>
        <p className="text-slate-500 text-sm mt-1">Create high-converting Google Business Profile posts in seconds</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Post Type</label>
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                {["Update", "Offer", "Event"].map(t => (
                  <button 
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${type === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {t === "Update" && <Megaphone size={12} className="inline mr-1" />}
                    {t === "Offer" && <ShoppingBag size={12} className="inline mr-1" />}
                    {t === "Event" && <Calendar size={12} className="inline mr-1" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">What is the post about?</label>
            <textarea 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. We just launched a new solar panel cleaning service in Lahore with 20% off for first 10 customers..."
              className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
            />
          </div>

          <button 
            onClick={generate}
            disabled={loading || !topic}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-blue-100"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? "AI is writing..." : "Generate Optimized Post"}
          </button>
        </div>

        {post && (
          <div className="animate-slide-up bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-400" />
                AI Generated Content
              </h3>
              <button 
                onClick={copyPost}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy Post"}
              </button>
            </div>
            
            <div className="bg-black/30 rounded-2xl p-6 border border-white/5 whitespace-pre-wrap leading-relaxed text-sm text-blue-100">
              {post}
            </div>

            <div className="mt-6 flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1"><Check size={12} className="text-emerald-400" /> Keyword Optimized</span>
              <span className="flex items-center gap-1"><Check size={12} className="text-emerald-400" /> Local Intent Included</span>
              <span className="flex items-center gap-1"><Check size={12} className="text-emerald-400" /> Call-to-Action Added</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
