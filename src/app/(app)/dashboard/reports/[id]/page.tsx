"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Download, Send, Pencil,
  TrendingUp, TrendingDown, Minus,
  Globe, Mail, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import ReportScreenshots from "@/components/ReportScreenshots";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Keyword { id: string; keyword: string; prev_ranking?: number; curr_ranking?: number; search_volume?: number; url?: string; }
interface WorkItem { id: string; category: string; task: string; }
interface Metrics {
  organic_traffic?: number; prev_traffic?: number;
  backlinks?: number; prev_backlinks?: number;
  domain_authority?: number; prev_da?: number;
  impressions?: number; clicks?: number; avg_position?: number;
  technical_fixed?: number; pages_indexed?: number;
  notes?: string; recommendations?: string;
}
interface OnPageSEO {
  title_tag?: string; title_length?: number; title_has_keyword?: boolean; title_issues?: string;
  meta_description?: string; meta_length?: number; meta_has_keyword?: boolean; meta_issues?: string;
  h1_count?: number; h1_text?: string; h2_count?: number; headings_issues?: string;
  word_count?: number; keyword_density?: number; thin_content_pages?: number; duplicate_content_pages?: number;
  total_images?: number; images_missing_alt?: number; images_large_count?: number;
  internal_links_count?: number; broken_internal_links?: number; orphan_pages?: number;
  lcp_score?: string; cls_score?: string; fid_score?: string;
  mobile_speed_score?: number; desktop_speed_score?: number;
  canonical_set?: boolean; schema_markup?: boolean; schema_types?: string;
  robots_txt_ok?: boolean; sitemap_submitted?: boolean; hreflang_set?: boolean;
  url_issues?: string; url_length_ok?: boolean;
  on_page_score?: number; issues_found?: number; issues_fixed?: number; notes?: string;
}
interface LocalSEO {
  gbp_name?: string; gbp_verified?: boolean; gbp_category?: string;
  gbp_rating?: number; gbp_reviews_total?: number; gbp_reviews_new?: number;
  gbp_photos_count?: number; gbp_posts_this_month?: number; gbp_qa_answered?: number; gbp_issues?: string;
  nap_consistent?: boolean; nap_name?: string; nap_address?: string; nap_phone?: string; nap_issues?: string;
  citations_total?: number; citations_new?: number; citations_fixed?: number;
  top_citations?: string; citations_issues?: string;
  local_keywords_tracked?: number; local_keywords_top3?: number;
  local_keywords_top10?: number; map_pack_keywords?: number;
  reviews_google?: number; reviews_yelp?: number; reviews_facebook?: number; reviews_other?: number;
  avg_rating?: number; negative_reviews?: number; review_response_rate?: number;
  local_backlinks_new?: number; local_directories?: string;
  local_schema?: boolean; location_pages?: number;
  google_maps_embedded?: boolean; local_content_published?: number;
  local_seo_score?: number; issues_found?: number; issues_fixed?: number; notes?: string;
}
interface SchemaSEO {
  has_organization?: boolean; has_local_business?: boolean; has_website?: boolean;
  has_breadcrumb?: boolean; has_article?: boolean; has_faq?: boolean;
  has_product?: boolean; has_review?: boolean; has_event?: boolean;
  has_person?: boolean; has_service?: boolean; has_howto?: boolean;
  custom_schemas?: string; schema_format?: string;
  pages_with_schema?: string; pages_missing_schema?: string;
  schema_errors?: string; schema_warnings?: string;
  rich_results_eligible?: boolean; rich_results_types?: string;
  rich_results_impressions?: string; rich_results_clicks?: string;
  google_rich_results_tested?: boolean; schema_validator_passed?: boolean;
  validation_errors?: string;
  schema_score?: string; issues_found?: string; issues_fixed?: string; notes?: string;
}
interface TechnicalSEO {
  robots_txt_ok?: boolean; sitemap_xml_ok?: boolean; sitemap_urls_count?: string;
  crawl_errors?: string; crawl_blocked_pages?: string; crawl_depth_ok?: boolean;
  total_pages_indexed?: string; pages_excluded?: string; index_coverage_errors?: string;
  index_coverage_warnings?: string; noindex_pages?: string; canonical_issues?: string;
  redirect_chains?: string; redirect_loops?: string; broken_links_count?: string;
  url_structure_ok?: boolean; url_parameters?: string; pagination_ok?: boolean;
  https_ok?: boolean; ssl_expiry?: string; mixed_content?: boolean;
  hsts_enabled?: boolean; security_headers?: boolean;
  mobile_friendly?: boolean; viewport_set?: boolean; tap_targets_ok?: boolean;
  mobile_usability_errors?: string;
  ttfb?: string; lcp?: string; cls?: string; inp?: string;
  page_size_avg?: string; render_blocking?: boolean;
  gsc_coverage_errors?: string; gsc_manual_actions?: boolean; gsc_messages?: string;
  technical_score?: string; issues_found?: string; issues_fixed?: string; notes?: string;
}
interface Report {
  id: string; month: string; year: number; status: string;
  clients: { id: string; name: string; email: string; website: string; company?: string; phone?: string };
  keywords: Keyword[];
  work_done: WorkItem[];
  metrics?: Metrics;
  on_page_seo?: OnPageSEO;
  local_seo?: LocalSEO;
  schema_seo?: SchemaSEO;
  technical_seo?: TechnicalSEO;
}

