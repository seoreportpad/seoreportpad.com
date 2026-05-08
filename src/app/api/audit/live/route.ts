import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const targetUrl = url.startsWith("http") ? url : `https://${url}`;
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    if (!res.ok) throw new Error("Could not fetch URL");

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract basic meta data
    const audit = {
      title: $("title").text() || "",
      description: $('meta[name="description"]').attr("content") || "",
      h1: $("h1").first().text() || "",
      canonical: $('link[rel="canonical"]').attr("href") || "",
      ogImage: $('meta[property="og:image"]').attr("content") || "",
      robots: $('meta[name="robots"]').attr("content") || "index, follow",
      
      // Basic checks
      checks: {
        hasDescription: !!$('meta[name="description"]').attr("content"),
        hasH1: $("h1").length > 0,
        multipleH1: $("h1").length > 1,
        hasCanonical: !!$('link[rel="canonical"]').attr("href"),
        titleLength: $("title").text().length,
        descLength: ($('meta[name="description"]').attr("content") || "").length,
      }
    };

    return NextResponse.json(audit);
  } catch (e: any) {
    console.error("Live Audit Error:", e);
    return NextResponse.json({ error: "Failed to audit site. Check if URL is correct and public." }, { status: 500 });
  }
}
