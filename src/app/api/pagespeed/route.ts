import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, jsonWithCookies } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const strategy = searchParams.get("strategy") || "mobile";

    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "PageSpeed API key not configured" }, { status: 503 });

    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`;
    const res = await fetch(psiUrl);
    const json = await res.json();

    if (json.error) return NextResponse.json({ error: json.error.message }, { status: 400 });

    const cats = json.lighthouseResult?.categories ?? {};
    const audits = json.lighthouseResult?.audits ?? {};
    const cwv = json.loadingExperience?.metrics ?? {};

    const score = (key: string) => Math.round((cats[key]?.score ?? 0) * 100);
    const audit = (key: string) => audits[key] ?? {};

    const data = {
      url,
      strategy,
      scores: {
        performance: score("performance"),
        accessibility: score("accessibility"),
        best_practices: score("best-practices"),
        seo: score("seo"),
      },
      cwv: {
        fcp: cwv.FIRST_CONTENTFUL_PAINT_MS,
        lcp: cwv.LARGEST_CONTENTFUL_PAINT_MS,
        cls: cwv.CUMULATIVE_LAYOUT_SHIFT_SCORE,
        fid: cwv.FIRST_INPUT_DELAY_MS,
        inp: cwv.INTERACTION_TO_NEXT_PAINT,
        ttfb: cwv.EXPERIMENTAL_TIME_TO_FIRST_BYTE,
      },
      metrics: {
        fcp: audit("first-contentful-paint"),
        lcp: audit("largest-contentful-paint"),
        tbt: audit("total-blocking-time"),
        cls: audit("cumulative-layout-shift"),
        si: audit("speed-index"),
        tti: audit("interactive"),
      },
      opportunities: Object.values(audits)
        .filter((a: unknown) => {
          const audit = a as { details?: { type?: string }; score?: number | null; scoreDisplayMode?: string };
          return audit.details?.type === "opportunity" && audit.score !== null && (audit.score ?? 1) < 0.9;
        })
        .sort((a: unknown, b: unknown) => {
          const aa = a as { details?: { overallSavingsMs?: number } };
          const bb = b as { details?: { overallSavingsMs?: number } };
          return (bb.details?.overallSavingsMs ?? 0) - (aa.details?.overallSavingsMs ?? 0);
        })
        .slice(0, 8)
        .map((a: unknown) => {
          const audit = a as { id: string; title: string; description: string; displayValue?: string; details?: { overallSavingsMs?: number } };
          return {
            id: audit.id,
            title: audit.title,
            description: audit.description,
            displayValue: audit.displayValue,
            savingsMs: audit.details?.overallSavingsMs,
          };
        }),
      diagnostics: Object.values(audits)
        .filter((a: unknown) => {
          const audit = a as { details?: { type?: string }; score?: number | null };
          return audit.details?.type === "table" && audit.score !== null && (audit.score ?? 1) < 0.9;
        })
        .slice(0, 6)
        .map((a: unknown) => {
          const audit = a as { id: string; title: string; displayValue?: string; score?: number };
          return { id: audit.id, title: audit.title, displayValue: audit.displayValue, score: audit.score };
        }),
      screenshot: audits["final-screenshot"]?.details?.data ?? null,
    };

    return jsonWithCookies(data, auth);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
