"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { CodeBox } from "./ToolHelpers";

export function SitemapTool() {
  const [urls, setUrls] = useState("");
  const [freq, setFreq] = useState("weekly");
  const [priority, setPriority] = useState("0.8");

  const lines = urls.split("\n").map(u => u.trim()).filter(Boolean);
  const xml = lines.length === 0 ? "" : `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lines.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>`).join("\n")}
</urlset>`;

  const download = () => {
    const blob = new Blob([xml], { type: "application/xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sitemap.xml";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Change Frequency</label>
          <select value={freq} onChange={e => setFreq(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {["always","hourly","daily","weekly","monthly","yearly","never"].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Default Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {["1.0","0.9","0.8","0.7","0.6","0.5","0.4","0.3"].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1.5">URLs (one per line)</label>
        <textarea value={urls} onChange={e => setUrls(e.target.value)} rows={6}
          placeholder={"https://yoursite.com/\nhttps://yoursite.com/about\nhttps://yoursite.com/services"}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none" />
        <p className="text-xs text-slate-400 mt-1">{lines.length} URL{lines.length !== 1 ? "s" : ""} added</p>
      </div>
      {xml && (
        <>
          <CodeBox code={xml} lang="sitemap.xml" />
          <button onClick={download}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
            <Download size={15} /> Download sitemap.xml
          </button>
        </>
      )}
    </div>
  );
}
