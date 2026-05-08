import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <ClipboardCheck size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">SEO Report Manager</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Features</Link>
            <Link href="/blog" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Blog</Link>
            <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Pricing</Link>
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Sign In</Link>
          </div>
          <Link href="/signup" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
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
                  { href: "/dashboard/tools", label: "SEO Tools" },
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
                  { href: "/blog/scaling-seo-agency", label: "Scale Your Agency" },
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
