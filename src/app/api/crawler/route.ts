import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { getAuthenticatedUser } from "@/lib/auth";

const UA = "Mozilla/5.0 (compatible; SEOReportBot/1.0)";
const MAX_PAGES = 60;
const TIMEOUT = 10000;

export interface PageIssue {
  type: "error" | "warning" | "info";
  category: string;
  message: string;
}

export interface CrawledPage {
  url: string;
  status: number;
  title: string;
  titleLen: number;
  description: string;
  descLen: number;
  h1: string[];
  h2Count: number;
  canonical: string;
  robots: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  wordCount: number;
  imgTotal: number;
  imgMissingAlt: number;
  internalLinks: number;
  externalLinks: number;
  hasSchema: boolean;
  schemaTypes: string[];
  isHttps: boolean;
  loadMs: number;
  issues: PageIssue[];
  score: number;
}

export interface CrawlReport {
  url: string;
  crawledAt: string;
  totalPages: number;
  pages: CrawledPage[];
  summary: {
    errors: number;
    warnings: number;
    avgScore: number;
    missingTitle: number;
    missingDesc: number;
    missingH1: number;
    missingAlt: number;
    duplicateTitles: number;
    duplicateDescs: number;
    brokenPages: number;
    noIndex: number;
    missingCanonical: number;
    missingSchema: number;
    missingOgImage: number;
  };
}

async function fetchPage(url: string): Promise<{ html: string; status: number; loadMs: number } | null> {
  const start = Date.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    clearTimeout(timer);
    const html = res.ok ? await res.text() : "";
    return { html, status: res.status, loadMs: Date.now() - start };
  } catch {
    return null;
  }
}

