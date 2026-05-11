"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Download, CheckSquare, Square, Sparkles, Loader2, ListPlus, TrendingUp, Activity, ImagePlus, X, ZoomIn } from "lucide-react";
import ReportScreenshots from "@/components/ReportScreenshots";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WORK_CATEGORIES = ["On-Page SEO","Technical SEO","Link Building","Content","Local SEO","Reporting","Other"];

const REPORT_TEMPLATES = [
  {
    id: "month_1",
    name: "Month 1 - Technical & Baseline",
    notes: "This month focused heavily on technical SEO foundation, setting up Google Search Console, and creating a baseline for rankings.",
    recommendations: "Next month, we will shift focus to On-Page optimization for the main service pages and start local citation building."
  },
  {
    id: "local_seo",
    name: "Local SEO Boost",
    notes: "Focus was on Google Business Profile optimization, cleaning up NAP consistency, and acquiring high-quality local citations.",
    recommendations: "Next month, we will launch new location-specific landing pages and push for more Google Reviews."
  },
  {
    id: "content_links",
    name: "Content & Outreach",
    notes: "Published 3 new blog posts targeting informational keywords. Reached out to 50+ prospects for link building, securing 2 high-DA guest posts.",
    recommendations: "Continue content production. Plan to update older blog posts for better freshness scores."
  }
];

interface Keyword { keyword: string; prev_ranking: string; curr_ranking: string; search_volume: string; url: string; }
interface WorkItem { category: string; task: string; description?: string; images?: string[]; }
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

interface BlogItem {
  title: string;
  target_keyword: string;
  status: "Planned" | "Writing" | "Published";
  url?: string;
}

interface GmbPost {
  title: string;
  type: "Update" | "Offer" | "Event" | "Product";
  status: "Draft" | "Sent to Client" | "Published";
  notes?: string;
  image_url?: string;
}

interface ContentStrategy {
  blogs: BlogItem[];
  gmb_posts: GmbPost[];
  focus_topics: string;
  content_score: string;
  notes: string;
}

interface CsvSheet {
  name: string;
  headers: string[];
  rows: string[][];
}

interface SocialSignals {
  // Facebook
  fb_page_likes: string; fb_page_followers: string; fb_posts_this_month: string;
  fb_total_reach: string; fb_total_engagement: string; fb_shares: string; fb_page_url: string;
  // Instagram
  ig_followers: string; ig_posts_this_month: string; ig_impressions: string;
  ig_reach: string; ig_engagement: string; ig_profile_visits: string; ig_url: string;
  // Twitter/X
  tw_followers: string; tw_tweets_this_month: string; tw_impressions: string;
  tw_mentions: string; tw_retweets: string; tw_url: string;
  // LinkedIn
  li_followers: string; li_posts_this_month: string; li_impressions: string;
  li_engagements: string; li_url: string;
  // Pinterest
  pt_monthly_viewers: string; pt_pins_created: string; pt_saves: string; pt_url: string;
  // YouTube
  yt_subscribers: string; yt_views_this_month: string; yt_videos_published: string; yt_url: string;
  // Overall
  total_social_traffic: string; brand_mentions: string; notes: string;
}

interface PressRelease {
  items: {
    id: string;
    title: string;
    url: string;
    published_date: string;
    distribution: string;
    status: "Draft" | "Published" | "Picked Up";
    pickups: string;
    da: string;
    notes: string;
  }[];
  total_distribution: string;
  total_backlinks_earned: string;
  notes: string;
}

interface VideoSEO {
  platform: string;
  channel_url: string;
  videos_published: string;
  total_views: string; new_views: string;
  subscribers: string; new_subscribers: string;
  watch_time_hours: string;
  avg_view_duration: string;
  top_video_title: string; top_video_views: string; top_video_url: string;
  videos_optimized: string;
  titles_with_keyword: string;
  descriptions_optimized: string;
  tags_added: string;
  thumbnails_updated: string;
  cards_added: string;
  end_screens_added: string;
  playlists_created: string;
  video_schema_added: boolean;
  youtube_search_traffic: string;
  impressions: string; ctr: string;
  notes: string;
}

interface EcommerceSEO {
  platform: string;
  total_products: string;
  products_optimized: string;
  products_with_schema: string;
  category_pages_optimized: string;
  out_of_stock_handled: string;
  canonical_set: boolean;
  faceted_nav_ok: boolean;
  product_reviews_enabled: boolean;
  rich_snippets_eligible: boolean;
  // Performance
  organic_revenue: string; prev_organic_revenue: string;
  organic_transactions: string; prev_organic_transactions: string;
  organic_conversion_rate: string;
  cart_abandonment_rate: string;
  top_selling_organic_product: string;
  // Issues
  duplicate_product_pages: string;
  thin_product_descriptions: string;
  missing_product_images: string;
  broken_product_links: string;
  notes: string;
}

interface AiGeoSEO {
  // AI Visibility
  chatgpt_mentions: string; perplexity_mentions: string; gemini_mentions: string;
  bing_copilot_mentions: string; ai_overview_appearances: string;
  brand_in_ai_answers: boolean; competitor_in_ai_answers: boolean;
  // Featured Snippets & PAA
  featured_snippets_owned: string; featured_snippets_lost: string; featured_snippets_gained: string;
  paa_boxes_owned: string; knowledge_panel_exists: boolean; knowledge_panel_updated: boolean;
  // GEO Optimization work done
  structured_data_for_ai: boolean; faq_schema_added: boolean; speakable_schema: boolean;
  content_q_and_a_format: boolean; conversational_content_added: boolean;
  cited_by_ai_sources: string; ai_citation_urls: string;
  // AI Search Traffic
  ai_referral_traffic: string; zero_click_searches: string; ai_traffic_trend: string;
  // SGE / AI Overviews
  sge_impressions: string; sge_clicks: string; sge_ctr: string;
  // Scores
  geo_score: string; ai_visibility_score: string; notes: string;
}

interface NlpSEO {
  // Entity Optimization
  primary_entity: string; secondary_entities: string; entity_type: string;
  entity_in_title: boolean; entity_in_h1: boolean; entity_in_meta: boolean;
  entities_added_this_month: string; entities_linked_to_kg: boolean;
  // Content Quality
  readability_score: string; readability_grade: string; flesch_kincaid: string;
  avg_sentence_length: string; passive_voice_percent: string;
  sentiment_score: string; sentiment_label: string;
  // NLP Keywords
  nlp_keywords_targeted: string; nlp_keywords_ranking: string;
  co_occurrence_terms: string; topic_authority_score: string;
  // EEAT
  author_bio_added: boolean; expert_quotes_added: boolean;
  citations_added: string; trust_signals_added: string;
  fact_checked: boolean; last_updated_shown: boolean;
  // Structured Data NLP
  speakable_markup: boolean; faq_markup: boolean; howto_markup: boolean;
  article_schema: boolean; review_schema: boolean;
  // Score
  nlp_score: string; content_depth_score: string; notes: string;
}

interface SemanticSEO {
  // Topic Clusters
  pillar_pages: string; cluster_pages: string; new_pillar_pages: string;
  new_cluster_pages: string; pillar_pages_list: string;
  // LSI Keywords
  lsi_keywords_added: string; lsi_keywords_ranking: string; lsi_keywords_list: string;
  // Internal Linking
  internal_links_added: string; orphan_pages_fixed: string; silo_structure_ok: boolean;
  avg_internal_links_per_page: string; hub_pages_identified: string;
  // Content Coverage
  topic_coverage_score: string; content_gaps_identified: string;
  content_gaps_filled: string; cannibalization_issues: string;
  cannibalization_fixed: string;
  // Topical Authority
  topical_authority_score: string; niche_relevance_score: string;
  total_pages_on_topic: string; pages_added_this_month: string;
  // Co-Citation & Co-Occurrence
  co_citations: string; co_occurrences_targeted: string;
  related_terms_used: string;
  // Score
  semantic_score: string; notes: string;
}

interface ImageSeoReport {
  // Inventory
  total_images: string; images_with_alt: string; images_missing_alt: string;
  images_missing_alt_fixed: string;
  // Optimization
  images_compressed: string; images_converted_to_webp: string;
  lazy_loading_enabled: boolean; responsive_images: boolean;
  images_with_title_attr: string;
  // File Sizes
  avg_image_size_kb: string; oversized_images: string; oversized_images_fixed: string;
  // Structured Data
  images_with_schema: string; product_images_schema: string;
  article_images_schema: string; logo_schema: boolean;
  // Google Image Search
  image_search_impressions: string; image_search_clicks: string; image_search_ctr: string;
  top_ranking_image: string; top_ranking_image_keyword: string;
  // CDN & Delivery
  cdn_serving_images: boolean; next_gen_formats: boolean; image_sitemap_submitted: boolean;
  // Score
  image_seo_score: string; issues_fixed: string; notes: string;
}

interface ActionItem {
  id: string;
  task: string;
  priority: "high" | "medium" | "low";
  done: boolean;
}

interface Goal {
  id: string;
  goal: string;
  target: string;
  achieved: string;
  status: "achieved" | "partial" | "missed" | "ongoing";
}

interface TimeEntry {
  id: string;
  category: string;
  hours: string;
  notes: string;
}

interface InvoiceItem {
  desc: string;
  qty: string;
  price: string;
}

interface Invoice {
  number: string;
  date: string;
  due_date: string;
  currency: string;
  items: InvoiceItem[];
  notes: string;
  paid: boolean;
}

interface ReviewRequest {
  id: string;
  platform: string;
  link: string;
  sent: boolean;
  notes: string;
}

