"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LayoutDashboard, Users, BarChart3, LogOut, Settings } from "lucide-react";

const nav = [
  { href: "/admin/dashboard", label: "Users", icon: Users },
  { href: "/admin/stats", label: "Stats", icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show sidebar on login page
  if (pathname === "/admin/login") return null;

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-white leading-tight">Admin Panel</p>
            <p className="text-xs text-slate-500">SEO Report Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "bg-red-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}>
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5">
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all w-full">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
