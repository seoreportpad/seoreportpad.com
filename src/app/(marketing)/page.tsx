"use client";
import Link from "next/link";
import {
  BarChart3, FileText, Users, ClipboardCheck, Mail,
  Download, TrendingUp, CheckCircle, ArrowRight,
  Zap, Shield, Globe, Star,
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
    desc: "Enter traffic, backlinks, DA, keywords manually. Charts generate automatically. Clean, professional output.",
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: Users,
    title: "Client Management",
    desc: "Add unlimited clients with contact info. All reports and notes linked per client. Easy search and filter.",
    color: "from-teal-500 to-teal-600",
    bg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    icon: Mail,
    title: "Email Reports",
    desc: "Send beautiful HTML reports directly to clients via Gmail. No paid service needed — just App Password.",
    color: "from-orange-500 to-orange-600",
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    icon: Download,
    title: "PDF & CSV Export",
    desc: "Download reports as PDF or export to CSV for Google Sheets. One click, zero cost.",
    color: "from-green-500 to-green-600",
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: FileText,
    title: "Templates & Notes",
    desc: "Save your SEO prompts, recommendations and client notes. Reuse with one click. Never start from scratch.",
    color: "from-pink-500 to-pink-600",
    bg: "bg-pink-50",
    iconColor: "text-pink-600",
  },
];

const stats = [
  { value: "24", label: "Audit Categories" },
  { value: "180+", label: "SEO Checks" },
  { value: "100%", label: "Free to Use" },
  { value: "0", label: "Paid APIs" },
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <ClipboardCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">SEO Reports</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/audit" className="text-sm text-slate-600 hover:text-slate-900 font-medium hidden md:block">Audit Checklist</Link>
            <Link href="/dashboard/reports" className="text-sm text-slate-600 hover:text-slate-900 font-medium hidden md:block">Reports</Link>
            <Link href="/dashboard" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium px-4 py-2 rounded-full mb-6">
            <Zap size={12} />
            Built for SEO Professionals · No Paid APIs Required
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            Professional SEO Reports
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              In Minutes, Not Hours
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Manage clients, run full Screaming Frog audits, track keyword rankings,
            and send beautiful reports to clients — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-900/30">
              Open Dashboard <ArrowRight size={20} />
            </Link>
            <Link href="/dashboard/audit" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all">
              View Audit Checklist
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-12 border-t border-white/10">
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
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Everything You Need</h2>
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

      {/* Screaming Frog section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Shield size={12} /> Screaming Frog Powered
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-5 leading-tight">
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

            <div className="bg-slate-900 rounded-2xl p-6 space-y-3">
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
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gradient-to-b from-blue-600 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-4">How It Works</h2>
          <p className="text-blue-200 text-lg mb-16 max-w-xl mx-auto">From audit to client email in a few steps</p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: Users, title: "Add Client", desc: "Enter client name, website, email and contact info." },
              { step: "02", icon: ClipboardCheck, title: "Run Audit", desc: "Go through the Screaming Frog checklist. Mark issues found and fixed." },
              { step: "03", icon: BarChart3, title: "Enter Metrics", desc: "Add traffic, rankings, backlinks, DA. Charts auto-generate." },
              { step: "04", icon: Mail, title: "Send Report", desc: "Download PDF, export CSV, or email direct to client." },
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

      {/* Testimonial / CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />)}
          </div>
          <blockquote className="text-3xl font-bold text-slate-800 mb-6 leading-tight">
            "Finally a tool that lets me manage all my SEO clients and send professional reports without paying for 5 different tools."
          </blockquote>
          <p className="text-slate-500 mb-12">— Muhammad Ismail, SEO Specialist</p>

          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-10 text-white">
            <Globe size={40} className="mx-auto mb-4 text-blue-400" />
            <h2 className="text-3xl font-black mb-3">Ready to Get Started?</h2>
            <p className="text-slate-300 mb-8 text-lg">Open your dashboard and create your first client report.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105">
                Go to Dashboard <ArrowRight size={20} />
              </Link>
              <Link href="/dashboard/reports/new" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all">
                Create First Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <ClipboardCheck size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">SEO Reports</span>
          </div>
          <p className="text-slate-400 text-sm">Built by Muhammad Ismail · SEO Specialist · 2026</p>
          <div className="flex gap-5">
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</Link>
            <Link href="/dashboard/audit" className="text-slate-400 hover:text-white text-sm transition-colors">Audit</Link>
            <Link href="/dashboard/clients" className="text-slate-400 hover:text-white text-sm transition-colors">Clients</Link>
            <Link href="/dashboard/settings" className="text-slate-400 hover:text-white text-sm transition-colors">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
