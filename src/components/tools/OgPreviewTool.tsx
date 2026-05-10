"use client";
import { useState } from "react";
import { Globe, Share2, MessageSquare, Copy, Check } from "lucide-react";

export function OgPreviewTool() {
  const [form, setForm] = useState({
    title: "", description: "", imageUrl: "", siteName: "", url: "", twitterCard: "summary_large_image" as "summary"|"summary_large_image",
  });
  const [tab, setTab] = useState<"fb"|"tw">("fb");
  const [copied, setCopied] = useState(false);

  const ogTags = `<!-- Open Graph -->
<meta property="og:title" content="${form.title}" />
<meta property="og:description" content="${form.description}" />
<meta property="og:image" content="${form.imageUrl}" />
<meta property="og:url" content="${form.url}" />
<meta property="og:site_name" content="${form.siteName}" />
<meta property="og:type" content="website" />

<!-- Twitter Card -->
<meta name="twitter:card" content="${form.twitterCard}" />
<meta name="twitter:title" content="${form.title}" />
<meta name="twitter:description" content="${form.description}" />
<meta name="twitter:image" content="${form.imageUrl}" />`;

  const copyTags = () => {
    navigator.clipboard.writeText(ogTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inp = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const lbl = "text-xs font-semibold text-slate-600 block mb-1.5";

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-5">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className={lbl}>Page Title *</label>
            <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="My Awesome Page Title"
              className={inp} maxLength={60}/>
            <p className={`text-xs mt-1 ${form.title.length>60?"text-red-500":"text-slate-400"}`}>{form.title.length}/60</p>
          </div>
          <div>
            <label className={lbl}>Description *</label>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3}
              placeholder="A compelling description that appears in social shares..." maxLength={160}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
            <p className={`text-xs mt-1 ${form.description.length>155?"text-amber-500":"text-slate-400"}`}>{form.description.length}/160</p>
          </div>
          <div>
            <label className={lbl}>Image URL</label>
            <input value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} placeholder="https://example.com/og-image.jpg"
              className={inp}/>
            <p className="text-xs text-slate-400 mt-1">Recommended: 1200×630px</p>
          </div>
          <div>
            <label className={lbl}>Page URL</label>
            <input value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://example.com/page"
              className={inp}/>
          </div>
          <div>
            <label className={lbl}>Site Name</label>
            <input value={form.siteName} onChange={e=>setForm({...form,siteName:e.target.value})} placeholder="My Website"
              className={inp}/>
          </div>
          <div>
            <label className={lbl}>Twitter Card Type</label>
            <select value={form.twitterCard} onChange={e=>setForm({...form,twitterCard:e.target.value as "summary"|"summary_large_image"})}
              className={inp}>
              <option value="summary_large_image">Summary with Large Image</option>
              <option value="summary">Summary (small image)</option>
            </select>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="flex gap-2 mb-3">
            <button onClick={()=>setTab("fb")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab==="fb"?"bg-blue-600 text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              <Share2 size={13}/> Facebook
            </button>
            <button onClick={()=>setTab("tw")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab==="tw"?"bg-slate-800 text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              <MessageSquare size={13}/> Twitter
            </button>
          </div>

          {tab === "fb" ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="w-full h-40 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="OG" className="w-full h-full object-cover" onError={e=>(e.currentTarget.style.display="none")}/>
                ) : (
                  <Globe size={40} className="text-slate-400"/>
                )}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-200">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{form.siteName || "WEBSITE.COM"}</p>
                <p className="text-sm font-bold text-slate-900 line-clamp-2">{form.title || "Page Title"}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{form.description || "Page description..."}</p>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              {form.twitterCard === "summary_large_image" ? (
                <>
                  <div className="w-full h-44 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt="TW" className="w-full h-full object-cover" onError={e=>(e.currentTarget.style.display="none")}/>
                    ) : (
                      <MessageSquare size={40} className="text-slate-400"/>
                    )}
                  </div>
                  <div className="p-3 border-t border-slate-200">
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{form.title || "Page Title"}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{form.description || "Description..."}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Globe size={11}/>{form.url || "example.com"}</p>
                  </div>
                </>
              ) : (
                <div className="p-3 flex gap-3">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl shrink-0 flex items-center justify-center overflow-hidden">
                    {form.imageUrl ? <img src={form.imageUrl} alt="TW" className="w-full h-full object-cover" onError={e=>(e.currentTarget.style.display="none")}/> : <MessageSquare size={24} className="text-slate-400"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{form.title || "Page Title"}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{form.description || "Description..."}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Globe size={11}/>{form.url || "example.com"}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Generated tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-slate-700">Generated Meta Tags</label>
          <button onClick={copyTags} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${copied?"bg-green-100 text-green-700":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {copied?<><Check size={13}/> Copied!</>:<><Copy size={13}/> Copy All</>}
          </button>
        </div>
        <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">{ogTags}</pre>
      </div>
    </div>
  );
}
