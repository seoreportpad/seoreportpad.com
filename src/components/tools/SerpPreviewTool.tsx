"use client";
import { useState } from "react";
import { Monitor, Smartphone, Copy, Check } from "lucide-react";

export function SerpPreviewTool() {
  const [form, setForm] = useState({
    title: "", url: "", description: "", date: "", sitelinks: ["", ""], breadcrumb: "",
  });
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  const displayUrl = form.breadcrumb || form.url || "https://example.com › page";
  const titleLimit = 60;
  const descLimit = 160;

  const truncate = (str: string, len: number) => str.length > len ? str.slice(0, len - 1) + "…" : str;
  const titleDisplay = truncate(form.title || "Page Title — Your Website", titleLimit);
  const descDisplay = truncate(form.description || "This is the meta description that appears in Google search results. Write something compelling that makes users want to click.", descLimit);

  const generateTags = () => `<title>${form.title}</title>
<meta name="description" content="${form.description}" />`;

  const copy = () => {
    navigator.clipboard.writeText(generateTags());
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
            <label className={lbl}>Title Tag *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Best SEO Tools 2025 — Free & Paid" className={inp} maxLength={70} />
            <p className={`text-xs mt-1 ${form.title.length > 60 ? "text-red-500" : "text-slate-400"}`}>
              {form.title.length}/{titleLimit} chars {form.title.length > 60 ? "⚠ may truncate" : ""}
            </p>
          </div>
          <div>
            <label className={lbl}>Page URL</label>
            <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com/seo-tools" className={inp} />
          </div>
          <div>
            <label className={lbl}>Breadcrumb (overrides URL display)</label>
            <input value={form.breadcrumb} onChange={e => setForm({ ...form, breadcrumb: e.target.value })}
              placeholder="example.com › blog › seo-tools" className={inp} />
          </div>
          <div>
            <label className={lbl}>Meta Description *</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              placeholder="Discover the best free and paid SEO tools to boost your rankings. Includes keyword research, backlink analysis, and more." maxLength={200}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <p className={`text-xs mt-1 ${form.description.length > 155 ? "text-amber-500" : "text-slate-400"}`}>
              {form.description.length}/{descLimit} chars {form.description.length > 155 ? "⚠ near limit" : ""}
            </p>
          </div>
          <div>
            <label className={lbl}>Date (optional, e.g. "May 10, 2025")</label>
            <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              placeholder="May 10, 2025" className={inp} />
          </div>
          <div>
            <label className={lbl}>Sitelinks (optional, 2 links)</label>
            <div className="flex gap-2">
              <input value={form.sitelinks[0]} onChange={e => setForm({ ...form, sitelinks: [e.target.value, form.sitelinks[1]] })}
                placeholder="Pricing" className={inp} />
              <input value={form.sitelinks[1]} onChange={e => setForm({ ...form, sitelinks: [form.sitelinks[0], e.target.value] })}
                placeholder="Features" className={inp} />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setDevice("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${device === "desktop" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              <Monitor size={13} /> Desktop
            </button>
            <button onClick={() => setDevice("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${device === "mobile" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              <Smartphone size={13} /> Mobile
            </button>
          </div>

          {device === "desktop" ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm font-sans">
              {/* Google-style preview */}
              <div className="max-w-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center font-bold">G</div>
                  <div>
                    <p className="text-xs text-slate-700 font-medium leading-none">{form.url ? new URL(form.url.startsWith("http") ? form.url : "https://" + form.url).hostname : "example.com"}</p>
                    <p className="text-xs text-slate-500 leading-none">{displayUrl}</p>
                  </div>
                </div>
                <a href="#" className="text-xl text-blue-700 hover:underline font-normal leading-tight block mt-1">
                  {titleDisplay}
                </a>
                <p className="text-sm text-slate-700 mt-1 leading-snug">
                  {form.date && <span className="text-slate-500">{form.date} — </span>}
                  {descDisplay}
                </p>
                {(form.sitelinks[0] || form.sitelinks[1]) && (
                  <div className="flex gap-3 mt-2">
                    {form.sitelinks.filter(Boolean).map((s, i) => (
                      <a key={i} href="#" className="text-sm text-blue-700 hover:underline border border-slate-200 rounded-lg px-2 py-1">{s}</a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm font-sans max-w-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ fontSize: 8 }}>G</div>
                <p className="text-xs text-slate-500">{form.url ? new URL(form.url.startsWith("http") ? form.url : "https://" + form.url).hostname : "example.com"}</p>
              </div>
              <a href="#" className="text-base text-blue-700 hover:underline font-normal leading-snug block">
                {titleDisplay}
              </a>
              <p className="text-xs text-slate-600 mt-1 leading-snug">
                {form.date && <span className="text-slate-400">{form.date} — </span>}
                {truncate(form.description || "This is the meta description...", 120)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generated tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-slate-700">Generated Tags</label>
          <button onClick={copy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${copied ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
        <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">{generateTags()}</pre>
      </div>
    </div>
  );
}
