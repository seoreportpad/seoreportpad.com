"use client";
import { useState } from "react";
import {
  Wrench, Tag, FileCode2, Globe, ArrowRightLeft,
  ChevronRight, Link2, BarChart3, Type, AlignLeft,
} from "lucide-react";

// Import tool components
import { MetaTagTool } from "@/components/tools/MetaTagTool";
import { TitleCheckerTool } from "@/components/tools/TitleCheckerTool";
import { RobotsTool } from "@/components/tools/RobotsTool";
import { SitemapTool } from "@/components/tools/SitemapTool";
import { WordCountTool } from "@/components/tools/WordCountTool";
import { SlugifyTool } from "@/components/tools/SlugifyTool";
import { UtmTool } from "@/components/tools/UtmTool";
import { RedirectTool } from "@/components/tools/RedirectTool";

type ToolId = "meta" | "title" | "robots" | "sitemap" | "redirect" | "wordcount" | "slugify" | "utm";

const TOOLS: { id: ToolId; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { id: "meta",      label: "Meta Tag Generator",    desc: "Generate SEO-ready title & meta description tags",   icon: Tag,          color: "bg-blue-500" },
  { id: "title",     label: "Title Tag Checker",     desc: "Analyze length, keyword presence & SERP preview",    icon: Type,         color: "bg-violet-500" },
  { id: "robots",    label: "Robots.txt Generator",  desc: "Build robots.txt rules for any CMS or custom site",  icon: FileCode2,    color: "bg-slate-600" },
  { id: "sitemap",   label: "Sitemap Generator",     desc: "Create a basic XML sitemap from a list of URLs",     icon: Globe,        color: "bg-green-500" },
  { id: "redirect",  label: "Redirect Checker",      desc: "Detect redirect chains, 301 vs 302 status",          icon: ArrowRightLeft,color: "bg-amber-500" },
  { id: "wordcount", label: "Word Count & Density",  desc: "Count words, check keyword density in content",      icon: AlignLeft,    color: "bg-pink-500" },
  { id: "slugify",   label: "URL Slug Generator",    desc: "Convert any text to an SEO-friendly URL slug",       icon: Link2,        color: "bg-teal-500" },
  { id: "utm",       label: "UTM Builder",           desc: "Build UTM-tagged URLs for campaign tracking",        icon: BarChart3,    color: "bg-orange-500" },
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

export default function ToolsPage() {
  const [active, setActive] = useState<ToolId | null>(null);
  const ActiveTool = active ? TOOL_COMPONENTS[active] : null;
  const activeMeta = active ? TOOLS.find(t => t.id === active)! : null;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/10">
          <Wrench size={26} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">SEO Tools</h1>
          <p className="text-slate-500 font-medium mt-1">8 professional utilities to optimize your search presence</p>
        </div>
      </div>

      {active && activeMeta ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Back button */}
          <button 
            onClick={() => setActive(null)} 
            className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-bold mb-6 transition-colors"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Toolkit
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 ${activeMeta.color} rounded-2xl flex items-center justify-center shadow-lg`}>
              <activeMeta.icon size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{activeMeta.label}</h2>
              <p className="text-slate-500 font-medium">{activeMeta.desc}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
            {ActiveTool && <ActiveTool />}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {TOOLS.map(tool => (
            <button 
              key={tool.id} 
              onClick={() => setActive(tool.id)}
              className="group bg-white border border-slate-100 rounded-3xl p-6 text-left hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all hover:-translate-y-1 relative overflow-hidden"
            >
              <div className={`w-12 h-12 ${tool.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <tool.icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{tool.label}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">{tool.desc}</p>
              
              <div className="flex items-center gap-1.5 mt-5 text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Launch tool <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
