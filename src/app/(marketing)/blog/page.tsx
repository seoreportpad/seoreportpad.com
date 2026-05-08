import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "SEO Blog — Reporting, Agency Growth & Topical Authority | SEO Report Manager",
  description: "Free guides on automated SEO reporting, white-label client dashboards, scaling your SEO agency, and building topical authority. Written by Muhammad Ismail.",
};

const pillars = [
  {
    href: "/blog/automated-seo-reporting",
    badge: "Pillar Guide",
    badgeColor: "bg-blue-100 text-blue-700",
    title: "Automated SEO Reporting",
    desc: "Stop spending hours each month building reports from scratch. Learn how to automate your entire SEO reporting workflow — from data collection to client email delivery — saving 10+ hours per month.",
    readTime: "12 min read",
    clusters: [
      "How to Automate Monthly SEO Reports for Clients",
      "Saving Time with AI-Driven SEO Summaries",
      "Creating Daily Rank Tracking Logs Automatically",
    ],
    accent: "from-blue-600 to-blue-700",
  },
  {
    href: "/blog/white-label-seo-reports",
    badge: "Pillar Guide",
    badgeColor: "bg-violet-100 text-violet-700",
    title: "White Label SEO Reports for Agencies",
    desc: "Your clients should see your brand, not your tools. Learn how to create stunning white-label SEO reports that command premium retainer fees and make your agency look world-class.",
    readTime: "10 min read",
    clusters: [
      "White Label SEO Reports Clients Will Love",
      "Custom Branding vs Generic SEO Dashboards",
      "Pricing Strategies for Selling SEO Audits",
    ],
    accent: "from-violet-600 to-violet-700",
  },
  {
    href: "/blog/client-seo-dashboards",
    badge: "Pillar Guide",
    badgeColor: "bg-teal-100 text-teal-700",
    title: "Client SEO Communication & Dashboards",
    desc: "PDFs are dead. Learn how to build interactive client dashboards that communicate SEO value clearly, reduce churn, and turn confused clients into loyal long-term retainers.",
    readTime: "11 min read",
    clusters: [
      "Key SEO Metrics Clients Actually Care About",
      "How to Explain Technical SEO to Non-Technical Clients",
      "Building a Transparent SEO Workflow with Client Portals",
    ],
    accent: "from-teal-600 to-teal-700",
  },
  {
    href: "/blog/seo-audit-competitor-reporting",
    badge: "Pillar Guide",
    badgeColor: "bg-red-100 text-red-700",
    title: "SEO Audits & Competitor Analysis Reporting",
    desc: "Your Screaming Frog data is worthless if clients don't understand it. Learn how to present technical SEO audits and competitor analysis in reports that justify your retainer and drive action.",
    readTime: "13 min read",
    clusters: [
      "How to Present Screaming Frog Audit Data to Clients",
      "Reporting on Competitor Backlink Gaps Effectively",
      "How to Show the ROI of Fixing Technical SEO Debt",
    ],
    accent: "from-red-600 to-red-700",
  },
  {
    href: "/blog/scaling-seo-agency",
    badge: "Pillar Guide",
    badgeColor: "bg-amber-100 text-amber-700",
    title: "Scaling Your SEO Agency",
    desc: "From solo freelancer to multi-client agency — learn the systems, workflows, and tools that let you manage 50+ SEO clients without burning out or dropping quality.",
    readTime: "14 min read",
    clusters: [
      "How to Manage 50+ SEO Clients Without Going Crazy",
      "Systematizing Your SEO Team's Daily Work Logs",
      "Client Onboarding Checklist for SEO Agencies",
    ],
    accent: "from-amber-600 to-amber-700",
  },
];

export default function BlogIndexPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <BookOpen size={12} />
            Topical Authority Content Hub
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            SEO Reporting{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Knowledge Base
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Free, in-depth guides on SEO reporting, agency scaling, white-label dashboards, and building topical authority — written by working SEO professionals.
          </p>
        </div>
      </section>

      {/* Pillar Articles */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-slate-900">Pillar Guides</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <TrendingUp size={14} />
              5 core topics · 25+ cluster articles
            </div>
          </div>

          <div className="space-y-6">
            {pillars.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group block bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className={`shrink-0 w-2 rounded-full bg-gradient-to-b ${p.accent} hidden md:block`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.badgeColor}`}>{p.badge}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={11} /> {p.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed mb-5">{p.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {p.clusters.map((c) => (
                        <span key={c} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-600 flex items-center justify-center transition-colors">
                      <ArrowRight size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-black mb-3">Ready to Put This Into Practice?</h2>
            <p className="text-slate-300 mb-8 text-lg">SEO Report Manager gives you the tools to implement every strategy in this blog — reporting, audits, client portals and more.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105">
              Start Free Trial <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
