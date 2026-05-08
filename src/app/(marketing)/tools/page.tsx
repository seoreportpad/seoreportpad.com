"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  Wrench, Tag, FileCode2, Globe, ArrowRightLeft, 
  ChevronRight, Link2, BarChart3, Type, AlignLeft,
  Search, Sparkles
} from "lucide-react";

// Import tool components (reusing from dashboard)
import { MetaTagTool } from "@/components/tools/MetaTagTool";
import { TitleCheckerTool } from "@/components/tools/TitleCheckerTool";
import { RobotsTool } from "@/components/tools/RobotsTool";
import { SitemapTool } from "@/components/tools/SitemapTool";
import { WordCountTool } from "@/components/tools/WordCountTool";
import { SlugifyTool } from "@/components/tools/SlugifyTool";
import { UtmTool } from "@/components/tools/UtmTool";
import { RedirectTool } from "@/components/tools/RedirectTool";

type ToolId = "meta" | "title" | "robots" | "sitemap" | "redirect" | "wordcount" | "slugify" | "utm";

const TOOLS: { id: ToolId; label: string; slug: string; desc: string; icon: React.ElementType; color: string }[] = [
  { id: "meta",      label: "Meta Tag Generator",    slug: "meta-tag-generator",    desc: "Generate SEO-ready title & meta description tags instantly.",   icon: Tag,          color: "bg-blue-500" },
  { id: "title",     label: "Title Tag Checker",     slug: "title-tag-checker",     desc: "Analyze length, keyword presence & preview your SERP appearance.",    icon: Type,         color: "bg-violet-500" },
  { id: "robots",    label: "Robots.txt Generator",  slug: "robots-txt-generator",  desc: "Build perfect robots.txt rules for any CMS or custom website.",  icon: FileCode2,    color: "bg-slate-600" },
  { id: "sitemap",   label: "Sitemap Generator",     slug: "sitemap-generator",     desc: "Create a clean XML sitemap from a simple list of your URLs.",     icon: Globe,        color: "bg-green-500" },
  { id: "redirect",  label: "Redirect Checker",      slug: "redirect-checker",      desc: "Detect redirect chains and verify 301 vs 302 status codes.",          icon: ArrowRightLeft,color: "bg-amber-500" },
  { id: "wordcount", label: "Word Count & Density",  slug: "word-count-checker",    desc: "Check word count and keyword density for better content optimization.",      icon: AlignLeft,    color: "bg-pink-500" },
  { id: "slugify",   label: "URL Slug Generator",    slug: "url-slug-generator",    desc: "Convert any title or text into a clean, SEO-friendly URL slug.",       icon: Link2,        color: "bg-teal-500" },
  { id: "utm",       label: "UTM Builder",           slug: "utm-builder",           desc: "Build professional UTM campaign URLs for accurate tracking.",           icon: BarChart3,    color: "bg-orange-500" },
];

const TOOL_COMPONENTS: Record<ToolId, React.ComponentType> = {
  meta: MetaTagTool,
  title: TitleCheckerTool,
  robots: RobotsTool,
  sitemap: SitemapTool,
  redirect: RedirectTool,
  wordcount: WordCountTool,
  slugify: SlugifyTool,
  utm: UtmTool,
};

export default function PublicToolsPage() {
  const [active, setActive] = useState<ToolId | null>(null);
  const [search, setSearch] = useState("");

  const filtered = TOOLS.filter(t => 
    t.label.toLowerCase().includes(search.toLowerCase()) || 
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  const ActiveTool = active ? TOOL_COMPONENTS[active] : null;
  const activeMeta = active ? TOOLS.find(t => t.id === active)! : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <Sparkles size={14} /> 100% Free SEO Utilities
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Professional SEO Toolkit</h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Free tools to help you optimize your website, track campaigns, and improve your search rankings. No signup required.
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text"
              placeholder="Search for a tool (e.g. meta, robots, sitemap)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10">
        {active && activeMeta ? (
          <div className="animate-fade-in">
            {/* Tool Container */}
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden mb-12">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${activeMeta.color} rounded-2xl flex items-center justify-center shadow-lg shadow-current/10`}>
                    <activeMeta.icon size={28} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{activeMeta.label}</h2>
                    <p className="text-slate-500 font-medium">{activeMeta.desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActive(null)}
                  className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  View All Tools
                </button>
              </div>
              <div className="p-8 md:p-12">
                {ActiveTool && <ActiveTool />}
              </div>
            </div>

            {/* Related Tools */}
            <h3 className="text-xl font-black text-slate-800 mb-6">Other Tools You Might Like</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {TOOLS.filter(t => t.id !== active).slice(0, 3).map(tool => (
                <button 
                  key={tool.id}
                  onClick={() => { setActive(tool.id); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all text-left group"
                >
                   <div className={`w-10 h-10 ${tool.color} rounded-xl flex items-center justify-center mb-4 text-white`}>
                    <tool.icon size={18} />
                   </div>
                   <h4 className="font-bold text-slate-900 mb-1">{tool.label}</h4>
                   <p className="text-xs text-slate-500 line-clamp-2">{tool.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(tool => (
              <button 
                key={tool.id} 
                onClick={() => { setActive(tool.id); window.scrollTo({ top: 350, behavior: 'smooth' }); }}
                className="group bg-white border border-slate-100 rounded-[2rem] p-8 text-left hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-100 transition-all hover:-translate-y-1 flex flex-col h-full"
              >
                <div className={`w-14 h-14 ${tool.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <tool.icon size={26} className="text-white" />
                </div>
                <h3 className="font-black text-slate-900 text-xl mb-3">{tool.label}</h3>
                <p className="text-slate-500 leading-relaxed font-medium mb-8 flex-1">{tool.desc}</p>
                
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  Try it for free <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Want more than just free tools?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">Get automated SEO audits, white-label reporting, and client management for your agency.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black hover:bg-slate-50 transition-colors shadow-lg shadow-black/10">
                Start Free Trial
              </Link>
              <Link href="/" className="bg-blue-500/20 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-black hover:bg-white/10 transition-colors">
                Run Free Audit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
