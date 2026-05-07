"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setError(data.error ?? "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/40">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">SEO Report Manager</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          {error && (
            <div className="bg-red-900/30 border border-red-800/50 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Admin Email</label>
              <input type="email" required autoComplete="username"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="admin@seoreportpad.com"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} required autoComplete="current-password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : "Sign In to Admin"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600 mt-5">
          No admin account?{" "}
          <Link href="/admin/signup" className="text-red-400 hover:text-red-300 font-semibold">Create one</Link>
        </p>
        <p className="text-center text-xs text-slate-700 mt-3">
          Restricted access · Unauthorized use is prohibited
        </p>
      </div>
    </div>
  );
}
