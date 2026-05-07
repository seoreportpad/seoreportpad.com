"use client";
import { useState } from "react";
import {
  Wrench, Tag, FileCode2, Globe, ArrowRightLeft,
  Copy, Check, Download, RefreshCw, AlertCircle,
  CheckCircle2, XCircle, ChevronRight, Link2,
  Search, BarChart3, Hash, Type, AlignLeft,
} from "lucide-react";

// ─── TOOL IDs ────────────────────────────────────────────────
type ToolId = "meta" | "title" | "robots" | "sitemap" | "redirect" | "wordcount" | "slugify" | "utm";

const TOOLS: { id: ToolId; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { id: "meta",      label: "Meta Tag Generator",    desc: "Generate SEO-ready title & meta description tags",   icon: Tag,          color: "bg-blue-500" },
  { id: "title",     label: "Title Tag Checker",     desc: "Analyze length, keyword presence & SERP preview",    icon: Type,         color: "bg-violet-500" },
  { id: "robots",    label: "Robots.txt Generator",  desc: "Build robots.txt rules for any CMS or custom site",  icon: FileCode2,    color: "bg-slate-600" },
  { id: "sitemap",   label: "Sitemap Generator",     desc: "Create a basic XML sitemap from a list of URLs",     icon: Globe,        color: "bg-green-500" },
  { id: "redirect",  label: "Redirect Checker",      desc: "Detect redirect chains, 301 vs 302 status",          icon: ArrowRightLeft,color: "bg-amber-500" },
  { id: "wordcount", label: "Word Count & Density",  desc: "Count words, check keyword density in content",      icon: AlignLeft,    color: "bg-pink-500" },
  { id: "slugify",   label: "URL Slug Generator",    desc: "Convert any text to an SEO-friendly URL slug",       icon: Link2,        color: "bg-teal-500" },
  { id: "utm",       label: "UTM Builder",           desc: "Build UTM-tagged URLs for campaign tracking",        icon: BarChart3,    color: "bg-orange-500" },
];

// ─── COPY HOOK ────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

