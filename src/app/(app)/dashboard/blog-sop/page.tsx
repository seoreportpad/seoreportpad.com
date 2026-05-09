"use client";

import { useState, useEffect, useMemo } from "react";
import {
  blogSopData,
  getBlogOverallProgress,
  getBlogPhaseProgress,
  getBlogPhaseGroups,
} from "@/lib/blogSopData";

const STORAGE_KEY = "blog-sop-checked";

const PRIORITY_STYLES = {
  must: "bg-red-100 text-red-700 border-red-200",
  should: "bg-yellow-100 text-yellow-700 border-yellow-200",
  nice: "bg-blue-100 text-blue-700 border-blue-200",
};

const PHASE_COLORS: Record<string, string> = {
  "Phase 1 — Research": "bg-blue-500",
  "Phase 2 — Outline": "bg-purple-500",
  "Phase 3 — Writing": "bg-emerald-500",
  "Phase 4 — SEO Layer": "bg-orange-500",
  "Phase 5 — E-E-A-T & AEO": "bg-pink-500",
  "Phase 6 — Quality Check": "bg-yellow-500",
  "Phase 7 — Submission": "bg-green-600",
};

const PHASE_BADGES: Record<string, string> = {
  "Phase 1 — Research": "bg-blue-100 text-blue-700 border-blue-200",
  "Phase 2 — Outline": "bg-purple-100 text-purple-700 border-purple-200",
  "Phase 3 — Writing": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Phase 4 — SEO Layer": "bg-orange-100 text-orange-700 border-orange-200",
  "Phase 5 — E-E-A-T & AEO": "bg-pink-100 text-pink-700 border-pink-200",
  "Phase 6 — Quality Check": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Phase 7 — Submission": "bg-green-100 text-green-700 border-green-200",
};

