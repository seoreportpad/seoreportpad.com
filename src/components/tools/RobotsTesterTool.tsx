"use client";
import { useState } from "react";
import { Search, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface TestResult {
  url: string;
  allowed: boolean;
  matchedRule: string;
  userAgent: string;
}

function parseRobotsTxt(content: string, userAgent: string, url: string): { allowed: boolean; matchedRule: string } {
  const lines = content.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
  let currentUA = "*";
  let applicable: { type: "allow" | "disallow"; path: string }[] = [];
  let defaultRules: { type: "allow" | "disallow"; path: string }[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith("user-agent:")) {
      currentUA = line.split(":")[1]?.trim() || "*";
      continue;
    }
    if (lower.startsWith("allow:")) {
      const path = line.split(":")[1]?.trim() || "/";
      if (currentUA.toLowerCase() === userAgent.toLowerCase() || currentUA === "*") {
        const rule = { type: "allow" as const, path };
        if (currentUA === "*") defaultRules.push(rule);
        else applicable.push(rule);
      }
    }
    if (lower.startsWith("disallow:")) {
      const path = line.split(":")[1]?.trim() || "";
      if (currentUA.toLowerCase() === userAgent.toLowerCase() || currentUA === "*") {
        const rule = { type: "disallow" as const, path };
        if (currentUA === "*") defaultRules.push(rule);
        else applicable.push(rule);
      }
    }
  }

  const rules = applicable.length > 0 ? applicable : defaultRules;
  let urlPath = url;
  try { urlPath = new URL(url).pathname; } catch {}

  let matched: { type: "allow" | "disallow"; path: string } = { type: "allow", path: "/" };
  let matchLen = 0;

  for (const rule of rules) {
    if (!rule.path) continue;
    const pattern = rule.path.replace(/\*/g, ".*").replace(/\?/g, "\\?");
    try {
      if (new RegExp("^" + pattern).test(urlPath) && rule.path.length > matchLen) {
        matched = rule;
        matchLen = rule.path.length;
      }
    } catch {}
  }

  return {
    allowed: matched.type === "allow",
    matchedRule: matchLen > 0 ? `${matched.type === "allow" ? "Allow" : "Disallow"}: ${matched.path}` : "No matching rule (allowed by default)",
  };
}

export function RobotsTesterTool() {
  const [robotsContent, setRobotsContent] = useState("");
  const [testUrl, setTestUrl] = useState("");
  const [userAgent, setUserAgent] = useState("Googlebot");
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchUrl, setFetchUrl] = useState("");

  const commonBots = ["Googlebot", "Bingbot", "Slurp", "DuckDuckBot", "Baiduspider", "*"];

  const fetchRobots = async () => {
    if (!fetchUrl) return;
    setLoading(true);
    try {
      let base = fetchUrl.trim();
      if (!base.startsWith("http")) base = "https://" + base;
      const origin = new URL(base).origin;
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(origin + "/robots.txt")}`);
      const text = await res.text();
      setRobotsContent(text);
    } catch {
      setRobotsContent("# Could not fetch robots.txt — paste it manually below");
    }
    setLoading(false);
  };

  const testSingle = () => {
    if (!testUrl || !robotsContent) return;
    const result = parseRobotsTxt(robotsContent, userAgent, testUrl);
    setResults(prev => [{ url: testUrl, ...result, userAgent }, ...prev.filter(r => r.url !== testUrl || r.userAgent !== userAgent)]);
  };

  const inp = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-5">
      {/* Fetch robots.txt */}
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Fetch robots.txt from website</label>
        <div className="flex gap-2">
          <input value={fetchUrl} onChange={e => setFetchUrl(e.target.value)} placeholder="https://example.com"
            className={inp} onKeyDown={e => e.key === "Enter" && fetchRobots()} />
          <button onClick={fetchRobots} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Fetch
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Robots.txt content */}
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">robots.txt Content</label>
          <textarea value={robotsContent} onChange={e => setRobotsContent(e.target.value)} rows={12}
            placeholder={"User-agent: *\nDisallow: /admin/\nAllow: /\n\nSitemap: https://example.com/sitemap.xml"}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono" />
        </div>

        {/* Test panel */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">URL to Test</label>
            <input value={testUrl} onChange={e => setTestUrl(e.target.value)}
              placeholder="https://example.com/admin/page" className={inp} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">User-Agent</label>
            <div className="flex gap-2">
              <select value={userAgent} onChange={e => setUserAgent(e.target.value)} className={inp}>
                {commonBots.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <button onClick={testSingle}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
            Test URL
          </button>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className={`rounded-xl p-3 border ${r.allowed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {r.allowed
                      ? <CheckCircle size={15} className="text-green-600 shrink-0" />
                      : <XCircle size={15} className="text-red-600 shrink-0" />}
                    <span className={`text-xs font-bold ${r.allowed ? "text-green-700" : "text-red-700"}`}>
                      {r.allowed ? "ALLOWED" : "BLOCKED"} — {r.userAgent}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono truncate">{r.url}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={10} /> {r.matchedRule}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
