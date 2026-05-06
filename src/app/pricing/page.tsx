"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle, ClipboardCheck, ArrowRight, Zap } from "lucide-react";

const FREE_FEATURES = [
  "Up to 3 clients",
  "Monthly SEO reports",
  "On-Page, Local, Schema & Technical SEO tabs",
  "Keyword tracking",
  "PDF & CSV export",
  "14-day free trial",
];

const PRO_FEATURES = [
  "Unlimited clients",
  "Unlimited reports",
  "All SEO report tabs",
  "Email reports to clients",
  "Client portal links",
  "Screenshots & backlinks tracker",
  "Daily work log",
  "Competitor tracking",
  "Rank history",
  "Priority support",
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const monthlyPrice = 29;
  const yearlyPrice = 19;
  const price = billing === "monthly" ? monthlyPrice : yearlyPrice;
  const priceId = billing === "monthly"
    ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
    : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

  const handleCheckout = async () => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else if (data.error === "Unauthorized") window.location.href = "/signup";
    else alert("Error: " + data.error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 h-16 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ClipboardCheck size={16} className="text-white" />
          </div>
          <span className="font-bold text-white">SEO Reports</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
          <Link href="/signup" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors">
            Start Free Trial
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium px-4 py-2 rounded-full mb-6">
            <Zap size={12} /> Simple, transparent pricing
          </div>
          <h1 className="text-5xl font-black mb-4">Plans & Pricing</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">Start free for 14 days. No credit card required.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 mt-8">
            <button onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${billing === "monthly" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
              Monthly
            </button>
            <button onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${billing === "yearly" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
              Yearly <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Save 35%</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">Free Trial</p>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-black">$0</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">14 days, then $0 (limited)</p>
            <Link href="/signup"
              className="block text-center bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-xl font-semibold text-sm transition-all mb-8">
              Start Free Trial
            </Link>
            <ul className="space-y-3">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle size={15} className="text-slate-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500/50 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-blue-900/50">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-blue-200 uppercase tracking-wide">Pro</p>
                <span className="bg-yellow-400/20 text-yellow-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-yellow-400/30">POPULAR</span>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black text-white">${price}</span>
                <span className="text-blue-200 mb-2">/ mo</span>
              </div>
              <p className="text-blue-200 text-sm mb-8">{billing === "yearly" ? "Billed $228/year" : "Billed monthly"}</p>
              <button onClick={handleCheckout}
                className="w-full bg-white text-blue-700 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2 mb-8 shadow-lg">
                <ArrowRight size={16} /> Get Started
              </button>
              <ul className="space-y-3">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-blue-100">
                    <CheckCircle size={15} className="text-blue-300 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 text-center">
          <p className="text-slate-400 text-sm">Questions? Email us at <a href="mailto:support@seoreportpad.com" className="text-blue-400 hover:text-blue-300">support@seoreportpad.com</a></p>
        </div>
      </div>
    </div>
  );
}