export default function BlogSopPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState(blogSopData[0].id);
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

  const checkAll = (phaseId: string) => {
    const phase = blogSopData.find((p) => p.id === phaseId);
    if (!phase) return;
    setChecked((prev) => {
      const next = { ...prev };
      phase.checks.forEach((ch) => (next[ch.id] = true));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetPhase = (phaseId: string) => {
    const phase = blogSopData.find((p) => p.id === phaseId);
    if (!phase) return;
    setChecked((prev) => {
      const next = { ...prev };
      phase.checks.forEach((ch) => delete next[ch.id]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetAll = () => {
    setChecked({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const overall = useMemo(() => getBlogOverallProgress(checked), [checked]);
  const overallPercent = overall.total > 0 ? Math.round((overall.done / overall.total) * 100) : 0;
  const phaseGroups = useMemo(() => getBlogPhaseGroups(), []);

  const activePhase = blogSopData.find((p) => p.id === activeTab)!;
  const phaseProgress = getBlogPhaseProgress(activeTab, checked);
  const phasePercent = phaseProgress.total > 0 ? Math.round((phaseProgress.done / phaseProgress.total) * 100) : 0;

  const filteredChecks = useMemo(() => {
    return activePhase.checks.filter((ch) => {
      if (filterPriority !== "all" && ch.priority !== filterPriority) return false;
      if (showOnlyUnchecked && checked[ch.id]) return false;
      if (search && !ch.label.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activePhase, filterPriority, showOnlyUnchecked, checked, search]);

  const mustLeft = activePhase.checks.filter(
    (ch) => ch.priority === "must" && !checked[ch.id]
  ).length;

  // Overall phase completion
  const phaseCompletion = Object.keys(phaseGroups).map((phaseName) => {
    const phases = phaseGroups[phaseName];
    const totalChecks = phases.reduce((s, p) => s + p.checks.length, 0);
    const doneChecks = phases.reduce(
      (s, p) => s + p.checks.filter((ch) => checked[ch.id]).length,
      0
    );
    return { phaseName, done: doneChecks, total: totalChecks, pct: totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0 };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📝</span>
              <h1 className="text-2xl font-bold text-gray-900">Blog Writing SOP</h1>
              <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200">
                Blog-Specific
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {overall.total} checkpoints • 7 phases — blog likhne ka complete end-to-end SOP
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">Overall Progress</div>
              <div className="text-2xl font-bold text-purple-600">
                {overall.done}/{overall.total}
              </div>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#9333ea" strokeWidth="3"
                  strokeDasharray={`${overallPercent} ${100 - overallPercent}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-purple-600">
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

        {/* Phase progress bar strip */}
        <div className="max-w-7xl mx-auto mt-4">
          <div className="flex gap-1.5 flex-wrap">
            {phaseCompletion.map(({ phaseName, pct }) => (
              <div key={phaseName} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${pct === 100 ? "bg-green-500" : PHASE_COLORS[phaseName] || "bg-gray-400"}`} />
                <span className="text-xs text-gray-500">{phaseName.split("—")[1]?.trim()}</span>
                <span className={`text-xs font-bold ${pct === 100 ? "text-green-600" : "text-gray-400"}`}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">
            <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              7 Phases • {blogSopData.length} Steps
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {Object.entries(phaseGroups).map(([phaseName, phases]) => (
                <div key={phaseName}>
                  {/* Phase group header */}
                  <div className={`px-4 py-2 text-xs font-bold border-b border-gray-100 flex items-center gap-2 ${PHASE_BADGES[phaseName] || "bg-gray-50 text-gray-500"}`}>
                    <div className={`w-2 h-2 rounded-full ${PHASE_COLORS[phaseName] || "bg-gray-400"}`} />
                    {phaseName}
                  </div>
                  {phases.map((phase, idx) => {
                    const prog = getBlogPhaseProgress(phase.id, checked);
                    const pct = prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0;
                    const isActive = activeTab === phase.id;
                    return (
                      <button
                        key={phase.id}
                        onClick={() => setActiveTab(phase.id)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                          isActive
                            ? "bg-purple-50 border-l-4 border-l-purple-500"
                            : "hover:bg-gray-50 border-l-4 border-l-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{phase.icon}</span>
                            <span className={`text-xs font-medium leading-tight ${isActive ? "text-purple-700" : "text-gray-700"}`}>
                              {phase.title}
                            </span>
                          </div>
                          <span className={`text-xs font-bold shrink-0 ${pct === 100 ? "text-green-600" : isActive ? "text-purple-600" : "text-gray-400"}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden ml-6">
                          <div
                            className={`h-full rounded-full transition-all ${pct === 100 ? "bg-green-500" : PHASE_COLORS[phase.phase] || "bg-purple-400"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Phase header */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">{activePhase.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PHASE_BADGES[activePhase.phase] || "bg-gray-100 text-gray-600"}`}>
                      {activePhase.phase}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{activePhase.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{activePhase.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-gray-600">
                      <span className={`font-bold ${phasePercent === 100 ? "text-green-600" : "text-purple-600"}`}>
                        {phaseProgress.done}/{phaseProgress.total}
                      </span> done
                    </span>
                    {mustLeft > 0 && (
                      <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                        {mustLeft} must-do remaining
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => checkAll(activeTab)}
                  className="text-xs bg-purple-600 text-white rounded px-3 py-1.5 hover:bg-purple-700"
                >
                  Check All
                </button>
                <button
                  onClick={() => resetPhase(activeTab)}
                  className="text-xs border border-gray-200 text-gray-600 rounded px-3 py-1.5 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-4 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${phasePercent === 100 ? "bg-green-500" : PHASE_COLORS[activePhase.phase] || "bg-purple-500"}`}
                style={{ width: `${phasePercent}%` }}
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
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 flex-1 min-w-[180px]"
            />
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-xs text-gray-500 font-medium">Filter:</span>
              {(["all", "must", "should", "nice"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                    filterPriority === p
                      ? "bg-purple-600 text-white border-purple-600"
                      : p === "must"
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : p === "should"
                      ? "border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                      : p === "nice"
                      ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p === "all" ? "All" : p === "must" ? "Must" : p === "should" ? "Should" : "Nice"}
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
                      <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isDone ? "bg-green-500 border-green-500" : "border-gray-300"
                      }`}>
                        {isDone && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-gray-300 font-mono mt-1 shrink-0 w-5 text-right">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm leading-relaxed ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                          {ch.label}
                        </span>
                        {ch.detail && (
                          <p className="text-xs text-gray-400 mt-0.5">{ch.detail}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold shrink-0 mt-0.5 ${PRIORITY_STYLES[ch.priority]}`}>
                        {ch.priority === "must" ? "Must" : ch.priority === "should" ? "Should" : "Nice"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {phasePercent === 100 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-center text-green-700 font-semibold text-sm">
              ✅ {activePhase.title} — Complete! Agla step karo.
            </div>
          )}

          {overallPercent === 100 && (
            <div className="mt-4 bg-purple-50 border-2 border-purple-300 rounded-xl px-5 py-5 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-purple-800 font-bold text-lg">Blog SOP 100% Complete!</p>
              <p className="text-purple-600 text-sm mt-1">Poora blog ready hai submit karne ke liye. Zabardast kaam!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
