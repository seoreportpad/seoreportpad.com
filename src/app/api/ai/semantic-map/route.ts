import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;
    const sb = createServiceClient();

    const { seedKeyword } = await req.json();
    if (!seedKeyword) return NextResponse.json({ error: "seedKeyword required" }, { status: 400 });

    const { data: agency } = await sb.from("agency_settings").select("gemini_api_key").eq("user_id", auth.user.id).maybeSingle();
    const apiKey = agency?.gemini_api_key || process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "AI not configured. Please add Gemini API Key in Settings." }, { status: 503 });

    const prompt = `You are an expert SEO strategist. Create a comprehensive Semantic SEO Topical Map for the seed keyword: "${seedKeyword}".
Return the result strictly as a valid JSON object matching this structure:
{
  "pillar": "Main Pillar Topic",
  "searchIntent": "Informational/Navigational/Transactional/Commercial",
  "audience": "Target audience description",
  "clusters": [
    {
      "topic": "Cluster Topic Name",
      "longTailKeywords": ["keyword 1", "keyword 2", "keyword 3"],
      "suggestedTitle": "SEO Optimized Article Title"
    }
  ]
}
Include exactly 5 high-quality, highly relevant clusters. Output ONLY the raw JSON object. Do not include markdown code blocks or any other text.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const result = await response.json();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(text);

    return NextResponse.json({ map: parsed });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
