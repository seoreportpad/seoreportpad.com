"use client";
import { useState } from "react";
import { Plus, Trash2, Copy, Check, Globe } from "lucide-react";

interface HreflangEntry {
  id: string;
  locale: string;
  url: string;
  isXDefault: boolean;
}

const LOCALES = [
  "en", "en-US", "en-GB", "en-AU", "en-CA",
  "es", "es-ES", "es-MX", "es-AR",
  "fr", "fr-FR", "fr-CA",
  "de", "de-DE", "de-AT",
  "it", "it-IT",
  "pt", "pt-BR", "pt-PT",
  "nl", "nl-NL",
  "ru", "ru-RU",
  "zh", "zh-CN", "zh-TW",
  "ja", "ja-JP",
  "ko", "ko-KR",
  "ar", "ar-SA",
  "hi", "hi-IN",
  "tr", "tr-TR",
  "pl", "pl-PL",
  "sv", "sv-SE",
  "da", "da-DK",
  "fi", "fi-FI",
  "no", "no-NO",
  "x-default",
];

export function HreflangGeneratorTool() {
  const [entries, setEntries] = useState<HreflangEntry[]>([
    { id: "1", locale: "en", url: "", isXDefault: false },
    { id: "2", locale: "es", url: "", isXDefault: false },
  ]);
  const [copied, setCopied] = useState<"html" | "xml" | null>(null);
  const [format, setFormat] = useState<"html" | "xml">("html");

  const add = () => {
    setEntries(prev => [...prev, { id: Date.now().toString(), locale: "fr", url: "", isXDefault: false }]);
  };

  const remove = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  const update = (id: string, field: keyof HreflangEntry, value: string | boolean) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const htmlTags = entries
    .filter(e => e.url)
    .map(e => `<link rel="alternate" hreflang="${e.locale}" href="${e.url}" />`)
    .join("\n");

  const xDefaultEntry = entries.find(e => e.isXDefault && e.url);
  const htmlWithXDefault = xDefaultEntry
    ? htmlTags + `\n<link rel="alternate" hreflang="x-default" href="${xDefaultEntry.url}" />`
    : htmlTags;

  const xmlSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.filter(e => e.url).map(e => `  <url>
    <loc>${e.url}</loc>
${entries.filter(x => x.url).map(x => `    <xhtml:link rel="alternate" hreflang="${x.locale}" href="${x.url}"/>`).join("\n")}
${xDefaultEntry ? `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultEntry.url}"/>` : ""}
  </url>`).join("\n")}
</urlset>`;

  const output = format === "html" ? htmlWithXDefault : xmlSitemap;

  const copy = (type: "html" | "xml") => {
    navigator.clipboard.writeText(type === "html" ? htmlWithXDefault : xmlSitemap);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const inp = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
        <strong>How to use:</strong> Add a row for each language/region version of your page. Check "x-default" on the version you want shown when no other language matches (usually your English version).
      </div>

      {/* Entries table */}
      <div className="space-y-2">
        {entries.map((entry, idx) => (
          <div key={entry.id} className="flex gap-2 items-center">
            <span className="text-xs text-slate-400 w-5 shrink-0 text-right">{idx + 1}</span>
            <select value={entry.locale} onChange={e => update(entry.id, "locale", e.target.value)}
              className="border border-slate-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 shrink-0">
              {LOCALES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input value={entry.url} onChange={e => update(entry.id, "url", e.target.value)}
              placeholder="https://example.com/page" className={inp} />
            <label className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap shrink-0 cursor-pointer">
              <input type="checkbox" checked={entry.isXDefault} onChange={e => update(entry.id, "isXDefault", e.target.checked)}
                className="rounded" />
              x-default
            </label>
            <button onClick={() => remove(entry.id)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={add}
        className="flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors w-full justify-center">
        <Plus size={15} /> Add Language
      </button>

      {/* Output format toggle */}
      <div className="flex gap-2">
        <button onClick={() => setFormat("html")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${format === "html" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          HTML {"<link>"} Tags
        </button>
        <button onClick={() => setFormat("xml")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${format === "xml" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          XML Sitemap
        </button>
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-slate-700">
            <Globe size={14} className="inline mr-1.5" />
            {format === "html" ? "HTML Tags (paste in <head>)" : "XML Sitemap"}
          </label>
          <button onClick={() => copy(format)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${copied === format ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {copied === format ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
        <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap max-h-64">
          {output || "# Fill in URLs above to generate tags"}
        </pre>
      </div>

      {/* Validation hints */}
      {entries.filter(e => e.url).length > 0 && (
        <div className="bg-slate-50 rounded-xl p-3 space-y-1">
          <p className="text-xs font-semibold text-slate-600 mb-1.5">Checklist</p>
          {[
            [entries.some(e => e.isXDefault && e.url), "x-default is set"],
            [entries.filter(e => e.url).length >= 2, "At least 2 language versions"],
            [entries.filter(e => e.url).every(e => e.url.startsWith("http")), "All URLs are absolute"],
            [new Set(entries.filter(e => e.url).map(e => e.locale)).size === entries.filter(e => e.url).length, "No duplicate locales"],
          ].map(([ok, msg], i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <div className={`w-3 h-3 rounded-full ${ok ? "bg-green-500" : "bg-red-400"}`} />
              <span className={ok ? "text-green-700" : "text-red-600"}>{msg as string}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
