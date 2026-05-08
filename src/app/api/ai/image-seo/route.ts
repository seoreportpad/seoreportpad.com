import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";
import { getUserClient } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // 1. Fetch images from URL
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" } });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const imageUrls: string[] = [];
    $("img").each((i, el) => {
      let src = $(el).attr("src");
      if (src && !src.startsWith("data:")) {
        if (src.startsWith("//")) src = "https:" + src;
        else if (src.startsWith("/")) {
          const base = new URL(url).origin;
          src = base + src;
        }
        if (imageUrls.length < 10) imageUrls.push(src); // Limit to 10 for speed
      }
    });

    if (imageUrls.length === 0) return NextResponse.json({ images: [] });

    // 2. Generate Alt texts with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze these image URLs from a website (${url}) and provide SEO-optimized Alt text for each.
    Focus on being descriptive, including relevant keywords (if possible from the URL), and keeping it under 125 characters.
    
    Images:
    ${imageUrls.map((u, i) => `${i+1}. ${u}`).join("\n")}
    
    Return as JSON: { "images": [ { "url": "...", "suggestedAlt": "..." } ] }`;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const text = aiResponse.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("Image SEO Error:", e);
    return NextResponse.json({ error: "Failed to analyze images" }, { status: 500 });
  }
}
