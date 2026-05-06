"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, X, ExternalLink } from "lucide-react";

export default function SetupBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if Supabase is configured by hitting a lightweight endpoint
    fetch("/api/clients")
      .then(r => r.json())
      .then(d => {
        // If it's an array (even empty), Supabase is working
        if (Array.isArray(d)) setShow(false);
        else setShow(true);
      })
      .catch(() => setShow(true));
  }, []);

  if (!show) return null;

  return (
    <div className="mx-8 mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
      <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-semibold text-amber-800">Supabase not connected yet</p>
        <p className="text-amber-700 mt-0.5">
          Add your keys to <code className="bg-amber-100 px-1 rounded">.env.local</code> to save data.{" "}
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
            Get free Supabase account <ExternalLink size={11} />
          </a>
        </p>
        <p className="text-amber-600 text-xs mt-1 font-mono">
          NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co<br />
          NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
        </p>
      </div>
      <button onClick={() => setShow(false)} className="text-amber-400 hover:text-amber-600 shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}
