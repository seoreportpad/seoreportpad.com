"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle, ClipboardCheck, ArrowRight, Zap, X, HelpCircle, Star } from "lucide-react";

type FeatureRow = { label: string; free: string | boolean; pro: string | boolean; tip?: string };

const featureGroups: { group: string; rows: FeatureRow[] }[] = [
  {
    group: "Clients & Reports",
    rows: [
      { label: "Clients",            free: "Up to 3",    pro: "Unlimited" },
      { label: "Monthly reports",    free: true,         pro: true },
      { label: "Bulk report generation", free: false,   pro: true },
      { label: "Auto-schedule reports",  free: false,   pro: true },
      { label: "Client portal links", free: false,      pro: true, tip: "Shareable link for each report — no login needed" },
    ],
  },
  {
    group: "Report Content",
    rows: [
      { label: "On-Page SEO tab",        free: true,     pro: true },
      { label: "Local SEO tab",          free: true,     pro: true },
      { label: "Schema / Technical tab", free: true,     pro: true },
      { label: "SEO Score Summary",      free: true,     pro: true },
      { label: "Before/After comparison", free: false,   pro: true },
      { label: "Task completion summary", free: true,    pro: true },
      { label: "Screenshot embedding",   free: false,    pro: true },
      { label: "Keyword movement cards", free: false,    pro: true },
    ],
  },
  {
    group: "Export & Delivery",
    rows: [
      { label: "PDF export",             free: true,     pro: true },
      { label: "Excel (XLSX) export",    free: false,    pro: true, tip: "5-sheet workbook: overview, keywords, backlinks, audit, tasks" },
      { label: "CSV export",             free: true,     pro: true },
      { label: "Email reports to clients", free: false,  pro: true },
      { label: "White-label branding",   free: false,    pro: true },
      { label: "Custom logo & color",    free: false,    pro: true },
      { label: "Report templates",       free: "1",      pro: "Full / Executive / Minimal" },
    ],
  },
  {
    group: "SEO Tracking",
    rows: [
      { label: "Keyword tracking",       free: true,     pro: true },
      { label: "Backlinks tracker",      free: false,    pro: true },
      { label: "Competitor tracking",    free: false,    pro: true },
      { label: "Daily work log",         free: false,    pro: true },
      { label: "Rank history",           free: false,    pro: true },
    ],
  },
  {
    group: "Audit & Tools",
    rows: [
      { label: "Screaming Frog audit checklist", free: true, pro: true },
      { label: "180+ audit checks",     free: true,      pro: true },
      { label: "SEO Tools (8 tools)",   free: true,      pro: true },
      { label: "Templates & Notes",     free: true,      pro: true },
      { label: "Proposals builder",     free: false,     pro: true },
    ],
  },
  {
    group: "Support",
    rows: [
      { label: "Community support",     free: true,      pro: true },
      { label: "Priority support",      free: false,     pro: true },
      { label: "Paid APIs required",    free: false,     pro: false },
    ],
  },
];