function Delta({ curr, prev, lower = false }: { curr?: number | null; prev?: number | null; lower?: boolean }) {
  if (curr == null || prev == null) return <span className="text-slate-300">—</span>;
  const diff = curr - prev;
  const better = lower ? diff < 0 : diff > 0;
  if (diff === 0) return <span className="flex items-center gap-0.5 text-slate-400 text-xs"><Minus size={11} /> 0</span>;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${better ? "text-green-600" : "text-red-500"}`}>
      {better ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {diff > 0 ? "+" : ""}{diff}
    </span>
  );
}

function MetricCard({ label, value, prev, lower, suffix = "" }: { label: string; value?: number | null; prev?: number | null; lower?: boolean; suffix?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value != null ? value.toLocaleString() + suffix : "—"}</p>
      {prev != null && value != null && (
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-slate-400">Prev: {prev.toLocaleString()}{suffix}</span>
          <Delta curr={value} prev={prev} lower={lower} />
        </div>
      )}
    </div>
  );
}

export default function ReportViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [emailModal, setEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: "", customMsg: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null)
      .then(d => { if (d && !d.error) setReport(d); });
  }, [id]);

  if (!report) return <div className="text-center py-20 text-slate-400 animate-pulse">Loading report...</div>;

  const m = report.metrics;
  const client = report.clients;

  const chartData = m ? [
    { name: "Traffic", Prev: m.prev_traffic ?? 0, Curr: m.organic_traffic ?? 0 },
    { name: "Backlinks", Prev: m.prev_backlinks ?? 0, Curr: m.backlinks ?? 0 },
    { name: "Domain Auth", Prev: m.prev_da ?? 0, Curr: m.domain_authority ?? 0 },
  ] : [];

  const workByCategory = (report.work_done ?? []).reduce<Record<string, string[]>>((acc, w) => {
    if (!acc[w.category]) acc[w.category] = [];
    acc[w.category].push(w.task);
    return acc;
  }, {});

  const downloadCSV = () => {
    const rows = [
      ["SEO Monthly Report", client.name, `${report.month} ${report.year}`],
      [],
      ["METRICS", "Current", "Previous"],
      ["Organic Traffic", m?.organic_traffic ?? "", m?.prev_traffic ?? ""],
      ["Backlinks", m?.backlinks ?? "", m?.prev_backlinks ?? ""],
      ["Domain Authority", m?.domain_authority ?? "", m?.prev_da ?? ""],
      ["Impressions", m?.impressions ?? "", ""],
      ["Clicks", m?.clicks ?? "", ""],
      ["Avg Position", m?.avg_position ?? "", ""],
      ["Technical Fixed", m?.technical_fixed ?? "", ""],
      ["Pages Indexed", m?.pages_indexed ?? "", ""],
      [],
      ["KEYWORDS", "Prev Rank", "Curr Rank", "Volume", "URL"],
      ...(report.keywords ?? []).map(k => [k.keyword, k.prev_ranking ?? "", k.curr_ranking ?? "", k.search_volume ?? "", k.url ?? ""]),
      [],
      ["WORK DONE", "Category", "Task"],
      ...(report.work_done ?? []).map(w => ["", w.category, w.task]),
      [],
      ["NOTES"], [m?.notes ?? ""],
      [],
      ["RECOMMENDATIONS"], [m?.recommendations ?? ""],
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `SEO-Report-${client.name}-${report.month}-${report.year}.csv`;
    a.click();
  };

  const sendEmail = async () => {
    setSending(true);
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:680px;margin:0 auto;color:#1e293b;background:#f8fafc;padding:20px">
        <div style="background:linear-gradient(135deg,#1e3a5f,#1d4ed8);color:white;padding:36px;border-radius:16px 16px 0 0;text-align:center">
          <h1 style="margin:0;font-size:26px;font-weight:700">Monthly SEO Report</h1>
          <p style="margin:8px 0 0;opacity:.8;font-size:15px">${report.month} ${report.year}</p>
        </div>
        <div style="background:white;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:0">
          <p style="font-size:15px">Dear <strong>${client.name}</strong>,</p>
          <p style="color:#475569">${emailForm.customMsg || "Please find your SEO performance report for this month. We have been working hard to improve your online visibility and rankings."}</p>
          ${m ? `
          <h2 style="color:#1e3a5f;border-bottom:2px solid #e2e8f0;padding-bottom:10px;margin-top:28px">Key Performance Metrics</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead><tr style="background:#f1f5f9"><th style="padding:10px 14px;text-align:left;color:#64748b">Metric</th><th style="padding:10px 14px;text-align:center;color:#64748b">Current</th><th style="padding:10px 14px;text-align:center;color:#64748b">Previous</th><th style="padding:10px 14px;text-align:center;color:#64748b">Change</th></tr></thead>
            <tbody>
              <tr style="border-bottom:1px solid #f1f5f9"><td style="padding:10px 14px">Organic Traffic</td><td style="padding:10px 14px;text-align:center;font-weight:600">${m.organic_traffic?.toLocaleString() ?? "—"}</td><td style="padding:10px 14px;text-align:center;color:#94a3b8">${m.prev_traffic?.toLocaleString() ?? "—"}</td><td style="padding:10px 14px;text-align:center;color:${(m.organic_traffic ?? 0) >= (m.prev_traffic ?? 0) ? "#16a34a" : "#dc2626"}">${m.organic_traffic != null && m.prev_traffic != null ? ((m.organic_traffic - m.prev_traffic) >= 0 ? "+" : "") + (m.organic_traffic - m.prev_traffic).toLocaleString() : "—"}</td></tr>
              <tr style="border-bottom:1px solid #f1f5f9"><td style="padding:10px 14px">Backlinks</td><td style="padding:10px 14px;text-align:center;font-weight:600">${m.backlinks?.toLocaleString() ?? "—"}</td><td style="padding:10px 14px;text-align:center;color:#94a3b8">${m.prev_backlinks?.toLocaleString() ?? "—"}</td><td style="padding:10px 14px;text-align:center;color:${(m.backlinks ?? 0) >= (m.prev_backlinks ?? 0) ? "#16a34a" : "#dc2626"}">${m.backlinks != null && m.prev_backlinks != null ? ((m.backlinks - m.prev_backlinks) >= 0 ? "+" : "") + (m.backlinks - m.prev_backlinks).toLocaleString() : "—"}</td></tr>
              <tr style="border-bottom:1px solid #f1f5f9"><td style="padding:10px 14px">Domain Authority</td><td style="padding:10px 14px;text-align:center;font-weight:600">${m.domain_authority ?? "—"}</td><td style="padding:10px 14px;text-align:center;color:#94a3b8">${m.prev_da ?? "—"}</td><td style="padding:10px 14px;text-align:center;color:${(m.domain_authority ?? 0) >= (m.prev_da ?? 0) ? "#16a34a" : "#dc2626"}">${m.domain_authority != null && m.prev_da != null ? ((m.domain_authority - m.prev_da) >= 0 ? "+" : "") + (m.domain_authority - m.prev_da) : "—"}</td></tr>
            </tbody>
          </table>` : ""}
          ${m?.notes ? `<h2 style="color:#1e3a5f;margin-top:28px">Monthly Summary</h2><p style="color:#475569;line-height:1.7">${m.notes}</p>` : ""}
          ${m?.recommendations ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-top:20px"><h2 style="color:#1d4ed8;margin:0 0 10px">Next Month Plan</h2><p style="color:#1e40af;margin:0;line-height:1.7">${m.recommendations}</p></div>` : ""}
          <p style="margin-top:32px;color:#64748b;font-size:13px;border-top:1px solid #e2e8f0;padding-top:20px">Best regards,<br/><strong>Muhammad Ismail</strong><br/>SEO Specialist</p>
        </div>
      </div>`;

    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: client.email,
        subject: emailForm.subject || `SEO Report — ${report.month} ${report.year} | ${client.name}`,
        html,
      }),
    });
    const data = await res.json();
    setSending(false);
    if (data.success) {
      await fetch(`/api/reports/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...report, status: "sent", keywords: report.keywords, work_done: report.work_done, metrics: report.metrics }),
      });
      setReport({ ...report, status: "sent" });
      setEmailModal(false);
      alert("Email sent successfully!");
    } else {
      alert("Error: " + data.error);
    }
  };

  return (
    <>
      <style>{`@media print { .no-print { display: none !important; } @page { margin: 1cm; } }`}</style>

      {/* Top bar */}
      <div className="no-print flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Reports
        </button>
        <div className="flex gap-2">
          <button onClick={downloadCSV} className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 px-3.5 py-2 rounded-xl text-sm hover:bg-slate-50 transition-colors">
            <Download size={15} /> CSV
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 px-3.5 py-2 rounded-xl text-sm hover:bg-slate-50 transition-colors">
            <Download size={15} /> PDF
          </button>
          <button onClick={() => setEmailModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm">
            <Send size={15} /> Email Client
          </button>
          <Link href={`/dashboard/reports/${id}/edit`} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-slate-700 transition-colors">
            <Pencil size={15} /> Edit
          </Link>
        </div>
      </div>

      {/* Report body */}
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Hero header */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-blue-900 text-white rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
          <div className="relative flex justify-between items-start">
            <div>
              <span className="inline-block bg-blue-500/30 text-blue-200 text-xs px-3 py-1 rounded-full mb-3 border border-blue-400/20">
                Monthly SEO Report
              </span>
              <h1 className="text-3xl font-bold text-white">{client.name}</h1>
              {client.company && <p className="text-slate-300 mt-1">{client.company}</p>}
              <div className="flex items-center gap-4 mt-3">
                <a href={client.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white">
                  <Globe size={14} /> {client.website}
                </a>
                <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white">
                  <Mail size={14} /> {client.email}
                </a>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{report.month}</p>
              <p className="text-blue-300 text-lg">{report.year}</p>
              <span className={`inline-block mt-3 text-xs px-3 py-1.5 rounded-full font-semibold ${
                report.status === "sent" ? "bg-green-500/20 text-green-300 border border-green-400/30"
                : report.status === "ready" ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
              }`}>
                {report.status === "sent" ? "✓ Sent" : report.status === "ready" ? "Ready" : "Draft"}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics grid */}
        {m && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard label="Organic Traffic" value={m.organic_traffic} prev={m.prev_traffic} />
              <MetricCard label="Backlinks" value={m.backlinks} prev={m.prev_backlinks} />
              <MetricCard label="Domain Authority" value={m.domain_authority} prev={m.prev_da} />
              <MetricCard label="Avg. Position" value={m.avg_position} prev={undefined} lower suffix="" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="Impressions" value={m.impressions} />
              <MetricCard label="Clicks" value={m.clicks} />
              <MetricCard label="Technical Issues Fixed" value={m.technical_fixed} />
            </div>

            {/* Chart */}
            {(m.organic_traffic || m.backlinks || m.domain_authority) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-700 mb-5">Performance Comparison</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="Prev" name="Previous" fill="#cbd5e1" radius={[6,6,0,0]} />
                    <Bar dataKey="Curr" name="Current" fill="#3b82f6" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {m.notes && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-700 mb-3">Monthly Summary</h2>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{m.notes}</p>
              </div>
            )}
          </>
        )}

        {/* Keywords */}
        {(report.keywords ?? []).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-700 mb-4">Keyword Rankings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Keyword", "Previous", "Current", "Change", "Volume"].map(h => (
                      <th key={h} className={`py-2 text-slate-500 font-medium text-xs ${h === "Keyword" ? "text-left" : "text-center"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(report.keywords ?? []).map((k) => {
                    const improved = k.prev_ranking != null && k.curr_ranking != null && k.curr_ranking < k.prev_ranking;
                    const worsened = k.prev_ranking != null && k.curr_ranking != null && k.curr_ranking > k.prev_ranking;
                    return (
                      <tr key={k.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {improved && <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
                            {worsened && <XCircle size={14} className="text-red-400 shrink-0" />}
                            {!improved && !worsened && <AlertCircle size={14} className="text-slate-300 shrink-0" />}
                            {k.url
                              ? <a href={k.url} target="_blank" rel="noreferrer" className="font-medium text-slate-700 hover:text-blue-600">{k.keyword}</a>
                              : <span className="font-medium text-slate-700">{k.keyword}</span>
                            }
                          </div>
                        </td>
                        <td className="py-3 text-center text-slate-400">{k.prev_ranking ?? "—"}</td>
                        <td className="py-3 text-center font-semibold text-slate-700">{k.curr_ranking ?? "—"}</td>
                        <td className="py-3 text-center">
                          <div className="flex justify-center">
                            <Delta curr={k.curr_ranking} prev={k.prev_ranking} lower />
                          </div>
                        </td>
                        <td className="py-3 text-center text-slate-400">{k.search_volume?.toLocaleString() ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Work done */}
        {Object.keys(workByCategory).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-700 mb-5">Work Done This Month</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {Object.entries(workByCategory).map(([cat, tasks]) => (
                <div key={cat}>
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">{cat}</h3>
                  <ul className="space-y-1.5">
                    {tasks.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* On-Page SEO Section */}
        {report.on_page_seo && (() => {
          const op = report.on_page_seo!;
          const scoreColor = op.on_page_score != null
            ? op.on_page_score >= 80 ? "text-green-600 bg-green-50 border-green-200"
            : op.on_page_score >= 60 ? "text-amber-600 bg-amber-50 border-amber-200"
            : "text-red-600 bg-red-50 border-red-200" : "";
          const vitalsChip = (v?: string) => !v ? null : (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${v === "Good" ? "bg-green-100 text-green-700" : v === "Needs Improvement" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{v}</span>
          );
          const boolChip = (v?: boolean, goodTrue = true) => v == null ? null : (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${(goodTrue ? v : !v) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{v ? "Yes" : "No"}</span>
          );
          return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-700">On-Page SEO Analysis</h2>
                {op.on_page_score != null && (
                  <div className={`flex items-center gap-2 border rounded-xl px-4 py-2 ${scoreColor}`}>
                    <span className="text-2xl font-black">{op.on_page_score}</span>
                    <span className="text-sm font-medium">/100</span>
                  </div>
                )}
              </div>

              {/* Score summary */}
              {(op.issues_found != null || op.issues_fixed != null) && (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {op.issues_found != null && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-red-600">{op.issues_found}</p>
                      <p className="text-xs text-red-500 font-medium mt-0.5">Issues Found</p>
                    </div>
                  )}
                  {op.issues_fixed != null && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-green-600">{op.issues_fixed}</p>
                      <p className="text-xs text-green-500 font-medium mt-0.5">Issues Fixed</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-5">
                {/* Title */}
                {(op.title_tag || op.title_issues || op.title_length != null) && (
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Title Tags</p>
                    {op.title_tag && <p className="text-sm font-medium text-slate-800 mb-1">&ldquo;{op.title_tag}&rdquo;</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {op.title_length != null && <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{op.title_length} chars</span>}
                      {op.title_has_keyword != null && <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${op.title_has_keyword ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{op.title_has_keyword ? "✓ Has keyword" : "✗ Missing keyword"}</span>}
                    </div>
                    {op.title_issues && <p className="text-xs text-red-600 mt-2 flex items-start gap-1"><XCircle size={12} className="shrink-0 mt-0.5" /> {op.title_issues}</p>}
                  </div>
                )}

                {/* Meta */}
                {(op.meta_description || op.meta_issues || op.meta_length != null) && (
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Meta Description</p>
                    {op.meta_description && <p className="text-sm text-slate-700 italic mb-2">&ldquo;{op.meta_description}&rdquo;</p>}
                    <div className="flex flex-wrap gap-2">
                      {op.meta_length != null && <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{op.meta_length} chars</span>}
                      {op.meta_has_keyword != null && <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${op.meta_has_keyword ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{op.meta_has_keyword ? "✓ Has keyword" : "✗ Missing keyword"}</span>}
                    </div>
                    {op.meta_issues && <p className="text-xs text-red-600 mt-2 flex items-start gap-1"><XCircle size={12} className="shrink-0 mt-0.5" /> {op.meta_issues}</p>}
                  </div>
                )}

                {/* Headings + Content + Images + Links */}
                <div className="grid md:grid-cols-2 gap-3">
                  {(op.h1_count != null || op.h2_count != null || op.h1_text) && (
                    <div className="border border-slate-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Headings</p>
                      {op.h1_text && <p className="text-sm text-slate-700 mb-2">H1: &ldquo;{op.h1_text}&rdquo;</p>}
                      <div className="flex gap-3">
                        {op.h1_count != null && <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">H1: {op.h1_count}</span>}
                        {op.h2_count != null && <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">H2: {op.h2_count}</span>}
                      </div>
                      {op.headings_issues && <p className="text-xs text-red-600 mt-2">{op.headings_issues}</p>}
                    </div>
                  )}
                  {(op.word_count != null || op.keyword_density != null || op.thin_content_pages != null) && (
                    <div className="border border-slate-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Content</p>
                      <div className="space-y-1.5 text-sm text-slate-600">
                        {op.word_count != null && <p>Avg words: <strong>{op.word_count}</strong></p>}
                        {op.keyword_density != null && <p>Keyword density: <strong>{op.keyword_density}%</strong></p>}
                        {op.thin_content_pages != null && <p>Thin content pages: <strong className={op.thin_content_pages > 0 ? "text-red-600" : "text-green-600"}>{op.thin_content_pages}</strong></p>}
                        {op.duplicate_content_pages != null && <p>Duplicate pages: <strong className={op.duplicate_content_pages > 0 ? "text-amber-600" : "text-green-600"}>{op.duplicate_content_pages}</strong></p>}
                      </div>
                    </div>
                  )}
                  {(op.total_images != null || op.images_missing_alt != null) && (
                    <div className="border border-slate-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Images</p>
                      <div className="space-y-1.5 text-sm text-slate-600">
                        {op.total_images != null && <p>Total images: <strong>{op.total_images}</strong></p>}
                        {op.images_missing_alt != null && <p>Missing alt text: <strong className={op.images_missing_alt > 0 ? "text-red-600" : "text-green-600"}>{op.images_missing_alt}</strong></p>}
                        {op.images_large_count != null && <p>Unoptimized: <strong className={op.images_large_count > 0 ? "text-amber-600" : "text-green-600"}>{op.images_large_count}</strong></p>}
                      </div>
                    </div>
                  )}
                  {(op.internal_links_count != null || op.broken_internal_links != null) && (
                    <div className="border border-slate-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Internal Links</p>
                      <div className="space-y-1.5 text-sm text-slate-600">
                        {op.internal_links_count != null && <p>Total links: <strong>{op.internal_links_count}</strong></p>}
                        {op.broken_internal_links != null && <p>Broken links: <strong className={op.broken_internal_links > 0 ? "text-red-600" : "text-green-600"}>{op.broken_internal_links}</strong></p>}
                        {op.orphan_pages != null && <p>Orphan pages: <strong className={op.orphan_pages > 0 ? "text-amber-600" : "text-green-600"}>{op.orphan_pages}</strong></p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Page Speed */}
                {(op.mobile_speed_score != null || op.lcp_score || op.cls_score) && (
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Page Speed & Core Web Vitals</p>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {op.mobile_speed_score != null && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Mobile</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                              <div className={`h-2 rounded-full ${op.mobile_speed_score >= 80 ? "bg-green-500" : op.mobile_speed_score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${op.mobile_speed_score}%` }} />
                            </div>
                            <span className={`text-sm font-bold ${op.mobile_speed_score >= 80 ? "text-green-600" : op.mobile_speed_score >= 60 ? "text-amber-600" : "text-red-600"}`}>{op.mobile_speed_score}</span>
                          </div>
                        </div>
                      )}
                      {op.desktop_speed_score != null && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Desktop</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                              <div className={`h-2 rounded-full ${op.desktop_speed_score >= 80 ? "bg-green-500" : op.desktop_speed_score >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${op.desktop_speed_score}%` }} />
                            </div>
                            <span className={`text-sm font-bold ${op.desktop_speed_score >= 80 ? "text-green-600" : op.desktop_speed_score >= 60 ? "text-amber-600" : "text-red-600"}`}>{op.desktop_speed_score}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {op.lcp_score && <div className="flex items-center gap-1.5">{vitalsChip(op.lcp_score)}<span className="text-xs text-slate-500">LCP</span></div>}
                      {op.cls_score && <div className="flex items-center gap-1.5">{vitalsChip(op.cls_score)}<span className="text-xs text-slate-500">CLS</span></div>}
                      {op.fid_score && <div className="flex items-center gap-1.5">{vitalsChip(op.fid_score)}<span className="text-xs text-slate-500">INP</span></div>}
                    </div>
                  </div>
                )}

                {/* Technical */}
                <div className="border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Technical On-Page</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {op.canonical_set != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Canonical</span>{boolChip(op.canonical_set)}</div>}
                    {op.schema_markup != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Schema</span>{boolChip(op.schema_markup)}</div>}
                    {op.robots_txt_ok != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Robots.txt</span>{boolChip(op.robots_txt_ok)}</div>}
                    {op.sitemap_submitted != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Sitemap</span>{boolChip(op.sitemap_submitted)}</div>}
                    {op.hreflang_set != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Hreflang</span>{boolChip(op.hreflang_set)}</div>}
                    {op.url_length_ok != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">URLs OK</span>{boolChip(op.url_length_ok)}</div>}
                  </div>
                  {op.schema_types && <p className="text-xs text-slate-500 mt-2">Schema types: <strong className="text-slate-700">{op.schema_types}</strong></p>}
                  {op.url_issues && <p className="text-xs text-red-600 mt-1">{op.url_issues}</p>}
                </div>

                {op.notes && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">On-Page SEO Notes</p>
                    <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">{op.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Local SEO Section */}
        {report.local_seo && (() => {
          const ls = report.local_seo!;
          const scoreColor = ls.local_seo_score != null
            ? ls.local_seo_score >= 80 ? "text-green-600 bg-green-50 border-green-200"
            : ls.local_seo_score >= 60 ? "text-amber-600 bg-amber-50 border-amber-200"
            : "text-red-600 bg-red-50 border-red-200" : "";
          const boolChip = (v?: boolean, goodTrue = true) => v == null ? null : (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${(goodTrue ? v : !v) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{v ? "Yes" : "No"}</span>
          );
          const totalReviews = (ls.reviews_google ?? 0) + (ls.reviews_facebook ?? 0) + (ls.reviews_yelp ?? 0) + (ls.reviews_other ?? 0);
          return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-700">Local SEO Analysis</h2>
                {ls.local_seo_score != null && (
                  <div className={`flex items-center gap-2 border rounded-xl px-4 py-2 ${scoreColor}`}>
                    <span className="text-2xl font-black">{ls.local_seo_score}</span>
                    <span className="text-sm font-medium">/100</span>
                  </div>
                )}
              </div>

              {/* Score summary */}
              {(ls.issues_found != null || ls.issues_fixed != null) && (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {ls.issues_found != null && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-red-600">{ls.issues_found}</p>
                      <p className="text-xs text-red-500 font-medium mt-0.5">Issues Found</p>
                    </div>
                  )}
                  {ls.issues_fixed != null && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-green-600">{ls.issues_fixed}</p>
                      <p className="text-xs text-green-500 font-medium mt-0.5">Issues Fixed</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-5">
                {/* GBP */}
                {(ls.gbp_name || ls.gbp_reviews_total != null || ls.gbp_rating != null) && (
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Google Business Profile</p>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {ls.gbp_name && <span className="font-semibold text-slate-800">{ls.gbp_name}</span>}
                      {ls.gbp_verified != null && boolChip(ls.gbp_verified)}
                      {ls.gbp_category && <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{ls.gbp_category}</span>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {ls.gbp_rating != null && (
                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-yellow-600">⭐ {ls.gbp_rating}</p>
                          <p className="text-xs text-yellow-600 font-medium">Rating</p>
                        </div>
                      )}
                      {ls.gbp_reviews_total != null && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-slate-700">{ls.gbp_reviews_total}</p>
                          <p className="text-xs text-slate-500 font-medium">Total Reviews</p>
                        </div>
                      )}
                      {ls.gbp_reviews_new != null && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-green-600">+{ls.gbp_reviews_new}</p>
                          <p className="text-xs text-green-500 font-medium">New This Month</p>
                        </div>
                      )}
                      {ls.gbp_photos_count != null && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-slate-700">{ls.gbp_photos_count}</p>
                          <p className="text-xs text-slate-500 font-medium">Photos</p>
                        </div>
                      )}
                    </div>
                    {ls.gbp_issues && <p className="text-xs text-red-600 mt-2 flex items-start gap-1"><XCircle size={12} className="shrink-0 mt-0.5" /> {ls.gbp_issues}</p>}
                  </div>
                )}

                {/* NAP */}
                {(ls.nap_name || ls.nap_consistent != null) && (
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">NAP Consistency</p>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-slate-700">Consistent across web:</span>
                      {boolChip(ls.nap_consistent)}
                    </div>
                    {ls.nap_name && <p className="text-sm text-slate-600"><strong>Name:</strong> {ls.nap_name}</p>}
                    {ls.nap_address && <p className="text-sm text-slate-600"><strong>Address:</strong> {ls.nap_address}</p>}
                    {ls.nap_phone && <p className="text-sm text-slate-600"><strong>Phone:</strong> {ls.nap_phone}</p>}
                    {ls.nap_issues && <p className="text-xs text-red-600 mt-2 flex items-start gap-1"><XCircle size={12} className="shrink-0 mt-0.5" /> {ls.nap_issues}</p>}
                  </div>
                )}

                {/* Citations + Local Keywords side by side */}
                <div className="grid md:grid-cols-2 gap-3">
                  {(ls.citations_total != null || ls.citations_new != null) && (
                    <div className="border border-slate-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Local Citations</p>
                      <div className="space-y-1.5 text-sm text-slate-600">
                        {ls.citations_total != null && <p>Total: <strong>{ls.citations_total}</strong></p>}
                        {ls.citations_new != null && <p>New this month: <strong className="text-green-600">+{ls.citations_new}</strong></p>}
                        {ls.citations_fixed != null && <p>Fixed/updated: <strong>{ls.citations_fixed}</strong></p>}
                      </div>
                      {ls.top_citations && <p className="text-xs text-slate-500 mt-2">{ls.top_citations}</p>}
                      {ls.citations_issues && <p className="text-xs text-red-600 mt-1">{ls.citations_issues}</p>}
                    </div>
                  )}
                  {(ls.local_keywords_tracked != null || ls.map_pack_keywords != null) && (
                    <div className="border border-slate-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Local Keywords</p>
                      <div className="space-y-1.5 text-sm text-slate-600">
                        {ls.local_keywords_tracked != null && <p>Tracked: <strong>{ls.local_keywords_tracked}</strong></p>}
                        {ls.local_keywords_top3 != null && <p>In Top 3: <strong className="text-green-600">{ls.local_keywords_top3}</strong></p>}
                        {ls.local_keywords_top10 != null && <p>In Top 10: <strong className="text-blue-600">{ls.local_keywords_top10}</strong></p>}
                        {ls.map_pack_keywords != null && <p>Map Pack: <strong className="text-violet-600">{ls.map_pack_keywords}</strong></p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reviews */}
                {totalReviews > 0 && (
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Reviews & Reputation</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {ls.reviews_google != null && ls.reviews_google > 0 && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-blue-600">{ls.reviews_google}</p>
                          <p className="text-xs text-blue-500">Google</p>
                        </div>
                      )}
                      {ls.reviews_facebook != null && ls.reviews_facebook > 0 && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-indigo-600">{ls.reviews_facebook}</p>
                          <p className="text-xs text-indigo-500">Facebook</p>
                        </div>
                      )}
                      {ls.reviews_yelp != null && ls.reviews_yelp > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-red-500">{ls.reviews_yelp}</p>
                          <p className="text-xs text-red-400">Yelp</p>
                        </div>
                      )}
                      {ls.reviews_other != null && ls.reviews_other > 0 && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-slate-600">{ls.reviews_other}</p>
                          <p className="text-xs text-slate-400">Other</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      {ls.avg_rating != null && <span>Avg Rating: <strong className="text-yellow-600">⭐ {ls.avg_rating}</strong></span>}
                      {ls.negative_reviews != null && <span>Negative: <strong className={ls.negative_reviews > 0 ? "text-red-600" : "text-green-600"}>{ls.negative_reviews}</strong></span>}
                      {ls.review_response_rate != null && <span>Response Rate: <strong>{ls.review_response_rate}%</strong></span>}
                    </div>
                  </div>
                )}

                {/* Technical Local */}
                <div className="border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Technical Local SEO</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {ls.local_schema != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Local Schema</span>{boolChip(ls.local_schema)}</div>}
                    {ls.google_maps_embedded != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Maps Embed</span>{boolChip(ls.google_maps_embedded)}</div>}
                    {ls.location_pages != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Location Pages</span><span className="text-xs font-bold text-slate-700">{ls.location_pages}</span></div>}
                    {ls.local_content_published != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Local Content</span><span className="text-xs font-bold text-slate-700">{ls.local_content_published}</span></div>}
                  </div>
                  {ls.local_directories && <p className="text-xs text-slate-500 mt-2">Directories: <strong className="text-slate-700">{ls.local_directories}</strong></p>}
                  {ls.local_backlinks_new != null && <p className="text-xs text-slate-500 mt-1">New local backlinks: <strong className="text-green-600">+{ls.local_backlinks_new}</strong></p>}
                </div>

                {ls.notes && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Local SEO Notes</p>
                    <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap">{ls.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Schema Markup Section */}
        {report.schema_seo && (() => {
          const sc = report.schema_seo!;
          const scoreNum = sc.schema_score ? parseInt(sc.schema_score) : null;
          const scoreColor = scoreNum != null
            ? scoreNum >= 80 ? "text-green-600 bg-green-50 border-green-200"
            : scoreNum >= 60 ? "text-amber-600 bg-amber-50 border-amber-200"
            : "text-red-600 bg-red-50 border-red-200" : "";
          const boolChip = (v?: boolean, goodTrue = true) => v == null ? null : (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${(goodTrue ? v : !v) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{v ? "Yes" : "No"}</span>
          );
          const schemaTypes = [
            { key: "has_organization", label: "Organization" },
            { key: "has_local_business", label: "LocalBusiness" },
            { key: "has_website", label: "Website" },
            { key: "has_breadcrumb", label: "Breadcrumb" },
            { key: "has_article", label: "Article" },
            { key: "has_faq", label: "FAQ" },
            { key: "has_product", label: "Product" },
            { key: "has_review", label: "Review" },
            { key: "has_event", label: "Event" },
            { key: "has_person", label: "Person" },
            { key: "has_service", label: "Service" },
            { key: "has_howto", label: "HowTo" },
          ] as const;
          const activeSchemas = schemaTypes.filter(t => sc[t.key]);
          return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-700">Schema Markup Analysis</h2>
                {scoreNum != null && (
                  <div className={`flex items-center gap-2 border rounded-xl px-4 py-2 ${scoreColor}`}>
                    <span className="text-2xl font-black">{scoreNum}</span>
                    <span className="text-sm font-medium">/100</span>
                  </div>
                )}
              </div>

              {(sc.issues_found || sc.issues_fixed) && (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {sc.issues_found && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-red-600">{sc.issues_found}</p>
                      <p className="text-xs text-red-500 font-medium mt-0.5">Issues Found</p>
                    </div>
                  )}
                  {sc.issues_fixed && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-green-600">{sc.issues_fixed}</p>
                      <p className="text-xs text-green-500 font-medium mt-0.5">Issues Fixed</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-5">
                {activeSchemas.length > 0 && (
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Schema Types Implemented</p>
                    <div className="flex flex-wrap gap-2">
                      {activeSchemas.map(t => (
                        <span key={t.key} className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-medium">{t.label}</span>
                      ))}
                    </div>
                    {sc.custom_schemas && <p className="text-xs text-slate-500 mt-2">Custom: <strong className="text-slate-700">{sc.custom_schemas}</strong></p>}
                    {sc.schema_format && <p className="text-xs text-slate-500 mt-1">Format: <strong className="text-slate-700">{sc.schema_format}</strong></p>}
                  </div>
                )}

                {(sc.pages_with_schema || sc.pages_missing_schema) && (
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Coverage</p>
                    <div className="grid grid-cols-2 gap-3">
                      {sc.pages_with_schema && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-green-600">{sc.pages_with_schema}</p>
                          <p className="text-xs text-green-500 font-medium">Pages With Schema</p>
                        </div>
                      )}
                      {sc.pages_missing_schema && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-red-600">{sc.pages_missing_schema}</p>
                          <p className="text-xs text-red-500 font-medium">Pages Missing Schema</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(sc.rich_results_eligible != null || sc.rich_results_types || sc.rich_results_impressions) && (
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Rich Results</p>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-slate-600">Rich Results Eligible:</span>
                      {boolChip(sc.rich_results_eligible)}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {sc.rich_results_impressions && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-blue-600">{sc.rich_results_impressions}</p>
                          <p className="text-xs text-blue-500 font-medium">Impressions</p>
                        </div>
                      )}
                      {sc.rich_results_clicks && (
                        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-violet-600">{sc.rich_results_clicks}</p>
                          <p className="text-xs text-violet-500 font-medium">Clicks</p>
                        </div>
                      )}
                    </div>
                    {sc.rich_results_types && <p className="text-xs text-slate-500 mt-2">Types: <strong className="text-slate-700">{sc.rich_results_types}</strong></p>}
                  </div>
                )}

                <div className="border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Validation Status</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {sc.google_rich_results_tested != null && (
                      <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-slate-600">Rich Results Test</span>
                        {boolChip(sc.google_rich_results_tested)}
                      </div>
                    )}
                    {sc.schema_validator_passed != null && (
                      <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-slate-600">Validator Passed</span>
                        {boolChip(sc.schema_validator_passed)}
                      </div>
                    )}
                  </div>
                  {sc.schema_errors && <p className="text-xs text-red-600 mt-2 flex items-start gap-1"><XCircle size={12} className="shrink-0 mt-0.5" /> Errors: {sc.schema_errors}</p>}
                  {sc.schema_warnings && <p className="text-xs text-amber-600 mt-1">Warnings: {sc.schema_warnings}</p>}
                  {sc.validation_errors && <p className="text-xs text-red-600 mt-1">Validation: {sc.validation_errors}</p>}
                </div>

                {sc.notes && (
                  <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-2">Schema Markup Notes</p>
                    <p className="text-sm text-violet-800 leading-relaxed whitespace-pre-wrap">{sc.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Technical SEO Section */}
        {report.technical_seo && (() => {
          const ts = report.technical_seo!;
          const scoreNum = ts.technical_score ? parseInt(ts.technical_score) : null;
          const scoreColor = scoreNum != null
            ? scoreNum >= 80 ? "text-green-600 bg-green-50 border-green-200"
            : scoreNum >= 60 ? "text-amber-600 bg-amber-50 border-amber-200"
            : "text-red-600 bg-red-50 border-red-200" : "";
          const boolChip = (v?: boolean, goodTrue = true) => v == null ? null : (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${(goodTrue ? v : !v) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{v ? "Yes" : "No"}</span>
          );
          return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-700">Technical SEO Analysis</h2>
                {scoreNum != null && (
                  <div className={`flex items-center gap-2 border rounded-xl px-4 py-2 ${scoreColor}`}>
                    <span className="text-2xl font-black">{scoreNum}</span>
                    <span className="text-sm font-medium">/100</span>
                  </div>
                )}
              </div>

              {(ts.issues_found || ts.issues_fixed) && (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {ts.issues_found && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-red-600">{ts.issues_found}</p>
                      <p className="text-xs text-red-500 font-medium mt-0.5">Issues Found</p>
                    </div>
                  )}
                  {ts.issues_fixed && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-green-600">{ts.issues_fixed}</p>
                      <p className="text-xs text-green-500 font-medium mt-0.5">Issues Fixed</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-5">
                {/* Crawlability */}
                <div className="border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Crawlability</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-3">
                    {ts.robots_txt_ok != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Robots.txt</span>{boolChip(ts.robots_txt_ok)}</div>}
                    {ts.sitemap_xml_ok != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Sitemap.xml</span>{boolChip(ts.sitemap_xml_ok)}</div>}
                    {ts.crawl_depth_ok != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Crawl Depth</span>{boolChip(ts.crawl_depth_ok)}</div>}
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    {ts.sitemap_urls_count && <p>Sitemap URLs: <strong>{ts.sitemap_urls_count}</strong></p>}
                    {ts.crawl_errors && <p className="text-red-600">Crawl Errors: <strong>{ts.crawl_errors}</strong></p>}
                    {ts.crawl_blocked_pages && <p className="text-amber-600">Blocked Pages: <strong>{ts.crawl_blocked_pages}</strong></p>}
                  </div>
                </div>

                {/* Indexing */}
                <div className="border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Indexing</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                    {ts.total_pages_indexed && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-blue-600">{ts.total_pages_indexed}</p>
                        <p className="text-xs text-blue-500 font-medium">Pages Indexed</p>
                      </div>
                    )}
                    {ts.pages_excluded && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-amber-600">{ts.pages_excluded}</p>
                        <p className="text-xs text-amber-500 font-medium">Excluded</p>
                      </div>
                    )}
                    {ts.noindex_pages && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                        <p className="text-lg font-black text-slate-600">{ts.noindex_pages}</p>
                        <p className="text-xs text-slate-500 font-medium">Noindex</p>
                      </div>
                    )}
                  </div>
                  {ts.index_coverage_errors && <p className="text-xs text-red-600">Coverage Errors: {ts.index_coverage_errors}</p>}
                  {ts.index_coverage_warnings && <p className="text-xs text-amber-600 mt-1">Warnings: {ts.index_coverage_warnings}</p>}
                  {ts.canonical_issues && <p className="text-xs text-red-600 mt-1">Canonical Issues: {ts.canonical_issues}</p>}
                </div>

                {/* Site Architecture */}
                <div className="border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Site Architecture</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-3">
                    {ts.url_structure_ok != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">URL Structure</span>{boolChip(ts.url_structure_ok)}</div>}
                    {ts.pagination_ok != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Pagination</span>{boolChip(ts.pagination_ok)}</div>}
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    {ts.redirect_chains && <p className="text-amber-600">Redirect Chains: <strong>{ts.redirect_chains}</strong></p>}
                    {ts.redirect_loops && <p className="text-red-600">Redirect Loops: <strong>{ts.redirect_loops}</strong></p>}
                    {ts.broken_links_count && <p className="text-red-600">Broken Links: <strong>{ts.broken_links_count}</strong></p>}
                    {ts.url_parameters && <p>URL Parameters: <strong>{ts.url_parameters}</strong></p>}
                  </div>
                </div>

                {/* Security & HTTPS */}
                <div className="border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">HTTPS & Security</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {ts.https_ok != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">HTTPS</span>{boolChip(ts.https_ok)}</div>}
                    {ts.hsts_enabled != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">HSTS</span>{boolChip(ts.hsts_enabled)}</div>}
                    {ts.security_headers != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Security Headers</span>{boolChip(ts.security_headers)}</div>}
                    {ts.mixed_content != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Mixed Content</span>{boolChip(ts.mixed_content, false)}</div>}
                  </div>
                  {ts.ssl_expiry && <p className="text-xs text-slate-500 mt-2">SSL Expires: <strong className="text-slate-700">{ts.ssl_expiry}</strong></p>}
                </div>

                {/* Mobile */}
                <div className="border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Mobile Usability</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {ts.mobile_friendly != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Mobile-Friendly</span>{boolChip(ts.mobile_friendly)}</div>}
                    {ts.viewport_set != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Viewport Meta</span>{boolChip(ts.viewport_set)}</div>}
                    {ts.tap_targets_ok != null && <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"><span className="text-xs text-slate-600">Tap Targets</span>{boolChip(ts.tap_targets_ok)}</div>}
                  </div>
                  {ts.mobile_usability_errors && <p className="text-xs text-red-600 mt-2">{ts.mobile_usability_errors}</p>}
                </div>

                {/* Performance / Core Web Vitals */}
                {(ts.ttfb || ts.lcp || ts.cls || ts.inp) && (
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Performance & Core Web Vitals</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {ts.lcp && <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center"><p className="text-lg font-black text-blue-600">{ts.lcp}</p><p className="text-xs text-blue-500 font-medium">LCP</p></div>}
                      {ts.cls && <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center"><p className="text-lg font-black text-green-600">{ts.cls}</p><p className="text-xs text-green-500 font-medium">CLS</p></div>}
                      {ts.inp && <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center"><p className="text-lg font-black text-violet-600">{ts.inp}</p><p className="text-xs text-violet-500 font-medium">INP</p></div>}
                      {ts.ttfb && <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center"><p className="text-lg font-black text-slate-600">{ts.ttfb}</p><p className="text-xs text-slate-500 font-medium">TTFB</p></div>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      {ts.page_size_avg && <span>Avg Page Size: <strong>{ts.page_size_avg}</strong></span>}
                      {ts.render_blocking != null && <span>Render Blocking: <strong className={ts.render_blocking ? "text-red-600" : "text-green-600"}>{ts.render_blocking ? "Yes" : "No"}</strong></span>}
                    </div>
                  </div>
                )}

                {/* GSC */}
                {(ts.gsc_coverage_errors || ts.gsc_manual_actions != null || ts.gsc_messages) && (
                  <div className="border border-slate-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Google Search Console</p>
                    <div className="mb-2">
                      {ts.gsc_manual_actions != null && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">Manual Actions:</span>
                          {boolChip(ts.gsc_manual_actions, false)}
                        </div>
                      )}
                    </div>
                    {ts.gsc_coverage_errors && <p className="text-xs text-red-600">Coverage Errors: {ts.gsc_coverage_errors}</p>}
                    {ts.gsc_messages && <p className="text-xs text-slate-500 mt-1">Messages: {ts.gsc_messages}</p>}
                  </div>
                )}

                {ts.notes && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">Technical SEO Notes</p>
                    <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-wrap">{ts.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Screenshots */}
        <ReportScreenshots reportId={id} />

        {/* Recommendations */}
        {m?.recommendations && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Next Month Recommendations
            </h2>
            <p className="text-blue-700 text-sm leading-relaxed whitespace-pre-wrap">{m.recommendations}</p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-100 rounded-2xl p-5 text-center">
          <p className="text-slate-500 text-sm font-medium">Muhammad Ismail — SEO Specialist</p>
          <p className="text-slate-400 text-xs mt-1">Report for {client.name} · {report.month} {report.year}</p>
        </div>
      </div>

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 no-print p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Send Report via Email</h2>
            <p className="text-sm text-slate-500 mb-5">
              Will be sent to: <strong>{client.email}</strong>
              <br />
              <span className="text-xs text-slate-400">From: reports@seoreportpad.com (via Resend)</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Subject (optional)</label>
                <input placeholder={`SEO Report — ${report.month} ${report.year}`} value={emailForm.subject}
                  onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Custom Message (optional)</label>
                <textarea rows={2} placeholder="Hi, please find your monthly SEO report..." value={emailForm.customMsg}
                  onChange={e => setEmailForm({ ...emailForm, customMsg: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={sendEmail} disabled={sending}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                <Send size={15} /> {sending ? "Sending..." : "Send Report"}
              </button>
              <button onClick={() => setEmailModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
