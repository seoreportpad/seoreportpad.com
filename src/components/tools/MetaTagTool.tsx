"use client";
import { useState } from "react";
import { CodeBox } from "./ToolHelpers";

export function MetaTagTool() {
  const [f, setF] = useState({ title: "", desc: "", url: "", type: "website", image: "", siteName: "" });
  const titleLen = f.title.length;
  const descLen = f.desc.length;
  const titleOk = titleLen >= 30 && titleLen <= 60;
  const descOk = descLen >= 120 && descLen <= 160;

  const tags = `<!-- Primary Meta Tags -->
<title>${f.title}</title>
<meta name="title" content="${f.title}" />
<meta name="description" content="${f.desc}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="${f.type}" />
<meta property="og:url" content="${f.url}" />
<meta property="og:title" content="${f.title}" />
<meta property="og:description" content="${f.desc}" />${f.image ? `\n<meta property="og:image" content="${f.image}" />` : ""}${f.siteName ? `\n<meta property="og:site_name" content="${f.siteName}" />` : ""}

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${f.url}" />
<meta property="twitter:title" content="${f.title}" />
<meta property="twitter:description" content="${f.desc}" />${f.image ? `\n<meta property="twitter:image" content="${f.image}" />` : ""}`;

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Page Title *</label>
          <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} placeholder="Best SEO Tools for Agencies" maxLength={80}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs font-medium ${titleOk ? "text-green-600" : titleLen > 60 ? "text-red-500" : "text-amber-500"}`}>
              {titleLen}/60 chars {titleOk ? "✓ Good" : titleLen > 60 ? "Too long" : "Too short"}
            </span>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Meta Description *</label>
          <textarea value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} placeholder="Write a compelling description..." rows={3} maxLength={200}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          <span className={`text-xs font-medium ${descOk ? "text-green-600" : descLen > 160 ? "text-red-500" : "text-amber-500"}`}>
            {descLen}/160 chars {descOk ? "✓ Good" : descLen > 160 ? "Too long" : "Too short"}
          </span>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Page URL</label>
          <input value={f.url} onChange={e => setF({ ...f, url: e.target.value })} placeholder="https://yoursite.com/page"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">OG Image URL</label>
          <input value={f.image} onChange={e => setF({ ...f, image: e.target.value })} placeholder="https://yoursite.com/og.jpg"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Site Name</label>
          <input value={f.siteName} onChange={e => setF({ ...f, siteName: e.target.value })} placeholder="SEO Report Manager"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">OG Type</label>
          <select value={f.type} onChange={e => setF({ ...f, type: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {["website","article","product","profile"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {f.title && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">SERP Preview</p>
          <div className="max-w-lg">
            <p className="text-xs text-green-700 mb-0.5 truncate">{f.url || "https://yoursite.com"}</p>
            <p className="text-blue-600 text-lg font-medium leading-tight hover:underline cursor-pointer truncate">{f.title || "Page Title"}</p>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed line-clamp-2">{f.desc || "Meta description will appear here..."}</p>
          </div>
        </div>
      )}

      {f.title && <CodeBox code={tags} lang="HTML" />}
    </div>
  );
}
