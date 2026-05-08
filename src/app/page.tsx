"use client";
import Link from "next/link";
import { useState } from "react";
import {
  BarChart3, FileText, Users, ClipboardCheck, Mail,
  Download, TrendingUp, CheckCircle, ArrowRight,
  Zap, Shield, Globe, Star, Wrench, ChevronDown,
  FileSpreadsheet, Link2, Target, CalendarDays, Layers,
  Search, Code2, MapPin, RefreshCw, Type, AlignLeft, Hash,
  ExternalLink, PlayCircle,
} from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "SEO Audit Checklist",
    desc: "180+ Screaming Frog checks across 24 categories — Issues, Warnings & Opportunities with High/Medium/Low priority.",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: BarChart3,
    title: "Performance Reports",
    desc: "Enter traffic, backlinks, DA, keywords manually. Charts generate automatically. Clean, professional PDF output.",
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: Users,
    title: "Client Management",
    desc: "Unlimited clients with branding, contact info, portal links. All reports linked per client with search and filter.",
    color: "from-teal-500 to-teal-600",
    bg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    icon: Mail,
    title: "Email Reports",
    desc: "Send beautiful HTML reports directly to clients via Gmail App Password. No paid email service needed.",
    color: "from-orange-500 to-orange-600",
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    icon: FileSpreadsheet,
    title: "PDF & Excel Export",
    desc: "Download reports as PDF or multi-sheet XLSX with charts, keyword data, backlinks and task summary.",
    color: "from-green-500 to-green-600",
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: Link2,
    title: "Backlinks & Competitors",
    desc: "Track backlinks manually, monitor competitor rankings, DA, traffic and compare progress over time.",
    color: "from-pink-500 to-pink-600",
    bg: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    icon: Target,
    title: "Keyword Tracking",
    desc: "Track keyword positions, search volume, difficulty and history. Spot improvements and declines at a glance.",
    color: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    icon: Layers,
    title: "Bulk & Auto Reports",
    desc: "Generate reports for all clients at once. Auto-schedule monthly reports with blank or copy-last templates.",
    color: "from-amber-500 to-amber-600",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: Wrench,
    title: "SEO Tools Built-In",
    desc: "8 free tools: Meta Tag Generator, Title Checker, Robots.txt Builder, Sitemap Generator, UTM Builder and more.",
    color: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
];

const tools = [
  { icon: Code2,        label: "Meta Tag Generator",       desc: "Generate title, description & OG tags with SERP preview" },
  { icon: Type,         label: "Title Tag Checker",         desc: "Score your title tag across 6 quality checks instantly" },
  { icon: Shield,       label: "Robots.txt Generator",      desc: "CMS templates (WP/Shopify/Wix) + custom rules builder" },
  { icon: MapPin,       label: "Sitemap Generator",         desc: "Turn a URL list into a ready-to-upload XML sitemap" },
  { icon: RefreshCw,    label: "Redirect Checker",          desc: "Redirect chain checklist for any URL" },
  { icon: AlignLeft,    label: "Word Count & Density",       desc: "Words, sentences, readability + keyword density gauge" },
  { icon: Hash,         label: "URL Slug Generator",        desc: "Convert any text to an SEO-friendly URL slug instantly" },
  { icon: ExternalLink, label: "UTM Builder",               desc: "Build UTM-tagged URLs with 6 params + quick-fill presets" },
];

const stats = [
  { value: "24",   label: "Audit Categories" },
  { value: "180+", label: "SEO Checks" },
  { value: "8",    label: "Free SEO Tools" },
  { value: "0",    label: "Paid APIs" },
];

const checks = [
  "Response Codes & Redirects",
  "Page Titles & Meta Descriptions",
  "H1, H2 Headings",
  "Images & Alt Text",
  "Core Web Vitals (LCP, CLS, INP)",
  "Canonicals & Hreflang",
  "Structured Data / Schema",
  "XML Sitemaps",
  "Internal Links & Broken Links",
  "Mobile Usability",
  "JavaScript & Accessibility",
  "Search Console & Analytics",
];

const testimonials = [
  {
    quote: "Finally a tool that lets me manage all my SEO clients and send professional reports without paying for 5 different tools.",
    name: "Muhammad Ismail",
    role: "SEO Specialist · Freelancer",
    stars: 5,
  },
  {
    quote: "The Screaming Frog audit checklist alone saves me 2 hours per client. I used to build this in Google Sheets every month.",
    name: "Sarah K.",
    role: "SEO Consultant",
    stars: 5,
  },
  {
    quote: "Bulk report generation is a game changer. I generate reports for all 12 clients in under 5 minutes.",
    name: "James R.",
    role: "Agency Owner",
    stars: 5,
  },
];

