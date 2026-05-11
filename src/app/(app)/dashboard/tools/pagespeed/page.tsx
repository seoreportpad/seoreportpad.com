"use client";
import { useState, useEffect } from "react";
import {
  Zap, Monitor, Smartphone, Search, AlertCircle, CheckCircle2,
  AlertTriangle, Clock, BarChart3, RefreshCw, ExternalLink, Info,
  Save, History, Trash2, X, ChevronDown,
} from "lucide-react";

type Scores = { performance: number; accessibility: number; best_practices: number; seo: number };
type CWVMetric = { category?: string; percentile?: number };
type Metric = { displayValue?: string; score?: number | null };
type Opportunity = { id: string; title: string; description: string; displayValue?: string; savingsMs?: number };
type Diagnostic = { id: string; title: string; displayValue?: string; score?: number };
type PSIResult = {
  url: string; strategy: string; scores: Scores;
  cwv: Record<string, CWVMetric>;
  metrics: Record<string, Metric>;
  opportunities: Opportunity[];
  diagnostics: Diagnostic[];
  screenshot: string | null;
};
type Client = { id: string; name: string };
type Website = { id: string; url: string; name?: string };
type SavedResult = {
  id: string; url: string; strategy: string;
  performance: number; accessibility: number; best_practices: number; seo_score: number;
  lcp?: string; cls?: string; fcp?: string; tbt?: string; tti?: string;
  notes?: string; created_at: string;
  clients?: { name: string }; websites?: { url: string; name?: string };
};

