import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { url, email, name } = await req.json();

    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // 1. Call Google PageSpeed Insights API (FREE)
    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=seo&category=accessibility&category=best-practices`;
    
    const res = await fetch(psiUrl);
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    const lighthouse = data.lighthouseResult;
    const categories = lighthouse.categories;

    const auditResults = {
      performance: Math.round(categories.performance.score * 100),
      seo: Math.round(categories.seo.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      best_practices: Math.round(categories["best-practices"].score * 100),
      vitals: {
        lcp: lighthouse.audits["largest-contentful-paint"].displayValue,
        cls: lighthouse.audits["cumulative-layout-shift"].displayValue,
        tbt: lighthouse.audits["total-blocking-time"].displayValue,
        speed_index: lighthouse.audits["speed-index"].displayValue,
      },
      url: url,
      fetched_at: new Date().toISOString(),
    };

    // 2. Save lead to Supabase if email provided
    if (email) {
      try {
        const sb = createServiceClient();
        await sb.from("leads").insert({
          email,
          name: name || "Anonymous",
          website: url,
          audit_data: auditResults,
          source: "public_audit_tool"
        });
      } catch (dbError) {
        console.error("Error saving lead:", dbError);
        // We don't block the response if DB fails, as the audit is the main goal
      }
    }

    return NextResponse.json(auditResults);
  } catch (error) {
    console.error("Audit API Error:", error);
    return NextResponse.json({ error: "Failed to audit site. Please check the URL." }, { status: 500 });
  }
}
