"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

export function CopyBtn({ text, small }: { text: string; small?: boolean }) {
  const { copied, copy } = useCopy();
  return (
    <button onClick={() => copy(text)}
      className={`flex items-center gap-1.5 font-semibold transition-colors ${small ? "text-xs text-slate-400 hover:text-slate-700" : "text-sm text-blue-600 hover:text-blue-800"}`}>
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function CodeBox({ code, lang = "" }: { code: string; lang?: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-inner">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">{lang}</span>
        <button onClick={() => copy(code)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm text-green-300 font-mono whitespace-pre-wrap break-all overflow-x-auto max-h-72">{code}</pre>
    </div>
  );
}
