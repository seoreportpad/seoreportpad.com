"use client";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export function TitleCheckerTool() {
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
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className={`text-3xl font-black ${score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-500" : "text-red-500"}`}>{score}%</div>
            <div>
              <p className="font-semibold text-slate-700">Title Score</p>
              <p className="text-sm text-slate-500">{score >= 80 ? "Excellent! Great title tag." : score >= 60 ? "Good, a few improvements possible." : "Needs improvement."}</p>
            </div>
            <div className="flex-1 bg-slate-200 rounded-full h-2.5 ml-4 overflow-hidden">
              <div className={`h-2.5 rounded-full transition-all duration-500 ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${score}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            {checks.map((c, i) => c.ok !== null && (
              <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${c.ok ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
                {c.ok ? <CheckCircle2 size={15} className="text-green-500 shrink-0" /> : <XCircle size={15} className="text-red-400 shrink-0" />}
                <span className={`text-sm font-medium ${c.ok ? "text-green-800" : "text-red-700"}`}>{c.label}</span>
              </div>
            ))}
          </div>

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
