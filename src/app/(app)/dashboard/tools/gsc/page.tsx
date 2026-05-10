"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Search, TrendingUp, MousePointerClick, Eye, BarChart3,
  RefreshCw, Link2, ExternalLink, AlertCircle, CheckCircle2,
  ChevronUp, ChevronDown, Minus, Globe, FileText, Unlink,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

type Client = { id: string; name: string; website?: string };
type Site = { siteUrl: string; permissionLevel: string };
type KeywordRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
type PageRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
type TrendRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

function PositionBadge({ pos }: { pos: number }) {
  const p = Math.round(pos);
  const color = p <= 3 ? "bg-green-100 text-green-700" : p <= 10 ? "bg-blue-100 text-blue-700" : p <= 20 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500";
  const arrow = pos <= 3 ? <ChevronUp size={11} /> : pos <= 10 ? <Minus size={11} /> : <ChevronDown size={11} />;
  return <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{arrow} #{p}</span>;
}

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <div className="text-2xl font-black text-slate-800">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

function GSCContent() {
  const searchParams = useSearchParams();
  const connectedParam = searchParams.get("connected");
  const errorParam = searchParams.get("error");

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [connected, setConnected] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteUrl, setSiteUrl] = useState("");
  const [range, setRange] = useState("28");
  const [tab, setTab] = useState<"keywords" | "pages" | "trends">("keywords");
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [trends, setTrends] = useState<TrendRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(errorParam || "");
  const [successMsg, setSuccessMsg] = useState(connectedParam ? "Google Search Console connected successfully!" : "");

  // Load clients
  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setClients(d);
    });
  }, []);

  // Auto-select connected client
  useEffect(() => {
    if (connectedParam) setClientId(connectedParam);
  }, [connectedParam]);

  // Check connection status when client changes
  const checkStatus = useCallback(async (cid: string) => {
    if (!cid) return;
    setLoading(true);
    const res = await fetch(`/api/gsc?clientId=${cid}&action=status`);
    const data = await res.json();
    setConnected(data.connected);
    setLoading(false);
    if (data.connected) loadSites(cid);
  }, []);

  useEffect(() => { checkStatus(clientId); }, [clientId, checkStatus]);

  async function loadSites(cid: string) {
    const res = await fetch(`/api/gsc?clientId=${cid}&action=sites`);
    const data = await res.json();
    if (data.sites) {
      setSites(data.sites);
      if (data.sites.length > 0 && !siteUrl) setSiteUrl(data.sites[0].siteUrl);
    }
  }

  async function loadData() {
    if (!clientId || !siteUrl) return;
    setLoadingData(true); setError("");
    const end = new Date(); end.setDate(end.getDate() - 1);
    const start = new Date(); start.setDate(start.getDate() - parseInt(range));
    const s = start.toISOString().split("T")[0];
    const e = end.toISOString().split("T")[0];
    try {
      const [kwRes, pgRes, trRes] = await Promise.all([
        fetch(`/api/gsc?clientId=${clientId}&action=performance&siteUrl=${encodeURIComponent(siteUrl)}&startDate=${s}&endDate=${e}`),
        fetch(`/api/gsc?clientId=${clientId}&action=pages&siteUrl=${encodeURIComponent(siteUrl)}&startDate=${s}&endDate=${e}`),
        fetch(`/api/gsc?clientId=${clientId}&action=overview&siteUrl=${encodeURIComponent(siteUrl)}&startDate=${s}&endDate=${e}`),
      ]);
      const [kw, pg, tr] = await Promise.all([kwRes.json(), pgRes.json(), trRes.json()]);
      if (kw.rows) setKeywords(kw.rows);
      if (pg.rows) setPages(pg.rows);
      if (tr.rows) setTrends(tr.rows);
    } catch (e: unknown) { setError(String(e)); }
    finally { setLoadingData(false); }
  }

  useEffect(() => { if (connected && siteUrl) loadData(); }, [connected, siteUrl, range]);

  async function disconnect() {
    if (!clientId) return;
    await fetch(`/api/gsc?clientId=${clientId}`, { method: "DELETE" });
    setConnected(false); setSites([]); setSiteUrl(""); setKeywords([]); setPages([]); setTrends([]);
  }

  const totals = trends.reduce((acc, r) => ({
    clicks: acc.clicks + r.clicks,
    impressions: acc.impressions + r.impressions,
  }), { clicks: 0, impressions: 0 });
  const avgCtr = keywords.length ? (keywords.reduce((s, r) => s + r.ctr, 0) / keywords.length * 100).toFixed(1) : "0";
  const avgPos = keywords.length ? (keywords.reduce((s, r) => s + r.position, 0) / keywords.length).toFixed(1) : "0";

  const trendData = trends.map(r => ({
    date: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Search className="text-blue-500" size={26} /> Google Search Console
        </h1>
        <p className="text-slate-500 text-sm mt-1">Real clicks, impressions, CTR and keyword rankings from your clients' GSC data</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={16} /> {error === "access_denied" ? "Google access was denied. Please try again." : error}
        </div>
      )}

      {/* Client selector + connect */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Select Client</label>
            <select
              value={clientId}
              onChange={e => { setClientId(e.target.value); setConnected(false); setSites([]); setSiteUrl(""); }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Choose a client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {clientId && !connected && (
            <a
              href={`/api/auth/google?clientId=${clientId}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.316 0-9.828-3.319-11.395-7.99l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C42.021 35.592 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
              </svg>
              Connect Google Account
            </a>
          )}

          {clientId && connected && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium bg-green-50 border border-green-200 px-3 py-2 rounded-xl">
                <CheckCircle2 size={14} /> Connected
              </span>
              <button onClick={disconnect} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors px-3 py-2 border border-slate-200 rounded-xl hover:border-red-200">
                <Unlink size={13} /> Disconnect
              </button>
            </div>
          )}

          {loading && <div className="flex items-center gap-2 text-slate-400 text-sm"><RefreshCw size={14} className="animate-spin" /> Checking...</div>}
        </div>

        {connected && sites.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Property / Site</label>
              <select
                value={siteUrl}
                onChange={e => setSiteUrl(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sites.map(s => <option key={s.siteUrl} value={s.siteUrl}>{s.siteUrl}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Date Range</label>
              <select value={range} onChange={e => setRange(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="7">Last 7 days</option>
                <option value="28">Last 28 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={loadData} disabled={loadingData}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all">
                <RefreshCw size={14} className={loadingData ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {connected && siteUrl && keywords.length > 0 && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Clicks" value={totals.clicks.toLocaleString()} sub={`Last ${range} days`} icon={MousePointerClick} color="bg-blue-500" />
            <StatCard label="Impressions" value={totals.impressions.toLocaleString()} sub={`Last ${range} days`} icon={Eye} color="bg-purple-500" />
            <StatCard label="Avg CTR" value={`${avgCtr}%`} sub="Click-through rate" icon={TrendingUp} color="bg-green-500" />
            <StatCard label="Avg Position" value={`#${avgPos}`} sub="Search ranking" icon={BarChart3} color="bg-amber-500" />
          </div>

          {/* Trend Chart */}
          {trendData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Clicks & Impressions Over Time</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: unknown, n: unknown) => [(v as number).toLocaleString(), n as string]} labelFormatter={(l: unknown) => `Date: ${l}`} />
                  <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={false} name="Clicks" />
                  <Line yAxisId="right" type="monotone" dataKey="impressions" stroke="#a855f7" strokeWidth={2} dot={false} name="Impressions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
            {(["keywords", "pages", "trends"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
                {t === "keywords" ? `Keywords (${keywords.length})` : t === "pages" ? `Top Pages (${pages.length})` : "Trends"}
              </button>
            ))}
          </div>

          {/* Keywords table */}
          {tab === "keywords" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <Search size={15} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Top Keywords by Clicks</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3">Keyword</th>
                      <th className="text-right px-4 py-3">Clicks</th>
                      <th className="text-right px-4 py-3">Impressions</th>
                      <th className="text-right px-4 py-3">CTR</th>
                      <th className="text-right px-4 py-3">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {keywords.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{r.keys[0]}</td>
                        <td className="px-4 py-3 text-right text-blue-600 font-semibold">{r.clicks.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{r.impressions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">{(r.ctr * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right"><PositionBadge pos={r.position} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pages table */}
          {tab === "pages" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <FileText size={15} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Top Pages by Clicks</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3">Page URL</th>
                      <th className="text-right px-4 py-3">Clicks</th>
                      <th className="text-right px-4 py-3">Impressions</th>
                      <th className="text-right px-4 py-3">CTR</th>
                      <th className="text-right px-4 py-3">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pages.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 max-w-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 truncate text-xs font-mono">{r.keys[0]}</span>
                            <a href={r.keys[0]} target="_blank" rel="noopener noreferrer" className="shrink-0 text-slate-400 hover:text-blue-500">
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-blue-600 font-semibold">{r.clicks.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{r.impressions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">{(r.ctr * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right"><PositionBadge pos={r.position} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trends tab */}
          {tab === "trends" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <TrendingUp size={15} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Daily Performance</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="text-right px-4 py-3">Clicks</th>
                      <th className="text-right px-4 py-3">Impressions</th>
                      <th className="text-right px-4 py-3">CTR</th>
                      <th className="text-right px-4 py-3">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trends.slice().reverse().map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-700 font-medium">{r.keys[0]}</td>
                        <td className="px-4 py-3 text-right text-blue-600 font-semibold">{r.clicks.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{r.impressions.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">{(r.ctr * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right"><PositionBadge pos={r.position} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {connected && siteUrl && keywords.length === 0 && !loadingData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center gap-3 text-center shadow-sm">
          <Globe size={32} className="text-slate-300" />
          <p className="text-slate-500 font-medium">No data found for this property and date range.</p>
          <p className="text-slate-400 text-sm">Make sure the site has impressions in Search Console.</p>
        </div>
      )}

      {!clientId && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center gap-3 text-center shadow-sm">
          <Link2 size={32} className="text-slate-300" />
          <p className="text-slate-600 font-medium">Select a client to get started</p>
          <p className="text-slate-400 text-sm">Each client connects their own Google account to share their Search Console data</p>
        </div>
      )}
    </div>
  );
}

export default function GSCPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>}>
      <GSCContent />
    </Suspense>
  );
}
