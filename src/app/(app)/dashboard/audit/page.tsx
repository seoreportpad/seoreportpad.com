"use client";
import { useState, useMemo, useEffect } from "react";
import {
  SF_CATEGORIES,
  SFCategory,
  IssueType,
  Priority,
} from "@/lib/screamingFrogIssues";
import {
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle2,
  Circle,
  RotateCcw,
  Download,
  Users,
  Loader2,
  CloudCheck,
  CloudOff,
} from "lucide-react";

type CheckState = "none" | "found" | "fixed" | "na";

const TYPE_CONFIG: Record<IssueType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  issue: { label: "Issue", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: AlertCircle },
  warning: { label: "Warning", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle },
  opportunity: { label: "Opportunity", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Lightbulb },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; dot: string }> = {
  high: { label: "High", dot: "bg-red-500" },
  medium: { label: "Medium", dot: "bg-amber-500" },
  low: { label: "Low", dot: "bg-green-500" },
};

const CHECK_STATES: { value: CheckState; label: string; color: string }[] = [
  { value: "none", label: "Not Checked", color: "text-slate-400" },
  { value: "found", label: "Issue Found", color: "text-red-600" },
  { value: "fixed", label: "Fixed", color: "text-green-600" },
  { value: "na", label: "N/A", color: "text-slate-400" },
];

