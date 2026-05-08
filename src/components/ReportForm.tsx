"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Download, CheckSquare, Square, Sparkles, Loader2, ListPlus, TrendingUp, Activity } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WORK_CATEGORIES = ["On-Page SEO","Technical SEO","Link Building","Content","Local SEO","Reporting","Other"];

interface Keyword { keyword: string; prev_ranking: string; curr_ranking: string; search_volume: string; url: string; }
interface WorkItem { category: string; task: string; }
interface Metrics {
  organic_traffic: string; prev_traffic: string;
  backlinks: string; prev_backlinks: string;
  domain_authority: string; prev_da: string;
  impressions: string; clicks: string; avg_position: string;
  technical_fixed: string; pages_indexed: string;
  notes: string; recommendations: string;
}
interface OnPageSEO {
  // Title
  title_tag: string; title_length: string; title_has_keyword: boolean; title_issues: string;
  // Meta
  meta_description: string; meta_length: string; meta_has_keyword: boolean; meta_issues: string;
  // Headings
  h1_count: string; h1_text: string; h2_count: string; headings_issues: string;
  // Content
  word_count: string; keyword_density: string; thin_content_pages: string; duplicate_content_pages: string;
  // Images
  total_images: string; images_missing_alt: string; images_large_count: string;
  // Internal Links
  internal_links_count: string; broken_internal_links: string; orphan_pages: string;
  // Page Speed
  lcp_score: string; cls_score: string; fid_score: string; mobile_speed_score: string; desktop_speed_score: string;
  // Technical
  canonical_set: boolean; schema_markup: boolean; schema_types: string;
  robots_txt_ok: boolean; sitemap_submitted: boolean; hreflang_set: boolean;
  // URL
  url_issues: string; url_length_ok: boolean;
  // Overall
  on_page_score: string; issues_found: string; issues_fixed: string; notes: string;
}
interface LocalSEO {
  // GBP
  gbp_name: string; gbp_verified: boolean; gbp_category: string;
  gbp_rating: string; gbp_reviews_total: string; gbp_reviews_new: string;
  gbp_photos_count: string; gbp_posts_this_month: string; gbp_qa_answered: string; gbp_issues: string;
  // NAP
  nap_consistent: boolean; nap_name: string; nap_address: string; nap_phone: string; nap_issues: string;
  // Citations
  citations_total: string; citations_new: string; citations_fixed: string;
  top_citations: string; citations_issues: string;
  // Local Keywords
  local_keywords_tracked: string; local_keywords_top3: string;
  local_keywords_top10: string; map_pack_keywords: string;
  // Reviews
  reviews_google: string; reviews_yelp: string; reviews_facebook: string; reviews_other: string;
  avg_rating: string; negative_reviews: string; review_response_rate: string;
  // Local Links
  local_backlinks_new: string; local_directories: string;
  // On-Page Local
  local_schema: boolean; location_pages: string;
  google_maps_embedded: boolean; local_content_published: string;
  // Overall
  local_seo_score: string; issues_found: string; issues_fixed: string; notes: string;
}
interface SchemaSEO {
  has_organization: boolean; has_local_business: boolean; has_website: boolean;
  has_breadcrumb: boolean; has_article: boolean; has_faq: boolean;
  has_product: boolean; has_review: boolean; has_event: boolean;
  has_person: boolean; has_service: boolean; has_howto: boolean;
  custom_schemas: string; schema_format: string;
  pages_with_schema: string; pages_missing_schema: string;
  schema_errors: string; schema_warnings: string;
  rich_results_eligible: boolean; rich_results_types: string;
  rich_results_impressions: string; rich_results_clicks: string;
  google_rich_results_tested: boolean; schema_validator_passed: boolean;
  validation_errors: string;
  schema_score: string; issues_found: string; issues_fixed: string; notes: string;
}
interface TechnicalSEO {
  robots_txt_ok: boolean; robots_txt_issues: string;
  xml_sitemap_exists: boolean; xml_sitemap_submitted: boolean;
  xml_sitemap_errors: string; pages_crawled: string;
  pages_blocked: string; crawl_errors: string;
  pages_indexed: string; pages_noindex: string; pages_excluded: string;
  index_coverage_errors: string; google_search_console_connected: boolean;
  max_crawl_depth: string; broken_links: string;
  redirect_chains: string; redirect_loops: string; orphan_pages: string;
  https_enabled: boolean; ssl_valid: boolean; ssl_expiry_date: string;
  mixed_content_issues: string; security_headers: boolean;
  mobile_friendly: boolean; mobile_issues: string;
  viewport_meta: boolean; responsive_design: boolean;
  ttfb_ms: string; server_response_ok: boolean;
  caching_enabled: boolean; cdn_used: boolean; compression_enabled: boolean;
  minified_css: boolean; minified_js: boolean; image_format_modern: boolean;
  hreflang_correct: boolean; pagination_correct: boolean;
  canonical_issues: string; duplicate_pages: string;
  gsc_coverage_errors: string; gsc_manual_actions: string; gsc_enhancement_errors: string;
  technical_score: string; issues_found: string; issues_fixed: string; notes: string;
}
interface Client { id: string; name: string; website?: string; }

interface Props {
  reportId?: string;
  initialClientId?: string;
  initial?: {
    client_id: string; month: string; year: number; status: string;
    keywords: Keyword[]; work_done: WorkItem[]; metrics?: Partial<Metrics>;
    on_page_seo?: Partial<OnPageSEO>;
    local_seo?: Partial<LocalSEO>;
    schema_seo?: Partial<SchemaSEO>;
    technical_seo?: Partial<TechnicalSEO>;
  };
}

const defaultMetrics: Metrics = {
  organic_traffic: "", prev_traffic: "", backlinks: "", prev_backlinks: "",
  domain_authority: "", prev_da: "", impressions: "", clicks: "", avg_position: "",
  technical_fixed: "", pages_indexed: "", notes: "", recommendations: "",
};

const defaultLocalSEO: LocalSEO = {
  gbp_name: "", gbp_verified: false, gbp_category: "",
  gbp_rating: "", gbp_reviews_total: "", gbp_reviews_new: "",
  gbp_photos_count: "", gbp_posts_this_month: "", gbp_qa_answered: "", gbp_issues: "",
  nap_consistent: true, nap_name: "", nap_address: "", nap_phone: "", nap_issues: "",
  citations_total: "", citations_new: "", citations_fixed: "", top_citations: "", citations_issues: "",
  local_keywords_tracked: "", local_keywords_top3: "", local_keywords_top10: "", map_pack_keywords: "",
  reviews_google: "", reviews_yelp: "", reviews_facebook: "", reviews_other: "",
  avg_rating: "", negative_reviews: "", review_response_rate: "",
  local_backlinks_new: "", local_directories: "",
  local_schema: false, location_pages: "", google_maps_embedded: false, local_content_published: "",
  local_seo_score: "", issues_found: "", issues_fixed: "", notes: "",
};

