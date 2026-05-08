import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserClient } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topic, type } = await req.json();
    if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Create a high-converting Google Business Profile (GMB) post.
    Post Type: ${type}
    Topic/Goal: ${topic}
    
    Guidelines:
    1. Include a strong hook.
    2. Use local SEO keywords naturally.
    3. Include a clear Call to Action (CTA).
    4. Keep it engaging and professional.
    5. Use relevant emojis.
    6. Max 1500 characters.
    
    Return as JSON: { "post": "..." }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("GMB Optimizer Error:", e);
    return NextResponse.json({ error: "Failed to generate post" }, { status: 500 });
  }
}