function TypeBadge({ type }: { type: IssueType }) {
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function PriorityDot({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function CategoryScore({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-600 bg-green-50 border-green-200"
    : score >= 50 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-600 bg-red-50 border-red-200";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {score}%
    </span>
  );
}

function CategoryCard({
  cat,
  checks,
  onCheck,
}: {
  cat: SFCategory;
  checks: Record<string, CheckState>;
  onCheck: (id: string, state: CheckState) => void;
}) {
  const [open, setOpen] = useState(false);

  const found = cat.issues.filter((i) => checks[i.id] === "found").length;
  const fixed = cat.issues.filter((i) => checks[i.id] === "fixed").length;
  const na = cat.issues.filter((i) => checks[i.id] === "na").length;
  const checked = cat.issues.filter((i) => checks[i.id] && checks[i.id] !== "none").length;

  const actionable = cat.issues.length - na;
  const score = actionable === 0 ? 100 : Math.round(((fixed + na) / cat.issues.length) * 100);
  const fixPct = found + fixed > 0 ? Math.round((fixed / (found + fixed)) * 100) : 0;
  const checkPct = Math.round((checked / cat.issues.length) * 100);

  return (
    <div className={`bg-white rounded-xl border shadow-sm transition-all ${open ? "border-slate-300" : "border-slate-100"}`}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/60 rounded-xl transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="font-semibold text-slate-800">{cat.label}</h3>
            <CategoryScore score={score} />
            {found > 0 && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                {found} found
              </span>
            )}
            {fixed > 0 && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                {fixed} fixed
              </span>
            )}
            {found + fixed > 0 && (
              <span className="text-xs text-slate-400">{fixPct}% resolved</span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate">{cat.description}</p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-xs text-slate-500">{checked}/{cat.issues.length} checked</p>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${found > 0 ? "bg-red-400" : fixed > 0 ? "bg-green-500" : "bg-blue-500"}`}
                style={{ width: `${checkPct}%` }}
              />
            </div>
          </div>
          <div className="w-5 text-slate-400">
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </div>
      </button>

      {/* Issues list */}
      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {cat.issues.map((issue) => {
            const state = checks[issue.id] ?? "none";
            return (
              <div
                key={issue.id}
                className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                  state === "found"
                    ? "bg-red-50/40"
                    : state === "fixed"
                    ? "bg-green-50/40"
                    : "hover:bg-slate-50/60"
                }`}
              >
                {/* Status icon */}
                <div className="shrink-0">
                  {state === "fixed" ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : state === "found" ? (
                    <AlertCircle size={18} className="text-red-500" />
                  ) : (
                    <Circle size={18} className="text-slate-300" />
                  )}
                </div>

                {/* Label + badges */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${state === "na" ? "line-through text-slate-400" : "text-slate-700"}`}>
                    {issue.label}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <TypeBadge type={issue.type} />
                    <PriorityDot priority={issue.priority} />
                  </div>
                </div>

                {/* State selector */}
                <div className="shrink-0">
                  <select
                    value={state}
                    onChange={(e) => onCheck(issue.id, e.target.value as CheckState)}
                    className={`text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                      state === "found"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : state === "fixed"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : state === "na"
                        ? "border-slate-200 bg-slate-50 text-slate-400"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {CHECK_STATES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AuditPage() {
  const [checks, setChecks] = useState<Record<string, CheckState>>({});
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<IssueType | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterState, setFilterState] = useState<CheckState | "all">("all");

  // Load clients and initial audit data
  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients).catch(() => {});
    loadAuditData("all");
  }, []);

  const loadAuditData = async (clientId: string) => {
    setLoading(true);
    try {
      const url = clientId === "all" ? "/api/audit/results" : `/api/audit/results?clientId=${clientId}`;
      const res = await fetch(url);
      const data = await res.json();
      setChecks(data || {});
    } catch {
      setChecks({});
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedClientId(cid);
    loadAuditData(cid);
  };

  const updateCheck = async (id: string, state: CheckState) => {
    const updated = { ...checks, [id]: state };
    setChecks(updated);
    
    // Sync to cloud
    setSyncing(true);
    try {
      await fetch("/api/audit/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          checks: updated, 
          clientId: selectedClientId === "all" ? null : selectedClientId 
        }),
      });
    } catch (err) {
      console.error("Sync failed", err);
    } finally {
      setSyncing(false);
    }
  };

  const resetAll = async () => {
    if (!confirm("Reset all audit checks for this view?")) return;
    setChecks({});
    await fetch("/api/audit/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        checks: {}, 
        clientId: selectedClientId === "all" ? null : selectedClientId 
      }),
    });
  };

  const exportCSV = () => {
    const rows: string[][] = [
      ["Category", "Issue", "Type", "Priority", "Status"],
    ];
    for (const cat of SF_CATEGORIES) {
      for (const issue of cat.issues) {
        const state = checks[issue.id] ?? "none";
        if (state === "none") continue;
        rows.push([cat.label, issue.label, issue.type, issue.priority, state]);
      }
    }
    if (rows.length === 1) { alert("No checked items to export yet."); return; }
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const clientName = selectedClientId === "all" ? "Workspace" : clients.find(c => c.id === selectedClientId)?.name || "Client";
    a.download = `SEO-Audit-${clientName}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const exportText = () => {
    const clientName = selectedClientId === "all" ? "Workspace" : clients.find(c => c.id === selectedClientId)?.name || "Client";
    const date = new Date().toLocaleDateString();
    let txt = `SEO AUDIT REPORT — ${clientName}\nDate: ${date}\n${"=".repeat(50)}\n\n`;
    for (const cat of SF_CATEGORIES) {
      const catChecked = cat.issues.filter(i => checks[i.id] && checks[i.id] !== "none");
      if (!catChecked.length) continue;
      const fixed = catChecked.filter(i => checks[i.id] === "fixed").length;
      const found = catChecked.filter(i => checks[i.id] === "found").length;
      txt += `\n${cat.label.toUpperCase()}\n${"-".repeat(cat.label.length)}\n`;
      txt += `Found: ${found} | Fixed: ${fixed}\n\n`;
      for (const issue of catChecked) {
        const state = checks[issue.id];
        const mark = state === "fixed" ? "[FIXED]" : state === "found" ? "[FOUND]" : "[N/A]";
        txt += `  ${mark} ${issue.label} (${issue.type}, ${issue.priority} priority)\n`;
      }
    }
    if (txt.split("\n").length < 5) { alert("No checked items to export yet."); return; }
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `SEO-Audit-${clientName}-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
  };

  const totalIssues = SF_CATEGORIES.reduce((s, c) => s + c.issues.length, 0);
  const totalFound = Object.values(checks).filter((v) => v === "found").length;
  const totalFixed = Object.values(checks).filter((v) => v === "fixed").length;
  const totalChecked = Object.values(checks).filter((v) => v !== "none").length;

  const filteredCats = useMemo(() => {
    return SF_CATEGORIES.map((cat) => ({
      ...cat,
      issues: cat.issues.filter((issue) => {
        const matchSearch =
          !search || issue.label.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === "all" || issue.type === filterType;
        const matchPriority = filterPriority === "all" || issue.priority === filterPriority;
        const matchState =
          filterState === "all" || (checks[issue.id] ?? "none") === filterState;
        return matchSearch && matchType && matchPriority && matchState;
      }),
    })).filter((cat) => cat.issues.length > 0);
  }, [search, filterType, filterPriority, filterState, checks]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">SEO Audit Checklist</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            Screaming Frog · {totalIssues} checks
            <span className="text-slate-200">|</span>
            {syncing ? (
              <span className="flex items-center gap-1 text-blue-500 font-medium">
                <Loader2 size={12} className="animate-spin" /> Syncing…
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <CloudCheck size={12} className="text-green-500" /> Synced
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-48">
            <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedClientId}
              onChange={handleClientChange}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Global Workspace</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 text-sm border border-slate-200 bg-white px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={exportText}
            className="flex items-center gap-2 text-sm border border-slate-200 bg-white px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
            <Download size={14} /> Export Text
          </button>
          <button onClick={resetAll}
            className="flex items-center gap-2 text-sm border border-slate-200 bg-white px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Checks", value: totalIssues, color: "text-slate-700", bg: "bg-white" },
          { label: "Issues Found", value: totalFound, color: "text-red-600", bg: "bg-red-50" },
          { label: "Fixed", value: totalFixed, color: "text-green-600", bg: "bg-green-50" },
          { label: "Checked", value: totalChecked, color: "text-blue-600", bg: "bg-blue-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl border border-slate-100 shadow-sm px-5 py-4`}>
            {loading ? (
              <div className="h-8 w-12 bg-slate-200 animate-pulse rounded-lg" />
            ) : (
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            )}
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as IssueType | "all")}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Types</option>
          <option value="issue">Issues Only</option>
          <option value="warning">Warnings Only</option>
          <option value="opportunity">Opportunities Only</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | "all")}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value as CheckState | "all")}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Status</option>
          <option value="none">Not Checked</option>
          <option value="found">Issue Found</option>
          <option value="fixed">Fixed</option>
          <option value="na">N/A</option>
        </select>
      </div>

      {/* Category cards */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredCats.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p>No issues match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCats.map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              checks={checks}
              onCheck={updateCheck}
            />
          ))}
        </div>
      )}
    </div>
  );
}
