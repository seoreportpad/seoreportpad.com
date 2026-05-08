import { NextRequest, NextResponse } from "next/server";
import { getUserClient } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reportId } = await req.json();
    if (!reportId) return NextResponse.json({ error: "reportId required" }, { status: 400 });

    // Fetch agency settings for API key
    const { data: agency } = await sb.from("agency_settings").select("gemini_api_key").eq("user_id", user.id).maybeSingle();
    const apiKey = agency?.gemini_api_key || process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "AI not configured. Please add Gemini API Key in Settings." }, { status: 503 });

    const { data: report } = await sb
      .from("reports")
      .select("*, clients(name, website), keywords(*), work_done(*), metrics(*)")
      .eq("id", reportId)
      .single();

    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    const m = report.metrics;
    const kws = (report.keywords ?? []) as { keyword: string; prev_ranking: number; curr_ranking: number }[];
    const work = (report.work_done ?? []) as { task: string }[];

    const trafficChange = m?.organic_traffic && m?.prev_traffic
      ? Math.round(((m.organic_traffic - m.prev_traffic) / m.prev_traffic) * 100)
      : null;

    const prompt = `You are an expert SEO specialist writing a professional monthly report summary for a client.

Client: ${report.clients?.name ?? "the client"}
Website: ${report.clients?.website ?? ""}
Month: ${report.month} ${report.year}

KEY METRICS:
- Organic Traffic: ${m?.organic_traffic ?? "N/A"}${trafficChange !== null ? ` (${trafficChange > 0 ? "+" : ""}${trafficChange}% vs last month)` : ""}
- Backlinks: ${m?.backlinks ?? "N/A"}${m?.prev_backlinks ? ` (was ${m.prev_backlinks})` : ""}
- Domain Authority: ${m?.domain_authority ?? "N/A"}${m?.prev_da ? ` (was ${m.prev_da})` : ""}
- Impressions: ${m?.impressions ?? "N/A"}
- Clicks: ${m?.clicks ?? "N/A"}
- Avg Position: ${m?.avg_position ?? "N/A"}
- Pages Indexed: ${m?.pages_indexed ?? "N/A"}
- Technical Issues Fixed: ${m?.technical_fixed ?? "N/A"}

TOP KEYWORDS (up to 5):
${kws.slice(0, 5).map(k => `- "${k.keyword}": moved from #${k.prev_ranking} to #${k.curr_ranking}`).join("\n") || "No keyword data"}

WORK COMPLETED THIS MONTH:
${work.map(w => `- ${w.task}`).join("\n") || "No tasks logged"}

Write a professional, client-friendly 3-paragraph executive summary (150-200 words total).
Paragraph 1: Overall performance snapshot highlighting the most impressive metric.
Paragraph 2: What work was done and its impact.
Paragraph 3: Forward-looking — what to focus on next month.
Use confident, positive language. Be specific with numbers. Do NOT use headers or bullet points. Output ONLY the summary text.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return NextResponse.json({ summary: text.trim() });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
