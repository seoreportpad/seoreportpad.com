"use client";
import { useState } from "react";

export function WordCountTool() {
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
