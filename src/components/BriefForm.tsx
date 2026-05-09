"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Type, List, Link as LinkIcon, FileText, CheckCircle2 } from "lucide-react";

interface Client { id: string; name: string; }

interface Brief {
  id?: string;
  client_id: string;
  title: string;
  primary_keyword: string;
  secondary_keywords: string;
  word_count: string;
  tone: string;
  outline: string;
  competitor_links: string;
  internal_links: string;
  instructions: string;
  nlp_terms?: string;
  semantic_entities?: string;
  status: string;
}

export default function BriefForm({ initialClientId, briefId, initialData }: { initialClientId?: string; briefId?: string; initialData?: Brief }) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Brief>({
    client_id: initialData?.client_id || initialClientId || "",
    title: initialData?.title || "",
    primary_keyword: initialData?.primary_keyword || "",
    secondary_keywords: initialData?.secondary_keywords || "",
    word_count: initialData?.word_count || "1000",
    tone: initialData?.tone || "Professional, informative, and engaging",
    outline: initialData?.outline || "H2: Introduction\n\nH2: Main Point 1\n\nH2: Main Point 2\n\nH2: Conclusion",
    competitor_links: initialData?.competitor_links || "",
    internal_links: initialData?.internal_links || "",
    instructions: initialData?.instructions || "Please ensure short paragraphs (max 3-4 lines). Use bullet points where appropriate.",
    nlp_terms: initialData?.nlp_terms || "",
    semantic_entities: initialData?.semantic_entities || "",
    status: initialData?.status || "draft",
  });

  useEffect(() => {
    fetch("/api/clients").then(r => r.ok ? r.json() : []).then(c => {
      setClients(Array.isArray(c) ? c : []);
      if (!data.client_id && Array.isArray(c) && c.length > 0) {
        setData(d => ({ ...d, client_id: c[0].id }));
      }
    });
  }, [data.client_id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = briefId ? `/api/briefs/${briefId}` : "/api/briefs";
    const method = briefId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
      if (data.client_id) {
        router.push(`/dashboard/clients/${data.client_id}`);
      } else {
        router.push("/dashboard");
      }
    } else {
      alert("Error saving brief");
      setLoading(false);
    }
  };

  const inp = (label: string, field: keyof Brief, placeholder = "", type = "text") => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <input type={type} value={data[field] as string} onChange={e => setData({ ...data, [field]: e.target.value })}
        placeholder={placeholder} required={field === "title" || field === "primary_keyword"}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white shadow-sm" />
    </div>
  );

  const txt = (label: string, field: keyof Brief, placeholder = "", rows = 4) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <textarea value={data[field] as string} onChange={e => setData({ ...data, [field]: e.target.value })}
        placeholder={placeholder} rows={rows}
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white shadow-sm resize-y" />
    </div>
  );

  return (
    <form onSubmit={save} className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <FileText className="text-violet-600" />
              {briefId ? "Edit Content Brief" : "Create Content Brief"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Define scope and requirements for the writer.</p>
          </div>
          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? "Saving..." : "Save Brief"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Client <span className="text-red-500">*</span></label>
            <select required value={data.client_id} onChange={e => setData({ ...data, client_id: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white shadow-sm">
              <option value="">-- Select Client --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
            <select value={data.status} onChange={e => setData({ ...data, status: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white shadow-sm">
              <option value="draft">Draft (Not Ready)</option>
              <option value="ready">Ready for Writer</option>
              <option value="in-progress">Writing In Progress</option>
              <option value="completed">Completed / Published</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-50 pb-3">
              <Type size={16} className="text-blue-500" /> Topic & Keywords
            </h2>
            {inp("Article Title / Topic", "title", "e.g. 10 Best Wedding Venues in Riyadh")}
            <div className="grid grid-cols-2 gap-4">
              {inp("Primary Keyword", "primary_keyword", "e.g. wedding venues riyadh")}
              {inp("Word Count Target", "word_count", "e.g. 1500 words")}
            </div>
            {txt("Secondary Keywords / LSI", "secondary_keywords", "Comma separated keywords to include...", 2)}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-50 pb-3">
              <CheckCircle2 size={16} className="text-indigo-500" /> NLP & Semantic Entities
            </h2>
            {txt("NLP Terms to Include", "nlp_terms", "e.g. seating capacity, catering services, outdoor space...", 2)}
            {txt("Semantic Entities (Places, Brands, Concepts)", "semantic_entities", "e.g. Kingdom Centre, Ritz-Carlton, Saudi Vision 2030...", 2)}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-50 pb-3">
              <List size={16} className="text-emerald-500" /> Structure & Tone
            </h2>
            {inp("Tone of Voice", "tone", "e.g. Authoritative but friendly")}
            {txt("Article Outline (H2 / H3)", "outline", "Write the expected headings here...", 8)}
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-50 pb-3">
              <LinkIcon size={16} className="text-amber-500" /> References
            </h2>
            {txt("Competitor Links to Review", "competitor_links", "Paste top ranking URLs here...", 3)}
            {txt("Internal/External Links to Include", "internal_links", "Paste URLs writer must link to...", 3)}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-50 pb-3">
              <CheckCircle2 size={16} className="text-pink-500" /> Extra Instructions
            </h2>
            {txt("Writer Instructions & Call to Action", "instructions", "Specific formatting rules, CTA at the end...", 5)}
          </div>
        </div>
      </div>
    </form>
  );
}
