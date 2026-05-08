import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";
import { getUserClient } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { clientUrl, compUrl } = await req.json();
    if (!clientUrl || !compUrl) return NextResponse.json({ error: "URLs are required" }, { status: 400 });

    // 1. Fetch metadata from both for context
    const [clientRes, compRes] = await Promise.all([
      fetch(clientUrl).then(r => r.text()).catch(() => ""),
      fetch(compUrl).then(r => r.text()).catch(() => "")
    ]);

    const $client = cheerio.load(clientRes);
    const $comp = cheerio.load(compRes);

    const clientInfo = {
      title: $client("title").text(),
      h1: $client("h1").first().text(),
      desc: $client('meta[name="description"]').attr("content")
    };

    const compInfo = {
      title: $comp("title").text(),
      h1: $comp("h1").first().text(),
      desc: $comp('meta[name="description"]').attr("content")
    };

    // 2. AI Gap Analysis
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze these two websites and perform a Competitor Keyword Gap Analysis.
    
    CLIENT SITE (${clientUrl}):
    Title: ${clientInfo.title}
    H1: ${clientInfo.h1}
    Description: ${clientInfo.desc}
    
    COMPETITOR SITE (${compUrl}):
    Title: ${compInfo.title}
    H1: ${compInfo.h1}
    Description: ${compInfo.desc}
    
    Based on their industries and niches, find 8-10 high-value keywords that the COMPETITOR is likely ranking for, but the CLIENT is missing.
    For each gap, provide:
    1. Keyword
    2. Estimated Competitor Position (1-10)
    3. Difficulty (Easy, Medium, Hard)
    4. Opportunity Strategy (how the client can win this)
    
    Return as JSON: { "gaps": [ { "keyword": "...", "competitorPos": "...", "difficulty": "...", "opportunity": "..." } ] }`;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const text = aiResponse.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("Gap Analysis Error:", e);
    return NextResponse.json({ error: "Failed to run gap analysis" }, { status: 500 });
  }
}
