import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, ChevronRight, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Scale Your SEO Agency to 50+ Clients | SEO Report Manager",
  description: "From solo freelancer to multi-client agency — the exact systems, workflows, and tools that let you manage 50+ SEO clients without burning out or dropping quality.",
};

const clusters = [
  { title: "How to Manage 50+ SEO Clients Without Going Crazy", href: "#manage-50" },
  { title: "Bulk Reporting Tools for Enterprise SEO Workflows", href: "#bulk-reporting" },
  { title: "Systematizing Your SEO Team's Daily Work Logs", href: "#work-logs" },
  { title: "Client Onboarding Checklist for SEO Agencies", href: "#onboarding" },
  { title: "Using CRM Features to Track Proposal Conversions", href: "#crm" },
];

export default function ScalingSEOAgencyPage() {
  return (
    <article>
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
            <ChevronRight size={14} className="rotate-180" /> Back to Blog
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/30">Pillar Guide</span>
            <span className="text-slate-400 text-sm flex items-center gap-1.5"><Clock size={13} /> 14 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
            Scaling Your SEO Agency:<br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              From 5 Clients to 50+
            </span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
            The systems, workflows, and tools that let you manage 50+ SEO clients without burning out or dropping quality. A practical playbook for growing agencies.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">

            <h2 id="manage-50" className="text-2xl font-black text-slate-900 mb-4">How to Manage 50+ SEO Clients Without Going Crazy</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              The bottleneck in scaling an SEO agency is almost never talent — it's operations. You can do great SEO for 5 clients manually. But at 20 clients, the reporting alone becomes a part-time job. At 50, without systems, it becomes a full-time nightmare.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              The agencies that successfully scale to 50+ clients share one common trait: they systematized everything before they needed to. Reporting, onboarding, audits, communication — all running on repeatable workflows with minimal manual touch.
            </p>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Users size={16} className="text-amber-600" /> The 4 Pillars of Agency Scale
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { num: "1", title: "Standardized Reporting", desc: "Every client gets the same quality report, generated in minutes — not hours." },
                  { num: "2", title: "Automated Onboarding", desc: "A checklist-driven process so no step is missed for any new client." },
                  { num: "3", title: "Team Work Logging", desc: "Every team member logs daily tasks. You know exactly what was done for every client." },
                  { num: "4", title: "Bulk Operations", desc: "Generate reports, send emails, and schedule tasks for all clients at once." },
                ].map(({ num, title, desc }) => (
                  <div key={num} className="bg-white rounded-xl p-4 border border-amber-100">
                    <p className="text-xs font-black text-amber-500 mb-1">0{num}</p>
                    <p className="font-bold text-slate-800 text-sm mb-1">{title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <h2 id="bulk-reporting" className="text-2xl font-black text-slate-900 mb-4 mt-10">Bulk Reporting Tools for Enterprise SEO Workflows</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              At 10+ clients, generating reports one-by-one is no longer viable. Bulk reporting means: one click generates a report for every active client simultaneously, auto-populated with last month's data as a starting point.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              The workflow that works at scale:
            </p>
            <div className="space-y-3 mb-8">
              {[
                { step: "01", action: "Schedule auto-reports", detail: "Set a recurring schedule (e.g., first Monday of every month). Reports auto-generate for all clients with blank or copy-last-month templates." },
                { step: "02", action: "Batch review and update", detail: "Spend 3–4 hours reviewing all generated reports, filling in the month's specific metrics and updates. Assembly-line style, not one-by-one." },
                { step: "03", action: "Bulk send", detail: "Send all reports in a single batch email operation. Every client receives their branded report simultaneously." },
              ].map(({ step, action, detail }) => (
                <div key={step} className="flex gap-4 bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <div className="text-2xl font-black text-slate-300 shrink-0 w-8">{step}</div>
                  <div>
                    <p className="font-bold text-slate-800 mb-1">{action}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 id="work-logs" className="text-2xl font-black text-slate-900 mb-4 mt-10">Systematizing Your SEO Team's Daily Work Logs</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Without work logs, you don't know what your team is doing. Clients ask "what did you do this month?" and you're scrambling through Slack messages and emails to reconstruct an answer.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              Implement a simple daily log system: every team member records their tasks per client at end of day. By month end, each client's report auto-populates with the full work log. No more scrambling. No more forgotten tasks.
            </p>
            <div className="bg-slate-900 rounded-2xl p-6 mb-8 text-sm">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Example Daily Log Entry</p>
              <div className="space-y-2">
                {[
                  { client: "Acme Corp", task: "Published 2 cluster articles targeting 'accounting software for freelancers'" },
                  { client: "TechStart Ltd", task: "Fixed 14 crawl errors identified in Screaming Frog audit, submitted updated sitemap" },
                  { client: "Wellness Brand", task: "Built 3 backlinks from health & wellness directories, DA 35+" },
                ].map(({ client, task }) => (
                  <div key={client} className="flex gap-3 items-start">
                    <span className="text-blue-400 font-bold shrink-0 text-xs pt-0.5">{client}</span>
                    <span className="text-slate-400 text-xs leading-relaxed">{task}</span>
                  </div>
                ))}
              </div>
            </div>

            <h2 id="onboarding" className="text-2xl font-black text-slate-900 mb-4 mt-10">Client Onboarding Checklist for SEO Agencies</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Inconsistent onboarding leads to missed opportunities, forgotten access credentials, and confused clients who don't know what to expect. A standardized onboarding checklist fixes this.
            </p>
            <div className="space-y-2 mb-8">
              {[
                "Add client to CRM with website, contact info, and branding details",
                "Run initial Screaming Frog crawl and save baseline audit results",
                "Record baseline metrics: traffic, DA, backlinks, top 10 keywords",
                "Set up client portal with branded link",
                "Send welcome email with portal link and reporting schedule",
                "Add client to bulk report schedule",
                "Schedule 30-day check-in call",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <CheckCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <h2 id="crm" className="text-2xl font-black text-slate-900 mb-4 mt-10">Using CRM Features to Track Proposal Conversions</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Your proposal pipeline is as important as your delivery pipeline. At scale, you need to track which prospects received a proposal, when they received it, what your follow-up schedule is, and what the outcome was.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              The simplest CRM approach that works for growing agencies: track every proposal with status (Sent, Followed Up, Won, Lost), deal value, and close date. Review this weekly. Your proposal-to-close ratio tells you exactly where your sales process is breaking down.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8">
              <div className="flex items-start gap-3">
                <Zap size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed">
                  <strong>Scale insight:</strong> Agencies that track proposal conversion rates grow 2x faster than those that don't. If you're sending 10 proposals/month and closing 2, your problem is the proposal. If you're sending 2 proposals/month, your problem is lead generation. You can't fix what you don't measure.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8 mt-10">
              <h3 className="font-bold text-slate-800 mb-4">Related Guides</h3>
              <div className="space-y-2">
                {[
                  { href: "/blog/automated-seo-reporting", label: "Automated SEO Reporting" },
                  { href: "/blog/white-label-seo-reports", label: "White Label SEO Reports" },
                  { href: "/blog/client-seo-dashboards", label: "Client SEO Dashboards" },
                  { href: "/blog/seo-audit-competitor-reporting", label: "SEO Audit & Competitor Reporting" },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium group">
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">In This Guide</p>
                <ul className="space-y-2.5">
                  {clusters.map(({ title, href }) => (
                    <li key={href}>
                      <a href={href} className="flex items-start gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors leading-snug">
                        <ChevronRight size={14} className="shrink-0 mt-0.5 text-slate-400" />
                        {title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Built for Scale</h3>
                <p className="text-amber-100 text-sm mb-5 leading-relaxed">Bulk reports, auto-scheduling, team work logs, and client portals — everything you need to manage 50+ clients without chaos.</p>
                <Link href="/signup" className="block text-center bg-white text-amber-700 font-bold py-3 rounded-xl hover:bg-amber-50 transition-colors text-sm">
                  Start Free Trial →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
