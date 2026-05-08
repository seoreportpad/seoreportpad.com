import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, ChevronRight, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Client SEO Dashboards: Replace PDFs with Interactive Portals | SEO Report Manager",
  description: "Learn how to build interactive client SEO dashboards that communicate value clearly, reduce churn, and turn confused clients into loyal long-term retainers. No more PDF attachments.",
};

const clusters = [
  { title: "Why PDFs Are Dead: The Rise of Client Dashboards", href: "#pdfs-dead" },
  { title: "Key SEO Metrics Clients Actually Care About", href: "#key-metrics" },
  { title: "How to Explain Technical SEO to Non-Technical Clients", href: "#explain-technical" },
  { title: "Building a Transparent SEO Workflow", href: "#transparent-workflow" },
  { title: "Handling Client Questions About Dropping Rankings", href: "#dropping-rankings" },
];

export default function ClientSEODashboardsPage() {
  return (
    <article>
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
            <ChevronRight size={14} className="rotate-180" /> Back to Blog
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1.5 rounded-full border border-teal-500/30">Pillar Guide</span>
            <span className="text-slate-400 text-sm flex items-center gap-1.5"><Clock size={13} /> 11 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
            Client SEO Dashboards:<br />
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Replace PDFs With Living Reports
            </span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
            PDFs are dead. Learn how to build interactive client dashboards that communicate SEO value clearly, reduce churn, and turn confused clients into loyal retainers.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">

            <h2 id="pdfs-dead" className="text-2xl font-black text-slate-900 mb-4">Why PDFs Are Dead: The Rise of Interactive Client Dashboards</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              A PDF is a dead document. The moment you export it, the data is frozen. Clients can't drill down, can't interact, and can't easily compare months. Worse, PDFs go to inboxes — where they get buried, forgotten, or worse, forwarded to the wrong person.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              Modern client dashboards are living documents. A shareable URL the client bookmarks. A portal where month 1, month 3, and month 12 are all accessible. Charts they can see at a glance, with a narrative that explains what the numbers mean.
            </p>

            <h2 id="key-metrics" className="text-2xl font-black text-slate-900 mb-4 mt-10">Key SEO Metrics Clients Actually Care About</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Here's a hard truth: most clients do not care about Domain Authority, crawl errors, or canonical tags. They care about three things: more website visitors, more calls/enquiries, and ranking higher than their competitors.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">Translate your technical work into these business metrics:</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { metric: "Organic Traffic", why: "Proxy for 'are more people finding us?'" },
                { metric: "Keyword Rankings", why: "Visible proof they're climbing above competitors" },
                { metric: "Conversions / Leads", why: "Direct business impact they understand" },
                { metric: "Clicks from Google", why: "Simple Search Console metric — very intuitive" },
                { metric: "Domain Authority Trend", why: "Long-term trust signal — great for showing growth over 6+ months" },
                { metric: "Technical Issues Fixed", why: "Proof of work — shows what your team actually did" },
              ].map(({ metric, why }) => (
                <div key={metric} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
                    <TrendingUp size={13} className="text-teal-600" /> {metric}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">{why}</p>
                </div>
              ))}
            </div>

            <h2 id="explain-technical" className="text-2xl font-black text-slate-900 mb-4 mt-10">How to Explain Technical SEO to Non-Technical Clients</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              "We fixed 23 crawl errors and improved your Core Web Vitals LCP score from 4.2s to 2.1s." This means nothing to your client. Here's how to translate it:
            </p>
            <div className="space-y-3 mb-8">
              {[
                { technical: "Fixed 23 crawl errors", simple: "We removed 23 broken pages that were confusing Google and wasting your crawl budget." },
                { technical: "Improved LCP from 4.2s to 2.1s", simple: "Your homepage now loads twice as fast — Google rewards fast pages with higher rankings." },
                { technical: "Added schema markup to 8 pages", simple: "We added special code so Google can display your business info directly in search results (rich snippets)." },
                { technical: "Fixed canonical tags on 34 pages", simple: "We told Google which version of each page is the 'official' one, so it doesn't get confused and split your ranking power." },
              ].map(({ technical, simple }) => (
                <div key={technical} className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-red-500 mb-1">❌ Don't say: "{technical}"</p>
                  <p className="text-xs font-bold text-green-600">✅ Say: "{simple}"</p>
                </div>
              ))}
            </div>

            <h2 id="transparent-workflow" className="text-2xl font-black text-slate-900 mb-4 mt-10">Building a Transparent SEO Workflow with Client Portals</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Transparency is the ultimate retention tool. When clients can see exactly what you're doing, when you're doing it, and what impact it's having — they don't question the retainer. They renew it.
            </p>
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-slate-800 mb-3">Transparency Framework</h3>
              <ul className="space-y-2.5">
                {[
                  "Monthly report with metrics, work log, and next month's plan",
                  "Shareable client portal link (no password needed)",
                  "Work log section listing every task completed that month",
                  "Clear 'next steps' section in every report",
                  "Historical report archive so clients see the long-term journey",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle size={15} className="text-teal-600 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <h2 id="dropping-rankings" className="text-2xl font-black text-slate-900 mb-4 mt-10">Handling Client Questions About Dropping Rankings</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Every SEO agency faces this: a client calls panicked because one keyword dropped 5 positions. How you respond to this determines whether you keep the client or lose them.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              The key is context. A drop from #3 to #7 on one keyword is not a crisis — especially if 12 other keywords improved. Your reporting dashboard should make this context immediately visible. Show the full keyword portfolio trend, not just the one keyword the client noticed.
            </p>

            <div className="border-t border-slate-100 pt-8 mt-10">
              <h3 className="font-bold text-slate-800 mb-4">Related Guides</h3>
              <div className="space-y-2">
                {[
                  { href: "/blog/automated-seo-reporting", label: "Automated SEO Reporting" },
                  { href: "/blog/white-label-seo-reports", label: "White Label SEO Reports" },
                  { href: "/blog/scaling-seo-agency", label: "Scaling Your SEO Agency" },
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
              <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Build Your Client Portal</h3>
                <p className="text-teal-100 text-sm mb-5 leading-relaxed">Every report gets a branded, shareable portal link. Clients bookmark it. They visit it. They stay.</p>
                <Link href="/signup" className="block text-center bg-white text-teal-700 font-bold py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm">
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
