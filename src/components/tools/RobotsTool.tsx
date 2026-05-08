"use client";
import { useState } from "react";
import { CodeBox } from "./ToolHelpers";

export function RobotsTool() {
  const [cms, setCms] = useState("custom");
  const [rules, setRules] = useState([{ agent: "*", disallow: "", allow: "" }]);
  const [sitemap, setSitemap] = useState("");
  const [crawlDelay, setCrawlDelay] = useState("");

  const addRule = () => setRules([...rules, { agent: "*", disallow: "", allow: "" }]);
  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));

  const CMS_TEMPLATES: Record<string, string> = {
    custom: "",
    wordpress: `User-agent: *\nDisallow: /wp-admin/\nDisallow: /wp-includes/\nDisallow: /wp-content/plugins/\nAllow: /wp-admin/admin-ajax.php\n`,
    shopify: `User-agent: *\nDisallow: /admin/\nDisallow: /cart\nDisallow: /orders\nDisallow: /checkouts\nDisallow: /account\n`,
    wix: `User-agent: *\nDisallow: /_api/\nDisallow: /_partials/\nDisallow: /stores/\n`,
    next: `User-agent: *\nDisallow: /api/\nDisallow: /_next/\nAllow: /_next/static/\n`,
  };

  const buildRobots = () => {
    if (cms !== "custom") return CMS_TEMPLATES[cms] + (sitemap ? `\nSitemap: ${sitemap}` : "");
    let txt = rules.map(r => {
      let block = `User-agent: ${r.agent || "*"}`;
      if (r.disallow) block += `\nDisallow: ${r.disallow}`;
      else block += `\nDisallow:`;
      if (r.allow) block += `\nAllow: ${r.allow}`;
      if (crawlDelay) block += `\nCrawl-delay: ${crawlDelay}`;
      return block;
    }).join("\n\n");
    if (sitemap) txt += `\n\nSitemap: ${sitemap}`;
    return txt;
  };

  const output = buildRobots();

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">CMS / Template</label>
          <select value={cms} onChange={e => setCms(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {[["custom","Custom (Manual)"],["wordpress","WordPress"],["shopify","Shopify"],["wix","Wix"],["next","Next.js"]].map(([v,l]) =>
              <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Sitemap URL (optional)</label>
          <input value={sitemap} onChange={e => setSitemap(e.target.value)} placeholder="https://yoursite.com/sitemap.xml"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {cms === "custom" && (
        <>
          {rules.map((r, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rule {i + 1}</p>
                {rules.length > 1 && (
                  <button onClick={() => removeRule(i)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">User-agent</label>
                  <input value={r.agent} onChange={e => { const n=[...rules]; n[i]={...n[i],agent:e.target.value}; setRules(n); }}
                    placeholder="*" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Disallow</label>
                  <input value={r.disallow} onChange={e => { const n=[...rules]; n[i]={...n[i],disallow:e.target.value}; setRules(n); }}
                    placeholder="/admin/" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Allow</label>
                  <input value={r.allow} onChange={e => { const n=[...rules]; n[i]={...n[i],allow:e.target.value}; setRules(n); }}
                    placeholder="/admin/public/" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-4 items-center">
            <button onClick={addRule} className="text-sm text-blue-600 font-semibold hover:underline">+ Add Rule</button>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Crawl-delay</label>
              <input value={crawlDelay} onChange={e => setCrawlDelay(e.target.value)} placeholder="10" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
            </div>
          </div>
        </>
      )}

      {output && <CodeBox code={output} lang="robots.txt" />}
    </div>
  );
}