const SCORE_COLOR = (s: number) =>
  s >= 90 ? { ring: "ring-green-500", text: "text-green-600", bg: "bg-green-50", bar: "bg-green-500" }
  : s >= 50 ? { ring: "ring-amber-400", text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-400" }
  : { ring: "ring-red-500", text: "text-red-600", bg: "bg-red-50", bar: "bg-red-500" };

const CWV_LABELS: Record<string, { label: string; unit: string }> = {
  fcp:  { label: "FCP",  unit: "ms" },
  lcp:  { label: "LCP",  unit: "ms" },
  cls:  { label: "CLS",  unit: ""   },
  fid:  { label: "FID",  unit: "ms" },
  inp:  { label: "INP",  unit: "ms" },
  ttfb: { label: "TTFB", unit: "ms" },
};

function ScoreRing({ score, label }: { score: number; label: string }) {
  const c = SCORE_COLOR(score);
  const r = 36; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative w-24 h-24 rounded-full ring-4 ${c.ring} ${c.bg} flex items-center justify-center`}>
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <circle cx="44" cy="44" r={r} fill="none" stroke="currentColor"
            strokeWidth="6" strokeDasharray={`${dash} ${circ}`}
            className={c.text} strokeLinecap="round" />
        </svg>
        <span className={`text-2xl font-bold ${c.text}`}>{score}</span>
      </div>
      <span className="text-xs font-medium text-slate-600 text-center leading-tight">{label}</span>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const c = SCORE_COLOR(score);
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{score}</span>;
}

function CWVBadge({ value, meta }: { value: CWVMetric | undefined; meta: typeof CWV_LABELS[string] }) {
  if (!value?.percentile) return (
    <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
      <div className="text-slate-400 text-sm font-medium mb-1">{meta.label}</div>
      <div className="text-slate-300 text-lg font-bold">—</div>
      <div className="text-slate-300 text-xs mt-1">No field data</div>
    </div>
  );
  const cat = value.category ?? "";
  const color = cat === "FAST" ? "text-green-600 bg-green-50 border-green-200"
    : cat === "AVERAGE" ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-600 bg-red-50 border-red-200";
  const label = cat === "FAST" ? "Good" : cat === "AVERAGE" ? "Needs Improvement" : "Poor";
  const display = meta.unit === "ms"
    ? value.percentile >= 1000 ? `${(value.percentile / 1000).toFixed(1)}s` : `${value.percentile}ms`
    : (value.percentile / 100).toFixed(2);
  return (
    <div className={`rounded-xl p-4 text-center border ${color}`}>
      <div className="text-xs font-semibold mb-1 opacity-70">{meta.label}</div>
      <div className="text-xl font-bold">{display}</div>
      <div className="text-xs font-medium mt-1">{label}</div>
    </div>
  );
}

function MetricRow({ label, metric }: { label: string; metric: Metric | undefined }) {
  if (!metric?.displayValue) return null;
  const score = metric.score ?? 0;
  const color = score >= 0.9 ? "bg-green-500" : score >= 0.5 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm font-medium text-slate-800">{metric.displayValue}</span>
      </div>
    </div>
  );
}

export default function PageSpeedPage() {
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PSIResult | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "opportunities" | "diagnostics">("overview");

  // Save modal
  const [showSave, setShowSave] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [saveClientId, setSaveClientId] = useState("");
  const [saveWebsiteId, setSaveWebsiteId] = useState("");
  const [saveNotes, setSaveNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // History
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SavedResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(d => { if (Array.isArray(d)) setClients(d); });
  }, []);

  useEffect(() => {
    if (!saveClientId) { setWebsites([]); setSaveWebsiteId(""); return; }
    fetch(`/api/websites?clientId=${saveClientId}`).then(r => r.json()).then(d => {
      if (Array.isArray(d)) setWebsites(d);
    });
  }, [saveClientId]);

  async function run() {
    if (!url.trim()) return;
    let target = url.trim();
    if (!target.startsWith("http")) target = "https://" + target;
    setLoading(true); setError(""); setResult(null); setSaveSuccess(false);
    try {
      const res = await fetch(`/api/pagespeed?url=${encodeURIComponent(target)}&strategy=${strategy}`);
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResult(data);
      setActiveTab("overview");
    } catch (e: unknown) { setError(String(e)); }
    finally { setLoading(false); }
  }

  async function saveResult() {
    if (!result) return;
    setSaving(true);
    try {
      await fetch("/api/pagespeed-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: result.url,
          strategy: result.strategy,
          performance: result.scores.performance,
          accessibility: result.scores.accessibility,
          best_practices: result.scores.best_practices,
          seo_score: result.scores.seo,
          lcp: result.metrics.lcp?.displayValue,
          cls: result.metrics.cls?.displayValue,
          fcp: result.metrics.fcp?.displayValue,
          tbt: result.metrics.tbt?.displayValue,
          tti: result.metrics.tti?.displayValue,
          screenshot: result.screenshot,
          raw: result,
          client_id: saveClientId || null,
          website_id: saveWebsiteId || null,
          notes: saveNotes || null,
        }),
      });
      setSaveSuccess(true);
      setShowSave(false);
      setSaveNotes("");
    } catch (e: unknown) { setError(String(e)); }
    finally { setSaving(false); }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    const res = await fetch("/api/pagespeed-results");
    const data = await res.json();
    if (Array.isArray(data)) setHistory(data);
    setHistoryLoading(false);
  }

  async function deleteResult(id: string) {
    await fetch(`/api/pagespeed-results?id=${id}`, { method: "DELETE" });
    setHistory(h => h.filter(r => r.id !== id));
  }

  const totalScore = result
    ? Math.round((result.scores.performance + result.scores.accessibility + result.scores.best_practices + result.scores.seo) / 4)
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Zap className="text-yellow-500" size={26} /> PageSpeed Insights
          </h1>
          <p className="text-slate-500 text-sm mt-1">Google Core Web Vitals, performance score, and optimization opportunities</p>
        </div>
        <button
          onClick={() => { setShowHistory(true); loadHistory(); }}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
        >
          <History size={15} /> History
        </button>
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="url" value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && run()}
              placeholder="https://example.com"
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStrategy("mobile")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${strategy === "mobile" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
              <Smartphone size={15} /> Mobile
            </button>
            <button onClick={() => setStrategy("desktop")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${strategy === "desktop" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
              <Monitor size={15} /> Desktop
            </button>
            <button onClick={run} disabled={loading || !url.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all">
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> 90–100 Good</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> 50–89 Needs Improvement</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> 0–49 Poor</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle2 size={16} /> Result saved successfully!
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center animate-pulse">
            <Zap size={28} className="text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-slate-700 font-medium">Running PageSpeed analysis...</p>
            <p className="text-slate-400 text-sm mt-1">This usually takes 15–30 seconds</p>
          </div>
        </div>
      )}

      {result && (
        <>
          {/* Scores */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {result.screenshot && (
                <img src={result.screenshot} alt="Screenshot" className="w-32 rounded-lg border border-slate-200 shadow-sm" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-700 truncate max-w-xs">{result.url}</span>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                    <ExternalLink size={13} />
                  </a>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${strategy === "mobile" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"}`}>
                    {result.strategy === "mobile" ? "Mobile" : "Desktop"}
                  </span>
                </div>
                {totalScore !== null && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-slate-500 text-sm">Overall:</span>
                    <span className={`text-lg font-bold ${SCORE_COLOR(totalScore).text}`}>{totalScore}/100</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${SCORE_COLOR(totalScore).bar}`} style={{ width: `${totalScore}%` }} />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <ScoreRing score={result.scores.performance} label="Performance" />
                  <ScoreRing score={result.scores.accessibility} label="Accessibility" />
                  <ScoreRing score={result.scores.best_practices} label="Best Practices" />
                  <ScoreRing score={result.scores.seo} label="SEO" />
                </div>
              </div>
            </div>
            {/* Save button */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowSave(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-all">
                <Save size={14} /> Save Result
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
            {(["overview", "opportunities", "diagnostics"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
                {tab}
                {tab === "opportunities" && result.opportunities.length > 0 && (
                  <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">{result.opportunities.length}</span>
                )}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <BarChart3 size={15} className="text-blue-500" /> Core Web Vitals (Field Data)
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(CWV_LABELS).map(([key, meta]) => (
                    <CWVBadge key={key} value={result.cwv[key]} meta={meta} />
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                  <Info size={11} /> Field data from real Chrome users over 28 days
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Clock size={15} className="text-purple-500" /> Lab Metrics (Lighthouse)
                </h2>
                <MetricRow label="First Contentful Paint" metric={result.metrics.fcp} />
                <MetricRow label="Largest Contentful Paint" metric={result.metrics.lcp} />
                <MetricRow label="Total Blocking Time" metric={result.metrics.tbt} />
                <MetricRow label="Cumulative Layout Shift" metric={result.metrics.cls} />
                <MetricRow label="Speed Index" metric={result.metrics.si} />
                <MetricRow label="Time to Interactive" metric={result.metrics.tti} />
              </div>
            </div>
          )}

          {activeTab === "opportunities" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Zap size={15} className="text-amber-500" /> Opportunities
                </h2>
              </div>
              {result.opportunities.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                  <CheckCircle2 size={28} className="text-green-400" /> No major opportunities found!
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {result.opportunities.map(op => (
                    <div key={op.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{op.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{op.description}</p>
                        </div>
                        {op.displayValue && (
                          <span className="shrink-0 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">{op.displayValue}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "diagnostics" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-500" /> Diagnostics
                </h2>
              </div>
              {result.diagnostics.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                  <CheckCircle2 size={28} className="text-green-400" /> No diagnostic issues found.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {result.diagnostics.map(d => {
                    const score = d.score ?? 0;
                    const icon = score >= 0.9 ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      : score >= 0.5 ? <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                      : <AlertCircle size={16} className="text-red-500 shrink-0" />;
                    return (
                      <div key={d.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                        {icon}
                        <span className="flex-1 text-sm text-slate-700">{d.title}</span>
                        {d.displayValue && <span className="text-xs text-slate-500 font-medium">{d.displayValue}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Save Modal */}
      {showSave && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Save Result</h2>
              <button onClick={() => setShowSave(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Link to Client (optional)</label>
                <select value={saveClientId} onChange={e => setSaveClientId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— No client —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {websites.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">Link to Website (optional)</label>
                  <select value={saveWebsiteId} onChange={e => setSaveWebsiteId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">— No website —</option>
                    {websites.map(w => <option key={w.id} value={w.id}>{w.name || w.url}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Notes (optional)</label>
                <textarea value={saveNotes} onChange={e => setSaveNotes(e.target.value)}
                  rows={3} placeholder="e.g. Before optimization, after fixing images..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              {/* Score preview */}
              {result && (
                <div className="bg-slate-50 rounded-xl p-3 flex gap-3 flex-wrap">
                  <span className="text-xs text-slate-500">Scores:</span>
                  <span className="text-xs text-slate-600">Perf: <ScoreBadge score={result.scores.performance} /></span>
                  <span className="text-xs text-slate-600">SEO: <ScoreBadge score={result.scores.seo} /></span>
                  <span className="text-xs text-slate-600">A11y: <ScoreBadge score={result.scores.accessibility} /></span>
                  <span className="text-xs text-slate-600">BP: <ScoreBadge score={result.scores.best_practices} /></span>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveResult} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all">
                <Save size={14} /> {saving ? "Saving..." : "Save Result"}
              </button>
              <button onClick={() => setShowSave(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <History size={18} /> Saved Results
              </h2>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {historyLoading ? (
                <div className="p-10 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin" /> Loading...
                </div>
              ) : history.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm">No saved results yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {history.map(r => (
                    <div key={r.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-800 truncate">{r.url}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${r.strategy === "mobile" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                              {r.strategy}
                            </span>
                          </div>
                          <div className="flex gap-2 mb-1.5 flex-wrap">
                            <ScoreBadge score={r.performance} />
                            <span className="text-xs text-slate-400">Perf</span>
                            <ScoreBadge score={r.seo_score} />
                            <span className="text-xs text-slate-400">SEO</span>
                            <ScoreBadge score={r.accessibility} />
                            <span className="text-xs text-slate-400">A11y</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            {r.clients?.name && <span>Client: {r.clients.name}</span>}
                            {r.websites?.url && <span>Site: {r.websites.name || r.websites.url}</span>}
                            <span>{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                          {r.notes && <p className="text-xs text-slate-500 mt-1 italic">{r.notes}</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => { setUrl(r.url); setStrategy(r.strategy as "mobile"|"desktop"); setShowHistory(false); }}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1">
                            <RefreshCw size={11} /> Re-run
                          </button>
                          <button onClick={() => deleteResult(r.id)}
                            className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
