"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

export default function AdminSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", secret: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setDone(true);
    } else {
      setError(data.error ?? "Signup failed");
    }
  };

  if (done) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Admin account created!</h2>
        <p className="text-slate-400 text-sm mb-6">You can now sign in with your credentials.</p>
        <Link href="/admin/login"
          className="inline-block bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors">
          Go to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/40">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Create Admin Account</h1>
          <p className="text-slate-500 text-sm mt-1">Requires admin signup secret</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          {error && (
            <div className="bg-red-900/30 border border-red-800/50 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Full Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Muhammad Ismail"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="admin@seoreportpad.com"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Admin Signup Secret</label>
              <input type="password" required value={form.secret} onChange={e => setForm({ ...form, secret: e.target.value })}
                placeholder="Secret key from server env"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              <p className="text-xs text-slate-600 mt-1">Set ADMIN_SIGNUP_SECRET in Vercel env vars</p>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : "Create Admin Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-5">
            Already have an account?{" "}
            <Link href="/admin/login" className="text-red-400 hover:text-red-300 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