const faqs = [
  {
    q: "Do I need to pay for any third-party APIs?",
    a: "No. Everything runs in your browser or on your own server. There are zero required paid APIs. Email reports use Gmail App Password (free).",
  },
  {
    q: "Can I white-label reports for clients?",
    a: "Yes. Add your agency name, logo and primary color in Settings. All PDF exports and client portal links show your branding.",
  },
  {
    q: "What SEO tools are included?",
    a: "8 built-in tools: Meta Tag Generator, Title Tag Checker, Robots.txt Generator, Sitemap Generator, Redirect Checker, Word Count & Keyword Density, URL Slug Generator, UTM Builder.",
  },
  {
    q: "Is there a client portal?",
    a: "Yes. Each report gets a unique shareable link. Clients can view their report in a branded portal without logging in.",
  },
  {
    q: "Can I export data to Excel?",
    a: "Yes. Reports export as a 5-sheet XLSX file with overview, keywords, backlinks, audit results and task summary.",
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Audit Tool State
  const [auditUrl, setAuditUrl] = useState("");
  const [auditEmail, setAuditEmail] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [auditError, setAuditError] = useState("");

  const runAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditUrl) return;
    setAuditLoading(true);
    setAuditError("");
    setAuditResult(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: auditUrl, email: auditEmail }),
      });
      const data = await res.json();
      if (data.error) setAuditError(data.error);
      else setAuditResult(data);
    } catch (err) {
      setAuditError("Failed to connect to audit server.");
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <ClipboardCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">SEO Report Manager</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Features</a>
            <a href="#tools" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Tools</a>
            <Link href="/blog" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Blog</Link>
            <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Pricing</Link>
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Sign In</Link>
          </div>
          <Link href="/signup" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Zap size={12} />
            Built for SEO Freelancers & Agencies · No Paid APIs · No Limits
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
            Professional SEO Reports
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              In Minutes, Not Hours
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Manage clients, run Screaming Frog audits, track keyword rankings, generate white-label PDF & Excel reports,
            and send them to clients — all in one place, no subscriptions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-900/30">
              Start Free Trial <ArrowRight size={20} />
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all">
              <PlayCircle size={20} /> Open Dashboard
            </Link>
          </div>

          {/* Audit Tool Lead Magnet */}
          <div id="audit" className="max-w-3xl mx-auto bg-white rounded-3xl p-1 shadow-2xl shadow-blue-500/20 mb-16 animate-bounce-subtle">
            <div className="bg-slate-50 rounded-[22px] p-6 md:p-8">
              <h2 className="text-2xl font-black text-slate-800 mb-2">Free Website SEO Audit</h2>
              <p className="text-slate-500 text-sm mb-6">Enter your URL to get an instant SEO & Performance score.</p>
              
              {!auditResult ? (
                <form onSubmit={runAudit} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                      <input 
                        type="url" 
                        required 
                        placeholder="https://yourwebsite.com" 
                        value={auditUrl}
                        onChange={e => setAuditUrl(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <input 
                        type="email" 
                        placeholder="your@email.com (optional)" 
                        value={auditEmail}
                        onChange={e => setAuditEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={auditLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 whitespace-nowrap shadow-lg shadow-blue-600/20"
                    >
                      {auditLoading ? <span className="flex items-center gap-2"><RefreshCw size={18} className="animate-spin" /> Analyzing…</span> : "Scan Now"}
                    </button>
                  </div>
                  {auditError && <p className="text-red-500 text-xs font-medium">{auditError}</p>}
                  <p className="text-[10px] text-slate-400">Powered by Google PageSpeed Insights · Takes ~15 seconds</p>
                </form>
              ) : (
                <div className="animate-fade-in">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Performance", value: auditResult.performance, color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "SEO Score", value: auditResult.seo, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { label: "Accessibility", value: auditResult.accessibility, color: "text-violet-600", bg: "bg-violet-50" },
                      { label: "Best Practices", value: auditResult.best_practices, color: "text-amber-600", bg: "bg-amber-50" },
                    ].map(s => (
                      <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm`}>
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}%</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-700">Detailed Report Ready!</p>
                      <p className="text-xs text-slate-500">Sign up to get the full 180-point audit for {auditResult.url}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setAuditResult(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-2 transition-colors">Scan Another</button>
                      <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10">Get Full Audit Free</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 mb-16">
            {["14-day free trial", "No credit card required", "No paid APIs", "White-label ready"].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-green-400" />
                {t}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-white/10">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-black text-white mb-1">{value}</p>
                <p className="text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Zap size={11} /> All features included
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              A complete SEO reporting system built for freelancers and agencies — no subscriptions, no APIs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, bg, iconColor }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Tools showcase */}
      <section id="tools" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
                <Wrench size={11} /> 8 Free SEO Tools
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 leading-tight">
                Built-In Tools,<br />
                <span className="text-blue-600">Zero Extra Cost</span>
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Stop paying for separate tools. Meta Tag Generator, Title Checker, Robots.txt Builder,
                Sitemap Generator, UTM Builder and more — all free, all running 100% in your browser.
              </p>
              <Link href="/dashboard/tools" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors">
                Open SEO Tools <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {tools.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:bg-blue-50 hover:border-blue-100 transition-all group cursor-default">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center mb-3 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-600 transition-all">
                    <Icon size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-tight mb-1">{label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Screaming Frog audit section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="bg-slate-900 rounded-2xl p-6 space-y-3 order-2 lg:order-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Audit Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {checks.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle size={13} className="text-green-400 shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-700 mt-3">
                <p className="text-xs text-slate-500 text-center">+ 12 more categories · 180+ total checks</p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
                <Shield size={11} /> Screaming Frog Powered
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 leading-tight">
                Complete SEO Audit<br />
                <span className="text-blue-600">Checklist Built-In</span>
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                All 24 Screaming Frog categories with 180+ individual checks. Mark each issue as
                <span className="font-semibold text-red-600"> Found</span>,
                <span className="font-semibold text-green-600"> Fixed</span>, or
                <span className="font-semibold text-slate-500"> N/A</span>.
                Your progress saves automatically.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["Issues", "Warnings", "Opportunities"].map((t, i) => (
                  <span key={t} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                    i === 0 ? "bg-red-50 border-red-200 text-red-600"
                    : i === 1 ? "bg-amber-50 border-amber-200 text-amber-600"
                    : "bg-blue-50 border-blue-200 text-blue-600"
                  }`}>{t}</span>
                ))}
                {["High", "Medium", "Low"].map((p, i) => (
                  <span key={p} className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${i === 0 ? "bg-red-500" : i === 1 ? "bg-amber-500" : "bg-green-500"}`} />
                    {p} Priority
                  </span>
                ))}
              </div>
              <Link href="/dashboard/audit" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors">
                Open Audit Checklist <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gradient-to-b from-blue-600 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">How It Works</h2>
          <p className="text-blue-200 text-lg mb-16 max-w-xl mx-auto">From audit to client email in 4 steps</p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: Users,         title: "Add Client",    desc: "Enter client name, website, email and contact info. Add your agency branding." },
              { step: "02", icon: ClipboardCheck, title: "Run Audit",    desc: "Go through the Screaming Frog checklist. Mark issues found and fixed." },
              { step: "03", icon: BarChart3,      title: "Enter Metrics", desc: "Add traffic, rankings, backlinks, DA. Charts and score cards auto-generate." },
              { step: "04", icon: Mail,           title: "Send Report",  desc: "Download PDF, export XLSX, share portal link, or email direct to client." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-black text-blue-500/40 mb-3">{step}</div>
                <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-blue-200 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Loved by SEO Professionals</h2>
            <p className="text-slate-500 text-lg">Join freelancers and agencies already saving hours every month</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role, stars }) => (
              <div key={name} className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(stars)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <blockquote className="text-slate-700 text-sm leading-relaxed mb-4">"{quote}"</blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know before you start</p>
          </div>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-slate-800 text-sm">{q}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl translate-y-16 -translate-x-16" />
            <div className="relative">
              <Globe size={44} className="mx-auto mb-5 text-blue-400" />
              <h2 className="text-4xl font-black mb-3">Ready to Get Started?</h2>
              <p className="text-slate-300 mb-2 text-lg">Open your dashboard and create your first client report.</p>
              <p className="text-slate-400 text-sm mb-10">14-day free trial · No credit card · Cancel anytime</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105">
                  Start Free Trial <ArrowRight size={20} />
                </Link>
                <Link href="/pricing" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all">
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ClipboardCheck size={14} className="text-white" />
                </div>
                <span className="font-bold text-white">SEO Report Manager</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Professional SEO reporting for freelancers and agencies. Built by Muhammad Ismail, SEO Specialist.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Product</p>
              <div className="space-y-2">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/dashboard/audit", label: "SEO Audit" },
                  { href: "/tools", label: "SEO Tools" },
                  { href: "/dashboard/reports", label: "Reports" },
                  { href: "/pricing", label: "Pricing" },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} className="block text-slate-400 hover:text-white text-sm transition-colors">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Learn</p>
              <div className="space-y-2">
                {[
                  { href: "/blog", label: "SEO Blog" },
                  { href: "/blog/automated-seo-reporting", label: "Automated Reporting" },
                  { href: "/blog/white-label-seo-reports", label: "White Label Reports" },
                  { href: "/blog/client-seo-dashboards", label: "Client Dashboards" },
                  { href: "/blog/seo-audit-competitor-reporting", label: "SEO Audits" },
                  { href: "/blog/scaling-seo-agency", label: "Scale Your Agency" },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} className="block text-slate-400 hover:text-white text-sm transition-colors">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Account</p>
              <div className="space-y-2">
                {[
                  { href: "/login", label: "Sign In" },
                  { href: "/signup", label: "Sign Up" },
                  { href: "/dashboard/settings", label: "Settings" },
                  { href: "/pricing", label: "Upgrade to Pro" },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} className="block text-slate-400 hover:text-white text-sm transition-colors">{label}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-slate-500 text-sm">© 2026 SEO Report Manager · Built by Muhammad Ismail</p>
            <p className="text-slate-600 text-xs">support@seoreportpad.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
