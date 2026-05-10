"use client";
import { useState } from "react";
import { Search, CheckCircle, XCircle, AlertTriangle, Copy, Check, Loader2 } from "lucide-react";

interface CanonicalResult {
  url: string;
  canonical: string | null;
  isSelf: boolean;
  isRelative: boolean;
  hasMultiple: boolean;
  raw: string;
  status: "ok" | "missing" | "cross-domain" | "relative" | "multiple";
}

export function CanonicalCheckerTool() {
  const [urls, setUrls] = useState("");
  const [results, setResults] = useState<CanonicalResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualHtml, setManualHtml] = useState("");
  const [manualUrl, setManualUrl] = useState("");

  const parseCanonical = (html: string, pageUrl: string): Omit<CanonicalResult, "url"> => {
    const matches = [...html.matchAll(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi)];
    const matches2 = [...html.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*\/?>/gi)];
    const all = [...matches, ...matches2];

    if (all.length === 0) return { canonical: null, isSelf: false, isRelative: false, hasMultiple: false, raw: "", status: "missing" };

    const raw = all.map(m => m[1]).join(", ");
    const hasMultiple = all.length > 1;
    const canonical = all[0][1];
    const isRelative = !canonical.startsWith("http");

    let resolved = canonical;
    if (isRelative) {
      try { resolved = new URL(canonical, pageUrl).href; } catch {}
    }

    let isSelf = false;
    try { isSelf = new URL(resolved).pathname === new URL(pageUrl).pathname; } catch {}

    let pageOrigin = "", canonicalOrigin = "";
    try { pageOrigin = new URL(pageUrl).origin; } catch {}
    try { canonicalOrigin = new URL(resolved).origin; } catch {}

    const isCrossDomain = pageOrigin && canonicalOrigin && pageOrigin !== canonicalOrigin;

    const status: CanonicalResult["status"] = hasMultiple ? "multiple"
      : isRelative ? "relative"
      : isCrossDomain ? "cross-domain"
      : "ok";

    return { canonical: resolved, isSelf, isRelative, hasMultiple, raw, status };
  };

  const checkUrls = async () => {
    const list = urls.split("\n").map(u => u.trim()).filter(Boolean);
    if (!list.length) return;
    setLoading(true);
    setResults([]);

    const newResults: CanonicalResult[] = [];
    for (const url of list.slice(0, 10)) {
      try {
        const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
        const html = await res.text();
        const data = parseCanonical(html, url);
        newResults.push({ url, ...data });
      } catch {
        newResults.push({ url, canonical: null, isSelf: false, isRelative: false, hasMultiple: false, raw: "", status: "missing" });
      }
      setResults([...newResults]);
    }
    setLoading(false);
  };

  const checkManual = () => {
    if (!manualHtml || !manualUrl) return;
    const data = parseCanonical(manualHtml, manualUrl);
    setResults([{ url: manualUrl, ...data }]);
  };

  const statusConfig = {
    ok: { icon: <CheckCircle size={15} className="text-green-600" />, label: "Self-canonical", cls: "bg-green-50 border-green-200 text-green-700" },
    missing: { icon: <XCircle size={15} className="text-red-600" />, label: "Missing canonical", cls: "bg-red-50 border-red-200 text-red-700" },
    "cross-domain": { icon: <AlertTriangle size={15} className="text-amber-600" />, label: "Cross-domain canonical", cls: "bg-amber-50 border-amber-200 text-amber-700" },
    relative: { icon: <AlertTriangle size={15} className="text-amber-600" />, label: "Relative canonical", cls: "bg-amber-50 border-amber-200 text-amber-700" },
    multiple: { icon: <XCircle size={15} className="text-red-600" />, label: "Multiple canonicals", cls: "bg-red-50 border-red-200 text-red-700" },
  };

  const exportCsv = () => {
    const rows = [["URL", "Canonical", "Status", "Self-canonical"]];
    results.forEach(r => rows.push([r.url, r.canonical || "", r.status, String(r.isSelf)]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "canonical-check.csv"; a.click();
  };

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        {/* Bulk URL checker */}
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">URLs to Check (one per line, max 10)</label>
          <textarea value={urls} onChange={e => setUrls(e.target.value)} rows={5}
            placeholder={"https://example.com/page-1\nhttps://example.com/page-2"}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono" />
          <button onClick={checkUrls} disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Checking...</> : <><Search size={14} /> Check Canonicals</>}
          </button>
        </div>

        {/* Manual HTML paste */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Page URL</label>
            <input value={manualUrl} onChange={e => setManualUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Paste HTML {"<head>"} (manual check)</label>
            <textarea value={manualHtml} onChange={e => setManualHtml(e.target.value)} rows={4}
              placeholder='<link rel="canonical" href="https://example.com/page" />'
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono" />
          </div>
          <button onClick={checkManual}
            className="w-full py-2.5 bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800">
            Parse HTML
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-700">{results.length} Result{results.length > 1 ? "s" : ""}</p>
            <button onClick={exportCsv} className="text-xs text-blue-600 hover:underline">Export CSV</button>
          </div>
          <div className="space-y-2">
            {results.map((r, i) => {
              const cfg = statusConfig[r.status];
              return (
                <div key={i} className={`rounded-xl p-3 border ${cfg.cls}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {cfg.icon}
                    <span className="text-xs font-bold">{cfg.label}</span>
                    {r.isSelf && r.status === "ok" && <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full">Self</span>}
                  </div>
                  <p className="text-xs font-mono text-slate-700 truncate">Page: {r.url}</p>
                  {r.canonical && <p className="text-xs font-mono text-slate-500 truncate mt-0.5">Canonical: {r.canonical}</p>}
                  {r.hasMultiple && <p className="text-xs text-red-600 mt-0.5">All found: {r.raw}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
