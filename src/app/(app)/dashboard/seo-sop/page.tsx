"use client";

import { useState, useEffect, useMemo } from "react";
import {
  seoSopData,
  getOverallProgress,
  getCategoryProgress,
  type SopCategory,
} from "@/lib/seoSopData";

const STORAGE_KEY = "seo-sop-checked";
const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export default function SeoSopPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState(seoSopData[0].id);
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetCategory = (categoryId: string) => {
    const cat = seoSopData.find((c) => c.id === categoryId);
    if (!cat) return;
    setChecked((prev) => {
      const next = { ...prev };
      cat.checks.forEach((ch) => delete next[ch.id]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetAll = () => {
    setChecked({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const overall = useMemo(() => getOverallProgress(checked), [checked]);

  const activeCategory = seoSopData.find((c) => c.id === activeTab)!;

  const filteredChecks = useMemo(() => {
    return activeCategory.checks.filter((ch) => {
      if (filterPriority !== "all" && ch.priority !== filterPriority) return false;
      if (showOnlyUnchecked && checked[ch.id]) return false;
      if (search && !ch.label.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeCategory, filterPriority, showOnlyUnchecked, checked, search]);

  const catProgress = getCategoryProgress(activeTab, checked);
  const catPercent = catProgress.total > 0 ? Math.round((catProgress.done / catProgress.total) * 100) : 0;
  const overallPercent = overall.total > 0 ? Math.round((overall.done / overall.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SEO Content SOP</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {overall.total} total checkpoints — writer ke liye complete content checklist
            </p>
          </div>

          {/* Overall progress */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Overall Progress</div>
              <div className="text-2xl font-bold text-indigo-600">
                {overall.done}/{overall.total}
              </div>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#6366f1" strokeWidth="3"
                  strokeDasharray={`${overallPercent} ${100 - overallPercent}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-600">
                {overallPercent}%
              </span>
            </div>
            <button
              onClick={resetAll}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-3 py-1.5"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left sidebar — category tabs */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Categories
            </div>
            {seoSopData.map((cat) => {
              const prog = getCategoryProgress(cat.id, checked);
              const pct = prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0;
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                    isActive
                      ? "bg-indigo-50 border-l-4 border-l-indigo-500"
                      : "hover:bg-gray-50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className={`text-sm font-medium ${isActive ? "text-indigo-700" : "text-gray-700"}`}>
                        {cat.title}
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${pct === 100 ? "text-green-600" : isActive ? "text-indigo-600" : "text-gray-400"}`}>
                      {pct}%
                    </span>
                  </div>
                  {/* mini progress bar */}
                  <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct === 100 ? "bg-green-500" : "bg-indigo-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{prog.done}/{prog.total} done</div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Category header */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeCategory.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{activeCategory.title}</h2>
                  <p className="text-sm text-gray-500">
                    {catProgress.done} / {catProgress.total} completed &nbsp;•&nbsp;
                    <span className={catPercent === 100 ? "text-green-600 font-semibold" : "text-indigo-600 font-semibold"}>
                      {catPercent}%
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const allIds = activeCategory.checks.map((c) => c.id);
                    setChecked((prev) => {
                      const next = { ...prev };
                      allIds.forEach((id) => (next[id] = true));
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                      return next;
                    });
                  }}
                  className="text-xs bg-indigo-600 text-white rounded px-3 py-1.5 hover:bg-indigo-700"
                >
                  Check All
                </button>
                <button
                  onClick={() => resetCategory(activeTab)}
                  className="text-xs border border-gray-200 text-gray-600 rounded px-3 py-1.5 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${catPercent === 100 ? "bg-green-500" : "bg-indigo-500"}`}
                style={{ width: `${catPercent}%` }}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search checkpoints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 flex-1 min-w-[200px]"
            />
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500 font-medium">Priority:</span>
              {(["all", "high", "medium", "low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize transition-colors ${
                    filterPriority === p
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p === "all" ? "All" : p}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyUnchecked}
                onChange={(e) => setShowOnlyUnchecked(e.target.checked)}
                className="rounded"
              />
              Show unchecked only
            </label>
            <span className="text-xs text-gray-400 ml-auto">{filteredChecks.length} items</span>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {filteredChecks.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">
                No checkpoints match your filters.
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {filteredChecks.map((ch, idx) => {
                  const isDone = !!checked[ch.id];
                  return (
                    <li
                      key={ch.id}
                      onClick={() => toggle(ch.id)}
                      className={`flex items-start gap-4 px-5 py-3.5 cursor-pointer transition-colors select-none ${
                        isDone ? "bg-green-50" : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isDone ? "bg-green-500 border-green-500" : "border-gray-300"
                      }`}>
                        {isDone && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Number */}
                      <span className="text-xs text-gray-300 font-mono mt-1 shrink-0 w-6 text-right">
                        {idx + 1}
                      </span>

                      {/* Label */}
                      <span className={`flex-1 text-sm leading-relaxed ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {ch.label}
                        {ch.detail && (
                          <span className="block text-xs text-gray-400 mt-0.5 no-underline" style={{ textDecoration: "none" }}>
                            {ch.detail}
                          </span>
                        )}
                      </span>

                      {/* Priority badge */}
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 mt-0.5 ${PRIORITY_COLORS[ch.priority]}`}>
                        {ch.priority}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Category complete banner */}
          {catPercent === 100 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-center text-green-700 font-semibold text-sm">
              ✅ {activeCategory.title} — sab checkpoints complete! Shabaash!
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
