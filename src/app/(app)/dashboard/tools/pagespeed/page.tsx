"use client";
import { useState } from "react";
import {
  Zap, Monitor, Smartphone, Search, AlertCircle, CheckCircle2,
  AlertTriangle, Clock, BarChart3, RefreshCw, ExternalLink, Info,
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

const SCORE_COLOR = (s: number) =>
  s >= 90 ? { ring: "ring-green-500", text: "text-green-600", bg: "bg-green-50", bar: "bg-green-500" }
  : s >= 50 ? { ring: "ring-amber-400", text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-400" }
  : { ring: "ring-red-500", text: "text-red-600", bg: "bg-red-50", bar: "bg-red-500" };

const CWV_LABELS: Record<string, { label: string; unit: string; good: number; needs: number }> = {
  fcp:  { label: "FCP",  unit: "ms", good: 1800,  needs: 3000  },
  lcp:  { label: "LCP",  unit: "ms", good: 2500,  needs: 4000  },
  cls:  { label: "CLS",  unit: "",   good: 0.1,   needs: 0.25  },
  fid:  { label: "FID",  unit: "ms", good: 100,   needs: 300   },
  inp:  { label: "INP",  unit: "ms", good: 200,   needs: 500   },
  ttfb: { label: "TTFB", unit: "ms", good: 800,   needs: 1800  },
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

  async function run() {
    if (!url.trim()) return;
    let target = url.trim();
    if (!target.startsWith("http")) target = "https://" + target;

    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`/api/pagespeed?url=${encodeURIComponent(target)}&strategy=${strategy}`);
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResult(data);
      setActiveTab("overview");
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  const totalScore = result
    ? Math.round((result.scores.performance + result.scores.accessibility + result.scores.best_practices + result.scores.seo) / 4)
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Zap className="text-yellow-500" size={26} /> PageSpeed Insights
        </h1>
        <p className="text-slate-500 text-sm mt-1">Google Core Web Vitals, performance score, and optimization opportunities</p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && run()}
              placeholder="https://example.com"
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStrategy("mobile")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${strategy === "mobile" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
            >
              <Smartphone size={15} /> Mobile
            </button>
            <button
              onClick={() => setStrategy("desktop")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${strategy === "desktop" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
            >
              <Monitor size={15} /> Desktop
            </button>
            <button
              onClick={run}
              disabled={loading || !url.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all"
            >
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
          {/* Scores + overall */}
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
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
            {(["overview", "opportunities", "diagnostics"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab}
                {tab === "opportunities" && result.opportunities.length > 0 && (
                  <span className="ml-1.5 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">{result.opportunities.length}</span>
                )}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Core Web Vitals */}
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

              {/* Lab Metrics */}
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
                  <Zap size={15} className="text-amber-500" /> Opportunities — Potential savings
                </h2>
              </div>
              {result.opportunities.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                  <CheckCircle2 size={28} className="text-green-400" />
                  No major opportunities found — great job!
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
                          <span className="shrink-0 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                            {op.displayValue}
                          </span>
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
                  <CheckCircle2 size={28} className="text-green-400" />
                  No diagnostic issues found.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {result.diagnostics.map(d => {
                    const score = d.score ?? 0;
                    const icon = score >= 0.9
                      ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      : score >= 0.5
                      ? <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                      : <AlertCircle size={16} className="text-red-500 shrink-0" />;
                    return (
                      <div key={d.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                        {icon}
                        <span className="flex-1 text-sm text-slate-700">{d.title}</span>
                        {d.displayValue && (
                          <span className="text-xs text-slate-500 font-medium">{d.displayValue}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
