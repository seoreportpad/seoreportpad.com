"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Download, Send, Pencil,
  TrendingUp, TrendingDown, Minus,
  Globe, Mail, CheckCircle2, XCircle, AlertCircle,
  Link2, Copy, Check, FileSpreadsheet, LayoutTemplate,
  ArrowUpRight, ArrowDownRight, Target, Activity, Layers, ReceiptText, MessageCircle, BarChart3,
} from "lucide-react";
import ReportScreenshots from "@/components/ReportScreenshots";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell,
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
interface BlogItem {
  title: string;
  target_keyword: string;
  status: "Planned" | "Writing" | "Published";
  url?: string;
}
interface ContentStrategy {
  blogs: BlogItem[];
  focus_topics?: string;
  content_score?: string;
  notes?: string;
}
interface Backlink {
  id: string; source_url: string; target_url: string; anchor_text?: string;
  da?: number; type?: string; status?: string; added_date?: string; notes?: string;
}
interface Competitor {
  id: string; name: string; website: string; da?: number; keywords?: number; notes?: string;
}
interface WorkLog {
  id: string; log_date: string; category: string; task: string; status?: string;
}
interface RankHistoryItem {
  id: string; keyword: string; position: number; month: string; year: number; url?: string;
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
  content_strategy?: ContentStrategy;
  backlinks?: Backlink[];
  competitors?: Competitor[];
  work_logs?: WorkLog[];
  rank_history?: RankHistoryItem[];
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
  const [portalLink, setPortalLink] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [agency, setAgency] = useState({ agency_name: "", primary_color: "#2563eb", logo_url: "" });
  const [template, setTemplate] = useState<"full" | "executive" | "minimal">("full");
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    number: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    amount: "500",
    currency: "$",
    description: "Monthly SEO Services",
    items: [{ desc: "Technical SEO Audit & Fixes", qty: 1, price: 200 }, { desc: "Content Optimization & Link Building", qty: 1, price: 300 }]
  });
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null)
      .then(d => { if (d && !d.error) setReport(d); });

    fetch("/api/agency")
      .then(r => r.ok ? r.json() : {})
      .then((d: Partial<{ agency_name: string; primary_color: string; logo_url: string }>) => {
        if (d?.agency_name) setAgency({ agency_name: d.agency_name, primary_color: d.primary_color ?? "#2563eb", logo_url: d.logo_url ?? "" });
      })
      .catch(() => {});
  }, [id]);

  const generatePortalLink = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_id: id }),
      });
      const data = await res.json();
      if (data.token) {
        const link = `${window.location.origin}/portal/${data.token}`;
        setPortalLink(link);
      }
    } finally { setPortalLoading(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(portalLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!report) return <div className="text-center py-20 text-slate-400 animate-pulse">Loading report...</div>;

  const m = report.metrics;
  const client = report.clients;
  const improved = (report.keywords ?? []).filter(k => k.curr_ranking != null && k.prev_ranking != null && k.curr_ranking < k.prev_ranking).length;
  const top10 = (report.keywords ?? []).filter(k => k.curr_ranking != null && k.curr_ranking <= 10).length;

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
      ["DAILY WORK LOGS", "Date", "Category", "Task", "Status"],
      ...(report.work_logs ?? []).map(l => ["", l.log_date, l.category, l.task, l.status ?? "done"]),
      [],
      ["BACKLINKS", "Source URL", "Target URL", "Anchor", "DA", "Status"],
      ...(report.backlinks ?? []).map(b => ["", b.source_url, b.target_url, b.anchor_text ?? "", b.da ?? "", b.status ?? "live"]),
      [],
      ["COMPETITORS", "Name", "Website", "DA", "Keywords"],
      ...(report.competitors ?? []).map(c => ["", c.name, c.website, c.da ?? "", c.keywords ?? ""]),
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

  const downloadExcel = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();

    // Sheet 1: Overview
    const overview = [
      ["SEO Monthly Report", "", ""],
      ["Client", client.name, ""],
      ["Period", `${report.month} ${report.year}`, ""],
      ["Website", client.website, ""],
      ["Status", report.status, ""],
      [],
      ["PERFORMANCE METRICS", "Current", "Previous"],
      ["Organic Traffic", m?.organic_traffic ?? "", m?.prev_traffic ?? ""],
      ["Backlinks", m?.backlinks ?? "", m?.prev_backlinks ?? ""],
      ["Domain Authority", m?.domain_authority ?? "", m?.prev_da ?? ""],
      ["GSC Impressions", m?.impressions ?? "", ""],
      ["GSC Clicks", m?.clicks ?? "", ""],
      ["Avg. Position", m?.avg_position ?? "", ""],
      ["Technical Issues Fixed", m?.technical_fixed ?? "", ""],
      ["Pages Indexed", m?.pages_indexed ?? "", ""],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(overview);
    ws1["!cols"] = [{ wch: 28 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Overview");

    // Sheet 2: Keywords
    const kwRows = [
      ["Keyword", "Previous Rank", "Current Rank", "Change", "Search Volume", "URL"],
      ...(report.keywords ?? []).map(k => {
        const diff = k.prev_ranking != null && k.curr_ranking != null ? k.prev_ranking - k.curr_ranking : "";
        return [k.keyword, k.prev_ranking ?? "", k.curr_ranking ?? "", diff !== "" ? (Number(diff) > 0 ? `+${diff}` : String(diff)) : "", k.search_volume ?? "", k.url ?? ""];
      }),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(kwRows);
    ws2["!cols"] = [{ wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Keywords");

    // Sheet 3: Work Done
    const workRows = [
      ["Category", "Task"],
      ...(report.work_done ?? []).map(w => [w.category, w.task]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(workRows);
    ws3["!cols"] = [{ wch: 20 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Work Done");

    // Sheet 4: Scores
    const scores: (string | number)[][] = [["Section", "Score /100", "Issues Found", "Issues Fixed"]];
    if (report.on_page_seo?.on_page_score != null) scores.push(["On-Page SEO", report.on_page_seo.on_page_score, report.on_page_seo.issues_found ?? "", report.on_page_seo.issues_fixed ?? ""]);
    if (report.local_seo?.local_seo_score != null) scores.push(["Local SEO", report.local_seo.local_seo_score, report.local_seo.issues_found ?? "", report.local_seo.issues_fixed ?? ""]);
    const ws4 = XLSX.utils.aoa_to_sheet(scores);
    ws4["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws4, "SEO Scores");

    // Sheet 5: Notes
    const notesRows = [["Notes"], [m?.notes ?? ""], [], ["Recommendations"], [m?.recommendations ?? ""]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(notesRows), "Notes");

    // Sheet 6: Daily Work Logs
    if ((report.work_logs ?? []).length > 0) {
      const logRows = [
        ["Date", "Category", "Task", "Status"],
        ...(report.work_logs ?? []).map(l => [l.log_date, l.category, l.task, l.status ?? "done"]),
      ];
      const wsLogs = XLSX.utils.aoa_to_sheet(logRows);
      wsLogs["!cols"] = [{ wch: 14 }, { wch: 18 }, { wch: 50 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, wsLogs, "Daily Logs");
    }

    // Sheet 7: Backlinks
    if ((report.backlinks ?? []).length > 0) {
      const blRows = [
        ["Source URL", "Target URL", "Anchor Text", "DA", "Type", "Status"],
        ...(report.backlinks ?? []).map(b => [b.source_url, b.target_url, b.anchor_text ?? "", b.da ?? "", b.type ?? "", b.status ?? "live"]),
      ];
      const wsBl = XLSX.utils.aoa_to_sheet(blRows);
      wsBl["!cols"] = [{ wch: 40 }, { wch: 30 }, { wch: 20 }, { wch: 6 }, { wch: 12 }, { wch: 8 }];
      XLSX.utils.book_append_sheet(wb, wsBl, "Backlinks");
    }

    // Sheet 8: Competitors
    if ((report.competitors ?? []).length > 0) {
      const compRows = [
        ["Name", "Website", "DA", "Keywords", "Notes"],
        ...(report.competitors ?? []).map(c => [c.name, c.website, c.da ?? "", c.keywords ?? "", c.notes ?? ""]),
      ];
      const wsComp = XLSX.utils.aoa_to_sheet(compRows);
      wsComp["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 6 }, { wch: 10 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, wsComp, "Competitors");
    }

    // Sheet 9: Rank History
    if ((report.rank_history ?? []).length > 0) {
      const rhRows = [
        ["Keyword", "Month", "Year", "Position", "URL"],
        ...(report.rank_history ?? []).map(rh => [rh.keyword, rh.month, rh.year, rh.position, rh.url ?? ""]),
      ];
      const wsRh = XLSX.utils.aoa_to_sheet(rhRows);
      wsRh["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, wsRh, "Rank History");
    }

    XLSX.writeFile(wb, `SEO-Report-${client.name}-${report.month}-${report.year}.xlsx`);
  };

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("report-body");
      if (!element) return;
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `SEO-Report-${client.name}-${report.month}-${report.year}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
    } finally {
      setPdfLoading(false);
    }
  };

  const downloadWord = () => {
    const m = report.metrics;
    const kws = report.keywords ?? [];
    const work = report.work_done ?? [];

    const kwRows = kws.map(k => {
      const diff = k.prev_ranking != null && k.curr_ranking != null ? k.prev_ranking - k.curr_ranking : null;
      return `<tr>
        <td style="padding:6px 10px;border:1px solid #e2e8f0;">${k.keyword}</td>
        <td style="padding:6px 10px;border:1px solid #e2e8f0;text-align:center;">${k.prev_ranking ?? "—"}</td>
        <td style="padding:6px 10px;border:1px solid #e2e8f0;text-align:center;">${k.curr_ranking ?? "—"}</td>
        <td style="padding:6px 10px;border:1px solid #e2e8f0;text-align:center;color:${diff != null && diff > 0 ? "green" : diff != null && diff < 0 ? "red" : "gray"};">${diff != null ? (diff > 0 ? `+${diff}` : String(diff)) : "—"}</td>
        <td style="padding:6px 10px;border:1px solid #e2e8f0;text-align:center;">${k.search_volume?.toLocaleString() ?? "—"}</td>
      </tr>`;
    }).join("");

    const workRows = work.map(w => `<tr>
      <td style="padding:6px 10px;border:1px solid #e2e8f0;font-weight:600;color:#3b82f6;">${w.category}</td>
      <td style="padding:6px 10px;border:1px solid #e2e8f0;">${w.task}</td>
    </tr>`).join("");

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>SEO Report</title>
      <style>
        body { font-family: Calibri, sans-serif; font-size: 11pt; color: #1e293b; margin: 2cm; }
        h1 { font-size: 28pt; font-weight: 900; color: #0f172a; margin-bottom: 4px; }
        h2 { font-size: 14pt; font-weight: 700; color: #3b82f6; margin-top: 24px; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
        h3 { font-size: 11pt; font-weight: 700; color: #475569; margin: 0 0 4px; }
        table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 10pt; }
        th { background: #f8fafc; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 8pt; letter-spacing: 0.05em; padding: 8px 10px; border: 1px solid #e2e8f0; text-align: left; }
        .cover { text-align: center; padding: 40px 0 32px; border-bottom: 3px solid #3b82f6; margin-bottom: 32px; }
        .badge { display: inline-block; background: #dbeafe; color: #1d4ed8; font-weight: 700; padding: 4px 12px; border-radius: 999px; font-size: 9pt; }
        .metric-grid { display: flex; gap: 16px; flex-wrap: wrap; margin: 12px 0; }
        .metric-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; min-width: 120px; }
        .metric-val { font-size: 22pt; font-weight: 900; color: #0f172a; }
        .metric-lbl { font-size: 8pt; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .metric-diff-up { color: #16a34a; font-size: 9pt; font-weight: 700; }
        .metric-diff-dn { color: #dc2626; font-size: 9pt; font-weight: 700; }
        .note-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 12px 0; font-size: 10pt; line-height: 1.6; }
      </style></head>
      <body>
        <div class="cover">
          <p style="color:#3b82f6;font-weight:900;letter-spacing:3px;font-size:9pt;text-transform:uppercase;">${agency?.agency_name || "SEO REPORT PAD"}</p>
          <h1>SEO Performance Report</h1>
          <p style="font-size:18pt;color:#3b82f6;font-weight:700;">${report.month} ${report.year}</p>
          <p style="margin-top:16px;font-size:13pt;font-weight:700;">Prepared for: <strong>${client.name}</strong></p>
          <p style="color:#64748b;">${client.website}</p>
          <span class="badge">${report.status?.toUpperCase()}</span>
        </div>

        <h2>Performance Metrics</h2>
        <table>
          <tr><th>Metric</th><th>This Month</th><th>Last Month</th><th>Change</th></tr>
          <tr><td style="padding:6px 10px;border:1px solid #e2e8f0;">Organic Traffic</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">${m?.organic_traffic?.toLocaleString() ?? "—"}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">${m?.prev_traffic?.toLocaleString() ?? "—"}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;${m?.organic_traffic && m?.prev_traffic ? (m.organic_traffic >= m.prev_traffic ? "color:green;" : "color:red;") : ""}">${m?.organic_traffic && m?.prev_traffic ? (m.organic_traffic >= m.prev_traffic ? "+" : "") + (m.organic_traffic - m.prev_traffic).toLocaleString() : "—"}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #e2e8f0;">Backlinks</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">${m?.backlinks?.toLocaleString() ?? "—"}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">${m?.prev_backlinks?.toLocaleString() ?? "—"}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;${m?.backlinks && m?.prev_backlinks ? (m.backlinks >= m.prev_backlinks ? "color:green;" : "color:red;") : ""}">${m?.backlinks && m?.prev_backlinks ? (m.backlinks >= m.prev_backlinks ? "+" : "") + (m.backlinks - m.prev_backlinks) : "—"}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #e2e8f0;">Domain Authority</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">${m?.domain_authority ?? "—"}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">${m?.prev_da ?? "—"}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;${m?.domain_authority && m?.prev_da ? (m.domain_authority >= m.prev_da ? "color:green;" : "color:red;") : ""}">${m?.domain_authority && m?.prev_da ? (m.domain_authority >= m.prev_da ? "+" : "") + (m.domain_authority - m.prev_da) : "—"}</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #e2e8f0;">GSC Impressions</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">${m?.impressions?.toLocaleString() ?? "—"}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">—</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">—</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #e2e8f0;">GSC Clicks</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">${m?.clicks?.toLocaleString() ?? "—"}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">—</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">—</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #e2e8f0;">Avg. Position</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">${m?.avg_position ?? "—"}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">—</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">—</td></tr>
          <tr><td style="padding:6px 10px;border:1px solid #e2e8f0;">Pages Indexed</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">${m?.pages_indexed ?? "—"}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">—</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">—</td></tr>
        </table>

        ${kws.length ? `
        <h2>Keyword Rankings</h2>
        <table>
          <tr><th>Keyword</th><th>Prev Rank</th><th>Curr Rank</th><th>Change</th><th>Volume</th></tr>
          ${kwRows}
        </table>` : ""}

        ${work.length ? `
        <h2>Work Done This Month</h2>
        <table>
          <tr><th>Category</th><th>Task</th></tr>
          ${workRows}
        </table>` : ""}

        ${m?.notes ? `<h2>Notes</h2><div class="note-box">${m.notes}</div>` : ""}
        ${m?.recommendations ? `<h2>Recommendations</h2><div class="note-box">${m.recommendations}</div>` : ""}

        <p style="margin-top:40px;color:#94a3b8;font-size:8pt;text-align:center;">Generated by ${agency?.agency_name || "SEO Report Pad"} · ${report.month} ${report.year}</p>
      </body></html>`;

    const blob = new Blob([html], { type: "application/msword" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `SEO-Report-${client.name}-${report.month}-${report.year}.doc`;
    a.click();
  };

  const sendEmail = async () => {
    setSending(true);
    const portalSection = portalLink
      ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px;margin-top:20px;text-align:center">
           <p style="margin:0 0 10px;color:#166534;font-size:14px;font-weight:600">View Your Full Report Online</p>
           <a href="${portalLink}" style="display:inline-block;background:#16a34a;color:#fff;padding:10px 24px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">Open Client Portal →</a>
         </div>`
      : "";

    const html = `
      <p style="font-size:15px;color:#1e293b">Dear <strong>${client.name}</strong>,</p>
      <p style="color:#475569;line-height:1.7">${emailForm.customMsg || "Please find your SEO performance report for this month. We have been working hard to improve your online visibility and search rankings."}</p>
      ${m ? `
      <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:10px;margin-top:28px;font-size:16px">Key Performance — ${report.month} ${report.year}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px">
        <thead>
          <tr style="background:#f8fafc">
            <th style="padding:10px 14px;text-align:left;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">Metric</th>
            <th style="padding:10px 14px;text-align:center;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">Current</th>
            <th style="padding:10px 14px;text-align:center;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">Previous</th>
            <th style="padding:10px 14px;text-align:center;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0">Change</th>
          </tr>
        </thead>
        <tbody>
          ${m.organic_traffic != null ? `<tr style="border-bottom:1px solid #f1f5f9">
            <td style="padding:10px 14px;color:#374151">Organic Traffic</td>
            <td style="padding:10px 14px;text-align:center;font-weight:700;color:#1e293b">${m.organic_traffic.toLocaleString()}</td>
            <td style="padding:10px 14px;text-align:center;color:#94a3b8">${m.prev_traffic?.toLocaleString() ?? "—"}</td>
            <td style="padding:10px 14px;text-align:center;font-weight:600;color:${m.prev_traffic != null ? (m.organic_traffic >= m.prev_traffic ? "#16a34a" : "#dc2626") : "#94a3b8"}">${m.prev_traffic != null ? (m.organic_traffic - m.prev_traffic >= 0 ? "+" : "") + (m.organic_traffic - m.prev_traffic).toLocaleString() : "—"}</td>
          </tr>` : ""}
          ${m.backlinks != null ? `<tr style="border-bottom:1px solid #f1f5f9">
            <td style="padding:10px 14px;color:#374151">Backlinks</td>
            <td style="padding:10px 14px;text-align:center;font-weight:700;color:#1e293b">${m.backlinks.toLocaleString()}</td>
            <td style="padding:10px 14px;text-align:center;color:#94a3b8">${m.prev_backlinks?.toLocaleString() ?? "—"}</td>
            <td style="padding:10px 14px;text-align:center;font-weight:600;color:${m.prev_backlinks != null ? (m.backlinks >= m.prev_backlinks ? "#16a34a" : "#dc2626") : "#94a3b8"}">${m.prev_backlinks != null ? (m.backlinks - m.prev_backlinks >= 0 ? "+" : "") + (m.backlinks - m.prev_backlinks).toLocaleString() : "—"}</td>
          </tr>` : ""}
          ${m.domain_authority != null ? `<tr style="border-bottom:1px solid #f1f5f9">
            <td style="padding:10px 14px;color:#374151">Domain Authority</td>
            <td style="padding:10px 14px;text-align:center;font-weight:700;color:#1e293b">${m.domain_authority}</td>
            <td style="padding:10px 14px;text-align:center;color:#94a3b8">${m.prev_da ?? "—"}</td>
            <td style="padding:10px 14px;text-align:center;font-weight:600;color:${m.prev_da != null ? (m.domain_authority >= m.prev_da ? "#16a34a" : "#dc2626") : "#94a3b8"}">${m.prev_da != null ? (m.domain_authority - m.prev_da >= 0 ? "+" : "") + (m.domain_authority - m.prev_da) : "—"}</td>
          </tr>` : ""}
          ${m.impressions != null ? `<tr style="border-bottom:1px solid #f1f5f9">
            <td style="padding:10px 14px;color:#374151">GSC Impressions</td>
            <td style="padding:10px 14px;text-align:center;font-weight:700;color:#1e293b">${m.impressions.toLocaleString()}</td>
            <td style="padding:10px 14px;text-align:center;color:#94a3b8">—</td>
            <td style="padding:10px 14px;text-align:center;color:#94a3b8">—</td>
          </tr>` : ""}
          ${m.clicks != null ? `<tr>
            <td style="padding:10px 14px;color:#374151">GSC Clicks</td>
            <td style="padding:10px 14px;text-align:center;font-weight:700;color:#1e293b">${m.clicks.toLocaleString()}</td>
            <td style="padding:10px 14px;text-align:center;color:#94a3b8">—</td>
            <td style="padding:10px 14px;text-align:center;color:#94a3b8">—</td>
          </tr>` : ""}
        </tbody>
      </table>` : ""}

      ${report.keywords?.length > 0 ? `
      <h2 style="color:#1e293b;font-size:16px;margin-top:28px;margin-bottom:12px;border-bottom:2px solid #e2e8f0;padding-bottom:10px">Keyword Rankings</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#f8fafc">
          <th style="padding:8px 12px;text-align:left;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0">Keyword</th>
          <th style="padding:8px 12px;text-align:center;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0">Prev</th>
          <th style="padding:8px 12px;text-align:center;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0">Now</th>
          <th style="padding:8px 12px;text-align:center;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0">Change</th>
        </tr></thead>
        <tbody>
          ${report.keywords.slice(0, 8).map(k => {
            const diff = k.curr_ranking != null && k.prev_ranking != null ? k.prev_ranking - k.curr_ranking : null;
            return `<tr style="border-bottom:1px solid #f8fafc">
              <td style="padding:8px 12px;color:#374151;font-weight:500">${k.keyword}</td>
              <td style="padding:8px 12px;text-align:center;color:#94a3b8">#${k.prev_ranking ?? "—"}</td>
              <td style="padding:8px 12px;text-align:center;font-weight:700;color:#1e293b">#${k.curr_ranking ?? "—"}</td>
              <td style="padding:8px 12px;text-align:center;font-weight:600;color:${diff == null ? "#94a3b8" : diff > 0 ? "#16a34a" : diff < 0 ? "#dc2626" : "#94a3b8"}">${diff == null ? "—" : diff > 0 ? `▲ ${diff}` : diff < 0 ? `▼ ${Math.abs(diff)}` : "—"}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>` : ""}

      ${m?.notes ? `<div style="background:#f8fafc;border-left:4px solid #3b82f6;padding:16px 20px;margin-top:24px;border-radius:0 8px 8px 0"><h3 style="margin:0 0 8px;color:#1e293b;font-size:14px;font-weight:700">Monthly Summary</h3><p style="margin:0;color:#475569;line-height:1.7;font-size:14px">${m.notes.replace(/\n/g, "<br/>")}</p></div>` : ""}
      ${m?.recommendations ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px 20px;margin-top:16px"><h3 style="margin:0 0 8px;color:#1d4ed8;font-size:14px;font-weight:700">Focus for Next Month</h3><p style="margin:0;color:#1e40af;line-height:1.7;font-size:14px">${m.recommendations.replace(/\n/g, "<br/>")}</p></div>` : ""}
      ${portalSection}`;

    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: client.email,
        subject: emailForm.subject || `${report.month} ${report.year} SEO Report — ${client.name}`,
        html,
        reportId: id,
      }),
    });
    const data = await res.json();
    setSending(false);
    if (data.success) {
      setReport({ ...report, status: "sent" });
      setEmailModal(false);
      alert("Report sent successfully!");
    } else {
      alert("Error: " + data.error);
    }
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 0; size: A4; }
          body { 
            font-family: 'Inter', sans-serif;
            font-size: 11px; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: white !important;
          }
          .print-container { padding: 1.5cm 1.8cm; }
          .print-break { page-break-before: always; break-before: page; }
          .print-avoid-break { page-break-inside: avoid; break-inside: avoid; }
          
          /* Cover Page */
          .cover-page {
            height: 297mm;
            width: 210mm;
            background: #0f172a !important;
            color: white !important;
            display: flex !important;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 2cm;
            page-break-after: always;
          }
          .cover-page h1 { font-size: 48px; font-weight: 900; margin-bottom: 8px; }
          .cover-page h2 { font-size: 24px; color: #3b82f6; margin-bottom: 40px; }
          .cover-page .client-box { background: rgba(255,255,255,0.05); padding: 32px; border-radius: 24px; width: 100%; max-width: 500px; border: 1px solid rgba(255,255,255,0.1); }
          
          table { border-collapse: collapse; width: 100%; margin: 12px 0; }
          th { background: #f8fafc !important; color: #64748b !important; font-weight: 700; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; }
          td { border-bottom: 1px solid #f1f5f9; padding: 10px 12px; font-size: 10px; }
          
          .card { border: 1px solid #e2e8f0 !important; border-radius: 16px !important; margin-bottom: 16px !important; box-shadow: none !important; }
          .invoice-only { display: none !important; }
        }
        @media print {
          .invoice-mode .report-body, .invoice-mode .cover-page { display: none !important; }
          .invoice-mode .invoice-only { display: block !important; padding: 2cm; }
        }
        .cover-page { display: none; }
      `}</style>

      {/* Cover Page (Print Only) */}
      <div className="cover-page">
        <div className="mb-20">
          {agency.logo_url ? (
            <img src={agency.logo_url} alt={agency.agency_name} className="h-16 w-auto mx-auto mb-6" />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-xl shadow-blue-500/20">
              {agency.agency_name?.slice(0, 2).toUpperCase() || "SR"}
            </div>
          )}
          <p className="text-blue-400 font-black tracking-widest uppercase text-sm">{agency.agency_name || "SEO REPORT PAD"}</p>
        </div>
        
        <h1>SEO Performance Report</h1>
        <h2>{report.month} {report.year}</h2>
        
        <div className="client-box">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-4">Prepared for</p>
          <p className="text-3xl font-black text-white mb-2">{client.name}</p>
          <p className="text-blue-400 font-medium">{client.website}</p>
        </div>

        <div className="mt-auto pt-20 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} {agency.agency_name}. All rights reserved.</p>
          <p className="mt-1">Generated by SEO Report Pad</p>
        </div>
      </div>

      {/* Top bar */}
      <div className="no-print flex items-center justify-between mb-6 flex-wrap gap-3">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Reports
        </button>
        <div className="flex gap-2 flex-wrap">
          {/* Template switcher */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <LayoutTemplate size={13} className="text-slate-400 ml-1" />
            {(["full","executive","minimal"] as const).map(t => (
              <button key={t} onClick={() => setTemplate(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${template === t ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={downloadCSV} className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 px-3.5 py-2 rounded-xl text-sm hover:bg-slate-50 transition-colors">
            <Download size={15} /> CSV
          </button>
          <button onClick={downloadExcel} className="flex items-center gap-2 border border-slate-200 bg-white text-emerald-700 px-3.5 py-2 rounded-xl text-sm hover:bg-emerald-50 transition-colors">
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={downloadWord} className="flex items-center gap-2 border border-slate-200 bg-white text-blue-700 px-3.5 py-2 rounded-xl text-sm hover:bg-blue-50 transition-colors">
            <FileSpreadsheet size={15} /> Word
          </button>
          <button onClick={downloadPDF} disabled={pdfLoading} className="flex items-center gap-2 border border-slate-200 bg-white text-red-600 px-3.5 py-2 rounded-xl text-sm hover:bg-red-50 transition-colors disabled:opacity-60">
            {pdfLoading ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <Download size={15} />} PDF
          </button>
          <button onClick={() => { document.body.classList.add("invoice-mode"); setInvoiceModal(true); }} className="flex items-center gap-2 border border-slate-200 bg-white text-indigo-700 px-3.5 py-2 rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-sm">
            <ReceiptText size={15} /> Invoice
          </button>
          <button 
            onClick={() => {
              if (!portalLink) {
                alert("Please generate a Client Link first!");
                return;
              }
              const text = encodeURIComponent(`Hi ${client.name}, here is your SEO Report for ${report.month} ${report.year}: ${portalLink}`);
              window.open(`https://wa.me/?text=${text}`, "_blank");
            }}
            className="flex items-center gap-2 border border-slate-200 bg-white text-green-600 px-3.5 py-2 rounded-xl text-sm hover:bg-green-50 transition-colors shadow-sm"
          >
            <MessageCircle size={15} /> WhatsApp
          </button>
          <button onClick={generatePortalLink} disabled={portalLoading}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 px-3.5 py-2 rounded-xl text-sm hover:bg-slate-50 transition-colors disabled:opacity-50">
            <Link2 size={15} /> {portalLoading ? "Generating…" : "Client Link"}
          </button>
          <button onClick={() => setEmailModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition-colors shadow-sm">
            <Send size={15} /> Email Client
          </button>
          <Link href={`/dashboard/reports/${id}/edit`} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-slate-700 transition-colors">
            <Pencil size={15} /> Edit
          </Link>
        </div>
      </div>

      {/* Portal link bar */}
      {portalLink && (
        <div className="no-print mb-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <Link2 size={15} className="text-green-600 shrink-0" />
          <p className="text-sm text-green-700 flex-1 truncate font-medium">{portalLink}</p>
          <button onClick={copyLink}
            className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors shrink-0">
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {/* Report body */}
      <div id="report-body" className="report-body max-w-4xl mx-auto space-y-5 pb-20">

        {/* Hero header */}
        <div className="print-avoid-break rounded-2xl overflow-hidden">
          {/* Agency brand bar */}
          {agency.agency_name && (
            <div className="flex items-center justify-between px-6 py-3" style={{ background: agency.primary_color }}>
              <div className="flex items-center gap-3">
                {agency.logo_url && <img src={agency.logo_url} alt={agency.agency_name} className="h-7 w-auto object-contain" />}
                <span className="text-white font-bold text-sm">{agency.agency_name}</span>
              </div>
              <span className="text-white/70 text-xs">SEO Performance Report</span>
            </div>
          )}
          <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-blue-900 text-white p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
            <div className="relative flex justify-between items-start">
              <div>
                <span className="inline-block bg-blue-500/30 text-blue-200 text-xs px-3 py-1 rounded-full mb-3 border border-blue-400/20">
                  Monthly SEO Report
                </span>
                <h1 className="text-3xl font-bold text-white">{client.name}</h1>
                {client.company && <p className="text-slate-300 mt-1">{client.company}</p>}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
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
        </div>

        {/* Monthly Performance Highlights */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm print-avoid-break flex flex-col">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              SEO Category Scores
            </h2>
            {(() => {
              const scores = [
                { subject: "On-Page", A: report.on_page_seo?.on_page_score ?? 0, fullMark: 100 },
                { subject: "Local", A: report.local_seo?.local_seo_score ?? 0, fullMark: 100 },
                { subject: "Technical", A: report.technical_seo?.technical_score ? Number(report.technical_seo.technical_score) : 0, fullMark: 100 },
                { subject: "Schema", A: report.schema_seo?.schema_score ? Number(report.schema_seo.schema_score) : 0, fullMark: 100 },
              ];
              return (
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={scores}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm print-avoid-break">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" />
              Monthly Growth Overview
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Traffic Improvement</span>
                  <span className={`text-sm font-black ${m?.organic_traffic && m?.prev_traffic && m.organic_traffic > m.prev_traffic ? "text-green-600" : "text-slate-600"}`}>
                    {m?.organic_traffic && m?.prev_traffic 
                      ? `${Math.round(((m.organic_traffic - m.prev_traffic) / m.prev_traffic) * 100)}%`
                      : "—"}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (m?.organic_traffic || 0) / ((m?.prev_traffic || 1) / 100))}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Backlink Expansion</span>
                  <span className="text-sm font-black text-slate-600">+{m?.backlinks && m?.prev_backlinks ? m.backlinks - m.prev_backlinks : 0}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(100, (m?.backlinks || 0) / ((m?.prev_backlinks || 1) / 100))}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs text-slate-400 mb-0.5">Keywords Improved</p>
                  <p className="text-xl font-black text-slate-700">{improved}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs text-slate-400 mb-0.5">Top 10 Keywords</p>
                  <p className="text-xl font-black text-slate-700">{top10}</p>
                </div>
              </div>
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

                <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-50">
                  {m.organic_traffic != null && m.prev_traffic != null && (() => {
                    const pct = m.prev_traffic > 0 ? Math.round(((m.organic_traffic - m.prev_traffic) / m.prev_traffic) * 100) : 0;
                    return (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Traffic Growth</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pct >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{pct >= 0 ? "+" : ""}{pct}%</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-left">
                            <p className="text-[9px] text-slate-400">Before</p>
                            <p className="text-sm font-bold text-slate-500">{m.prev_traffic.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-blue-400">After</p>
                            <p className="text-sm font-black text-blue-600">{m.organic_traffic.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  {m.backlinks != null && m.prev_backlinks != null && (() => {
                    const diff = m.backlinks - m.prev_backlinks;
                    return (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">New Backlinks</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${diff >= 0 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>{diff >= 0 ? "+" : ""}{diff}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-left">
                            <p className="text-[9px] text-slate-400">Before</p>
                            <p className="text-sm font-bold text-slate-500">{m.prev_backlinks.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-teal-400">After</p>
                            <p className="text-sm font-black text-teal-600">{m.backlinks.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  {m.domain_authority != null && m.prev_da != null && (() => {
                    const diff = m.domain_authority - m.prev_da;
                    return (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">DA Authority</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${diff >= 0 ? "bg-violet-100 text-violet-700" : "bg-red-100 text-red-700"}`}>{diff >= 0 ? "+" : ""}{diff}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-left">
                            <p className="text-[9px] text-slate-400">Before</p>
                            <p className="text-sm font-bold text-slate-500">{m.prev_da}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-violet-400">After</p>
                            <p className="text-sm font-black text-violet-600">{m.domain_authority}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
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

        {/* Task Completion Summary */}
        {Object.keys(workByCategory).length > 0 && template !== "minimal" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 print-avoid-break">
            <h2 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
              <Layers size={16} className="text-violet-500" /> Task Completion Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {Object.entries(workByCategory).map(([cat, tasks]) => (
                <div key={cat} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-slate-700">{tasks.length}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{cat}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {Object.entries(workByCategory).map(([cat, tasks]) => {
                const pct = Math.round((tasks.length / (report.work_done ?? []).length) * 100);
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-32 shrink-0">{cat}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 w-8 text-right">{tasks.length}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-3">{(report.work_done ?? []).length} total tasks completed this month</p>
          </div>
        )}

        {/* On-Page SEO Section */}
        {template === "full" && report.on_page_seo && (() => {
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
        {template === "full" && report.local_seo && (() => {
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
        {template === "full" && report.schema_seo && (() => {
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
        {template === "full" && report.technical_seo && (() => {
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

        {/* Content Strategy Section */}
        {template === "full" && report.content_strategy && (() => {
          const cs = report.content_strategy!;
          const scoreNum = cs.content_score ? parseInt(cs.content_score) : null;
          const scoreColor = scoreNum != null
            ? scoreNum >= 80 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
            : scoreNum >= 60 ? "text-blue-600 bg-blue-50 border-blue-200"
            : "text-amber-600 bg-amber-50 border-amber-200" : "";
          
          return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 print-avoid-break">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">Content Strategy & Blog Performance</h2>
                  <p className="text-xs text-slate-500">Tracking content growth and topical authority</p>
                </div>
                {scoreNum != null && (
                  <div className={`flex items-center gap-2 border rounded-2xl px-4 py-2 ${scoreColor}`}>
                    <span className="text-2xl font-black">{scoreNum}</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Health</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {cs.blogs && cs.blogs.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Layers size={14} className="text-blue-500" /> Published & Planned Content
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cs.blogs.map((blog, i) => (
                        <div key={i} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 hover:bg-white hover:shadow-md transition-all duration-300">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-bold text-slate-800 text-sm leading-tight flex-1">{blog.title}</h3>
                            <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full whitespace-nowrap ${
                              blog.status === "Published" ? "bg-emerald-100 text-emerald-700" :
                              blog.status === "Writing" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                            }`}>
                              {blog.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Target size={12} className="text-slate-400" /> {blog.target_keyword}
                            </p>
                            {blog.url && (
                              <a href={blog.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                                <Link2 size={12} /> View Post
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cs.focus_topics && (
                    <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-5">
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Topic Clusters & Focus</p>
                      <p className="text-sm text-indigo-900/80 leading-relaxed whitespace-pre-wrap">{cs.focus_topics}</p>
                    </div>
                  )}
                  {cs.notes && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Strategy Notes</p>
                      <p className="text-sm text-slate-700 leading-relaxed italic">{cs.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Screenshots & Evidence */}
        {template !== "minimal" && (
          <div className="print-avoid-break">
            <ReportScreenshots reportId={id} />
          </div>
        )}

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

        {/* Keyword Rank History Chart */}
        {(report.rank_history ?? []).length > 0 && (() => {
          // Group by keyword, build month-series
          const byKeyword: Record<string, { month: string; position: number }[]> = {};
          (report.rank_history ?? []).forEach(rh => {
            if (!byKeyword[rh.keyword]) byKeyword[rh.keyword] = [];
            byKeyword[rh.keyword].push({ month: `${rh.month} ${rh.year}`, position: rh.position });
          });
          const keywords = Object.keys(byKeyword).slice(0, 5); // top 5
          // Build chart data: each row = one month, columns = keywords
          const monthSet = [...new Set((report.rank_history ?? []).map(rh => `${rh.month} ${rh.year}`))];
          const chartData = monthSet.map(m => {
            const row: Record<string, string | number> = { month: m };
            keywords.forEach(kw => {
              const entry = byKeyword[kw]?.find(e => e.month === m);
              if (entry) row[kw] = entry.position;
            });
            return row;
          });
          const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
          return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 print-avoid-break">
              <h2 className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-500" /> Keyword Rank History
              </h2>
              <p className="text-xs text-slate-400 mb-4">Position trends for top tracked keywords (lower = better)</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis reversed tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} label={{ value: "Position", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#94a3b8" } }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {keywords.map((kw, i) => (
                    <Line key={kw} type="monotone" dataKey={kw} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 3 }} name={kw} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })()}

        {/* Daily Work Logs */}
        {(report.work_logs ?? []).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 print-avoid-break">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Daily Work Log — {report.month} {report.year}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-2 text-left text-xs text-slate-500 font-medium">Date</th>
                    <th className="py-2 text-left text-xs text-slate-500 font-medium">Category</th>
                    <th className="py-2 text-left text-xs text-slate-500 font-medium">Task</th>
                    <th className="py-2 text-center text-xs text-slate-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.work_logs ?? []).map(log => (
                    <tr key={log.id} className="border-b border-slate-50">
                      <td className="py-2.5 text-slate-600 whitespace-nowrap">{new Date(log.log_date).toLocaleDateString()}</td>
                      <td className="py-2.5"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{log.category}</span></td>
                      <td className="py-2.5 text-slate-700">{log.task}</td>
                      <td className="py-2.5 text-center"><span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">{log.status ?? "done"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Backlinks */}
        {(report.backlinks ?? []).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 print-avoid-break">
            <h2 className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <Link2 size={16} className="text-indigo-500" /> Backlink Profile
            </h2>
            <p className="text-xs text-slate-400 mb-4">{(report.backlinks ?? []).length} total backlinks tracked</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-2 text-left text-xs text-slate-500 font-medium">Source</th>
                    <th className="py-2 text-left text-xs text-slate-500 font-medium">Target</th>
                    <th className="py-2 text-left text-xs text-slate-500 font-medium">Anchor</th>
                    <th className="py-2 text-center text-xs text-slate-500 font-medium">DA</th>
                    <th className="py-2 text-center text-xs text-slate-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.backlinks ?? []).slice(0, 15).map(bl => (
                    <tr key={bl.id} className="border-b border-slate-50">
                      <td className="py-2.5 max-w-[200px] truncate"><a href={bl.source_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">{bl.source_url.replace(/^https?:\/\//, "")}</a></td>
                      <td className="py-2.5 max-w-[150px] truncate text-xs text-slate-500">{bl.target_url.replace(/^https?:\/\//, "")}</td>
                      <td className="py-2.5 text-xs text-slate-600">{bl.anchor_text ?? "—"}</td>
                      <td className="py-2.5 text-center"><span className={`text-xs font-bold ${(bl.da ?? 0) >= 40 ? "text-green-600" : (bl.da ?? 0) >= 20 ? "text-amber-600" : "text-slate-400"}`}>{bl.da ?? "—"}</span></td>
                      <td className="py-2.5 text-center"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bl.status === "live" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{bl.status ?? "live"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Competitors */}
        {(report.competitors ?? []).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 print-avoid-break">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Target size={16} className="text-orange-500" /> Competitor Analysis
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {(report.competitors ?? []).map(comp => (
                <div key={comp.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-800 text-sm">{comp.name}</h3>
                    {comp.da != null && <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">DA {comp.da}</span>}
                  </div>
                  <a href={comp.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">{comp.website}</a>
                  {comp.keywords != null && <p className="text-xs text-slate-400 mt-1">{comp.keywords} keywords tracked</p>}
                  {comp.notes && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{comp.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="rounded-2xl p-5 text-center" style={{ background: agency.primary_color || "#1e293b" }}>
          <p className="text-sm font-bold text-white">{agency.agency_name || "SEO Report Manager"}</p>
          <p className="text-xs mt-1 opacity-70 text-white">Report for {client.name} · {report.month} {report.year}</p>
        </div>
      </div>

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 no-print p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Send Report via Email</h2>
            <p className="text-sm text-slate-500 mb-5">
              To: <strong>{client.email}</strong>
              {agency.agency_name && <span className="ml-2 text-slate-400">· From: {agency.agency_name}</span>}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Subject line</label>
                <input placeholder={`${report.month} ${report.year} SEO Report — ${client.name}`}
                  value={emailForm.subject}
                  onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Opening message (optional)</label>
                <textarea rows={3}
                  placeholder="Hi, please find your monthly SEO performance report attached. We've had a great month with significant improvements in organic traffic..."
                  value={emailForm.customMsg}
                  onChange={e => setEmailForm({ ...emailForm, customMsg: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              {/* Portal link option */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                {portalLink ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-green-700">Client portal link will be included in the email</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{portalLink}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link2 size={14} className="text-slate-400" />
                      <p className="text-xs text-slate-500">Include client portal link?</p>
                    </div>
                    <button onClick={generatePortalLink} disabled={portalLoading}
                      className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50">
                      {portalLoading ? "Generating…" : "Generate link"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={sendEmail} disabled={sending}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                <Send size={15} /> {sending ? "Sending..." : "Send Report Email"}
              </button>
              <button onClick={() => setEmailModal(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Invoice Modal */}
      {invoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 no-print p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Generate Monthly Invoice</h2>
              <button onClick={() => { document.body.classList.remove("invoice-mode"); setInvoiceModal(false); }} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Invoice #</label>
                <input value={invoiceForm.number} onChange={e => setInvoiceForm({...invoiceForm, number: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Date</label>
                <input type="date" value={invoiceForm.date} onChange={e => setInvoiceForm({...invoiceForm, date: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Currency</label>
                <input value={invoiceForm.currency} onChange={e => setInvoiceForm({...invoiceForm, currency: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                <input value={invoiceForm.description} onChange={e => setInvoiceForm({...invoiceForm, description: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Line Items</label>
              {invoiceForm.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input placeholder="Service" value={item.desc} onChange={e => {
                    const newItems = [...invoiceForm.items];
                    newItems[idx].desc = e.target.value;
                    setInvoiceForm({...invoiceForm, items: newItems});
                  }} className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                  <input type="number" placeholder="Price" value={item.price} onChange={e => {
                    const newItems = [...invoiceForm.items];
                    newItems[idx].price = Number(e.target.value);
                    setInvoiceForm({...invoiceForm, items: newItems});
                  }} className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                  <button onClick={() => {
                    const newItems = invoiceForm.items.filter((_, i) => i !== idx);
                    setInvoiceForm({...invoiceForm, items: newItems});
                  }} className="text-red-500 p-2"><XCircle size={18} /></button>
                </div>
              ))}
              <button onClick={() => setInvoiceForm({...invoiceForm, items: [...invoiceForm.items, { desc: "", qty: 1, price: 0 }]})} className="text-xs font-bold text-indigo-600 hover:underline">+ Add Item</button>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => { window.print(); }} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                <Download size={18} /> Print / Save Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice (hidden on screen, shows on print when in invoice-mode) */}
      <div className="invoice-only p-12 bg-white min-h-screen text-slate-900">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">INVOICE</h1>
            <p className="text-slate-500">#{invoiceForm.number}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">{agency.agency_name}</h2>
            <p className="text-sm text-slate-500">{client.company || "SEO Services"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</p>
            <p className="font-bold text-lg">{client.name}</p>
            <p className="text-slate-500">{client.email}</p>
            <p className="text-slate-500">{client.website}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Details</p>
            <p className="text-slate-500">Date: <span className="text-slate-900 font-medium">{invoiceForm.date}</span></p>
            <p className="text-slate-500">Description: <span className="text-slate-900 font-medium">{invoiceForm.description}</span></p>
          </div>
        </div>

        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-slate-100">
              <th className="py-4 text-left text-xs font-bold text-slate-400 uppercase">Description</th>
              <th className="py-4 text-right text-xs font-bold text-slate-400 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceForm.items.map((item, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="py-5 font-medium">{item.desc}</td>
                <td className="py-5 text-right font-bold">{invoiceForm.currency}{item.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 bg-slate-50 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-bold">{invoiceForm.currency}{invoiceForm.items.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-black text-indigo-600">{invoiceForm.currency}{invoiceForm.items.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-100 text-center">
          {agency.logo_url && <img src={agency.logo_url} alt={agency.agency_name} className="h-6 w-auto mx-auto mb-4 grayscale opacity-30" />}
          <p className="text-sm text-slate-400">Thank you for your business! Please pay within 15 days.</p>
          <p className="text-xs text-slate-300 mt-2">Generated by {agency.agency_name} SEO Portal</p>
        </div>
      </div>
    </>
  );
}
