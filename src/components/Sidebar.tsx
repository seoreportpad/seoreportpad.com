"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  StickyNote,
  BookOpen,
  Settings,
  ClipboardCheck,
  ChevronRight,
  X,
  Menu,
  CalendarDays,
  TrendingUp,
  Link2,
  Target,
  LogOut,
} from "lucide-react";

const nav = [
  { href: "/dashboard",              label: "Dashboard",   icon: LayoutDashboard },
  { href: "/dashboard/clients",      label: "Clients",     icon: Users },
  { href: "/dashboard/reports",      label: "Reports",     icon: FileText },
  { href: "/dashboard/daily-log",    label: "Daily Log",   icon: CalendarDays },
  { href: "/dashboard/keywords",     label: "Keywords",    icon: TrendingUp },
  { href: "/dashboard/backlinks",    label: "Backlinks",   icon: Link2 },
  { href: "/dashboard/competitors",  label: "Competitors", icon: Target },
  { href: "/dashboard/audit",        label: "SEO Audit",   icon: ClipboardCheck },
  { href: "/dashboard/notes",        label: "SEO Notes",   icon: StickyNote },
  { href: "/dashboard/prompts",      label: "Templates",   icon: BookOpen },
  { href: "/dashboard/settings",     label: "Settings",    icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 h-full bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <ClipboardCheck size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">SEO Report Manager</h1>
            <p className="text-xs text-slate-400 mt-0.5">Professional SEO Reports</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden ml-2">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Badge */}
      <div className="mx-3 mb-3 bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/40">
        <p className="text-xs font-semibold text-slate-300 mb-1">Screaming Frog</p>
        <p className="text-xs text-slate-500">24 categories · 180+ checks</p>
        <div className="flex gap-1.5 mt-2">
          <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full">Issues</span>
          <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full">Warnings</span>
          <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">Opps</span>
        </div>
      </div>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
            MI
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-200 truncate">Muhammad Ismail</p>
            <p className="text-xs text-slate-500">SEO Specialist</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0 h-screen">
        <SidebarContent />
      </div>

      {/* Mobile: hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 flex">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
