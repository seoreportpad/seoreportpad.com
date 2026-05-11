"use client";
import { useState } from "react";
import {
  Globe, Search, AlertCircle, AlertTriangle, Info, CheckCircle2,
  ChevronDown, ChevronRight, Download, RotateCcw, Loader2,
  FileText, Link2, Image, Code2, Shield, Zap, BarChart3,
} from "lucide-react";
import type { CrawlReport, CrawledPage, PageIssue } from "@/app/api/crawler/route";

type IssueFilter = "all" | "error" | "warning" | "info";

const ISSUE_CFG = {
  error: { color: "text-red-600", bg: "bg-red-50 border-red-200", icon: AlertCircle },
  warning: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle },
  info: { color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Info },
};

const SCORE_COLOR = (s: number) =>
  s >= 80 ? "text-green-600 bg-green-50 border-green-200"
  : s >= 50 ? "text-amber-600 bg-amber-50 border-amber-200"
  : "text-red-600 bg-red-50 border-red-200";

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${SCORE_COLOR(score)}`}>
      {score}
    </span>
  );
}

function IssueBadge({ type, count }: { type: "error" | "warning" | "info"; count: number }) {
  if (!count) return null;
  const cfg = ISSUE_CFG[type];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon size={10} /> {count}
    </span>
  );
}

function PageRow({ page, index }: { page: CrawledPage; index: number }) {
  const [open, setOpen] = useState(false);
  const errors = page.issues.filter(i => i.type === "error").length;
  const warnings = page.issues.filter(i => i.type === "warning").length;
  const infos = page.issues.filter(i => i.type === "info").length;

  return (
    <div className={`border rounded-xl overflow-hidden ${page.status >= 400 ? "border-red-200" : "border-slate-100"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-xs text-slate-400 w-6 shrink-0">{index + 1}</span>
        <ScoreBadge score={page.score} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate">{page.url}</p>
          <p className="text-xs text-slate-400 truncate">{page.title || <span className="text-red-400 italic">No title</span>}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <IssueBadge type="error" count={errors} />
          <IssueBadge type="warning" count={warnings} />
          <IssueBadge type="info" count={infos} />
          <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${page.status >= 400 ? "text-red-600 bg-red-50" : "text-slate-500 bg-slate-50"}`}>
            {page.status}
          </span>
          <span className="text-xs text-slate-400">{page.loadMs}ms</span>
          {open ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 py-4 bg-white space-y-4">
          {/* Meta details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Title <span className="font-normal text-slate-400">({page.titleLen} chars)</span></p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2">{page.title || <span className="text-red-400 italic">missing</span>}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Meta Description <span className="font-normal text-slate-400">({page.descLen} chars)</span></p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 line-clamp-2">{page.description || <span className="text-red-400 italic">missing</span>}</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "H1", value: page.h1.length, warn: page.h1.length === 0 || page.h1.length > 1 },
              { label: "H2", value: page.h2Count },
              { label: "Words", value: page.wordCount, warn: page.wordCount < 300 },
              { label: "Images", value: page.imgTotal },
              { label: "Missing Alt", value: page.imgMissingAlt, warn: page.imgMissingAlt > 0 },
              { label: "Int. Links", value: page.internalLinks },
              { label: "Ext. Links", value: page.externalLinks },
              { label: "Schema", value: page.hasSchema ? "Yes" : "No", warn: !page.hasSchema },
            ].map(({ label, value, warn }) => (
              <div key={label} className={`rounded-lg px-3 py-2 text-center border ${warn ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}>
                <p className={`text-sm font-bold ${warn ? "text-amber-600" : "text-slate-700"}`}>{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Schema types */}
          {page.schemaTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {page.schemaTypes.map((t, i) => (
                <span key={i} className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}

          {/* Issues */}
          {page.issues.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500">Issues</p>
              {page.issues.map((issue, i) => {
                const cfg = ISSUE_CFG[issue.type];
                const Icon = cfg.icon;
                return (
                  <div key={i} className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 border ${cfg.bg} ${cfg.color}`}>
                    <Icon size={12} className="mt-0.5 shrink-0" />
                    <span><span className="font-semibold">{issue.category}:</span> {issue.message}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color = "text-slate-700", bg = "bg-white" }: {
  icon: React.ElementType; label: string; value: number | string; color?: string; bg?: string;
}) {
  return (
    <div className={`${bg} rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3`}>
      <div className="text-slate-400"><Icon size={16} /></div>
      <div>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default function CrawlerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CrawlReport | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<IssueFilter>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "errors" | "url">("score");

  const runCrawl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const res = await fetch("/api/crawler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setReport(data);
    } catch (e: any) {
      setError("Request failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = report?.pages
    .filter(p => {
      if (search && !p.url.toLowerCase().includes(search.toLowerCase()) && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === "all") return true;
      return p.issues.some(i => i.type === filter);
    })
    .sort((a, b) => {
      if (sortBy === "score") return a.score - b.score;
      if (sortBy === "errors") return b.issues.filter(i => i.type === "error").length - a.issues.filter(i => i.type === "error").length;
      return a.url.localeCompare(b.url);
    }) ?? [];

  const exportCSV = () => {
    if (!report) return;
    const rows = [
      ["URL", "Status", "Score", "Title", "Title Len", "Description", "Desc Len", "H1 Count", "H2 Count", "Words", "Img Missing Alt", "Int Links", "Ext Links", "Has Schema", "HTTPS", "Load (ms)", "Errors", "Warnings"],
    ];
    for (const p of report.pages) {
      rows.push([
        p.url, String(p.status), String(p.score),
        p.title, String(p.titleLen),
        p.description, String(p.descLen),
        String(p.h1.length), String(p.h2Count), String(p.wordCount),
        String(p.imgMissingAlt), String(p.internalLinks), String(p.externalLinks),
        p.hasSchema ? "Yes" : "No", p.isHttps ? "Yes" : "No",
        String(p.loadMs),
        String(p.issues.filter(i => i.type === "error").length),
        String(p.issues.filter(i => i.type === "warning").length),
      ]);
    }
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `SEO-Crawl-${new URL(report.url).hostname}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Website SEO Crawler</h1>
        <p className="text-slate-500 text-sm mt-1">Crawl your entire site and get a full SEO audit — up to 60 pages</p>
      </div>

      {/* URL input */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && runCrawl()}
              placeholder="https://example.com"
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <button
            onClick={runCrawl}
            disabled={loading || !url.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            {loading ? "Crawling…" : "Crawl Site"}
          </button>
          {report && (
            <button
              onClick={() => { setReport(null); setUrl(""); }}
              className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <RotateCcw size={14} /> New
            </button>
          )}
        </div>
        {loading && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
              <Loader2 size={14} className="animate-spin" />
              Crawling pages… this may take 30-60 seconds depending on site size
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
          </div>
        )}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>

      {report && (
        <>
          {/* Summary header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-semibold text-slate-700 text-lg">
                {new URL(report.url).hostname}
                <span className="ml-2 text-sm font-normal text-slate-400">{report.totalPages} pages crawled</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Crawled {new Date(report.crawledAt).toLocaleString()}</p>
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-sm transition-colors shadow-sm"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* Overall score */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={report.summary.avgScore >= 80 ? "#22c55e" : report.summary.avgScore >= 50 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="3"
                    strokeDasharray={`${report.summary.avgScore} ${100 - report.summary.avgScore}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${report.summary.avgScore >= 80 ? "text-green-600" : report.summary.avgScore >= 50 ? "text-amber-600" : "text-red-600"}`}>
                    {report.summary.avgScore}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-700 mb-3">Average SEO Score</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-red-600">{report.summary.errors}</p>
                    <p className="text-xs text-slate-400">Errors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-amber-600">{report.summary.warnings}</p>
                    <p className="text-xs text-slate-400">Warnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{report.totalPages}</p>
                    <p className="text-xs text-slate-400">Pages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-red-500">{report.summary.brokenPages}</p>
                    <p className="text-xs text-slate-400">Broken (4xx)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Issue summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <SummaryCard icon={FileText} label="Missing Title" value={report.summary.missingTitle} color={report.summary.missingTitle > 0 ? "text-red-600" : "text-green-600"} bg={report.summary.missingTitle > 0 ? "bg-red-50" : "bg-white"} />
            <SummaryCard icon={FileText} label="Missing Desc" value={report.summary.missingDesc} color={report.summary.missingDesc > 0 ? "text-red-600" : "text-green-600"} bg={report.summary.missingDesc > 0 ? "bg-red-50" : "bg-white"} />
            <SummaryCard icon={FileText} label="Missing H1" value={report.summary.missingH1} color={report.summary.missingH1 > 0 ? "text-amber-600" : "text-green-600"} bg={report.summary.missingH1 > 0 ? "bg-amber-50" : "bg-white"} />
            <SummaryCard icon={Image} label="Missing Alt" value={report.summary.missingAlt} color={report.summary.missingAlt > 0 ? "text-amber-600" : "text-green-600"} bg={report.summary.missingAlt > 0 ? "bg-amber-50" : "bg-white"} />
            <SummaryCard icon={Link2} label="Dup Titles" value={report.summary.duplicateTitles} color={report.summary.duplicateTitles > 0 ? "text-amber-600" : "text-green-600"} bg={report.summary.duplicateTitles > 0 ? "bg-amber-50" : "bg-white"} />
            <SummaryCard icon={Link2} label="Dup Desc" value={report.summary.duplicateDescs} color={report.summary.duplicateDescs > 0 ? "text-amber-600" : "text-green-600"} bg={report.summary.duplicateDescs > 0 ? "bg-amber-50" : "bg-white"} />
            <SummaryCard icon={Code2} label="No Schema" value={report.summary.missingSchema} color={report.summary.missingSchema > 0 ? "text-blue-600" : "text-green-600"} />
            <SummaryCard icon={Shield} label="No Index" value={report.summary.noIndex} color={report.summary.noIndex > 0 ? "text-red-600" : "text-green-600"} bg={report.summary.noIndex > 0 ? "bg-red-50" : "bg-white"} />
          </div>

          {/* Filter + search */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter by URL or title…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-1">
              {(["all", "error", "warning", "info"] as IssueFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize ${filter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {f === "all" ? "All Pages" : f === "error" ? "Errors" : f === "warning" ? "Warnings" : "Info"}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as "score" | "errors" | "url")}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="score">Sort: Lowest Score</option>
              <option value="errors">Sort: Most Errors</option>
              <option value="url">Sort: URL A-Z</option>
            </select>
            <span className="text-xs text-slate-400 ml-auto">{filteredPages.length} pages</span>
          </div>

          {/* Pages list */}
          <div className="space-y-2">
            {filteredPages.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <BarChart3 size={36} className="mx-auto mb-3 opacity-30" />
                <p>No pages match your filter.</p>
              </div>
            ) : (
              filteredPages.map((page, i) => (
                <PageRow key={page.url} page={page} index={i} />
              ))
            )}
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="text-center py-20 text-slate-400">
          <Globe size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-base font-medium text-slate-500 mb-1">Enter a URL to start crawling</p>
          <p className="text-sm">The crawler will visit all internal pages and check each for SEO issues</p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto text-xs text-left">
            {[
              { icon: FileText, text: "Title & meta description" },
              { icon: Link2, text: "Canonical & redirects" },
              { icon: Image, text: "Image alt text" },
              { icon: Code2, text: "Schema / structured data" },
              { icon: Shield, text: "HTTPS & noindex" },
              { icon: Zap, text: "Page load time" },
              { icon: BarChart3, text: "Duplicate content" },
              { icon: Globe, text: "Internal linking" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                <Icon size={13} className="text-blue-500 shrink-0" />
                <span className="text-slate-600">{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
