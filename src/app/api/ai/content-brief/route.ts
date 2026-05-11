import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuthenticatedUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth.user) return auth.refreshedResponse!;

    const { topic, keyword } = await req.json();
    if (!topic || !keyword) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const sb = createServiceClient();
    const { data: agency } = await sb.from("agency_settings").select("gemini_api_key").eq("user_id", auth.user.id).maybeSingle();
    const apiKey = agency?.gemini_api_key || process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 400 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate a professional SEO content brief for the topic: "${topic}" targeting the keyword: "${keyword}".
    Return a JSON object with the following structure:
    {
      "title": "Optimized Title",
      "intent": "Search intent analysis and audience focus",
      "outline": [
        { "tag": "H2", "text": "Heading text", "notes": "What to cover here" }
      ],
      "lsi": ["keyword1", "keyword2", "keyword3"]
    }
    Make it high quality and strategic. Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const brief = JSON.parse(jsonStr);

    return NextResponse.json({ brief });
  } catch (e: any) {
    console.error("AI Brief Error:", e);
    return NextResponse.json({ error: "Failed to generate brief" }, { status: 500 });
  }
}
