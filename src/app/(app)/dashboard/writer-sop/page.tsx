"use client";

import { useState, useEffect, useMemo } from "react";
import {
  writerSopData,
  getWriterOverallProgress,
  getWriterCategoryProgress,
} from "@/lib/writerSopData";

const STORAGE_KEY = "writer-sop-checked";

const PRIORITY_STYLES = {
  must: "bg-red-100 text-red-700 border-red-200",
  should: "bg-yellow-100 text-yellow-700 border-yellow-200",
  nice: "bg-blue-100 text-blue-700 border-blue-200",
};

const PRIORITY_LABELS = {
  must: "Must Do",
  should: "Should Do",
  nice: "Nice to Have",
};

export default function WriterSopPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState(writerSopData[0].id);
  const [filterPriority, setFilterPriority] = useState<"all" | "must" | "should" | "nice">("all");
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

  const checkAll = (categoryId: string) => {
    const cat = writerSopData.find((c) => c.id === categoryId);
    if (!cat) return;
    setChecked((prev) => {
      const next = { ...prev };
      cat.checks.forEach((ch) => (next[ch.id] = true));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetCategory = (categoryId: string) => {
    const cat = writerSopData.find((c) => c.id === categoryId);
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

  const overall = useMemo(() => getWriterOverallProgress(checked), [checked]);
  const overallPercent = overall.total > 0 ? Math.round((overall.done / overall.total) * 100) : 0;

  const activeCategory = writerSopData.find((c) => c.id === activeTab)!;
  const catProgress = getWriterCategoryProgress(activeTab, checked);
  const catPercent = catProgress.total > 0 ? Math.round((catProgress.done / catProgress.total) * 100) : 0;

  const filteredChecks = useMemo(() => {
    return activeCategory.checks.filter((ch) => {
      if (filterPriority !== "all" && ch.priority !== filterPriority) return false;
      if (showOnlyUnchecked && checked[ch.id]) return false;
      if (search && !ch.label.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeCategory, filterPriority, showOnlyUnchecked, checked, search]);

  // Count must-do incomplete in active category
  const mustIncomplete = activeCategory.checks.filter(
    (ch) => ch.priority === "must" && !checked[ch.id]
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✍️</span>
              <h1 className="text-2xl font-bold text-gray-900">Content Writer SOP</h1>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-200">
                Writer-Only
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {overall.total} checkpoints — writer ke liye complete content writing SOP
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">Overall Progress</div>
              <div className="text-2xl font-bold text-emerald-600">
                {overall.done}/{overall.total}
              </div>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#10b981" strokeWidth="3"
                  strokeDasharray={`${overallPercent} ${100 - overallPercent}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-600">
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

        {/* Priority legend */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-4 text-xs">
          <span className="text-gray-400 font-medium">Priority:</span>
          <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-semibold">Must Do — Mandatory</span>
          <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-semibold">Should Do — Recommended</span>
          <span className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">Nice to Have — Bonus</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">
            <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Writing Steps ({writerSopData.length})
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {writerSopData.map((cat, idx) => {
                const prog = getWriterCategoryProgress(cat.id, checked);
                const pct = prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0;
                const isActive = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                      isActive
                        ? "bg-emerald-50 border-l-4 border-l-emerald-500"
                        : "hover:bg-gray-50 border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-300 font-mono w-4">{idx + 1}</span>
                        <span className="text-base">{cat.icon}</span>
                        <span className={`text-xs font-medium leading-tight ${isActive ? "text-emerald-700" : "text-gray-700"}`}>
                          {cat.title}
                        </span>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${pct === 100 ? "text-green-600" : isActive ? "text-emerald-600" : "text-gray-400"}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden ml-6">
                      <div
                        className={`h-full rounded-full transition-all ${pct === 100 ? "bg-green-500" : "bg-emerald-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Category header */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">{activeCategory.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{activeCategory.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{activeCategory.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-gray-600">
                      <span className={`font-bold ${catPercent === 100 ? "text-green-600" : "text-emerald-600"}`}>
                        {catProgress.done}/{catProgress.total}
                      </span> done
                    </span>
                    {mustIncomplete > 0 && (
                      <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                        {mustIncomplete} must-do remaining
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => checkAll(activeTab)}
                  className="text-xs bg-emerald-600 text-white rounded px-3 py-1.5 hover:bg-emerald-700"
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
            <div className="mt-4 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${catPercent === 100 ? "bg-green-500" : "bg-emerald-500"}`}
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
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 flex-1 min-w-[180px]"
            />
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-xs text-gray-500 font-medium">Filter:</span>
              {(["all", "must", "should", "nice"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                    filterPriority === p
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : p === "must"
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : p === "should"
                      ? "border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                      : p === "nice"
                      ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p === "all" ? "All" : PRIORITY_LABELS[p]}
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
              Unchecked only
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
                      className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors select-none ${
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
                      <span className="text-xs text-gray-300 font-mono mt-1 shrink-0 w-5 text-right">
                        {idx + 1}
                      </span>

                      {/* Label + detail */}
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm leading-relaxed ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                          {ch.label}
                        </span>
                        {ch.detail && (
                          <p className="text-xs text-gray-400 mt-0.5">{ch.detail}</p>
                        )}
                      </div>

                      {/* Priority badge */}
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold shrink-0 mt-0.5 ${PRIORITY_STYLES[ch.priority]}`}>
                        {ch.priority === "must" ? "Must" : ch.priority === "should" ? "Should" : "Nice"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Complete banner */}
          {catPercent === 100 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-center text-green-700 font-semibold text-sm">
              ✅ {activeCategory.title} — Mukammal! Agli step pe jao.
            </div>
          )}

          {/* All done banner */}
          {overallPercent === 100 && (
            <div className="mt-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl px-5 py-5 text-center">
              <div className="text-2xl mb-2">🎉</div>
              <p className="text-emerald-800 font-bold text-lg">Poori SOP complete kar li!</p>
              <p className="text-emerald-600 text-sm mt-1">Content submit karne ke liye ready hai. Shabaash!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