function FeatureCell({ val }: { val: string | boolean }) {
  if (val === true)  return <CheckCircle size={17} className="text-green-500 mx-auto" />;
  if (val === false) return <X size={15} className="text-slate-300 mx-auto" />;
  return <span className="text-xs font-medium text-slate-600">{val}</span>;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [tip, setTip] = useState<string | null>(null);

  const price   = billing === "monthly" ? 29 : 19;
  const priceId = billing === "monthly"
    ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
    : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

  const handleCheckout = async () => {
    const res  = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url)                           window.location.href = data.url;
    else if (data.error === "Unauthorized")  window.location.href = "/signup";
    else                                     alert("Error: " + data.error);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 px-6 h-16 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ClipboardCheck size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-800">SEO Report Manager</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login"  className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Sign in</Link>
          <Link href="/signup" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Start Free Trial
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
            <Zap size={12} /> Simple, transparent pricing
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-4">Plans & Pricing</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Start free for 14 days. No credit card required.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full p-1 mt-8">
            <button onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${billing === "monthly" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Monthly
            </button>
            <button onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${billing === "yearly" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Yearly <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">Save 35%</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-20">
          {/* Free */}
          <div className="border border-slate-200 rounded-3xl p-8 bg-white">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Free Trial</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-5xl font-black text-slate-900">$0</span>
            </div>
            <p className="text-slate-400 text-sm mb-6">14 days full access, then limited free plan</p>
            <Link href="/signup"
              className="block text-center bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-bold text-sm transition-all mb-6">
              Start Free Trial
            </Link>
            <ul className="space-y-2.5">
              {["Up to 3 clients", "Monthly SEO reports", "Screaming Frog audit checklist", "8 built-in SEO tools", "PDF & CSV export", "14-day trial of all Pro features"].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <CheckCircle size={15} className="text-slate-400 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-bold text-blue-200 uppercase tracking-wide">Pro</p>
                <span className="bg-yellow-400/20 text-yellow-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-yellow-400/30 flex items-center gap-1">
                  <Star size={10} className="fill-yellow-300" /> POPULAR
                </span>
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-black text-white">${price}</span>
                <span className="text-blue-200 mb-2">/ mo</span>
              </div>
              <p className="text-blue-200 text-sm mb-6">{billing === "yearly" ? "Billed $228/year — save $120" : "Billed monthly · cancel anytime"}</p>
              <button onClick={handleCheckout}
                className="w-full bg-white text-blue-700 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2 mb-6 shadow-lg">
                <ArrowRight size={16} /> Get Pro Now
              </button>
              <ul className="space-y-2.5">
                {["Unlimited clients & reports", "White-label branding + logo", "Email reports to clients", "Excel (XLSX) 5-sheet export", "Bulk & auto-scheduled reports", "Client portal links", "Backlinks & competitor tracking", "Before/After comparison", "Priority support"].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-blue-100">
                    <CheckCircle size={15} className="text-blue-300 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="mb-20">
          <h2 className="text-2xl font-black text-slate-900 text-center mb-8">Full Feature Comparison</h2>
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_100px] bg-slate-50 border-b border-slate-200">
              <div className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Feature</div>
              <div className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide text-center">Free</div>
              <div className="px-3 py-4 text-xs font-bold text-blue-600 uppercase tracking-wide text-center">Pro</div>
            </div>

            {featureGroups.map(({ group, rows }) => (
              <div key={group}>
                <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{group}</p>
                </div>
                {rows.map(({ label, free, pro, tip: rowTip }) => (
                  <div key={label} className="grid grid-cols-[1fr_100px_100px] border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <div className="px-5 py-3.5 flex items-center gap-2">
                      <span className="text-sm text-slate-700">{label}</span>
                      {rowTip && (
                        <button
                          onMouseEnter={() => setTip(rowTip)}
                          onMouseLeave={() => setTip(null)}
                          className="relative text-slate-300 hover:text-slate-500 transition-colors"
                        >
                          <HelpCircle size={13} />
                          {tip === rowTip && (
                            <div className="absolute left-5 top-0 z-10 w-52 bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl leading-relaxed">
                              {rowTip}
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="px-3 py-3.5 flex items-center justify-center">
                      <FeatureCell val={free} />
                    </div>
                    <div className="px-3 py-3.5 flex items-center justify-center bg-blue-50/30">
                      <FeatureCell val={pro} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-16 text-sm text-slate-500">
          {["14-day free trial", "No credit card required", "Cancel anytime", "No paid APIs ever"].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-green-500" />
              {t}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="text-center border-t border-slate-100 pt-10">
          <p className="text-slate-400 text-sm">
            Questions?{" "}
            <a href="mailto:support@seoreportpad.com" className="text-blue-600 hover:text-blue-500 font-semibold">
              support@seoreportpad.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
