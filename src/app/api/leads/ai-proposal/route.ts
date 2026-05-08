import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserClient } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const sb = getUserClient(req);
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leadId } = await req.json();
    const service = createServiceClient();

    const [{ data: lead }, { data: agency }] = await Promise.all([
      service.from("leads").select("*").eq("id", leadId).single(),
      service.from("agency_settings").select("*").eq("user_id", user.id).single(),
    ]);

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const apiKey = agency?.gemini_api_key || process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 400 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Create a professional SEO proposal for a potential client.
    Lead Name: ${lead.name}
    Website: ${lead.website}
    Audit Scores:
    - Performance: ${lead.audit_data?.performance}/100
    - SEO: ${lead.audit_data?.seo}/100
    - Accessibility: ${lead.audit_data?.accessibility}/100
    - Best Practices: ${lead.audit_data?.best_practices}/100
    
    Agency Name: ${agency?.agency_name || "Our Agency"}
    
    The proposal should include:
    1. Executive Summary
    2. Specific Issues Found (based on scores)
    3. 3-Month Action Plan
    4. Estimated Results
    5. Pricing (suggest a reasonable monthly retainer like $500-$2000)
    
    Return as JSON: { "title": "...", "sections": [ { "heading": "...", "content": "..." } ] }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const proposalData = JSON.parse(jsonStr);

    // Save proposal to database
    const { data: savedProposal, error: saveError } = await service.from("proposals").insert({
      user_id: user.id,
      client_name: lead.name,
      website: lead.website,
      title: proposalData.title,
      content: proposalData,
      status: "draft"
    }).select().single();

    if (saveError) {
      console.error("Save Error:", saveError);
      // Fallback: just return the data if table doesn't exist
      return NextResponse.json({ url: `/dashboard/proposals/preview?data=${encodeURIComponent(JSON.stringify(proposalData))}` });
    }

    return NextResponse.json({ url: `/dashboard/proposals/${savedProposal.id}` });
  } catch (e: any) {
    console.error("AI Proposal Error:", e);
    return NextResponse.json({ error: "Failed to generate proposal" }, { status: 500 });
  }
}