function auditPage(url: string, html: string, status: number, loadMs: number): CrawledPage {
  const $ = cheerio.load(html);

  const title = $("title").text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const h1Tags = $("h1").map((_, el) => $(el).text().trim()).get().filter(Boolean);
  const h2Count = $("h2").length;
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() ?? "";
  const robots = $('meta[name="robots"]').attr("content")?.toLowerCase() ?? "";
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim() ?? "";
  const ogDesc = $('meta[property="og:description"]').attr("content")?.trim() ?? "";
  const ogImage = $('meta[property="og:image"]').attr("content")?.trim() ?? "";
  const wordCount = $("body").text().replace(/\s+/g, " ").trim().split(" ").length;
  const allImgs = $("img");
  const imgMissingAlt = allImgs.filter((_, el) => !$(el).attr("alt")).length;
  const isHttps = url.startsWith("https://");

  // Schema detection
  const schemaTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() ?? "{}");
      const types = Array.isArray(data) ? data.map((d: any) => d["@type"]).filter(Boolean) : [data["@type"]].filter(Boolean);
      schemaTypes.push(...types);
    } catch { /* ignore */ }
  });

  // Link counts
  const origin = new URL(url).origin;
  let internalLinks = 0;
  let externalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const abs = new URL(href, url).href;
      if (abs.startsWith(origin)) internalLinks++;
      else externalLinks++;
    } catch { /* ignore */ }
  });

  const issues: PageIssue[] = [];

  if (status >= 400) issues.push({ type: "error", category: "HTTP", message: `Page returns HTTP ${status}` });
  if (!title) issues.push({ type: "error", category: "Title", message: "Missing title tag" });
  else if (title.length < 30) issues.push({ type: "warning", category: "Title", message: `Title too short (${title.length} chars, min 30)` });
  else if (title.length > 60) issues.push({ type: "warning", category: "Title", message: `Title too long (${title.length} chars, max 60)` });

  if (!description) issues.push({ type: "error", category: "Meta Description", message: "Missing meta description" });
  else if (description.length < 70) issues.push({ type: "warning", category: "Meta Description", message: `Meta description too short (${description.length} chars, min 70)` });
  else if (description.length > 160) issues.push({ type: "warning", category: "Meta Description", message: `Meta description too long (${description.length} chars, max 160)` });

  if (h1Tags.length === 0) issues.push({ type: "error", category: "Headings", message: "Missing H1 tag" });
  else if (h1Tags.length > 1) issues.push({ type: "warning", category: "Headings", message: `Multiple H1 tags found (${h1Tags.length})` });
  if (h2Count === 0 && wordCount > 200) issues.push({ type: "info", category: "Headings", message: "No H2 headings — consider adding subheadings" });

  if (!canonical) issues.push({ type: "warning", category: "Canonical", message: "Missing canonical tag" });
  if (robots.includes("noindex")) issues.push({ type: "error", category: "Indexing", message: "Page is set to noindex" });
  if (robots.includes("nofollow")) issues.push({ type: "warning", category: "Indexing", message: "Page is set to nofollow" });

  if (!isHttps) issues.push({ type: "error", category: "Security", message: "Page not served over HTTPS" });
  if (loadMs > 3000) issues.push({ type: "warning", category: "Performance", message: `Slow page load (${loadMs}ms > 3000ms)` });
  else if (loadMs > 1500) issues.push({ type: "info", category: "Performance", message: `Page load could be faster (${loadMs}ms)` });

  if (imgMissingAlt > 0) issues.push({ type: "warning", category: "Images", message: `${imgMissingAlt} image(s) missing alt text` });
  if (!ogImage) issues.push({ type: "info", category: "Open Graph", message: "Missing og:image" });
  if (!ogTitle) issues.push({ type: "info", category: "Open Graph", message: "Missing og:title" });

  if (wordCount < 300 && status === 200) issues.push({ type: "warning", category: "Content", message: `Thin content (${wordCount} words, recommended 300+)` });
  if (schemaTypes.length === 0) issues.push({ type: "info", category: "Schema", message: "No structured data (JSON-LD) found" });

  if (internalLinks === 0 && status === 200) issues.push({ type: "warning", category: "Links", message: "No internal links on this page" });

  // Score: start at 100, deduct per issue
  const deduct = { error: 10, warning: 5, info: 2 };
  const score = Math.max(0, 100 - issues.reduce((s, i) => s + deduct[i.type], 0));

  return {
    url, status, title, titleLen: title.length,
    description, descLen: description.length,
    h1: h1Tags, h2Count, canonical, robots,
    ogTitle, ogDesc, ogImage, wordCount,
    imgTotal: allImgs.length, imgMissingAlt,
    internalLinks, externalLinks,
    hasSchema: schemaTypes.length > 0, schemaTypes,
    isHttps, loadMs, issues, score,
  };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const baseUrl = url.startsWith("http") ? url : `https://${url}`;
    const origin = new URL(baseUrl).origin;

    const visited = new Set<string>();
    const queue: string[] = [baseUrl];
    const pages: CrawledPage[] = [];

    while (queue.length > 0 && visited.size < MAX_PAGES) {
      const current = queue.shift()!;
      const normalized = current.split("#")[0].replace(/\/$/, "") || current;
      if (visited.has(normalized)) continue;
      visited.add(normalized);

      const result = await fetchPage(current);
      if (!result) continue;

      const page = auditPage(current, result.html, result.status, result.loadMs);
      pages.push(page);

      if (result.html && result.status < 400) {
        const $ = cheerio.load(result.html);
        $("a[href]").each((_, el) => {
          const href = $( el).attr("href") ?? "";
          if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
          try {
            const abs = new URL(href, current).href.split("#")[0].replace(/\/$/, "");
            if (abs.startsWith(origin) && !visited.has(abs) && !queue.includes(abs)) {
              queue.push(abs);
            }
          } catch { /* ignore */ }
        });
      }
    }

    const titles = pages.map(p => p.title).filter(Boolean);
    const descs = pages.map(p => p.description).filter(Boolean);
    const dupTitles = titles.length - new Set(titles).size;
    const dupDescs = descs.length - new Set(descs).size;

    const summary = {
      errors: pages.reduce((s, p) => s + p.issues.filter(i => i.type === "error").length, 0),
      warnings: pages.reduce((s, p) => s + p.issues.filter(i => i.type === "warning").length, 0),
      avgScore: pages.length ? Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length) : 0,
      missingTitle: pages.filter(p => !p.title).length,
      missingDesc: pages.filter(p => !p.description).length,
      missingH1: pages.filter(p => p.h1.length === 0).length,
      missingAlt: pages.filter(p => p.imgMissingAlt > 0).length,
      duplicateTitles: dupTitles,
      duplicateDescs: dupDescs,
      brokenPages: pages.filter(p => p.status >= 400).length,
      noIndex: pages.filter(p => p.robots.includes("noindex")).length,
      missingCanonical: pages.filter(p => !p.canonical).length,
      missingSchema: pages.filter(p => !p.hasSchema).length,
      missingOgImage: pages.filter(p => !p.ogImage).length,
    };

    const report: CrawlReport = {
      url: baseUrl,
      crawledAt: new Date().toISOString(),
      totalPages: pages.length,
      pages,
      summary,
    };

    return NextResponse.json(report);
  } catch (e: any) {
    console.error("Crawler Error:", e);
    return NextResponse.json({ error: "Crawl failed: " + e.message }, { status: 500 });
  }
}