function CopyBtn({ text, small }: { text: string; small?: boolean }) {
  const { copied, copy } = useCopy();
  return (
    <button onClick={() => copy(text)}
      className={`flex items-center gap-1.5 font-semibold transition-colors ${small ? "text-xs text-slate-400 hover:text-slate-700" : "text-sm text-blue-600 hover:text-blue-800"}`}>
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBox({ code, lang = "" }: { code: string; lang?: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="relative bg-slate-900 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">{lang}</span>
        <button onClick={() => copy(code)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm text-green-300 font-mono whitespace-pre-wrap break-all overflow-x-auto max-h-72">{code}</pre>
    </div>
  );
}

// ─── META TAG GENERATOR ───────────────────────────────────────
function MetaTagTool() {
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

      {/* SERP Preview */}
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

// ─── TITLE TAG CHECKER ────────────────────────────────────────
function TitleCheckerTool() {
  const [title, setTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const len = title.length;
  const checks = [
    { label: "Length 30–60 chars", ok: len >= 30 && len <= 60 },
    { label: "Contains keyword", ok: keyword ? title.toLowerCase().includes(keyword.toLowerCase()) : null },
    { label: "Keyword near start (first 30 chars)", ok: keyword ? title.toLowerCase().slice(0, 30).includes(keyword.toLowerCase()) : null },
    { label: "No ALL CAPS words", ok: !(/\b[A-Z]{4,}\b/.test(title)) },
    { label: "Ends without punctuation", ok: !/[.!?]$/.test(title.trim()) },
    { label: "No duplicate words", ok: (() => { const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 3); return words.length === new Set(words).size; })() },
  ];
  const score = Math.round((checks.filter(c => c.ok === true).length / checks.filter(c => c.ok !== null).length) * 100) || 0;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Title Tag</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Your Page Title Here" maxLength={100}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className={`text-xs font-medium mt-1 block ${len >= 30 && len <= 60 ? "text-green-600" : "text-amber-500"}`}>{len} characters</span>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Target Keyword (optional)</label>
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="seo tools"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {title && (
        <>
          {/* Score */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className={`text-3xl font-black ${score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-500" : "text-red-500"}`}>{score}%</div>
            <div>
              <p className="font-semibold text-slate-700">Title Score</p>
              <p className="text-sm text-slate-500">{score >= 80 ? "Excellent! Great title tag." : score >= 60 ? "Good, a few improvements possible." : "Needs improvement."}</p>
            </div>
            {/* Progress bar */}
            <div className="flex-1 bg-slate-200 rounded-full h-2.5 ml-4">
              <div className={`h-2.5 rounded-full ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${score}%` }} />
            </div>
          </div>

          {/* Checks */}
          <div className="space-y-2">
            {checks.map((c, i) => c.ok !== null && (
              <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${c.ok ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
                {c.ok ? <CheckCircle2 size={15} className="text-green-500 shrink-0" /> : <XCircle size={15} className="text-red-400 shrink-0" />}
                <span className={`text-sm font-medium ${c.ok ? "text-green-800" : "text-red-700"}`}>{c.label}</span>
              </div>
            ))}
          </div>

          {/* SERP preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Google SERP Preview</p>
            <p className="text-xs text-green-700 mb-0.5">yoursite.com › page</p>
            <p className="text-blue-600 text-lg font-medium hover:underline cursor-pointer" style={{ maxWidth: "600px" }}>
              {title.length > 60 ? <><span>{title.slice(0, 57)}</span><span className="text-red-400">…{title.slice(57)}</span></> : title}
            </p>
            <p className="text-xs text-slate-500 mt-1">{len > 60 ? "⚠ Title will be truncated in search results" : "✓ Full title visible in search results"}</p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ROBOTS.TXT GENERATOR ─────────────────────────────────────
function RobotsTool() {
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
          <div className="flex gap-3">
            <button onClick={addRule} className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline">+ Add Rule</button>
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

// ─── SITEMAP GENERATOR ────────────────────────────────────────
function SitemapTool() {
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

// ─── WORD COUNT & KEYWORD DENSITY ─────────────────────────────
function WordCountTool() {
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");

  const words = text.trim() ? text.trim().split(/\s+/) : [];
  const chars = text.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const readTime = Math.max(1, Math.round(words.length / 200));

  const kwCount = keyword ? (text.toLowerCase().match(new RegExp(`\\b${keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")) ?? []).length : 0;
  const kwDensity = words.length > 0 && keyword ? ((kwCount / words.length) * 100).toFixed(2) : "0";

  // Top 10 words
  const freq: Record<string, number> = {};
  words.forEach(w => { const clean = w.toLowerCase().replace(/[^a-z]/g, ""); if (clean.length > 3) freq[clean] = (freq[clean] ?? 0) + 1; });
  const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Paste your content</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
          placeholder="Paste your article, blog post, or any content here..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Target Keyword (for density check)</label>
        <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. seo tools"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {text && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Words", value: words.length, color: "text-blue-600" },
              { label: "Characters", value: chars, color: "text-violet-600" },
              { label: "Sentences", value: sentences, color: "text-green-600" },
              { label: "Read Time", value: `~${readTime} min`, color: "text-amber-600" },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {keyword && (
            <div className={`flex items-center gap-4 rounded-xl border p-4 ${parseFloat(kwDensity) >= 1 && parseFloat(kwDensity) <= 3 ? "bg-green-50 border-green-200" : parseFloat(kwDensity) > 3 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
              <div>
                <p className="font-bold text-slate-800">&ldquo;{keyword}&rdquo;</p>
                <p className="text-xs text-slate-500">appears {kwCount} time{kwCount !== 1 ? "s" : ""}</p>
              </div>
              <div className="text-right ml-auto">
                <p className={`text-2xl font-black ${parseFloat(kwDensity) >= 1 && parseFloat(kwDensity) <= 3 ? "text-green-600" : parseFloat(kwDensity) > 3 ? "text-red-500" : "text-amber-500"}`}>{kwDensity}%</p>
                <p className="text-xs text-slate-500">density {parseFloat(kwDensity) >= 1 && parseFloat(kwDensity) <= 3 ? "(ideal 1-3%)" : parseFloat(kwDensity) > 3 ? "(too high!)" : "(too low)"}</p>
              </div>
            </div>
          )}

          {topWords.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Top Words</p>
              <div className="flex flex-wrap gap-2">
                {topWords.map(([word, count]) => (
                  <span key={word} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                    {word} <span className="bg-slate-300 text-slate-600 px-1.5 py-0.5 rounded-full text-xs">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── URL SLUG GENERATOR ───────────────────────────────────────
function SlugifyTool() {
  const [input, setInput] = useState("");
  const [prefix, setPrefix] = useState("");
  const slug = input.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
  const full = prefix ? `${prefix.replace(/\/$/, "")}/${slug}` : slug;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Text to convert</label>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Best SEO Tools for Digital Agencies 2025"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1.5">URL Prefix (optional)</label>
        <input value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="https://yoursite.com/blog"
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      {slug && (
        <div className="bg-slate-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Generated Slug</span>
            <CopyBtn text={full} small />
          </div>
          <p className="text-green-300 font-mono text-sm break-all">{full}</p>
        </div>
      )}
    </div>
  );
}

// ─── UTM BUILDER ─────────────────────────────────────────────
function UtmTool() {
  const [f, setF] = useState({ url: "", source: "", medium: "", campaign: "", term: "", content: "" });
  const params = new URLSearchParams();
  if (f.source) params.set("utm_source", f.source);
  if (f.medium) params.set("utm_medium", f.medium);
  if (f.campaign) params.set("utm_campaign", f.campaign);
  if (f.term) params.set("utm_term", f.term);
  if (f.content) params.set("utm_content", f.content);
  const full = f.url && f.source ? `${f.url.replace(/\/$/, "")}?${params.toString()}` : "";

  const presets = [
    { label: "Google Ads", source: "google", medium: "cpc" },
    { label: "Facebook Ad", source: "facebook", medium: "paid-social" },
    { label: "Email", source: "newsletter", medium: "email" },
    { label: "LinkedIn", source: "linkedin", medium: "social" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-500">Quick fill:</span>
        {presets.map(p => (
          <button key={p.label} onClick={() => setF({ ...f, source: p.source, medium: p.medium })}
            className="text-xs bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-3 py-1 rounded-full font-medium transition-colors border border-slate-200">
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          ["url", "Website URL *", "https://yoursite.com/page"],
          ["source", "UTM Source *", "google, newsletter, facebook"],
          ["medium", "UTM Medium", "cpc, email, social"],
          ["campaign", "UTM Campaign", "summer_sale, brand_awareness"],
          ["term", "UTM Term (optional)", "seo tools"],
          ["content", "UTM Content (optional)", "header_cta, banner_a"],
        ].map(([key, label, ph]) => (
          <div key={key}>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">{label}</label>
            <input value={f[key as keyof typeof f]} onChange={e => setF({ ...f, [key]: e.target.value })} placeholder={ph}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
      </div>
      {full && (
        <div className="bg-slate-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">UTM URL</span>
            <CopyBtn text={full} small />
          </div>
          <p className="text-green-300 font-mono text-sm break-all">{full}</p>
        </div>
      )}
    </div>
  );
}

// ─── REDIRECT CHECKER ─────────────────────────────────────────
function RedirectTool() {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Browser limitation</p>
          <p className="text-sm text-amber-700">Live redirect checking requires a server-side proxy due to CORS. Use these free tools instead:</p>
          <div className="mt-3 space-y-2">
            {[
              ["httpstatus.io", "https://httpstatus.io"],
              ["redirect-checker.org", "https://redirect-checker.org"],
              ["Screaming Frog SEO Spider", "https://www.screamingfrog.co.uk/seo-spider/"],
            ].map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline">
                <ChevronRight size={13} /> {name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Common Redirect Issues Checklist</p>
        <div className="space-y-2">
          {[
            "HTTP → HTTPS redirect (301)",
            "www → non-www (or vice versa) redirect",
            "Trailing slash consistency",
            "No redirect chains (A→B→C should be A→C)",
            "No redirect loops",
            "Old URLs properly 301 redirected after migration",
            "Soft 404s returning 200 instead of 404/301",
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="checkbox" className="w-4 h-4 accent-blue-600" />
              <span className="text-sm text-slate-700">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TOOL COMPONENTS MAP ──────────────────────────────────────
const TOOL_COMPONENTS: Record<ToolId, React.ComponentType> = {
  meta: MetaTagTool,
  title: TitleCheckerTool,
  robots: RobotsTool,
  sitemap: SitemapTool,
  redirect: RedirectTool,
  wordcount: WordCountTool,
  slugify: SlugifyTool,
  utm: UtmTool,
};

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function ToolsPage() {
  const [active, setActive] = useState<ToolId | null>(null);
  const ActiveTool = active ? TOOL_COMPONENTS[active] : null;
  const activeMeta = active ? TOOLS.find(t => t.id === active)! : null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Wrench size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800">SEO Tools</h1>
          <p className="text-slate-500 text-sm mt-0.5">8 free tools to speed up your SEO workflow</p>
        </div>
      </div>

      {active && activeMeta ? (
        <div>
          {/* Back button + title */}
          <button onClick={() => setActive(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors">
            ← Back to Tools
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 ${activeMeta.color} rounded-xl flex items-center justify-center`}>
              <activeMeta.icon size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{activeMeta.label}</h2>
              <p className="text-slate-500 text-sm">{activeMeta.desc}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {ActiveTool && <ActiveTool />}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TOOLS.map(tool => (
            <button key={tool.id} onClick={() => setActive(tool.id)}
              className="group bg-white border border-slate-100 rounded-2xl p-5 text-left hover:shadow-lg hover:border-slate-200 transition-all hover:-translate-y-0.5">
              <div className={`w-11 h-11 ${tool.color} rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                <tool.icon size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{tool.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{tool.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-blue-600 text-xs font-semibold">
                Open tool <ChevronRight size={12} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