const defaultSchemaSEO: SchemaSEO = {
  has_organization: false, has_local_business: false, has_website: false,
  has_breadcrumb: false, has_article: false, has_faq: false,
  has_product: false, has_review: false, has_event: false,
  has_person: false, has_service: false, has_howto: false,
  custom_schemas: "", schema_format: "JSON-LD",
  pages_with_schema: "", pages_missing_schema: "",
  schema_errors: "", schema_warnings: "",
  rich_results_eligible: false, rich_results_types: "",
  rich_results_impressions: "", rich_results_clicks: "",
  google_rich_results_tested: false, schema_validator_passed: false,
  validation_errors: "",
  schema_score: "", issues_found: "", issues_fixed: "", notes: "",
};
const defaultTechnicalSEO: TechnicalSEO = {
  robots_txt_ok: true, robots_txt_issues: "",
  xml_sitemap_exists: false, xml_sitemap_submitted: false,
  xml_sitemap_errors: "", pages_crawled: "",
  pages_blocked: "", crawl_errors: "",
  pages_indexed: "", pages_noindex: "", pages_excluded: "",
  index_coverage_errors: "", google_search_console_connected: false,
  max_crawl_depth: "", broken_links: "",
  redirect_chains: "", redirect_loops: "", orphan_pages: "",
  https_enabled: true, ssl_valid: true, ssl_expiry_date: "",
  mixed_content_issues: "", security_headers: false,
  mobile_friendly: true, mobile_issues: "",
  viewport_meta: true, responsive_design: true,
  ttfb_ms: "", server_response_ok: true,
  caching_enabled: false, cdn_used: false, compression_enabled: false,
  minified_css: false, minified_js: false, image_format_modern: false,
  hreflang_correct: false, pagination_correct: false,
  canonical_issues: "", duplicate_pages: "",
  gsc_coverage_errors: "", gsc_manual_actions: "", gsc_enhancement_errors: "",
  technical_score: "", issues_found: "", issues_fixed: "", notes: "",
};
const defaultOnPage: OnPageSEO = {
  title_tag: "", title_length: "", title_has_keyword: false, title_issues: "",
  meta_description: "", meta_length: "", meta_has_keyword: false, meta_issues: "",
  h1_count: "", h1_text: "", h2_count: "", headings_issues: "",
  word_count: "", keyword_density: "", thin_content_pages: "", duplicate_content_pages: "",
  total_images: "", images_missing_alt: "", images_large_count: "",
  internal_links_count: "", broken_internal_links: "", orphan_pages: "",
  lcp_score: "", cls_score: "", fid_score: "", mobile_speed_score: "", desktop_speed_score: "",
  canonical_set: false, schema_markup: false, schema_types: "",
  robots_txt_ok: true, sitemap_submitted: false, hreflang_set: false,
  url_issues: "", url_length_ok: true,
  on_page_score: "", issues_found: "", issues_fixed: "", notes: "",
};