interface SectionVisibility {
  executive_summary?: boolean;
  metrics?: boolean;
  scores_radar?: boolean;
  keywords?: boolean;
  work_done?: boolean;
  on_page?: boolean;
  local_seo?: boolean;
  schema?: boolean;
  technical?: boolean;
  content?: boolean;
  pagespeed?: boolean;
  goals?: boolean;
  time_spent?: boolean;
  invoice?: boolean;
  review_requests?: boolean;
  action_items?: boolean;
  backlinks?: boolean;
  competitors?: boolean;
  rank_history?: boolean;
  daily_logs?: boolean;
  csv_sheets?: boolean;
  screenshots?: boolean;
  recommendations?: boolean;
  social_signals?: boolean;
  press_release?: boolean;
  video_seo?: boolean;
  ecommerce?: boolean;
  ai_geo_seo?: boolean;
  nlp_seo?: boolean;
  semantic_seo?: boolean;
  image_seo?: boolean;
}

interface Client { id: string; name: string; website?: string; }

interface Props {
  reportId?: string;
  initialClientId?: string;
  initialWebsiteId?: string;
  initial?: {
    client_id: string; month: string; year: number; status: string;
    keywords: Keyword[]; work_done: WorkItem[]; metrics?: Partial<Metrics>;
    on_page_seo?: Partial<OnPageSEO>;
    local_seo?: Partial<LocalSEO>;
    schema_seo?: Partial<SchemaSEO>;
    technical_seo?: Partial<TechnicalSEO>;
    content_strategy?: Partial<ContentStrategy>;
    csv_sheets?: CsvSheet[];
    action_items?: ActionItem[];
    executive_summary?: string;
    goals?: Goal[];
    time_spent?: TimeEntry[];
    invoice?: Invoice;
    review_requests?: ReviewRequest[];
    section_visibility?: SectionVisibility;
    social_signals?: Partial<SocialSignals>;
    press_release?: Partial<PressRelease>;
    video_seo?: Partial<VideoSEO>;
    ecommerce_seo?: Partial<EcommerceSEO>;
    ai_geo_seo?: Partial<AiGeoSEO>;
    nlp_seo?: Partial<NlpSEO>;
    semantic_seo?: Partial<SemanticSEO>;
    image_seo_report?: Partial<ImageSeoReport>;
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

const defaultContentStrategy: ContentStrategy = {
  blogs: [{ title: "", target_keyword: "", status: "Planned", url: "" }],
  gmb_posts: [],
  focus_topics: "",
  content_score: "",
  notes: "",
};

const defaultSocial: SocialSignals = {
  fb_page_likes: "", fb_page_followers: "", fb_posts_this_month: "",
  fb_total_reach: "", fb_total_engagement: "", fb_shares: "", fb_page_url: "",
  ig_followers: "", ig_posts_this_month: "", ig_impressions: "",
  ig_reach: "", ig_engagement: "", ig_profile_visits: "", ig_url: "",
  tw_followers: "", tw_tweets_this_month: "", tw_impressions: "",
  tw_mentions: "", tw_retweets: "", tw_url: "",
  li_followers: "", li_posts_this_month: "", li_impressions: "",
  li_engagements: "", li_url: "",
  pt_monthly_viewers: "", pt_pins_created: "", pt_saves: "", pt_url: "",
  yt_subscribers: "", yt_views_this_month: "", yt_videos_published: "", yt_url: "",
  total_social_traffic: "", brand_mentions: "", notes: "",
};

const defaultVideoSEO: VideoSEO = {
  platform: "YouTube", channel_url: "",
  videos_published: "", total_views: "", new_views: "",
  subscribers: "", new_subscribers: "", watch_time_hours: "",
  avg_view_duration: "", top_video_title: "", top_video_views: "", top_video_url: "",
  videos_optimized: "", titles_with_keyword: "", descriptions_optimized: "",
  tags_added: "", thumbnails_updated: "", cards_added: "",
  end_screens_added: "", playlists_created: "",
  video_schema_added: false,
  youtube_search_traffic: "", impressions: "", ctr: "", notes: "",
};

const defaultEcommerce: EcommerceSEO = {
  platform: "WooCommerce",
  total_products: "", products_optimized: "", products_with_schema: "",
  category_pages_optimized: "", out_of_stock_handled: "",
  canonical_set: false, faceted_nav_ok: false,
  product_reviews_enabled: false, rich_snippets_eligible: false,
  organic_revenue: "", prev_organic_revenue: "",
  organic_transactions: "", prev_organic_transactions: "",
  organic_conversion_rate: "", cart_abandonment_rate: "",
  top_selling_organic_product: "",
  duplicate_product_pages: "", thin_product_descriptions: "",
  missing_product_images: "", broken_product_links: "", notes: "",
};

const defaultAiGeo: AiGeoSEO = {
  chatgpt_mentions: "", perplexity_mentions: "", gemini_mentions: "",
  bing_copilot_mentions: "", ai_overview_appearances: "",
  brand_in_ai_answers: false, competitor_in_ai_answers: false,
  featured_snippets_owned: "", featured_snippets_lost: "", featured_snippets_gained: "",
  paa_boxes_owned: "", knowledge_panel_exists: false, knowledge_panel_updated: false,
  structured_data_for_ai: false, faq_schema_added: false, speakable_schema: false,
  content_q_and_a_format: false, conversational_content_added: false,
  cited_by_ai_sources: "", ai_citation_urls: "",
  ai_referral_traffic: "", zero_click_searches: "", ai_traffic_trend: "",
  sge_impressions: "", sge_clicks: "", sge_ctr: "",
  geo_score: "", ai_visibility_score: "", notes: "",
};

const defaultNlp: NlpSEO = {
  primary_entity: "", secondary_entities: "", entity_type: "",
  entity_in_title: false, entity_in_h1: false, entity_in_meta: false,
  entities_added_this_month: "", entities_linked_to_kg: false,
  readability_score: "", readability_grade: "", flesch_kincaid: "",
  avg_sentence_length: "", passive_voice_percent: "",
  sentiment_score: "", sentiment_label: "",
  nlp_keywords_targeted: "", nlp_keywords_ranking: "",
  co_occurrence_terms: "", topic_authority_score: "",
  author_bio_added: false, expert_quotes_added: false,
  citations_added: "", trust_signals_added: "",
  fact_checked: false, last_updated_shown: false,
  speakable_markup: false, faq_markup: false, howto_markup: false,
  article_schema: false, review_schema: false,
  nlp_score: "", content_depth_score: "", notes: "",
};

const defaultSemantic: SemanticSEO = {
  pillar_pages: "", cluster_pages: "", new_pillar_pages: "", new_cluster_pages: "", pillar_pages_list: "",
  lsi_keywords_added: "", lsi_keywords_ranking: "", lsi_keywords_list: "",
  internal_links_added: "", orphan_pages_fixed: "", silo_structure_ok: false,
  avg_internal_links_per_page: "", hub_pages_identified: "",
  topic_coverage_score: "", content_gaps_identified: "", content_gaps_filled: "",
  cannibalization_issues: "", cannibalization_fixed: "",
  topical_authority_score: "", niche_relevance_score: "",
  total_pages_on_topic: "", pages_added_this_month: "",
  co_citations: "", co_occurrences_targeted: "", related_terms_used: "",
  semantic_score: "", notes: "",
};

const defaultImageSeo: ImageSeoReport = {
  total_images: "", images_with_alt: "", images_missing_alt: "", images_missing_alt_fixed: "",
  images_compressed: "", images_converted_to_webp: "",
  lazy_loading_enabled: false, responsive_images: false, images_with_title_attr: "",
  avg_image_size_kb: "", oversized_images: "", oversized_images_fixed: "",
  images_with_schema: "", product_images_schema: "", article_images_schema: "", logo_schema: false,
  image_search_impressions: "", image_search_clicks: "", image_search_ctr: "",
  top_ranking_image: "", top_ranking_image_keyword: "",
  cdn_serving_images: false, next_gen_formats: false, image_sitemap_submitted: false,
  image_seo_score: "", issues_fixed: "", notes: "",
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

function GmbPostCard({ post, index, onChange, onRemove }: {
  post: GmbPost;
  index: number;
  onChange: (updated: GmbPost) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = ev => {
      onChange({ ...post, image_url: ev.target?.result as string });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 relative group">
      <button type="button" onClick={onRemove}
        className="absolute -top-2 -right-2 bg-white border border-slate-200 p-1 rounded-full text-slate-300 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
        <Trash2 size={12} />
      </button>

      <div className="flex gap-4">
        {/* Image column */}
        <div className="shrink-0 w-28">
          {post.image_url ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-28 w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt="GMB post" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center gap-1.5 opacity-0 hover:opacity-100">
                <button type="button" onClick={() => setLightbox(true)}
                  className="bg-white text-slate-700 p-1.5 rounded-full shadow text-xs">
                  <ZoomIn size={12} />
                </button>
                <button type="button" onClick={() => { onChange({ ...post, image_url: undefined }); if (fileRef.current) fileRef.current.value = ""; }}
                  className="bg-white text-red-500 p-1.5 rounded-full shadow text-xs">
                  <X size={12} />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-1.5 cursor-pointer h-28 w-28 rounded-xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 transition-colors">
              {uploading ? (
                <Loader2 size={18} className="text-emerald-400 animate-spin" />
              ) : (
                <>
                  <ImagePlus size={18} className="text-emerald-400" />
                  <span className="text-[10px] text-emerald-500 font-medium text-center leading-tight">Add<br/>Image</span>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={uploading} />
            </label>
          )}
        </div>

        {/* Fields column */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Post Title / Topic</label>
              <input value={post.title} onChange={e => onChange({ ...post, title: e.target.value })}
                placeholder="e.g. Summer Sale — 20% Off All Services"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Post Type</label>
              <select value={post.type} onChange={e => onChange({ ...post, type: e.target.value as GmbPost["type"] })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                <option value="Update">Update</option>
                <option value="Offer">Offer</option>
                <option value="Event">Event</option>
                <option value="Product">Product</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={post.status} onChange={e => onChange({ ...post, status: e.target.value as GmbPost["status"] })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                <option value="Draft">Draft</option>
                <option value="Sent to Client">Sent to Client</option>
                <option value="Published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optional)</label>
              <input value={post.notes ?? ""} onChange={e => onChange({ ...post, notes: e.target.value })}
                placeholder="e.g. Client approved, posted on 5th"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && post.image_url && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <div className="relative max-w-3xl max-h-full" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt={post.title} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
            <div className="mt-3 text-center">
              <span className="text-white text-sm font-medium">{post.title}</span>
            </div>
            <button onClick={() => setLightbox(false)}
              className="absolute -top-4 -right-4 bg-white text-slate-700 rounded-full p-2 shadow-lg hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const parse = (line: string): string[] => {
    const cols: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; continue; }
      if (c === "," && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
      cur += c;
    }
    cols.push(cur.trim());
    return cols;
  };
  const headers = parse(lines[0]);
  const rows = lines.slice(1).map(parse);
  return { headers, rows };
}

function CsvSheetsTab({ sheets, onChange }: { sheets: CsvSheet[]; onChange: (s: CsvSheet[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [activeSheet, setActiveSheet] = useState(0);
  const [editName, setEditName] = useState<number | null>(null);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setParsing(true);
    const newSheets: CsvSheet[] = [];
    let done = 0;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const text = ev.target?.result as string;
        const { headers, rows } = parseCSV(text);
        newSheets.push({ name: file.name.replace(/\.csv$/i, ""), headers, rows });
        done++;
        if (done === files.length) {
          onChange([...sheets, ...newSheets]);
          setActiveSheet(sheets.length);
          setParsing(false);
          if (fileRef.current) fileRef.current.value = "";
        }
      };
      reader.readAsText(file);
    });
  };

  const removeSheet = (i: number) => {
    onChange(sheets.filter((_, idx) => idx !== i));
    setActiveSheet(Math.max(0, i - 1));
  };

  const sheet = sheets[activeSheet];

  const sorted = sheet ? [...sheet.rows].sort((a, b) => {
    if (sortCol === null) return 0;
    const av = a[sortCol] ?? "";
    const bv = b[sortCol] ?? "";
    const n = (v: string) => parseFloat(v.replace(/[^0-9.-]/g, ""));
    const an = n(av); const bn = n(bv);
    const cmp = (!isNaN(an) && !isNaN(bn)) ? an - bn : av.localeCompare(bv);
    return sortDir === "asc" ? cmp : -cmp;
  }) : [];

  const filtered = search ? sorted.filter(row => row.some(c => c.toLowerCase().includes(search.toLowerCase()))) : sorted;

  const toggleSort = (i: number) => {
    if (sortCol === i) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(i); setSortDir("asc"); }
  };

  return (
    <div className="space-y-4">
      {/* Upload bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-slate-700">Data Sheets</h2>
            <p className="text-xs text-slate-400 mt-0.5">Upload CSV exports — GSC, Ahrefs, Semrush, any spreadsheet</p>
          </div>
          <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${parsing ? "bg-slate-100 text-slate-400" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
            {parsing ? <><Loader2 size={14} className="animate-spin" /> Parsing…</> : <><Plus size={14} /> Upload CSV</>}
            <input ref={fileRef} type="file" accept=".csv,text/csv" multiple className="hidden" onChange={handleFiles} disabled={parsing} />
          </label>
        </div>

        {sheets.length === 0 ? (
          <label className="flex flex-col items-center gap-3 py-10 border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-2xl cursor-pointer transition-colors">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Plus size={22} className="text-blue-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">Click to upload CSV files</p>
              <p className="text-xs text-slate-400 mt-1">GSC Performance · Ahrefs Keywords · Backlinks · Any export</p>
            </div>
            <input type="file" accept=".csv,text/csv" multiple className="hidden" onChange={handleFiles} />
          </label>
        ) : (
          /* Sheet tabs */
          <div className="flex flex-wrap gap-2">
            {sheets.map((s, i) => (
              <div key={i} className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium cursor-pointer transition-colors ${activeSheet === i ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
                onClick={() => { setActiveSheet(i); setSearch(""); setSortCol(null); }}>
                {editName === i ? (
                  <input
                    autoFocus
                    value={s.name}
                    onChange={e => onChange(sheets.map((sh, idx) => idx === i ? { ...sh, name: e.target.value } : sh))}
                    onBlur={() => setEditName(null)}
                    onKeyDown={e => e.key === "Enter" && setEditName(null)}
                    onClick={e => e.stopPropagation()}
                    className="bg-transparent outline-none w-24 text-sm"
                  />
                ) : (
                  <span onDoubleClick={e => { e.stopPropagation(); setEditName(i); }}>{s.name}</span>
                )}
                <span className={`text-xs ${activeSheet === i ? "text-blue-200" : "text-slate-400"}`}>{s.rows.length}r</span>
                <button type="button" onClick={e => { e.stopPropagation(); removeSheet(i); }}
                  className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all ${activeSheet === i ? "hover:bg-blue-500 text-blue-100" : "hover:bg-red-50 text-slate-400 hover:text-red-500"}`}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sheet preview */}
      {sheet && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700 flex-1">{sheet.name} <span className="text-slate-400 font-normal">— {sheet.rows.length} rows × {sheet.headers.length} cols</span></p>
            <div className="relative">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40" />
              <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            {search && <span className="text-xs text-slate-400">{filtered.length} results</span>}
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  {sheet.headers.map((h, i) => (
                    <th key={i} onClick={() => toggleSort(i)}
                      className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap cursor-pointer hover:bg-slate-100 border-b border-slate-100 select-none">
                      <span className="flex items-center gap-1">
                        {h}
                        {sortCol === i ? (sortDir === "asc" ? " ↑" : " ↓") : <span className="text-slate-300">↕</span>}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.slice(0, 200).map((row, ri) => (
                  <tr key={ri} className="hover:bg-slate-50/60 transition-colors">
                    {sheet.headers.map((_, ci) => (
                      <td key={ci} className="px-3 py-2 text-slate-600 whitespace-nowrap max-w-xs truncate">{row[ci] ?? ""}</td>
                    ))}
                  </tr>
                ))}
                {filtered.length > 200 && (
                  <tr><td colSpan={sheet.headers.length} className="px-3 py-2 text-center text-slate-400 text-xs">Showing 200 of {filtered.length} rows</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const WORK_CAT_COLOR: Record<string, string> = {
  "On-Page SEO":   "bg-blue-100 text-blue-700 border-blue-200",
  "Technical SEO": "bg-violet-100 text-violet-700 border-violet-200",
  "Link Building": "bg-orange-100 text-orange-700 border-orange-200",
  "Content":       "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Local SEO":     "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Reporting":     "bg-slate-100 text-slate-600 border-slate-200",
  "Other":         "bg-pink-100 text-pink-700 border-pink-200",
};

function WorkItemCard({ item, onChange, onRemove }: {
  item: WorkItem;
  onChange: (updated: WorkItem) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const addImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    let loaded = 0;
    const newUrls: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        newUrls.push(ev.target?.result as string);
        loaded++;
        if (loaded === files.length) {
          onChange({ ...item, images: [...(item.images ?? []), ...newUrls] });
          if (fileRef.current) fileRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) =>
    onChange({ ...item, images: (item.images ?? []).filter((_, i) => i !== idx) });

  const catColor = WORK_CAT_COLOR[item.category] ?? "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm group relative">
      <button type="button" onClick={onRemove}
        className="absolute top-3 right-3 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-50">
        <Trash2 size={14} />
      </button>

      {/* Row 1: category + task */}
      <div className="flex gap-3 items-start pr-7">
        <select value={item.category} onChange={e => onChange({ ...item, category: e.target.value })}
          className={`shrink-0 text-xs font-semibold border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${catColor}`}>
          {WORK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input value={item.task} onChange={e => onChange({ ...item, task: e.target.value })}
          placeholder="What was done? (e.g. Fixed broken canonical tags on 5 pages)"
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Row 2: description */}
      <div className="mt-2">
        <textarea value={item.description ?? ""} onChange={e => onChange({ ...item, description: e.target.value })}
          placeholder="Details / notes (optional) — e.g. Updated title tags on homepage, about, services pages. Added target keyword in first 100 words."
          rows={2}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      {/* Row 3: images */}
      <div className="mt-3 flex flex-wrap gap-2 items-center">
        {(item.images ?? []).map((img, idx) => (
          <div key={idx} className="relative group/img w-20 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover/img:opacity-100">
              <button type="button" onClick={() => setLightbox(img)} className="bg-white text-slate-700 p-1 rounded-full shadow">
                <ZoomIn size={11} />
              </button>
              <button type="button" onClick={() => removeImage(idx)} className="bg-white text-red-500 p-1 rounded-full shadow">
                <X size={11} />
              </button>
            </div>
          </div>
        ))}
        <label className="flex items-center gap-1.5 cursor-pointer border-2 border-dashed border-slate-200 hover:border-blue-400 text-slate-400 hover:text-blue-500 rounded-xl px-3 py-2 text-xs font-medium transition-colors">
          <ImagePlus size={14} /> Add Image
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={addImages} />
        </label>
      </div>

      {lightbox && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
            <button onClick={() => setLightbox(null)}
              className="absolute -top-4 -right-4 bg-white text-slate-700 rounded-full p-2 shadow-lg hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportForm({ reportId, initialClientId, initialWebsiteId, initial }: Props) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(initial?.client_id ?? initialClientId ?? "");
  const [websiteId, setWebsiteId] = useState(initialWebsiteId ?? "");
  const [websites, setWebsites] = useState<{ id: string; url: string; name: string }[]>([]);
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
  const [contentStrategy, setContentStrategy] = useState<ContentStrategy>({
    ...defaultContentStrategy,
    ...initial?.content_strategy,
    blogs: initial?.content_strategy?.blogs ?? defaultContentStrategy.blogs,
    gmb_posts: initial?.content_strategy?.gmb_posts ?? defaultContentStrategy.gmb_posts,
  });
  const [csvSheets, setCsvSheets] = useState<CsvSheet[]>(initial?.csv_sheets ?? []);
  const [actionItems, setActionItems] = useState<ActionItem[]>(initial?.action_items ?? []);
  const [executiveSummary, setExecutiveSummary] = useState(initial?.executive_summary ?? "");
  const [socialSignals, setSocialSignals] = useState<SocialSignals>({ ...defaultSocial, ...initial?.social_signals });
  const [pressRelease, setPressRelease] = useState<PressRelease>({
    items: initial?.press_release?.items ?? [],
    total_distribution: initial?.press_release?.total_distribution ?? "",
    total_backlinks_earned: initial?.press_release?.total_backlinks_earned ?? "",
    notes: initial?.press_release?.notes ?? "",
  });
  const [videoSEO, setVideoSEO] = useState<VideoSEO>({ ...defaultVideoSEO, ...initial?.video_seo });
  const [ecommerceSEO, setEcommerceSEO] = useState<EcommerceSEO>({ ...defaultEcommerce, ...initial?.ecommerce_seo });
  const [aiGeoSEO, setAiGeoSEO] = useState<AiGeoSEO>({ ...defaultAiGeo, ...initial?.ai_geo_seo });
  const [nlpSEO, setNlpSEO] = useState<NlpSEO>({ ...defaultNlp, ...initial?.nlp_seo });
  const [semanticSEO, setSemanticSEO] = useState<SemanticSEO>({ ...defaultSemantic, ...initial?.semantic_seo });
  const [imageSeoReport, setImageSeoReport] = useState<ImageSeoReport>({ ...defaultImageSeo, ...initial?.image_seo_report });
  const [goals, setGoals] = useState<Goal[]>(initial?.goals ?? []);
  const [timeSpent, setTimeSpent] = useState<TimeEntry[]>(initial?.time_spent ?? []);
  const [invoice, setInvoice] = useState<Invoice>(initial?.invoice ?? {
    number: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
    date: new Date().toISOString().split("T")[0],
    due_date: "",
    currency: "USD",
    items: [{ desc: "Monthly SEO Services", qty: "1", price: "500" }],
    notes: "",
    paid: false,
  });
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>(initial?.review_requests ?? []);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    executive_summary: true, metrics: true, scores_radar: true, keywords: true, work_done: true,
    on_page: true, local_seo: true, schema: true, technical: true, content: true,
    pagespeed: true, social_signals: true, press_release: true, video_seo: true, ecommerce: true,
    ai_geo_seo: true, nlp_seo: true, semantic_seo: true, image_seo: true,
    goals: true, time_spent: true, invoice: false, review_requests: true,
    action_items: true, backlinks: true, competitors: true, rank_history: true, daily_logs: true,
    csv_sheets: true, screenshots: true, recommendations: true,
    ...initial?.section_visibility,
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "metrics" | "onpage" | "localseo" | "schema" | "technical" | "content" | "social" | "pr" | "video" | "ecom" | "aigeo" | "nlp" | "semantic" | "imageseo" | "keywords" | "work" | "screenshots" | "sheets" | "actions" | "goals" | "time" | "invoice" | "reviews" | "visibility">("info");
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

  useEffect(() => {
    if (!clientId) { setWebsites([]); return; }
    fetch(`/api/websites?clientId=${clientId}`)
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setWebsites(Array.isArray(d) ? d : []));
  }, [clientId]);

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

  const addWork = () => setWorkDone([...workDone, { category: "On-Page SEO", task: "", description: "", images: [] }]);
  const removeWork = (i: number) => setWorkDone(workDone.filter((_, idx) => idx !== i));
  const updateWork = (i: number, updated: Partial<WorkItem>) =>
    setWorkDone(workDone.map((w, idx) => idx === i ? { ...w, ...updated } : w));

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
      website_id: websiteId || null,
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
      content_strategy: {
        blogs: contentStrategy.blogs.filter(b => b.title),
        gmb_posts: contentStrategy.gmb_posts ?? [],
        focus_topics: contentStrategy.focus_topics || null,
        content_score: num(contentStrategy.content_score),
        notes: contentStrategy.notes || null,
      },
      csv_sheets: csvSheets,
      action_items: actionItems,
      executive_summary: executiveSummary || null,
      goals,
      time_spent: timeSpent,
      invoice,
      review_requests: reviewRequests,
      section_visibility: sectionVisibility,
      social_signals: socialSignals,
      press_release: pressRelease,
      video_seo: videoSEO,
      ecommerce_seo: ecommerceSEO,
      ai_geo_seo: aiGeoSEO,
      nlp_seo: nlpSEO,
      semantic_seo: semanticSEO,
      image_seo_report: imageSeoReport,
    };
    const url = reportId ? `/api/reports/${reportId}` : "/api/reports";
    const method = reportId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok || !data?.id) {
      alert(data?.error ?? "Failed to save report. Please try again.");
      return;
    }
    router.push(`/dashboard/reports/${data.id}`);
  };

  const tabs = [
    { id: "info", label: "Basic Info" },
    { id: "metrics", label: "Metrics" },
    { id: "onpage", label: "On-Page SEO" },
    { id: "localseo", label: "Local SEO" },
    { id: "schema", label: "Schema Markup" },
    { id: "technical", label: "Technical SEO" },
    { id: "content", label: "Content & Blogs" },
    { id: "keywords", label: `Keywords (${keywords.length})` },
    { id: "work", label: `Work Done (${workDone.length})` },
    { id: "social", label: "Social Signals" },
    { id: "pr", label: `Press Release${pressRelease.items.length ? ` (${pressRelease.items.length})` : ""}` },
    { id: "video", label: "Video SEO" },
    { id: "ecom", label: "E-commerce SEO" },
    { id: "aigeo", label: "AI / GEO SEO" },
    { id: "nlp", label: "NLP SEO" },
    { id: "semantic", label: "Semantic / LSI" },
    { id: "imageseo", label: "Image SEO" },
    { id: "goals", label: `Goals/KPIs${goals.length ? ` (${goals.length})` : ""}` },
    { id: "time", label: `Time Spent${timeSpent.length ? ` (${timeSpent.length})` : ""}` },
    { id: "invoice", label: "Invoice" },
    { id: "reviews", label: `Review Requests${reviewRequests.length ? ` (${reviewRequests.length})` : ""}` },
    { id: "actions", label: `Action Items${actionItems.length ? ` (${actionItems.length})` : ""}` },
    { id: "screenshots", label: "Screenshots" },
    { id: "sheets", label: `Data Sheets${csvSheets.length ? ` (${csvSheets.length})` : ""}` },
    { id: "visibility", label: "⚙ Sections" },
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
            {clientId && websites.length > 0 && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Website <span className="text-slate-400">(optional — for multi-site clients)</span></label>
                <select value={websiteId} onChange={e => setWebsiteId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- All / No specific website --</option>
                  {websites.map(w => <option key={w.id} value={w.id}>{w.name || w.url}</option>)}
                </select>
              </div>
            )}
            {clientId && websites.length === 0 && (
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
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Executive Summary <span className="text-slate-400 font-normal">(shown at top of report)</span></label>
            <textarea rows={4} value={executiveSummary} onChange={e => setExecutiveSummary(e.target.value)}
              placeholder="Brief overview of this month's SEO work, key wins, and what was accomplished for the client..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
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
              <div className="flex items-center gap-2">
                <select 
                  onChange={(e) => {
                    const t = REPORT_TEMPLATES.find(x => x.id === e.target.value);
                    if (t) setMetrics(m => ({...m, notes: t.notes, recommendations: t.recommendations}));
                    e.target.value = "";
                  }}
                  className="text-[10px] md:text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <option value="">Load Template...</option>
                  {REPORT_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                {reportId && (
                  <AISummaryButton reportId={reportId} onGenerated={summary => setMetrics(m => ({ ...m, notes: summary }))} />
                )}
              </div>
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

      {/* ── Content & Blogs ── */}
      {activeTab === "content" && (
        <div className="space-y-5">

          {/* GMB Posts */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-slate-700">GMB Posts This Month</h2>
                <p className="text-xs text-slate-400 mt-0.5">Posts sent to client or published on Google Business Profile</p>
              </div>
              <button type="button" onClick={() => setContentStrategy(s => ({ ...s, gmb_posts: [...(s.gmb_posts ?? []), { title: "", type: "Update", status: "Draft", notes: "" }] }))}
                className="flex items-center gap-1.5 text-sm text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium transition-colors">
                <Plus size={14} /> Add GMB Post
              </button>
            </div>
            <div className="space-y-3">
              {(contentStrategy.gmb_posts ?? []).map((post, i) => (
                <GmbPostCard
                  key={i}
                  post={post}
                  index={i}
                  onChange={(updated) => setContentStrategy(s => ({ ...s, gmb_posts: (s.gmb_posts ?? []).map((p, idx) => idx === i ? updated : p) }))}
                  onRemove={() => setContentStrategy(s => ({ ...s, gmb_posts: (s.gmb_posts ?? []).filter((_, idx) => idx !== i) }))}
                />
              ))}
              {(contentStrategy.gmb_posts ?? []).length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-sm text-slate-400">No GMB posts added yet</p>
                  <p className="text-xs text-slate-300 mt-1">Add posts you sent to the client or published this month</p>
                </div>
              )}
            </div>
          </div>

          {/* Blog Titles */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-slate-700">Blog Titles This Month</h2>
                <p className="text-xs text-slate-400 mt-0.5">Blog post titles suggested, written, or published</p>
              </div>
              <button type="button" onClick={() => setContentStrategy(s => ({ ...s, blogs: [...s.blogs, { title: "", target_keyword: "", status: "Planned", url: "" }] }))}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 font-medium transition-colors">
                <Plus size={14} /> Add Blog Title
              </button>
            </div>
            <div className="space-y-3">
              {contentStrategy.blogs.map((blog, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 relative group">
                  <button type="button" onClick={() => setContentStrategy(s => ({ ...s, blogs: s.blogs.filter((_, idx) => idx !== i) }))}
                    className="absolute -top-2 -right-2 bg-white border border-slate-200 p-1 rounded-full text-slate-300 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={12} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inp("Blog Title", blog.title, v => setContentStrategy(s => ({ ...s, blogs: s.blogs.map((b, idx) => idx === i ? { ...b, title: v } : b) })), "text", "e.g. 10 Best SEO Strategies for 2026")}
                    {inp("Target Keyword", blog.target_keyword, v => setContentStrategy(s => ({ ...s, blogs: s.blogs.map((b, idx) => idx === i ? { ...b, target_keyword: v } : b) })), "text", "e.g. seo strategies 2026")}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                      <select value={blog.status} onChange={e => setContentStrategy(s => ({ ...s, blogs: s.blogs.map((b, idx) => idx === i ? { ...b, status: e.target.value as BlogItem["status"] } : b) }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="Planned">Planned</option>
                        <option value="Writing">Writing</option>
                        <option value="Published">Published</option>
                      </select>
                    </div>
                    {blog.status === "Published" && inp("Live URL", blog.url || "", v => setContentStrategy(s => ({ ...s, blogs: s.blogs.map((b, idx) => idx === i ? { ...b, url: v } : b) })), "text", "https://...")}
                  </div>
                </div>
              ))}
              {contentStrategy.blogs.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-sm text-slate-400">No blog titles added yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-700 mb-3">Topic Clusters & Focus Areas</h3>
            <textarea value={contentStrategy.focus_topics} onChange={e => setContentStrategy(s => ({ ...s, focus_topics: e.target.value }))} rows={3}
              placeholder="e.g. Focus on 'Local SEO in Lahore' and 'Technical SEO for E-commerce'..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Content Health Score</label>
              <input type="number" min="0" max="100" value={contentStrategy.content_score}
                onChange={e => setContentStrategy(s => ({ ...s, content_score: e.target.value }))} placeholder="0-100"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-700 mb-2">Internal Linking Update</h3>
              <p className="text-xs text-slate-500 mb-2">Mention if any new internal linking maps were created.</p>
              <input value={contentStrategy.notes} onChange={e => setContentStrategy(s => ({ ...s, notes: e.target.value }))}
                placeholder="e.g. Added 5 internal links to new service pages"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>
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
          <div className="space-y-3">
            {workDone.map((w, i) => (
              <WorkItemCard
                key={i}
                item={w}
                onChange={updated => updateWork(i, updated)}
                onRemove={() => removeWork(i)}
              />
            ))}
            {workDone.filter(w => w.task).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No tasks yet — add manually or import from Daily Log</p>
            )}
          </div>
        </div>
      )}

      {/* ── Screenshots ── */}
      {activeTab === "screenshots" && (
        <div>
          {reportId ? (
            <ReportScreenshots reportId={reportId} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-400">
              <p className="font-medium text-slate-500 mb-1">Save the report first</p>
              <p className="text-sm">Screenshots can be added after the report is created and saved.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Data Sheets ── */}
      {activeTab === "sheets" && (
        <CsvSheetsTab sheets={csvSheets} onChange={setCsvSheets} />
      )}

      {/* ── Action Items ── */}
      {activeTab === "actions" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">Client Action Items</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tasks the client needs to complete before or alongside SEO work</p>
              </div>
              <button type="button" onClick={() => setActionItems(prev => [...prev, { id: crypto.randomUUID(), task: "", priority: "medium", done: false }])}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
                <Plus size={13} /> Add Item
              </button>
            </div>

            {actionItems.length === 0 ? (
              <div className="text-center py-10 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-40"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                <p className="text-sm text-slate-400 font-medium">No action items yet</p>
                <p className="text-xs mt-1 text-slate-300">Add tasks the client needs to do</p>
              </div>
            ) : (
              <div className="space-y-2">
                {actionItems.map((item, idx) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <button type="button" onClick={() => setActionItems(prev => prev.map((ai, i) => i === idx ? { ...ai, done: !ai.done } : ai))}
                      className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${item.done ? "bg-green-500 border-green-500" : "bg-white border-slate-300 hover:border-green-400"}`}>
                      {item.done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <input value={item.task} onChange={e => setActionItems(prev => prev.map((ai, i) => i === idx ? { ...ai, task: e.target.value } : ai))}
                        placeholder="e.g. Update Google Business Profile with new photos"
                        className={`w-full bg-transparent text-sm focus:outline-none ${item.done ? "line-through text-slate-400" : "text-slate-700"}`} />
                    </div>
                    <select value={item.priority} onChange={e => setActionItems(prev => prev.map((ai, i) => i === idx ? { ...ai, priority: e.target.value as ActionItem["priority"] } : ai))}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white shrink-0 focus:outline-none">
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                    <button type="button" onClick={() => setActionItems(prev => prev.filter((_, i) => i !== idx))}
                      className="text-slate-300 hover:text-red-500 transition-colors shrink-0 mt-0.5">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {actionItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
                <span>{actionItems.filter(a => a.done).length}/{actionItems.length} completed</span>
                <span>{actionItems.filter(a => a.priority === "high" && !a.done).length} high priority pending</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Social Signals ── */}
      {activeTab === "social" && (() => {
        const ss = (k: keyof SocialSignals, label: string, type = "number") => (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{label}</label>
            <input type={type} value={socialSignals[k] as string} onChange={e => setSocialSignals(p => ({ ...p, [k]: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        );
        const platform = (name: string, color: string, fields: React.ReactNode) => (
          <div className={`rounded-2xl border p-4`} style={{ borderColor: color + "40", background: color + "08" }}>
            <h4 className="text-sm font-bold mb-3" style={{ color }}>{name}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{fields}</div>
          </div>
        );
        return (
          <div className="space-y-4">
            {platform("Facebook", "#1877f2", <>
              {ss("fb_page_likes", "Page Likes")}
              {ss("fb_page_followers", "Followers")}
              {ss("fb_posts_this_month", "Posts This Month")}
              {ss("fb_total_reach", "Total Reach")}
              {ss("fb_total_engagement", "Total Engagement")}
              {ss("fb_shares", "Shares")}
              {ss("fb_page_url", "Page URL", "url")}
            </>)}
            {platform("Instagram", "#e1306c", <>
              {ss("ig_followers", "Followers")}
              {ss("ig_posts_this_month", "Posts This Month")}
              {ss("ig_impressions", "Impressions")}
              {ss("ig_reach", "Reach")}
              {ss("ig_engagement", "Engagement")}
              {ss("ig_profile_visits", "Profile Visits")}
              {ss("ig_url", "Profile URL", "url")}
            </>)}
            {platform("Twitter / X", "#000000", <>
              {ss("tw_followers", "Followers")}
              {ss("tw_tweets_this_month", "Tweets This Month")}
              {ss("tw_impressions", "Impressions")}
              {ss("tw_mentions", "Mentions")}
              {ss("tw_retweets", "Retweets")}
              {ss("tw_url", "Profile URL", "url")}
            </>)}
            {platform("LinkedIn", "#0a66c2", <>
              {ss("li_followers", "Followers")}
              {ss("li_posts_this_month", "Posts This Month")}
              {ss("li_impressions", "Impressions")}
              {ss("li_engagements", "Engagements")}
              {ss("li_url", "Page URL", "url")}
            </>)}
            {platform("Pinterest", "#e60023", <>
              {ss("pt_monthly_viewers", "Monthly Viewers")}
              {ss("pt_pins_created", "Pins Created")}
              {ss("pt_saves", "Saves")}
              {ss("pt_url", "Profile URL", "url")}
            </>)}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <h4 className="text-sm font-bold text-slate-700 mb-3">Overall</h4>
              <div className="grid grid-cols-2 gap-3">
                {ss("total_social_traffic", "Total Social Traffic")}
                {ss("brand_mentions", "Brand Mentions")}
              </div>
              <div className="mt-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Notes</label>
                <textarea rows={2} value={socialSignals.notes} onChange={e => setSocialSignals(p => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Press Release ── */}
      {activeTab === "pr" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">Press Release / PR</h3>
                <p className="text-xs text-slate-400 mt-0.5">Track press releases published and distributed this month</p>
              </div>
              <button type="button" onClick={() => setPressRelease(p => ({ ...p, items: [...p.items, { id: crypto.randomUUID(), title: "", url: "", published_date: "", distribution: "", status: "Draft", pickups: "", da: "", notes: "" }] }))}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-700">
                <Plus size={13} /> Add PR
              </button>
            </div>
            {pressRelease.items.length === 0 ? (
              <div className="text-center py-8 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 opacity-40"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
                <p className="text-sm text-slate-400">No press releases yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pressRelease.items.map((pr, i) => (
                  <div key={pr.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <input value={pr.title} onChange={e => setPressRelease(p => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, title: e.target.value } : x) }))}
                        placeholder="Press Release Title" className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <select value={pr.status} onChange={e => setPressRelease(p => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, status: e.target.value as typeof pr.status } : x) }))}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none shrink-0">
                        <option>Draft</option><option>Published</option><option>Picked Up</option>
                      </select>
                      <button type="button" onClick={() => setPressRelease(p => ({ ...p, items: p.items.filter((_, j) => j !== i) }))} className="text-slate-300 hover:text-red-500 shrink-0"><Trash2 size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">URL</label>
                        <input value={pr.url} onChange={e => setPressRelease(p => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, url: e.target.value } : x) }))}
                          placeholder="https://..." className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Published Date</label>
                        <input type="date" value={pr.published_date} onChange={e => setPressRelease(p => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, published_date: e.target.value } : x) }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Distribution</label>
                        <input value={pr.distribution} onChange={e => setPressRelease(p => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, distribution: e.target.value } : x) }))}
                          placeholder="e.g. PRWeb, EIN" className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Pickups / Backlinks</label>
                        <input type="number" value={pr.pickups} onChange={e => setPressRelease(p => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, pickups: e.target.value } : x) }))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <input value={pr.notes} onChange={e => setPressRelease(p => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, notes: e.target.value } : x) }))}
                        placeholder="Notes..." className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {pressRelease.items.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Total Distribution Sites</label>
                  <input type="number" value={pressRelease.total_distribution} onChange={e => setPressRelease(p => ({ ...p, total_distribution: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Total Backlinks Earned</label>
                  <input type="number" value={pressRelease.total_backlinks_earned} onChange={e => setPressRelease(p => ({ ...p, total_backlinks_earned: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Video SEO ── */}
      {activeTab === "video" && (() => {
        const vs = (k: keyof VideoSEO, label: string, type = "text") => (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{label}</label>
            <input type={type} value={videoSEO[k] as string} onChange={e => setVideoSEO(p => ({ ...p, [k]: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        );
        const vt = (k: keyof VideoSEO, label: string) => (
          <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <button type="button" onClick={() => setVideoSEO(p => ({ ...p, [k]: !p[k] }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${videoSEO[k] ? "bg-blue-600" : "bg-slate-200"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${videoSEO[k] ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
        );
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Channel Overview</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Platform</label>
                  <select value={videoSEO.platform} onChange={e => setVideoSEO(p => ({ ...p, platform: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none bg-white">
                    <option>YouTube</option><option>Vimeo</option><option>TikTok</option><option>Instagram Reels</option><option>Facebook Video</option>
                  </select>
                </div>
                {vs("channel_url", "Channel URL")}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vs("subscribers", "Total Subscribers", "number")}
                {vs("new_subscribers", "New Subscribers", "number")}
                {vs("videos_published", "Videos Published", "number")}
                {vs("total_views", "Total Channel Views", "number")}
                {vs("new_views", "New Views This Month", "number")}
                {vs("watch_time_hours", "Watch Time (hours)", "number")}
                {vs("avg_view_duration", "Avg View Duration")}
                {vs("impressions", "Impressions", "number")}
                {vs("ctr", "CTR (%)", "number")}
                {vs("youtube_search_traffic", "Search Traffic %", "number")}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Optimization This Month</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {vs("videos_optimized", "Videos Optimized", "number")}
                {vs("titles_with_keyword", "Titles with Keyword", "number")}
                {vs("descriptions_optimized", "Descriptions Optimized", "number")}
                {vs("tags_added", "Tags Added/Updated", "number")}
                {vs("thumbnails_updated", "Thumbnails Updated", "number")}
                {vs("cards_added", "Cards Added", "number")}
                {vs("end_screens_added", "End Screens Added", "number")}
                {vs("playlists_created", "Playlists Created", "number")}
              </div>
              {vt("video_schema_added", "Video Schema Markup Added")}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Top Performing Video</h3>
              <div className="grid grid-cols-3 gap-3">
                {vs("top_video_title", "Title")}
                {vs("top_video_views", "Views", "number")}
                {vs("top_video_url", "URL")}
              </div>
              <div className="mt-3">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Notes</label>
                <textarea rows={2} value={videoSEO.notes} onChange={e => setVideoSEO(p => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── E-commerce SEO ── */}
      {activeTab === "ecom" && (() => {
        const es = (k: keyof EcommerceSEO, label: string, type = "text") => (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{label}</label>
            <input type={type} value={ecommerceSEO[k] as string} onChange={e => setEcommerceSEO(p => ({ ...p, [k]: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        );
        const et = (k: keyof EcommerceSEO, label: string) => (
          <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <button type="button" onClick={() => setEcommerceSEO(p => ({ ...p, [k]: !p[k] }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${ecommerceSEO[k] ? "bg-blue-600" : "bg-slate-200"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${ecommerceSEO[k] ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
        );
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800">E-commerce SEO</h3>
                </div>
                <select value={ecommerceSEO.platform} onChange={e => setEcommerceSEO(p => ({ ...p, platform: e.target.value }))}
                  className="ml-auto border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none bg-white">
                  <option>WooCommerce</option><option>Shopify</option><option>Magento</option><option>BigCommerce</option><option>Custom</option>
                </select>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {es("total_products", "Total Products", "number")}
                {es("products_optimized", "Products Optimized", "number")}
                {es("products_with_schema", "Products with Schema", "number")}
                {es("category_pages_optimized", "Category Pages Optimized", "number")}
                {es("out_of_stock_handled", "Out-of-Stock Handled", "number")}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Organic Revenue</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {es("organic_revenue", "Organic Revenue (this month)")}
                {es("prev_organic_revenue", "Organic Revenue (last month)")}
                {es("organic_transactions", "Organic Transactions", "number")}
                {es("prev_organic_transactions", "Prev Transactions", "number")}
                {es("organic_conversion_rate", "Organic Conv. Rate (%)", "number")}
                {es("cart_abandonment_rate", "Cart Abandonment Rate (%)", "number")}
                {es("top_selling_organic_product", "Top Selling Product")}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Technical Checks</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {et("canonical_set", "Canonical Tags Set")}
                {et("faceted_nav_ok", "Faceted Navigation OK")}
                {et("product_reviews_enabled", "Product Reviews Enabled")}
                {et("rich_snippets_eligible", "Rich Snippets Eligible")}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {es("duplicate_product_pages", "Duplicate Product Pages", "number")}
                {es("thin_product_descriptions", "Thin Descriptions", "number")}
                {es("missing_product_images", "Missing Product Images", "number")}
                {es("broken_product_links", "Broken Product Links", "number")}
              </div>
              <div className="mt-3">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Notes</label>
                <textarea rows={2} value={ecommerceSEO.notes} onChange={e => setEcommerceSEO(p => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── AI / GEO SEO ── */}
      {activeTab === "aigeo" && (() => {
        const a = aiGeoSEO;
        const f = (k: keyof AiGeoSEO, label: string, type = "number") => (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{label}</label>
            <input type={type} value={a[k] as string} onChange={e => setAiGeoSEO(p => ({ ...p, [k]: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        );
        const tog = (k: keyof AiGeoSEO, label: string) => (
          <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <button type="button" onClick={() => setAiGeoSEO(p => ({ ...p, [k]: !p[k] }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${a[k] ? "bg-blue-600" : "bg-slate-200"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${a[k] ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
        );
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-violet-700 mb-1">🤖 AI / GEO SEO (Generative Engine Optimization)</p>
              <p className="text-xs text-slate-500">Track your brand visibility in AI-powered search engines like ChatGPT, Perplexity, Google SGE, and Bing Copilot.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">AI Engine Mentions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {f("chatgpt_mentions", "ChatGPT Mentions")}
                {f("perplexity_mentions", "Perplexity Mentions")}
                {f("gemini_mentions", "Google Gemini Mentions")}
                {f("bing_copilot_mentions", "Bing Copilot Mentions")}
                {f("ai_overview_appearances", "AI Overview Appearances")}
                {f("ai_referral_traffic", "AI Referral Traffic")}
                {f("zero_click_searches", "Zero-Click Searches")}
                {f("cited_by_ai_sources", "Cited by AI Sources")}
              </div>
              <div className="mt-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">AI Citation URLs (comma separated)</label>
                <textarea rows={2} value={a.ai_citation_urls} onChange={e => setAiGeoSEO(p => ({ ...p, ai_citation_urls: e.target.value }))}
                  placeholder="https://perplexity.ai/..., https://chatgpt.com/..."
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Featured Snippets & PAA</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {f("featured_snippets_owned", "Snippets Owned")}
                {f("featured_snippets_gained", "Snippets Gained")}
                {f("featured_snippets_lost", "Snippets Lost")}
                {f("paa_boxes_owned", "PAA Boxes Owned")}
                {f("sge_impressions", "SGE Impressions")}
                {f("sge_clicks", "SGE Clicks")}
                {f("sge_ctr", "SGE CTR (%)")}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">GEO Optimization Done</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {tog("brand_in_ai_answers", "Brand Appears in AI Answers")}
                {tog("competitor_in_ai_answers", "Competitor in AI Answers")}
                {tog("knowledge_panel_exists", "Knowledge Panel Exists")}
                {tog("knowledge_panel_updated", "Knowledge Panel Updated")}
                {tog("structured_data_for_ai", "Structured Data for AI Added")}
                {tog("faq_schema_added", "FAQ Schema Added")}
                {tog("speakable_schema", "Speakable Schema Added")}
                {tog("content_q_and_a_format", "Content in Q&A Format")}
                {tog("conversational_content_added", "Conversational Content Added")}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-3">Scores</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {f("geo_score", "GEO Score (0-100)")}
                {f("ai_visibility_score", "AI Visibility Score (0-100)")}
              </div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Notes</label>
              <textarea rows={2} value={a.notes} onChange={e => setAiGeoSEO(p => ({ ...p, notes: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        );
      })()}

      {/* ── NLP SEO ── */}
      {activeTab === "nlp" && (() => {
        const n = nlpSEO;
        const f = (k: keyof NlpSEO, label: string, type = "text") => (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{label}</label>
            <input type={type} value={n[k] as string} onChange={e => setNlpSEO(p => ({ ...p, [k]: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        );
        const tog = (k: keyof NlpSEO, label: string) => (
          <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <button type="button" onClick={() => setNlpSEO(p => ({ ...p, [k]: !p[k] }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${n[k] ? "bg-blue-600" : "bg-slate-200"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${n[k] ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
        );
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Entity Optimization</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {f("primary_entity", "Primary Entity")}
                {f("entity_type", "Entity Type (Person/Org/Place)")}
                {f("secondary_entities", "Secondary Entities (comma sep)")}
                {f("entities_added_this_month", "Entities Added This Month", "number")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tog("entity_in_title", "Entity in Title Tag")}
                {tog("entity_in_h1", "Entity in H1")}
                {tog("entity_in_meta", "Entity in Meta Description")}
                {tog("entities_linked_to_kg", "Entities Linked to Knowledge Graph")}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Content Quality & Readability</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {f("readability_score", "Readability Score")}
                {f("readability_grade", "Grade Level (e.g. Grade 8)")}
                {f("flesch_kincaid", "Flesch-Kincaid Score")}
                {f("avg_sentence_length", "Avg Sentence Length")}
                {f("passive_voice_percent", "Passive Voice %")}
                {f("sentiment_score", "Sentiment Score")}
                {f("sentiment_label", "Sentiment (Positive/Neutral)")}
                {f("topic_authority_score", "Topic Authority Score")}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">NLP Keywords & EEAT</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {f("nlp_keywords_targeted", "NLP Keywords Targeted", "number")}
                {f("nlp_keywords_ranking", "NLP Keywords Ranking", "number")}
                {f("co_occurrence_terms", "Co-occurrence Terms Added")}
                {f("citations_added", "Expert Citations Added", "number")}
                {f("trust_signals_added", "Trust Signals Added")}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {tog("author_bio_added", "Author Bio Added/Updated")}
                {tog("expert_quotes_added", "Expert Quotes Added")}
                {tog("fact_checked", "Content Fact Checked")}
                {tog("last_updated_shown", "Last Updated Date Shown")}
              </div>
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Structured Data for NLP</h4>
              <div className="grid grid-cols-2 gap-2">
                {tog("faq_markup", "FAQ Markup")}
                {tog("howto_markup", "HowTo Markup")}
                {tog("article_schema", "Article Schema")}
                {tog("review_schema", "Review Schema")}
                {tog("speakable_markup", "Speakable Markup")}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="grid grid-cols-2 gap-3 mb-3">
                {f("nlp_score", "NLP Score (0-100)", "number")}
                {f("content_depth_score", "Content Depth Score (0-100)", "number")}
              </div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Notes</label>
              <textarea rows={2} value={n.notes} onChange={e => setNlpSEO(p => ({ ...p, notes: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        );
      })()}

      {/* ── Semantic / LSI SEO ── */}
      {activeTab === "semantic" && (() => {
        const s = semanticSEO;
        const f = (k: keyof SemanticSEO, label: string, type = "text") => (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{label}</label>
            <input type={type} value={s[k] as string} onChange={e => setSemanticSEO(p => ({ ...p, [k]: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        );
        const tog = (k: keyof SemanticSEO, label: string) => (
          <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <button type="button" onClick={() => setSemanticSEO(p => ({ ...p, [k]: !p[k] }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${s[k] ? "bg-blue-600" : "bg-slate-200"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${s[k] ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
        );
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Topic Clusters</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {f("pillar_pages", "Total Pillar Pages", "number")}
                {f("cluster_pages", "Total Cluster Pages", "number")}
                {f("new_pillar_pages", "New Pillar Pages This Month", "number")}
                {f("new_cluster_pages", "New Cluster Pages This Month", "number")}
                {f("pages_added_this_month", "Total Pages Added", "number")}
                {f("total_pages_on_topic", "Total Pages on Topic", "number")}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Pillar Pages List</label>
                <textarea rows={2} value={s.pillar_pages_list} onChange={e => setSemanticSEO(p => ({ ...p, pillar_pages_list: e.target.value }))}
                  placeholder="e.g. /seo-guide, /link-building-guide"
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">LSI Keywords</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {f("lsi_keywords_added", "LSI Keywords Added", "number")}
                {f("lsi_keywords_ranking", "LSI Keywords Ranking", "number")}
                {f("related_terms_used", "Related Terms Used", "number")}
                {f("co_occurrences_targeted", "Co-occurrences Targeted", "number")}
                {f("co_citations", "Co-Citations", "number")}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">LSI Keywords List</label>
                <textarea rows={2} value={s.lsi_keywords_list} onChange={e => setSemanticSEO(p => ({ ...p, lsi_keywords_list: e.target.value }))}
                  placeholder="best seo tools, seo strategy 2024, search engine optimization tips..."
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Internal Linking & Silos</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {f("internal_links_added", "Internal Links Added", "number")}
                {f("orphan_pages_fixed", "Orphan Pages Fixed", "number")}
                {f("avg_internal_links_per_page", "Avg Internal Links/Page", "number")}
                {f("hub_pages_identified", "Hub Pages Identified", "number")}
              </div>
              {tog("silo_structure_ok", "Silo Structure Properly Set Up")}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Topical Authority & Content Gaps</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {f("topical_authority_score", "Topical Authority Score", "number")}
                {f("niche_relevance_score", "Niche Relevance Score", "number")}
                {f("topic_coverage_score", "Topic Coverage Score %", "number")}
                {f("content_gaps_identified", "Content Gaps Identified", "number")}
                {f("content_gaps_filled", "Content Gaps Filled", "number")}
                {f("cannibalization_issues", "Cannibalization Issues", "number")}
                {f("cannibalization_fixed", "Cannibalization Fixed", "number")}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="grid grid-cols-2 gap-3 mb-3">
                {f("semantic_score", "Semantic SEO Score (0-100)", "number")}
              </div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Notes</label>
              <textarea rows={2} value={s.notes} onChange={e => setSemanticSEO(p => ({ ...p, notes: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        );
      })()}

      {/* ── Image SEO ── */}
      {activeTab === "imageseo" && (() => {
        const img = imageSeoReport;
        const f = (k: keyof ImageSeoReport, label: string, type = "number") => (
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{label}</label>
            <input type={type} value={img[k] as string} onChange={e => setImageSeoReport(p => ({ ...p, [k]: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        );
        const tog = (k: keyof ImageSeoReport, label: string) => (
          <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <button type="button" onClick={() => setImageSeoReport(p => ({ ...p, [k]: !p[k] }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${img[k] ? "bg-blue-600" : "bg-slate-200"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${img[k] ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
        );
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Alt Text & Inventory</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {f("total_images", "Total Images")}
                {f("images_with_alt", "Images With Alt Text")}
                {f("images_missing_alt", "Images Missing Alt")}
                {f("images_missing_alt_fixed", "Missing Alt Fixed This Month")}
                {f("images_with_title_attr", "Images With Title Attr")}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Compression & Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {f("images_compressed", "Images Compressed")}
                {f("images_converted_to_webp", "Converted to WebP")}
                {f("avg_image_size_kb", "Avg Image Size (KB)")}
                {f("oversized_images", "Oversized Images Found")}
                {f("oversized_images_fixed", "Oversized Images Fixed")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tog("lazy_loading_enabled", "Lazy Loading Enabled")}
                {tog("responsive_images", "Responsive Images (srcset)")}
                {tog("next_gen_formats", "Next-Gen Formats Used (WebP/AVIF)")}
                {tog("cdn_serving_images", "CDN Serving Images")}
                {tog("image_sitemap_submitted", "Image Sitemap Submitted")}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Image Schema & Structured Data</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {f("images_with_schema", "Images With Schema")}
                {f("product_images_schema", "Product Images With Schema")}
                {f("article_images_schema", "Article Images With Schema")}
              </div>
              {tog("logo_schema", "Logo Schema Added")}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Google Image Search Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {f("image_search_impressions", "Image Search Impressions")}
                {f("image_search_clicks", "Image Search Clicks")}
                {f("image_search_ctr", "Image Search CTR %")}
                {f("top_ranking_image", "Top Ranking Image (filename)", "text")}
                {f("top_ranking_image_keyword", "Top Keyword for Image", "text")}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="grid grid-cols-2 gap-3 mb-3">
                {f("image_seo_score", "Image SEO Score (0-100)")}
                {f("issues_fixed", "Issues Fixed This Month")}
              </div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Notes</label>
              <textarea rows={2} value={img.notes} onChange={e => setImageSeoReport(p => ({ ...p, notes: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        );
      })()}

      {/* ── Goals / KPIs ── */}
      {activeTab === "goals" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">Monthly Goals & KPIs</h3>
                <p className="text-xs text-slate-400 mt-0.5">Set targets and track what was achieved this month</p>
              </div>
              <button type="button" onClick={() => setGoals(prev => [...prev, { id: crypto.randomUUID(), goal: "", target: "", achieved: "", status: "ongoing" }])}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
                <Plus size={13} /> Add Goal
              </button>
            </div>
            {goals.length === 0 ? (
              <div className="text-center py-10 text-slate-300">
                <Activity size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm text-slate-400">No goals set. Add goals to track progress.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((g, i) => (
                  <div key={g.id} className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="col-span-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Goal / KPI</label>
                      <input value={g.goal} onChange={e => setGoals(prev => prev.map((x, j) => j === i ? { ...x, goal: e.target.value } : x))}
                        placeholder="e.g. Increase organic traffic" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Target</label>
                      <input value={g.target} onChange={e => setGoals(prev => prev.map((x, j) => j === i ? { ...x, target: e.target.value } : x))}
                        placeholder="e.g. +20%" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Achieved</label>
                      <input value={g.achieved} onChange={e => setGoals(prev => prev.map((x, j) => j === i ? { ...x, achieved: e.target.value } : x))}
                        placeholder="e.g. +15%" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Status</label>
                      <select value={g.status} onChange={e => setGoals(prev => prev.map((x, j) => j === i ? { ...x, status: e.target.value as Goal["status"] } : x))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                        <option value="achieved">✅ Achieved</option>
                        <option value="partial">🟡 Partial</option>
                        <option value="ongoing">🔵 Ongoing</option>
                        <option value="missed">❌ Missed</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex items-end pb-1.5">
                      <button type="button" onClick={() => setGoals(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Time Spent ── */}
      {activeTab === "time" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">Time Spent This Month</h3>
                <p className="text-xs text-slate-400 mt-0.5">Track hours spent per category — shows total on report</p>
              </div>
              <button type="button" onClick={() => setTimeSpent(prev => [...prev, { id: crypto.randomUUID(), category: "On-Page SEO", hours: "", notes: "" }])}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
                <Plus size={13} /> Add Entry
              </button>
            </div>
            {timeSpent.length === 0 ? (
              <div className="text-center py-10 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 opacity-40"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <p className="text-sm text-slate-400">No time entries yet</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {timeSpent.map((t, i) => (
                    <div key={t.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="col-span-4">
                        <select value={t.category} onChange={e => setTimeSpent(prev => prev.map((x, j) => j === i ? { ...x, category: e.target.value } : x))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                          {WORK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="0" step="0.5" value={t.hours} onChange={e => setTimeSpent(prev => prev.map((x, j) => j === i ? { ...x, hours: e.target.value } : x))}
                          placeholder="hrs" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="col-span-5">
                        <input value={t.notes} onChange={e => setTimeSpent(prev => prev.map((x, j) => j === i ? { ...x, notes: e.target.value } : x))}
                          placeholder="Notes (optional)" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button type="button" onClick={() => setTimeSpent(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Total:</span>
                  <span className="text-sm font-bold text-slate-700">
                    {timeSpent.reduce((sum, t) => sum + (parseFloat(t.hours) || 0), 0).toFixed(1)} hours
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Invoice ── */}
      {activeTab === "invoice" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800">Invoice</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-slate-500">Paid</span>
                <button type="button" onClick={() => setInvoice(prev => ({ ...prev, paid: !prev.paid }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${invoice.paid ? "bg-green-500" : "bg-slate-200"}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${invoice.paid ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Invoice Number</label>
                <input value={invoice.number} onChange={e => setInvoice(p => ({ ...p, number: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Currency</label>
                <select value={invoice.currency} onChange={e => setInvoice(p => ({ ...p, currency: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
                  <option value="USD">$ USD</option>
                  <option value="GBP">£ GBP</option>
                  <option value="EUR">€ EUR</option>
                  <option value="PKR">₨ PKR</option>
                  <option value="AED">د.إ AED</option>
                  <option value="SAR">﷼ SAR</option>
                  <option value="INR">₹ INR</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Invoice Date</label>
                <input type="date" value={invoice.date} onChange={e => setInvoice(p => ({ ...p, date: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Due Date</label>
                <input type="date" value={invoice.due_date} onChange={e => setInvoice(p => ({ ...p, due_date: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-600">Line Items</label>
                <button type="button" onClick={() => setInvoice(p => ({ ...p, items: [...p.items, { desc: "", qty: "1", price: "" }] }))}
                  className="text-xs text-blue-600 hover:underline font-medium">+ Add item</button>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase px-1">
                  <div className="col-span-7">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                </div>
                {invoice.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-7">
                      <input value={item.desc} onChange={e => setInvoice(p => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x) }))}
                        placeholder="Service description" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" min="1" value={item.qty} onChange={e => setInvoice(p => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, qty: e.target.value } : x) }))}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" min="0" value={item.price} onChange={e => setInvoice(p => ({ ...p, items: p.items.map((x, j) => j === i ? { ...x, price: e.target.value } : x) }))}
                        placeholder="0" className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {invoice.items.length > 1 && (
                        <button type="button" onClick={() => setInvoice(p => ({ ...p, items: p.items.filter((_, j) => j !== i) }))} className="text-slate-300 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="text-xl font-black text-slate-800">
                      {invoice.currency === "USD" ? "$" : invoice.currency === "GBP" ? "£" : invoice.currency === "EUR" ? "€" : invoice.currency === "PKR" ? "₨" : invoice.currency === "AED" ? "د.إ" : invoice.currency === "SAR" ? "﷼" : "₹"}
                      {invoice.items.reduce((s, it) => s + (parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Invoice Notes</label>
              <textarea rows={2} value={invoice.notes} onChange={e => setInvoice(p => ({ ...p, notes: e.target.value }))}
                placeholder="Payment terms, bank details, thank you note..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        </div>
      )}

      {/* ── Review Requests ── */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">Review Requests</h3>
                <p className="text-xs text-slate-400 mt-0.5">Track which platforms you asked the client to get reviews on</p>
              </div>
              <button type="button" onClick={() => setReviewRequests(prev => [...prev, { id: crypto.randomUUID(), platform: "Google", link: "", sent: false, notes: "" }])}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
                <Plus size={13} /> Add Platform
              </button>
            </div>
            {reviewRequests.length === 0 ? (
              <div className="text-center py-10 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 opacity-40"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <p className="text-sm text-slate-400">No review requests added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reviewRequests.map((r, i) => (
                  <div key={r.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="col-span-3">
                      <select value={r.platform} onChange={e => setReviewRequests(prev => prev.map((x, j) => j === i ? { ...x, platform: e.target.value } : x))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none">
                        {["Google","Yelp","Facebook","TripAdvisor","Trustpilot","G2","Clutch","Other"].map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="col-span-5">
                      <input value={r.link} onChange={e => setReviewRequests(prev => prev.map((x, j) => j === i ? { ...x, link: e.target.value } : x))}
                        placeholder="Review link URL" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <input value={r.notes} onChange={e => setReviewRequests(prev => prev.map((x, j) => j === i ? { ...x, notes: e.target.value } : x))}
                        placeholder="Notes" className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button type="button" onClick={() => setReviewRequests(prev => prev.map((x, j) => j === i ? { ...x, sent: !x.sent } : x))}
                        title={r.sent ? "Sent" : "Not sent"}
                        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${r.sent ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-300 text-slate-300 hover:border-green-400"}`}>
                        {r.sent && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button type="button" onClick={() => setReviewRequests(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-3 text-xs text-slate-400 pt-2 border-t border-slate-100">
                  {reviewRequests.filter(r => r.sent).length}/{reviewRequests.length} requests sent
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Section Visibility ── */}
      {activeTab === "visibility" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="mb-5">
              <h3 className="font-semibold text-slate-800">Report Sections</h3>
              <p className="text-xs text-slate-400 mt-0.5">Check which sections appear in the final report. Unchecked sections are hidden.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: "executive_summary", label: "Executive Summary" },
                { key: "metrics", label: "Metrics & Charts" },
                { key: "scores_radar", label: "SEO Score Radar" },
                { key: "keywords", label: "Keyword Rankings" },
                { key: "work_done", label: "Work Done" },
                { key: "on_page", label: "On-Page SEO" },
                { key: "local_seo", label: "Local SEO" },
                { key: "schema", label: "Schema Markup" },
                { key: "technical", label: "Technical SEO" },
                { key: "content", label: "Content & Blogs" },
                { key: "pagespeed", label: "PageSpeed Scores" },
                { key: "social_signals", label: "Social Signals" },
                { key: "press_release", label: "Press Release / PR" },
                { key: "video_seo", label: "Video SEO" },
                { key: "ecommerce", label: "E-commerce SEO" },
                { key: "ai_geo_seo", label: "AI / GEO SEO" },
                { key: "nlp_seo", label: "NLP SEO" },
                { key: "semantic_seo", label: "Semantic / LSI SEO" },
                { key: "image_seo", label: "Image SEO" },
                { key: "goals", label: "Goals & KPIs" },
                { key: "time_spent", label: "Time Spent" },
                { key: "invoice", label: "Invoice" },
                { key: "review_requests", label: "Review Requests" },
                { key: "action_items", label: "Client Action Items" },
                { key: "backlinks", label: "Backlinks" },
                { key: "competitors", label: "Competitors" },
                { key: "rank_history", label: "Rank History Chart" },
                { key: "daily_logs", label: "Daily Work Log" },
                { key: "csv_sheets", label: "Data Sheets (CSV)" },
                { key: "screenshots", label: "Screenshots" },
                { key: "recommendations", label: "Recommendations" },
              ] as { key: keyof SectionVisibility; label: string }[]).map(({ key, label }) => (
                <label key={key} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${sectionVisibility[key] ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:bg-slate-50"}`}>
                  <input type="checkbox" checked={!!sectionVisibility[key]}
                    onChange={e => setSectionVisibility(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="accent-blue-600 w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
              <button type="button" onClick={() => setSectionVisibility(Object.fromEntries(Object.keys(sectionVisibility).map(k => [k, true])) as SectionVisibility)}
                className="text-xs text-blue-600 hover:underline font-medium">Enable All</button>
              <button type="button" onClick={() => setSectionVisibility(Object.fromEntries(Object.keys(sectionVisibility).map(k => [k, false])) as SectionVisibility)}
                className="text-xs text-slate-400 hover:text-slate-600 hover:underline">Disable All</button>
            </div>
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
