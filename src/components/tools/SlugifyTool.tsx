"use client";
import { useState } from "react";
import { CopyBtn } from "./ToolHelpers";

export function SlugifyTool() {
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
