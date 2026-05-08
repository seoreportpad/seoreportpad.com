"use client";
import { AlertCircle, ChevronRight } from "lucide-react";

export function RedirectTool() {
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
