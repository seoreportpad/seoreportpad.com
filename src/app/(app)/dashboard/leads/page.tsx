"use client";
import { useEffect, useState } from "react";
import { 
  Zap, Mail, Globe, Trash2, ExternalLink, 
  Search, Filter, Calendar, MessageCircle, 
  BarChart3, Shield, CheckCircle2, ChevronRight,
  TrendingUp, Activity, Sparkles, Loader2, FileText
} from "lucide-react";
import Link from "next/link";

interface Lead {
  id: string;
  email: string;
  name: string;
  website: string;
  created_at: string;
  audit_data?: {
    performance: number;
    seo: number;
    accessibility: number;
    best_practices: number;
    vitals?: {
      lcp: string;
      cls: string;
      tbt: string;
      speed_index: string;
    };
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState<string | null>(null);
  const [proposalLoading, setProposalLoading] = useState<string | null>(null);

  const generateAIProposal = async (lead: Lead) => {
    setProposalLoading(lead.id);
    try {
      const res = await fetch("/api/leads/ai-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert(data.error || "Failed to generate proposal");
      }
    } finally {
      setProposalLoading(null);
    }
  };

  const sendAIFollowUp = async (lead: Lead) => {
    setFollowUpLoading(lead.id);
    try {
      const res = await fetch("/api/leads/ai-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (data.success) {
        alert("AI Follow-up email sent successfully!");
      } else {
        alert(data.error || "Failed to send AI follow-up");
      }
    } finally {
      setFollowUpLoading(null);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (!data.error) setLeads(data);
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    const res = await fetch("/api/leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setLeads(leads.filter(l => l.id !== id));
  };

  const filtered = leads.filter(l => 
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.website?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Leads & Audits</h1>
          <p className="text-slate-500 text-sm mt-1">People who used your free audit tool on the landing page</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input 
            placeholder="Search leads..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm focus:outline-none bg-transparent w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{leads.length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Leads</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">
              {leads.filter(l => l.audit_data).length}
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audits Ran</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">
              {leads.filter(l => {
                const date = new Date(l.created_at);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">This Month</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Lead Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Audit Scores</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Core Vitals</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading leads...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No leads found.</td></tr>
              ) : filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold shrink-0">
                        {l.name[0] || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{l.name || "Anonymous"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-500 truncate">{l.email}</p>
                          <span className="text-slate-300">·</span>
                          <p className="text-[10px] text-slate-400">{new Date(l.created_at).toLocaleDateString()}</p>
                        </div>
                        <a href={l.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline mt-1 font-medium">
                          <Globe size={10} /> {l.website?.replace(/^https?:\/\/(www\.)?/, "")}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {l.audit_data ? (
                      <div className="flex gap-2">
                        {[
                          { val: l.audit_data.performance, label: "Perf", color: "text-blue-600", bg: "bg-blue-50" },
                          { val: l.audit_data.seo, label: "SEO", color: "text-emerald-600", bg: "bg-emerald-50" },
                        ].map(s => (
                          <div key={s.label} className={`${s.bg} border border-white rounded-lg px-2 py-1 text-center min-w-[50px] shadow-sm`}>
                            <p className={`text-sm font-black ${s.color}`}>{s.val}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{s.label}</p>
                          </div>
                        ))}
                        <div className="hidden md:flex gap-2">
                          {[
                            { val: l.audit_data.accessibility, label: "Acc", color: "text-violet-600", bg: "bg-violet-50" },
                            { val: l.audit_data.best_practices, label: "Best", color: "text-amber-600", bg: "bg-amber-50" },
                          ].map(s => (
                            <div key={s.label} className={`${s.bg} border border-white rounded-lg px-2 py-1 text-center min-w-[50px] shadow-sm`}>
                              <p className={`text-sm font-black ${s.color}`}>{s.val}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">No audit data</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {l.audit_data?.vitals ? (
                      <div className="flex justify-center gap-4">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-700">{l.audit_data.vitals.lcp}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">LCP</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-700">{l.audit_data.vitals.cls}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">CLS</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">—</div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => generateAIProposal(l)}
                        disabled={proposalLoading === l.id}
                        title="AI Proposal" 
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {proposalLoading === l.id ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                      </button>
                      <button 
                        onClick={() => sendAIFollowUp(l)}
                        disabled={followUpLoading === l.id}
                        title="AI Follow-up" 
                        className="p-2 text-violet-600 hover:bg-violet-50 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {followUpLoading === l.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      </button>
                      <a href={`mailto:${l.email}`} title="Email Lead" className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        <Mail size={16} />
                      </a>
                      <button onClick={() => deleteLead(l.id)} title="Delete" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <Link href={`/dashboard/clients/new?name=${encodeURIComponent(l.name || "Anonymous")}&email=${encodeURIComponent(l.email)}&website=${encodeURIComponent(l.website)}`} 
                        className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all ml-2"
                      >
                        Convert <ChevronRight size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