function AISummaryButton({ reportId, onGenerated }: { reportId: string; onGenerated: (s: string) => void }) {
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      const data = await res.json();
      if (data.summary) onGenerated(data.summary);
      else alert(data.error ?? "AI generation failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button type="button" onClick={generate} disabled={loading}
      className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50">
      {loading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
      {loading ? "Generating…" : "AI Summary"}
    </button>
  );
}

export default function ReportForm({ reportId, initialClientId, initial }: Props) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(initial?.client_id ?? initialClientId ?? "");
  const [month, setMonth] = useState(initial?.month ?? MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear());
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [keywords, setKeywords] = useState<Keyword[]>(
    initial?.keywords?.map(k => ({
      keyword: k.keyword, prev_ranking: String(k.prev_ranking ?? ""),
      curr_ranking: String(k.curr_ranking ?? ""), search_volume: String(k.search_volume ?? ""), url: k.url ?? "",
    })) ?? [{ keyword: "", prev_ranking: "", curr_ranking: "", search_volume: "", url: "" }]
  );
  const [workDone, setWorkDone] = useState<WorkItem[]>(initial?.work_done ?? [{ category: "On-Page SEO", task: "" }]);
  const [metrics, setMetrics] = useState<Metrics>({
    ...defaultMetrics,
    ...Object.fromEntries(Object.entries(initial?.metrics ?? {}).map(([k, v]) => [k, String(v ?? "")])),
  });
  const [onPage, setOnPage] = useState<OnPageSEO>({
    ...defaultOnPage,
    ...Object.fromEntries(
      Object.entries(initial?.on_page_seo ?? {}).map(([k, v]) => [
        k,
        typeof v === "boolean" ? v : v != null ? String(v) : (defaultOnPage as unknown as Record<string, unknown>)[k],
      ])
    ),
  });
  const [localSEO, setLocalSEO] = useState<LocalSEO>({
    ...defaultLocalSEO,
    ...Object.fromEntries(
      Object.entries(initial?.local_seo ?? {}).map(([k, v]) => [
        k,
        typeof v === "boolean" ? v : v != null ? String(v) : (defaultLocalSEO as unknown as Record<string, unknown>)[k],
      ])
    ),
  });
  const [schemaSEO, setSchemaSEO] = useState<SchemaSEO>({
    ...defaultSchemaSEO,
    ...Object.fromEntries(
      Object.entries(initial?.schema_seo ?? {}).map(([k, v]) => [
        k, typeof v === "boolean" ? v : v != null ? String(v) : (defaultSchemaSEO as unknown as Record<string, unknown>)[k],
      ])
    ),
  });
  const [technicalSEO, setTechnicalSEO] = useState<TechnicalSEO>({
    ...defaultTechnicalSEO,
    ...Object.fromEntries(
      Object.entries(initial?.technical_seo ?? {}).map(([k, v]) => [
        k, typeof v === "boolean" ? v : v != null ? String(v) : (defaultTechnicalSEO as unknown as Record<string, unknown>)[k],
      ])
    ),
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "metrics" | "onpage" | "localseo" | "schema" | "technical" | "keywords" | "work">("info");
  const [showImport, setShowImport] = useState(false);
  const [importLogs, setImportLogs] = useState<{ id: string; log_date: string; category: string; task: string }[]>([]);
  const [importSelected, setImportSelected] = useState<Set<string>>(new Set());
  const [importLoading, setImportLoading] = useState(false);
  const [bulkKeywordModal, setBulkKeywordModal] = useState(false);
  const [bulkKeywordText, setBulkKeywordText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  const runLiveAudit = async () => {
    const client = clients.find(c => c.id === clientId);
    if (!client?.website) return alert("Selected client does not have a website URL set.");
    
    setAuditLoading(true);
    try {
      const res = await fetch("/api/audit/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: client.website }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Auto-fill some fields
      op("title_tag", data.title);
      op("meta_description", data.description);
      op("h1_text", data.h1);
      op("title_length", String(data.checks.titleLength));
      op("meta_length", String(data.checks.descLength));
      
      if (!onPage.notes) {
        op("notes", `Live Audit Results for ${client.website}:\n- Title: ${data.title}\n- H1: ${data.h1}\n- Description: ${data.description}\n\nChecks:\n- Missing Meta Description: ${data.checks.hasDescription ? "No" : "Yes"}\n- Missing H1: ${data.checks.hasH1 ? "No" : "Yes"}`);
      }
      
      // Update technical checkboxes
      op("canonical_set", data.checks.hasCanonical);
      op("robots_txt_ok", data.robots.toLowerCase().includes("index"));
      
      alert("Live audit complete! Meta tags have been auto-filled in the On-Page section.");
    } catch (e: any) {
      alert("Audit failed: " + e.message);
    } finally {
      setAuditLoading(false);
    }
  };

  const refreshRankings = async () => {
    if (!clientId) return alert("Please select a client first");
    setRefreshing(true);
    try {
      // Mocking API call to Serper or ZenSerp
      await new Promise(r => setTimeout(r, 2000));
      
      setKeywords(current => current.map(k => {
        if (!k.keyword) return k;
        // Mock random improvement/drop
        const curr = parseInt(k.curr_ranking) || 10;
        const roll = Math.random();
        let next = curr;
        if (roll > 0.6) next = Math.max(1, curr - Math.floor(Math.random() * 3)); // Improve
        else if (roll < 0.2) next = curr + Math.floor(Math.random() * 2); // Drop
        
        return { ...k, curr_ranking: String(next) };
      }));
      
      alert("Rankings updated! (Mock data for demonstration)");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetch("/api/clients")
      .then(r => (r.ok ? r.json() : []))
      .catch(() => [])
      .then(d => setClients(Array.isArray(d) ? d : []));
  }, []);

  const openImport = async () => {
    if (!clientId || !month) return;
    setImportLoading(true);
    setShowImport(true);
    setImportSelected(new Set());
    const params = new URLSearchParams({ clientId, month, year: String(year) });
    const data = await fetch(`/api/work-logs?${params}`)
      .then(r => r.ok ? r.json() : []).catch(() => []);
    setImportLogs(Array.isArray(data) ? data : []);
    setImportLoading(false);
  };

  const toggleImportItem = (id: string) => {
    setImportSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllImport = () => {
    if (importSelected.size === importLogs.length) setImportSelected(new Set());
    else setImportSelected(new Set(importLogs.map(l => l.id)));
  };

  const applyImport = () => {
    const toAdd = importLogs
      .filter(l => importSelected.has(l.id))
      .map(l => ({ category: l.category, task: l.task }));
    const filtered = toAdd.filter(
      item => !workDone.some(w => w.task === item.task && w.category === item.category)
    );
    setWorkDone(prev => [...prev.filter(w => w.task), ...filtered]);
    setShowImport(false);
  };

  const addKeyword = () => setKeywords([...keywords, { keyword: "", prev_ranking: "", curr_ranking: "", search_volume: "", url: "" }]);
  const removeKeyword = (i: number) => setKeywords(keywords.filter((_, idx) => idx !== i));
  const updateKeyword = (i: number, k: keyof Keyword, v: string) =>
    setKeywords(keywords.map((kw, idx) => idx === i ? { ...kw, [k]: v } : kw));

  const applyBulkKeywords = () => {
    const lines = bulkKeywordText.split("\n").filter(l => l.trim());
    const newKws: Keyword[] = lines.map(line => {
      // Try to parse CSV format like "Keyword, 10, 5, 1000, url"
      const parts = line.split(",").map(p => p.trim());
      return {
        keyword: parts[0] || "",
        prev_ranking: parts[1] || "",
        curr_ranking: parts[2] || "",
        search_volume: parts[3] || "",
        url: parts[4] || "",
      };
    });
    setKeywords(prev => [...prev.filter(k => k.keyword), ...newKws]);
    setBulkKeywordText("");
    setBulkKeywordModal(false);
  };

  const addWork = () => setWorkDone([...workDone, { category: "On-Page SEO", task: "" }]);
  const removeWork = (i: number) => setWorkDone(workDone.filter((_, idx) => idx !== i));
  const updateWork = (i: number, k: keyof WorkItem, v: string) =>
    setWorkDone(workDone.map((w, idx) => idx === i ? { ...w, [k]: v } : w));

  const op = (k: keyof OnPageSEO, v: string | boolean) => setOnPage(prev => ({ ...prev, [k]: v }));
  const lp = (k: keyof LocalSEO, v: string | boolean) => setLocalSEO(prev => ({ ...prev, [k]: v }));
  const sp = (k: keyof SchemaSEO, v: string | boolean) => setSchemaSEO(prev => ({ ...prev, [k]: v }));
  const tp = (k: keyof TechnicalSEO, v: string | boolean) => setTechnicalSEO(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => v !== "" ? Number(v) : null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      client_id: clientId, month, year, status,
      keywords: keywords.filter(k => k.keyword).map(k => ({
        keyword: k.keyword, prev_ranking: num(k.prev_ranking),
        curr_ranking: num(k.curr_ranking), search_volume: num(k.search_volume), url: k.url || null,
      })),
      work_done: workDone.filter(w => w.task),
      metrics: {
        organic_traffic: num(metrics.organic_traffic), prev_traffic: num(metrics.prev_traffic),
        backlinks: num(metrics.backlinks), prev_backlinks: num(metrics.prev_backlinks),
        domain_authority: num(metrics.domain_authority), prev_da: num(metrics.prev_da),
        impressions: num(metrics.impressions), clicks: num(metrics.clicks),
        avg_position: num(metrics.avg_position), technical_fixed: num(metrics.technical_fixed),
        pages_indexed: num(metrics.pages_indexed),
        notes: metrics.notes || null, recommendations: metrics.recommendations || null,
      },
      on_page_seo: {
        title_tag: onPage.title_tag || null,
        title_length: num(onPage.title_length),
        title_has_keyword: onPage.title_has_keyword,
        title_issues: onPage.title_issues || null,
        meta_description: onPage.meta_description || null,
        meta_length: num(onPage.meta_length),
        meta_has_keyword: onPage.meta_has_keyword,
        meta_issues: onPage.meta_issues || null,
        h1_count: num(onPage.h1_count),
        h1_text: onPage.h1_text || null,
        h2_count: num(onPage.h2_count),
        headings_issues: onPage.headings_issues || null,
        word_count: num(onPage.word_count),
        keyword_density: num(onPage.keyword_density),
        thin_content_pages: num(onPage.thin_content_pages),
        duplicate_content_pages: num(onPage.duplicate_content_pages),
        total_images: num(onPage.total_images),
        images_missing_alt: num(onPage.images_missing_alt),
        images_large_count: num(onPage.images_large_count),
        internal_links_count: num(onPage.internal_links_count),
        broken_internal_links: num(onPage.broken_internal_links),
        orphan_pages: num(onPage.orphan_pages),
        lcp_score: onPage.lcp_score || null,
        cls_score: onPage.cls_score || null,
        fid_score: onPage.fid_score || null,
        mobile_speed_score: num(onPage.mobile_speed_score),
        desktop_speed_score: num(onPage.desktop_speed_score),
        canonical_set: onPage.canonical_set,
        schema_markup: onPage.schema_markup,
        schema_types: onPage.schema_types || null,
        robots_txt_ok: onPage.robots_txt_ok,
        sitemap_submitted: onPage.sitemap_submitted,
        hreflang_set: onPage.hreflang_set,
        url_issues: onPage.url_issues || null,
        url_length_ok: onPage.url_length_ok,
        on_page_score: num(onPage.on_page_score),
        issues_found: num(onPage.issues_found),
        issues_fixed: num(onPage.issues_fixed),
        notes: onPage.notes || null,
      },
      local_seo: {
        gbp_name: localSEO.gbp_name || null,
        gbp_verified: localSEO.gbp_verified,
        gbp_category: localSEO.gbp_category || null,
        gbp_rating: num(localSEO.gbp_rating),
        gbp_reviews_total: num(localSEO.gbp_reviews_total),
        gbp_reviews_new: num(localSEO.gbp_reviews_new),
        gbp_photos_count: num(localSEO.gbp_photos_count),
        gbp_posts_this_month: num(localSEO.gbp_posts_this_month),
        gbp_qa_answered: num(localSEO.gbp_qa_answered),
        gbp_issues: localSEO.gbp_issues || null,
        nap_consistent: localSEO.nap_consistent,
        nap_name: localSEO.nap_name || null,
        nap_address: localSEO.nap_address || null,
        nap_phone: localSEO.nap_phone || null,
        nap_issues: localSEO.nap_issues || null,
        citations_total: num(localSEO.citations_total),
        citations_new: num(localSEO.citations_new),
        citations_fixed: num(localSEO.citations_fixed),
        top_citations: localSEO.top_citations || null,
        citations_issues: localSEO.citations_issues || null,
        local_keywords_tracked: num(localSEO.local_keywords_tracked),
        local_keywords_top3: num(localSEO.local_keywords_top3),
        local_keywords_top10: num(localSEO.local_keywords_top10),
        map_pack_keywords: num(localSEO.map_pack_keywords),
        reviews_google: num(localSEO.reviews_google),
        reviews_yelp: num(localSEO.reviews_yelp),
        reviews_facebook: num(localSEO.reviews_facebook),
        reviews_other: num(localSEO.reviews_other),
        avg_rating: num(localSEO.avg_rating),
        negative_reviews: num(localSEO.negative_reviews),
        review_response_rate: num(localSEO.review_response_rate),
        local_backlinks_new: num(localSEO.local_backlinks_new),
        local_directories: localSEO.local_directories || null,
        local_schema: localSEO.local_schema,
        location_pages: num(localSEO.location_pages),
        google_maps_embedded: localSEO.google_maps_embedded,
        local_content_published: num(localSEO.local_content_published),
        local_seo_score: num(localSEO.local_seo_score),
        issues_found: num(localSEO.issues_found),
        issues_fixed: num(localSEO.issues_fixed),
        notes: localSEO.notes || null,
      },
      schema_seo: {
        has_organization: schemaSEO.has_organization, has_local_business: schemaSEO.has_local_business,
        has_website: schemaSEO.has_website, has_breadcrumb: schemaSEO.has_breadcrumb,
        has_article: schemaSEO.has_article, has_faq: schemaSEO.has_faq,
        has_product: schemaSEO.has_product, has_review: schemaSEO.has_review,
        has_event: schemaSEO.has_event, has_person: schemaSEO.has_person,
        has_service: schemaSEO.has_service, has_howto: schemaSEO.has_howto,
        custom_schemas: schemaSEO.custom_schemas || null,
        schema_format: schemaSEO.schema_format || "JSON-LD",
        pages_with_schema: num(schemaSEO.pages_with_schema),
        pages_missing_schema: num(schemaSEO.pages_missing_schema),
        schema_errors: num(schemaSEO.schema_errors),
        schema_warnings: num(schemaSEO.schema_warnings),
        rich_results_eligible: schemaSEO.rich_results_eligible,
        rich_results_types: schemaSEO.rich_results_types || null,
        rich_results_impressions: num(schemaSEO.rich_results_impressions),
        rich_results_clicks: num(schemaSEO.rich_results_clicks),
        google_rich_results_tested: schemaSEO.google_rich_results_tested,
        schema_validator_passed: schemaSEO.schema_validator_passed,
        validation_errors: schemaSEO.validation_errors || null,
        schema_score: num(schemaSEO.schema_score),
        issues_found: num(schemaSEO.issues_found),
        issues_fixed: num(schemaSEO.issues_fixed),
        notes: schemaSEO.notes || null,
      },
      technical_seo: {
        robots_txt_ok: technicalSEO.robots_txt_ok,
        robots_txt_issues: technicalSEO.robots_txt_issues || null,
        xml_sitemap_exists: technicalSEO.xml_sitemap_exists,
        xml_sitemap_submitted: technicalSEO.xml_sitemap_submitted,
        xml_sitemap_errors: num(technicalSEO.xml_sitemap_errors),
        pages_crawled: num(technicalSEO.pages_crawled),
        pages_blocked: num(technicalSEO.pages_blocked),
        crawl_errors: num(technicalSEO.crawl_errors),
        pages_indexed: num(technicalSEO.pages_indexed),
        pages_noindex: num(technicalSEO.pages_noindex),
        pages_excluded: num(technicalSEO.pages_excluded),
        index_coverage_errors: num(technicalSEO.index_coverage_errors),
        google_search_console_connected: technicalSEO.google_search_console_connected,
        max_crawl_depth: num(technicalSEO.max_crawl_depth),
        broken_links: num(technicalSEO.broken_links),
        redirect_chains: num(technicalSEO.redirect_chains),
        redirect_loops: num(technicalSEO.redirect_loops),
        orphan_pages: num(technicalSEO.orphan_pages),
        https_enabled: technicalSEO.https_enabled, ssl_valid: technicalSEO.ssl_valid,
        ssl_expiry_date: technicalSEO.ssl_expiry_date || null,
        mixed_content_issues: num(technicalSEO.mixed_content_issues),
        security_headers: technicalSEO.security_headers,
        mobile_friendly: technicalSEO.mobile_friendly,
        mobile_issues: technicalSEO.mobile_issues || null,
        viewport_meta: technicalSEO.viewport_meta,
        responsive_design: technicalSEO.responsive_design,
        ttfb_ms: num(technicalSEO.ttfb_ms),
        server_response_ok: technicalSEO.server_response_ok,
        caching_enabled: technicalSEO.caching_enabled, cdn_used: technicalSEO.cdn_used,
        compression_enabled: technicalSEO.compression_enabled,
        minified_css: technicalSEO.minified_css, minified_js: technicalSEO.minified_js,
        image_format_modern: technicalSEO.image_format_modern,
        hreflang_correct: technicalSEO.hreflang_correct,
        pagination_correct: technicalSEO.pagination_correct,
        canonical_issues: num(technicalSEO.canonical_issues),
        duplicate_pages: num(technicalSEO.duplicate_pages),
        gsc_coverage_errors: num(technicalSEO.gsc_coverage_errors),
        gsc_manual_actions: num(technicalSEO.gsc_manual_actions),
        gsc_enhancement_errors: num(technicalSEO.gsc_enhancement_errors),
        technical_score: num(technicalSEO.technical_score),
        issues_found: num(technicalSEO.issues_found),
        issues_fixed: num(technicalSEO.issues_fixed),
        notes: technicalSEO.notes || null,
      },
    };
    const url = reportId ? `/api/reports/${reportId}` : "/api/reports";
    const method = reportId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    router.push(`/dashboard/reports/${data.id}`);
  };

  const tabs = [
    { id: "info", label: "Basic Info" },
    { id: "metrics", label: "Metrics" },
    { id: "onpage", label: "On-Page SEO" },
    { id: "localseo", label: "Local SEO" },
    { id: "schema", label: "Schema Markup" },
    { id: "technical", label: "Technical SEO" },
    { id: "keywords", label: `Keywords (${keywords.length})` },
    { id: "work", label: `Work Done (${workDone.length})` },
  ] as const;

  const inp = (label: string, value: string, onChange: (v: string) => void, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
    </div>
  );

  const toggle = (label: string, value: boolean, onChange: (v: boolean) => void, good = true) => (
    <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? (good ? "bg-green-500" : "bg-red-500") : "bg-slate-300"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${value ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );

  const metricPair = (label: string, curr: keyof Metrics, prev: keyof Metrics) => (
    <div className="grid grid-cols-2 gap-3">
      {inp(`${label} (Current)`, metrics[curr], v => setMetrics({ ...metrics, [curr]: v }), "number")}
      {inp(`${label} (Previous)`, metrics[prev], v => setMetrics({ ...metrics, [prev]: v }), "number")}
    </div>
  );

  const scoreColor = (score: number) => score >= 80 ? "text-green-600 bg-green-50 border-green-200" : score >= 60 ? "text-amber-600 bg-amber-50 border-amber-200" : "text-red-600 bg-red-50 border-red-200";
  const vitalsColor = (v: string) => v === "Good" ? "bg-green-100 text-green-700" : v === "Needs Improvement" ? "bg-amber-100 text-amber-700" : v === "Poor" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500";

  return (
    <form onSubmit={save} className="max-w-3xl">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-slate-100 rounded-xl p-1 shadow-sm w-fit flex-wrap">
        {tabs.map(t => (
          <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Basic Info ── */}
      {activeTab === "info" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700">Report Information</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Client <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <select required value={clientId} onChange={e => setClientId(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">-- Select Client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="button" onClick={runLiveAudit} disabled={auditLoading || !clientId}
                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-2 disabled:opacity-50">
                {auditLoading ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
                {auditLoading ? "Auditing..." : "Live Audit"}
              </button>
            </div>
            {clientId && (
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                Website: {clients.find(c => c.id === clientId)?.website || "Not set"}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Month</label>
              <select value={month} onChange={e => setMonth(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Year</label>
              <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="draft">Draft</option>
              <option value="ready">Ready to Send</option>
              <option value="sent">Sent</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Metrics ── */}
      {activeTab === "metrics" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700">SEO Metrics</h2>
          {metricPair("Organic Traffic", "organic_traffic", "prev_traffic")}
          {metricPair("Backlinks", "backlinks", "prev_backlinks")}
          {metricPair("Domain Authority", "domain_authority", "prev_da")}
          <div className="grid grid-cols-3 gap-3">
            {inp("Impressions", metrics.impressions, v => setMetrics({ ...metrics, impressions: v }), "number")}
            {inp("Clicks", metrics.clicks, v => setMetrics({ ...metrics, clicks: v }), "number")}
            {inp("Avg. Position", metrics.avg_position, v => setMetrics({ ...metrics, avg_position: v }), "number", "e.g. 14.2")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {inp("Technical Issues Fixed", metrics.technical_fixed, v => setMetrics({ ...metrics, technical_fixed: v }), "number")}
            {inp("Pages Indexed", metrics.pages_indexed, v => setMetrics({ ...metrics, pages_indexed: v }), "number")}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-600">Summary / Notes</label>
              {reportId && (
                <AISummaryButton reportId={reportId} onGenerated={summary => setMetrics(m => ({ ...m, notes: summary }))} />
              )}
            </div>
            <textarea value={metrics.notes} onChange={e => setMetrics({ ...metrics, notes: e.target.value })} rows={3}
              placeholder="Monthly summary for the client..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Recommendations (Next Month)</label>
            <textarea value={metrics.recommendations} onChange={e => setMetrics({ ...metrics, recommendations: e.target.value })} rows={3}
              placeholder="What to focus on next month..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      )}

      {/* ── On-Page SEO ── */}
      {activeTab === "onpage" && (
        <div className="space-y-5">

          {/* Overall Score */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-4">Overall On-Page Score</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">On-Page Score (0–100)</label>
                <div className="relative">
                  <input type="number" min="0" max="100" value={onPage.on_page_score}
                    onChange={e => op("on_page_score", e.target.value)} placeholder="e.g. 72"
                    className={`w-full border rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${onPage.on_page_score ? scoreColor(Number(onPage.on_page_score)) : "border-slate-200 text-slate-700"}`} />
                </div>
              </div>
              {inp("Issues Found", onPage.issues_found, v => op("issues_found", v), "number")}
              {inp("Issues Fixed", onPage.issues_fixed, v => op("issues_fixed", v), "number")}
            </div>
          </div>

          {/* Title Tags */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" /> Title Tags
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Page Title (main/homepage)</label>
                <input value={onPage.title_tag} onChange={e => op("title_tag", e.target.value)}
                  placeholder="e.g. Best SEO Agency in Lahore | Company Name"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                {onPage.title_tag && (
                  <p className={`text-xs mt-1 font-medium ${onPage.title_tag.length < 50 || onPage.title_tag.length > 60 ? "text-amber-600" : "text-green-600"}`}>
                    {onPage.title_tag.length} chars {onPage.title_tag.length < 50 ? "(too short)" : onPage.title_tag.length > 60 ? "(too long)" : "(perfect)"}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {inp("Avg Title Length (chars)", onPage.title_length, v => op("title_length", v), "number", "e.g. 55")}
                <div className="flex flex-col justify-end">
                  {toggle("Contains Target Keyword", onPage.title_has_keyword, v => op("title_has_keyword", v))}
                </div>
              </div>
              {inp("Issues Found", onPage.title_issues, v => op("title_issues", v), "text", "e.g. 3 pages missing title, 2 duplicate titles")}
            </div>
          </div>

          {/* Meta Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-violet-500 rounded-full" /> Meta Description
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Meta Description (main/homepage)</label>
                <textarea value={onPage.meta_description} onChange={e => op("meta_description", e.target.value)}
                  rows={2} placeholder="e.g. We offer professional SEO services in Lahore..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none" />
                {onPage.meta_description && (
                  <p className={`text-xs mt-1 font-medium ${onPage.meta_description.length < 130 || onPage.meta_description.length > 160 ? "text-amber-600" : "text-green-600"}`}>
                    {onPage.meta_description.length} chars {onPage.meta_description.length < 130 ? "(too short)" : onPage.meta_description.length > 160 ? "(too long)" : "(perfect)"}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {inp("Avg Meta Length (chars)", onPage.meta_length, v => op("meta_length", v), "number", "e.g. 145")}
                <div className="flex flex-col justify-end">
                  {toggle("Contains Target Keyword", onPage.meta_has_keyword, v => op("meta_has_keyword", v))}
                </div>
              </div>
              {inp("Issues Found", onPage.meta_issues, v => op("meta_issues", v), "text", "e.g. 5 pages missing meta, 3 too long")}
            </div>
          </div>

          {/* Headings */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-500 rounded-full" /> Headings (H1 / H2)
            </h3>
            <div className="space-y-3">
              {inp("H1 Text (homepage)", onPage.h1_text, v => op("h1_text", v), "text", "e.g. SEO Services in Pakistan")}
              <div className="grid grid-cols-2 gap-3">
                {inp("H1 Count (site-wide)", onPage.h1_count, v => op("h1_count", v), "number")}
                {inp("H2 Count (site-wide)", onPage.h2_count, v => op("h2_count", v), "number")}
              </div>
              {inp("Heading Issues", onPage.headings_issues, v => op("headings_issues", v), "text", "e.g. 2 pages missing H1, 4 pages multiple H1")}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" /> Content Quality
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {inp("Avg Word Count", onPage.word_count, v => op("word_count", v), "number", "e.g. 850")}
              {inp("Keyword Density (%)", onPage.keyword_density, v => op("keyword_density", v), "number", "e.g. 1.5")}
              {inp("Thin Content Pages (<300 words)", onPage.thin_content_pages, v => op("thin_content_pages", v), "number")}
              {inp("Duplicate Content Pages", onPage.duplicate_content_pages, v => op("duplicate_content_pages", v), "number")}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full" /> Images
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {inp("Total Images", onPage.total_images, v => op("total_images", v), "number")}
              {inp("Missing Alt Text", onPage.images_missing_alt, v => op("images_missing_alt", v), "number")}
              {inp("Large/Unoptimized Images", onPage.images_large_count, v => op("images_large_count", v), "number")}
            </div>
          </div>

          {/* Internal Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full" /> Internal Links
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {inp("Total Internal Links", onPage.internal_links_count, v => op("internal_links_count", v), "number")}
              {inp("Broken Internal Links", onPage.broken_internal_links, v => op("broken_internal_links", v), "number")}
              {inp("Orphan Pages", onPage.orphan_pages, v => op("orphan_pages", v), "number")}
            </div>
          </div>

          {/* Page Speed / Core Web Vitals */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" /> Page Speed & Core Web Vitals
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {inp("Mobile Speed Score (0-100)", onPage.mobile_speed_score, v => op("mobile_speed_score", v), "number")}
              {inp("Desktop Speed Score (0-100)", onPage.desktop_speed_score, v => op("desktop_speed_score", v), "number")}
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Core Web Vitals</p>
            <div className="grid grid-cols-3 gap-3">
              {(["lcp_score","cls_score","fid_score"] as const).map((key, i) => {
                const labels = ["LCP (Largest Contentful Paint)","CLS (Cumulative Layout Shift)","INP / FID (Interactivity)"];
                return (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{labels[i]}</label>
                    <select value={onPage[key]} onChange={e => op(key, e.target.value)}
                      className={`w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${vitalsColor(onPage[key])}`}>
                      <option value="">-- Select --</option>
                      <option value="Good">Good</option>
                      <option value="Needs Improvement">Needs Improvement</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical On-Page */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-500 rounded-full" /> Technical On-Page
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {toggle("Canonical Tags Set", onPage.canonical_set, v => op("canonical_set", v))}
              {toggle("Schema Markup Present", onPage.schema_markup, v => op("schema_markup", v))}
              {toggle("Robots.txt OK", onPage.robots_txt_ok, v => op("robots_txt_ok", v))}
              {toggle("XML Sitemap Submitted", onPage.sitemap_submitted, v => op("sitemap_submitted", v))}
              {toggle("Hreflang Set (if multilingual)", onPage.hreflang_set, v => op("hreflang_set", v))}
              {toggle("URL Structure OK", onPage.url_length_ok, v => op("url_length_ok", v))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {inp("Schema Types Used", onPage.schema_types, v => op("schema_types", v), "text", "e.g. LocalBusiness, Article, FAQ")}
              {inp("URL Issues", onPage.url_issues, v => op("url_issues", v), "text", "e.g. 3 URLs too long, 2 with underscores")}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3">On-Page SEO Notes</h3>
            <textarea value={onPage.notes} onChange={e => op("notes", e.target.value)} rows={4}
              placeholder="Additional on-page observations, recommendations, or action items for the client..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      )}

      {/* ── Local SEO ── */}
      {activeTab === "localseo" && (
        <div className="space-y-5">

          {/* Overall Score */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-4">Overall Local SEO Score</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Local SEO Score (0–100)</label>
                <input type="number" min="0" max="100" value={localSEO.local_seo_score}
                  onChange={e => lp("local_seo_score", e.target.value)} placeholder="e.g. 68"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
              </div>
              {inp("Issues Found", localSEO.issues_found, v => lp("issues_found", v), "number")}
              {inp("Issues Fixed", localSEO.issues_fixed, v => lp("issues_fixed", v), "number")}
            </div>
          </div>

          {/* Google Business Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" /> Google Business Profile (GBP)
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {inp("Business Name", localSEO.gbp_name, v => lp("gbp_name", v), "text", "e.g. ABC Digital Solutions")}
                {inp("Primary Category", localSEO.gbp_category, v => lp("gbp_category", v), "text", "e.g. SEO Agency")}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {toggle("GBP Verified", localSEO.gbp_verified, v => lp("gbp_verified", v))}
                {inp("Overall Rating", localSEO.gbp_rating, v => lp("gbp_rating", v), "number", "e.g. 4.7")}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {inp("Total Reviews", localSEO.gbp_reviews_total, v => lp("gbp_reviews_total", v), "number")}
                {inp("New Reviews (this month)", localSEO.gbp_reviews_new, v => lp("gbp_reviews_new", v), "number")}
                {inp("Photos Count", localSEO.gbp_photos_count, v => lp("gbp_photos_count", v), "number")}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {inp("Posts Published (this month)", localSEO.gbp_posts_this_month, v => lp("gbp_posts_this_month", v), "number")}
                {inp("Q&A Answered", localSEO.gbp_qa_answered, v => lp("gbp_qa_answered", v), "number")}
              </div>
              {inp("GBP Issues", localSEO.gbp_issues, v => lp("gbp_issues", v), "text", "e.g. Missing service hours, incomplete description")}
            </div>
          </div>

          {/* NAP Consistency */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-violet-500 rounded-full" /> NAP Consistency
            </h3>
            <div className="space-y-3">
              {toggle("NAP Consistent Across Web", localSEO.nap_consistent, v => lp("nap_consistent", v))}
              <div className="grid grid-cols-2 gap-3">
                {inp("Business Name (exact)", localSEO.nap_name, v => lp("nap_name", v), "text", "Exact name as listed")}
                {inp("Phone", localSEO.nap_phone, v => lp("nap_phone", v), "text", "+92 300 1234567")}
              </div>
              {inp("Address", localSEO.nap_address, v => lp("nap_address", v), "text", "Full address as listed")}
              {inp("NAP Issues", localSEO.nap_issues, v => lp("nap_issues", v), "text", "e.g. Phone mismatch on Yelp, old address on Facebook")}
            </div>
          </div>

          {/* Local Citations */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-500 rounded-full" /> Local Citations
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {inp("Total Citations", localSEO.citations_total, v => lp("citations_total", v), "number")}
                {inp("New This Month", localSEO.citations_new, v => lp("citations_new", v), "number")}
                {inp("Fixed/Updated", localSEO.citations_fixed, v => lp("citations_fixed", v), "number")}
              </div>
              {inp("Top Citation Sources", localSEO.top_citations, v => lp("top_citations", v), "text", "e.g. Google, Yelp, Facebook, Yellow Pages, Bing Places")}
              {inp("Citation Issues", localSEO.citations_issues, v => lp("citations_issues", v), "text", "e.g. 5 duplicate listings, 3 wrong phone numbers")}
            </div>
          </div>

          {/* Local Keywords */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full" /> Local Keyword Rankings
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {inp("Keywords Tracked", localSEO.local_keywords_tracked, v => lp("local_keywords_tracked", v), "number")}
              {inp("In Top 3", localSEO.local_keywords_top3, v => lp("local_keywords_top3", v), "number")}
              {inp("In Top 10", localSEO.local_keywords_top10, v => lp("local_keywords_top10", v), "number")}
              {inp("Map Pack Keywords", localSEO.map_pack_keywords, v => lp("map_pack_keywords", v), "number", "Keywords appearing in Google Maps Pack")}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" /> Reviews & Reputation
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {inp("Google Reviews", localSEO.reviews_google, v => lp("reviews_google", v), "number")}
              {inp("Facebook Reviews", localSEO.reviews_facebook, v => lp("reviews_facebook", v), "number")}
              {inp("Yelp Reviews", localSEO.reviews_yelp, v => lp("reviews_yelp", v), "number")}
              {inp("Other Platform Reviews", localSEO.reviews_other, v => lp("reviews_other", v), "number")}
              {inp("Average Rating", localSEO.avg_rating, v => lp("avg_rating", v), "number", "e.g. 4.6")}
              {inp("Negative Reviews", localSEO.negative_reviews, v => lp("negative_reviews", v), "number")}
            </div>
            {inp("Review Response Rate (%)", localSEO.review_response_rate, v => lp("review_response_rate", v), "number", "e.g. 85")}
          </div>

          {/* Local Link Building */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full" /> Local Link Building
            </h3>
            <div className="space-y-3">
              {inp("New Local Backlinks", localSEO.local_backlinks_new, v => lp("local_backlinks_new", v), "number")}
              {inp("Local Directories Submitted", localSEO.local_directories, v => lp("local_directories", v), "text", "e.g. PakistanDirectory, LocalPages, OLX Business")}
            </div>
          </div>

          {/* Technical Local */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-500 rounded-full" /> Technical Local SEO
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {toggle("Local Business Schema", localSEO.local_schema, v => lp("local_schema", v))}
              {toggle("Google Maps Embedded", localSEO.google_maps_embedded, v => lp("google_maps_embedded", v))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {inp("Location/Service Pages", localSEO.location_pages, v => lp("location_pages", v), "number", "e.g. 5")}
              {inp("Local Content Published", localSEO.local_content_published, v => lp("local_content_published", v), "number", "Blog posts, local guides")}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3">Local SEO Notes</h3>
            <textarea value={localSEO.notes} onChange={e => lp("notes", e.target.value)} rows={4}
              placeholder="Local SEO observations, action items, client feedback..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      )}

      {/* ── Schema Markup ── */}
      {activeTab === "schema" && (
        <div className="space-y-5">

          {/* Overall */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-4">Schema Markup Overview</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Schema Score (0–100)</label>
                <input type="number" min="0" max="100" value={schemaSEO.schema_score}
                  onChange={e => sp("schema_score", e.target.value)} placeholder="e.g. 80"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              {inp("Issues Found", schemaSEO.issues_found, v => sp("issues_found", v), "number")}
              {inp("Issues Fixed", schemaSEO.issues_fixed, v => sp("issues_fixed", v), "number")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Schema Format</label>
                <select value={schemaSEO.schema_format} onChange={e => sp("schema_format", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="JSON-LD">JSON-LD (Recommended)</option>
                  <option value="Microdata">Microdata</option>
                  <option value="RDFa">RDFa</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              {inp("Pages With Schema", schemaSEO.pages_with_schema, v => sp("pages_with_schema", v), "number")}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {inp("Pages Missing Schema", schemaSEO.pages_missing_schema, v => sp("pages_missing_schema", v), "number")}
              {inp("Schema Errors", schemaSEO.schema_errors, v => sp("schema_errors", v), "number")}
              {inp("Schema Warnings", schemaSEO.schema_warnings, v => sp("schema_warnings", v), "number")}
            </div>
          </div>

          {/* Schema Types */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-violet-500 rounded-full" /> Schema Types Implemented
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {([
                ["has_organization", "Organization"],
                ["has_local_business", "LocalBusiness"],
                ["has_website", "WebSite"],
                ["has_breadcrumb", "BreadcrumbList"],
                ["has_article", "Article / BlogPosting"],
                ["has_faq", "FAQPage"],
                ["has_product", "Product"],
                ["has_review", "Review / AggregateRating"],
                ["has_event", "Event"],
                ["has_person", "Person"],
                ["has_service", "Service"],
                ["has_howto", "HowTo"],
              ] as [keyof SchemaSEO, string][]).map(([key, label]) => (
                toggle(label, schemaSEO[key] as boolean, v => sp(key, v))
              ))}
            </div>
            {inp("Custom / Other Schema Types", schemaSEO.custom_schemas, v => sp("custom_schemas", v), "text", "e.g. VideoObject, Recipe, JobPosting")}
          </div>

          {/* Rich Results */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" /> Rich Results (Google Search)
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {toggle("Eligible for Rich Results", schemaSEO.rich_results_eligible, v => sp("rich_results_eligible", v))}
              {toggle("Google Rich Results Test Done", schemaSEO.google_rich_results_tested, v => sp("google_rich_results_tested", v))}
              {toggle("Schema Validator Passed", schemaSEO.schema_validator_passed, v => sp("schema_validator_passed", v))}
            </div>
            {inp("Rich Results Types Appearing", schemaSEO.rich_results_types, v => sp("rich_results_types", v), "text", "e.g. FAQ snippets, Sitelinks, Star ratings")}
            <div className="grid grid-cols-2 gap-3 mt-3">
              {inp("Rich Results Impressions (GSC)", schemaSEO.rich_results_impressions, v => sp("rich_results_impressions", v), "number")}
              {inp("Rich Results Clicks (GSC)", schemaSEO.rich_results_clicks, v => sp("rich_results_clicks", v), "number")}
            </div>
            {inp("Validation Errors", schemaSEO.validation_errors, v => sp("validation_errors", v), "text", "e.g. Missing required field 'name' in Product schema")}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3">Schema Notes</h3>
            <textarea value={schemaSEO.notes} onChange={e => sp("notes", e.target.value)} rows={3}
              placeholder="Schema implementation observations, what to add next month..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      )}

      {/* ── Technical SEO ── */}
      {activeTab === "technical" && (
        <div className="space-y-5">

          {/* Overall */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-4">Technical SEO Overview</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Technical Score (0–100)</label>
                <input type="number" min="0" max="100" value={technicalSEO.technical_score}
                  onChange={e => tp("technical_score", e.target.value)} placeholder="e.g. 75"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              {inp("Issues Found", technicalSEO.issues_found, v => tp("issues_found", v), "number")}
              {inp("Issues Fixed", technicalSEO.issues_fixed, v => tp("issues_fixed", v), "number")}
            </div>
          </div>

          {/* Crawlability */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" /> Crawlability & Indexing
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {toggle("Robots.txt OK", technicalSEO.robots_txt_ok, v => tp("robots_txt_ok", v))}
              {toggle("XML Sitemap Exists", technicalSEO.xml_sitemap_exists, v => tp("xml_sitemap_exists", v))}
              {toggle("Sitemap Submitted to GSC", technicalSEO.xml_sitemap_submitted, v => tp("xml_sitemap_submitted", v))}
              {toggle("Google Search Console Connected", technicalSEO.google_search_console_connected, v => tp("google_search_console_connected", v))}
            </div>
            {inp("Robots.txt Issues", technicalSEO.robots_txt_issues, v => tp("robots_txt_issues", v), "text", "e.g. Blocking CSS/JS files")}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {inp("Pages Crawled", technicalSEO.pages_crawled, v => tp("pages_crawled", v), "number")}
              {inp("Pages Blocked", technicalSEO.pages_blocked, v => tp("pages_blocked", v), "number")}
              {inp("Crawl Errors", technicalSEO.crawl_errors, v => tp("crawl_errors", v), "number")}
              {inp("Sitemap Errors", technicalSEO.xml_sitemap_errors, v => tp("xml_sitemap_errors", v), "number")}
            </div>
          </div>

          {/* Indexing */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-500 rounded-full" /> Index Coverage
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {inp("Pages Indexed", technicalSEO.pages_indexed, v => tp("pages_indexed", v), "number")}
              {inp("Noindex Pages", technicalSEO.pages_noindex, v => tp("pages_noindex", v), "number")}
              {inp("Excluded Pages", technicalSEO.pages_excluded, v => tp("pages_excluded", v), "number")}
              {inp("Index Coverage Errors", technicalSEO.index_coverage_errors, v => tp("index_coverage_errors", v), "number")}
            </div>
          </div>

          {/* Site Architecture */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full" /> Site Architecture
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {inp("Max Crawl Depth (clicks from home)", technicalSEO.max_crawl_depth, v => tp("max_crawl_depth", v), "number")}
              {inp("Broken Links (4xx)", technicalSEO.broken_links, v => tp("broken_links", v), "number")}
              {inp("Redirect Chains", technicalSEO.redirect_chains, v => tp("redirect_chains", v), "number")}
              {inp("Redirect Loops", technicalSEO.redirect_loops, v => tp("redirect_loops", v), "number")}
              {inp("Orphan Pages", technicalSEO.orphan_pages, v => tp("orphan_pages", v), "number")}
              {inp("Duplicate Pages", technicalSEO.duplicate_pages, v => tp("duplicate_pages", v), "number")}
            </div>
            {inp("Canonical Issues", technicalSEO.canonical_issues, v => tp("canonical_issues", v), "number")}
          </div>

          {/* HTTPS & Security */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" /> HTTPS & Security
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {toggle("HTTPS Enabled", technicalSEO.https_enabled, v => tp("https_enabled", v))}
              {toggle("SSL Certificate Valid", technicalSEO.ssl_valid, v => tp("ssl_valid", v))}
              {toggle("Security Headers Set", technicalSEO.security_headers, v => tp("security_headers", v))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {inp("SSL Expiry Date", technicalSEO.ssl_expiry_date, v => tp("ssl_expiry_date", v), "text", "e.g. 2026-12-01")}
              {inp("Mixed Content Issues", technicalSEO.mixed_content_issues, v => tp("mixed_content_issues", v), "number")}
            </div>
          </div>

          {/* Mobile */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full" /> Mobile Usability
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {toggle("Mobile Friendly", technicalSEO.mobile_friendly, v => tp("mobile_friendly", v))}
              {toggle("Viewport Meta Tag", technicalSEO.viewport_meta, v => tp("viewport_meta", v))}
              {toggle("Responsive Design", technicalSEO.responsive_design, v => tp("responsive_design", v))}
            </div>
            {inp("Mobile Issues", technicalSEO.mobile_issues, v => tp("mobile_issues", v), "text", "e.g. Text too small, clickable elements too close")}
          </div>

          {/* Performance / Speed */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" /> Server & Performance
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {toggle("Server Response OK (<200ms)", technicalSEO.server_response_ok, v => tp("server_response_ok", v))}
              {toggle("Caching Enabled", technicalSEO.caching_enabled, v => tp("caching_enabled", v))}
              {toggle("CDN Used", technicalSEO.cdn_used, v => tp("cdn_used", v))}
              {toggle("Gzip/Brotli Compression", technicalSEO.compression_enabled, v => tp("compression_enabled", v))}
              {toggle("CSS Minified", technicalSEO.minified_css, v => tp("minified_css", v))}
              {toggle("JS Minified", technicalSEO.minified_js, v => tp("minified_js", v))}
              {toggle("Modern Image Formats (WebP/AVIF)", technicalSEO.image_format_modern, v => tp("image_format_modern", v))}
            </div>
            {inp("TTFB (Time to First Byte, ms)", technicalSEO.ttfb_ms, v => tp("ttfb_ms", v), "number", "e.g. 180")}
          </div>

          {/* Advanced */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-500 rounded-full" /> Advanced Technical
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {toggle("Hreflang Correct", technicalSEO.hreflang_correct, v => tp("hreflang_correct", v))}
              {toggle("Pagination Correct (rel prev/next)", technicalSEO.pagination_correct, v => tp("pagination_correct", v))}
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Google Search Console Data</p>
            <div className="grid grid-cols-3 gap-3">
              {inp("GSC Coverage Errors", technicalSEO.gsc_coverage_errors, v => tp("gsc_coverage_errors", v), "number")}
              {inp("GSC Manual Actions", technicalSEO.gsc_manual_actions, v => tp("gsc_manual_actions", v), "number")}
              {inp("GSC Enhancement Errors", technicalSEO.gsc_enhancement_errors, v => tp("gsc_enhancement_errors", v), "number")}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3">Technical SEO Notes</h3>
            <textarea value={technicalSEO.notes} onChange={e => tp("notes", e.target.value)} rows={4}
              placeholder="Technical issues found, fixes applied, recommendations..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      )}

      {/* ── Keywords ── */}
      {activeTab === "keywords" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">Keyword Rankings</h2>
            <div className="flex gap-2">
              <button type="button" onClick={refreshRankings} disabled={refreshing}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {refreshing ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />} 
                {refreshing ? "Tracking..." : "Refresh Rankings"}
              </button>
              <button type="button" onClick={() => setBulkKeywordModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                <ListPlus size={14} /> Bulk Add
              </button>
              <button type="button" onClick={addKeyword} className="flex items-center gap-1.5 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg">
                <Plus size={14} /> Add Keyword
              </button>
            </div>
          </div>
          <div className="mb-3 grid grid-cols-12 gap-2 px-1">
            {["Keyword", "Prev Rank", "Curr Rank", "Volume", "URL", ""].map((h, i) => (
              <p key={i} className={`text-xs font-medium text-slate-400 ${i === 0 ? "col-span-3" : i === 4 ? "col-span-2" : i === 5 ? "col-span-1" : "col-span-2"}`}>{h}</p>
            ))}
          </div>
          <div className="space-y-2">
            {keywords.map((kw, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <input placeholder="e.g. seo agency lahore" value={kw.keyword} onChange={e => updateKeyword(i, "keyword", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <input placeholder="15" type="number" value={kw.prev_ranking} onChange={e => updateKeyword(i, "prev_ranking", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <input placeholder="8" type="number" value={kw.curr_ranking} onChange={e => updateKeyword(i, "curr_ranking", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <input placeholder="1200" type="number" value={kw.search_volume} onChange={e => updateKeyword(i, "search_volume", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <input placeholder="URL" value={kw.url} onChange={e => updateKeyword(i, "url", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button type="button" onClick={() => removeKeyword(i)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">Lower number = better position (1 = #1 on Google)</p>
        </div>
      )}

      {/* ── Work Done ── */}
      {activeTab === "work" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">Work Done This Month</h2>
            <div className="flex gap-2">
              {clientId && (
                <button type="button" onClick={openImport}
                  className="flex items-center gap-1.5 text-sm text-violet-600 hover:bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-200 font-medium transition-colors">
                  <Download size={14} /> Import from Daily Log
                </button>
              )}
              <button type="button" onClick={addWork}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 font-medium transition-colors">
                <Plus size={14} /> Add Task
              </button>
            </div>
          </div>
          {!clientId && (
            <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
              Select a client in Basic Info tab to enable &quot;Import from Daily Log&quot;
            </div>
          )}
          <div className="space-y-2">
            {workDone.map((w, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <select value={w.category} onChange={e => updateWork(i, "category", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {WORK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-8">
                  <input placeholder="Describe what was done..." value={w.task} onChange={e => updateWork(i, "task", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button type="button" onClick={() => removeWork(i)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {workDone.filter(w => w.task).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No tasks yet — add manually or import from Daily Log</p>
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-bold text-slate-800">Import from Daily Log</h2>
                <p className="text-xs text-slate-400 mt-0.5">{month} {year} — select tasks to add</p>
              </div>
              <button onClick={() => setShowImport(false)} className="text-slate-400 hover:text-slate-600">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {importLoading ? (
                <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />)}</div>
              ) : importLogs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-400 font-medium">No daily log entries for {month} {year}</p>
                </div>
              ) : (
                <>
                  <button type="button" onClick={toggleAllImport} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-3 font-medium">
                    {importSelected.size === importLogs.length ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} className="text-slate-400" />}
                    {importSelected.size === importLogs.length ? "Deselect all" : `Select all (${importLogs.length})`}
                  </button>
                  <div className="space-y-2">
                    {importLogs.map(log => (
                      <label key={log.id} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${importSelected.has(log.id) ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:bg-slate-50"}`}>
                        <input type="checkbox" checked={importSelected.has(log.id)} onChange={() => toggleImportItem(log.id)} className="mt-0.5 accent-blue-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">{log.category}</span>
                            <span className="text-xs text-slate-400">{log.log_date}</span>
                          </div>
                          <p className="text-sm text-slate-700">{log.task}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
              <button type="button" onClick={applyImport} disabled={importSelected.size === 0}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
                Add {importSelected.size > 0 ? `${importSelected.size} task${importSelected.size !== 1 ? "s" : ""}` : "selected tasks"}
              </button>
              <button type="button" onClick={() => setShowImport(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
          {saving ? "Saving..." : reportId ? "Update Report" : "Create Report"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl text-sm border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
      </div>

      {/* Bulk Keyword Modal */}
      {bulkKeywordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-slate-800 mb-2 font-outfit">Bulk Add Keywords</h2>
            <p className="text-sm text-slate-500 mb-4">
              Paste your keywords below. Format: <code className="bg-slate-100 px-1 rounded text-blue-600 font-bold">Keyword, Prev, Curr, Volume, URL</code> (one per line)
            </p>
            <textarea value={bulkKeywordText} onChange={e => setBulkKeywordText(e.target.value)} rows={10}
              placeholder="SEO Agency, 10, 5, 1000, https://example.com/seo&#10;Backlink Service, 15, 12, 500, https://example.com/links"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none font-mono" />
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={applyBulkKeywords}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm">
                Add Keywords
              </button>
              <button type="button" onClick={() => setBulkKeywordModal(false)} className="px-6 py-2.5 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
