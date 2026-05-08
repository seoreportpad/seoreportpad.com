"use client";
import { useState } from "react";
import { CopyBtn } from "./ToolHelpers";

export function UtmTool() {
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
