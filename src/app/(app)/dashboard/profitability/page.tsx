"use client";
import { useEffect, useState } from "react";
import { 
  TrendingUp, Users, Clock, DollarSign, 
  BarChart3, ArrowUpRight, ArrowDownRight,
  Target, Zap, Activity, Filter, Calendar,
  Download, Loader2
} from "lucide-react";

interface ProfitStats {
  clientId: string;
  clientName: string;
  retainer: number;
  totalHours: number;
  hourlyRate: number;
  efficiency: number; // 0-100
  tasksCompleted: number;
}

export default function ProfitabilityPage() {
  const [stats, setStats] = useState<ProfitStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [filterMonth, filterYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientsRes, logsRes] = await Promise.all([
        fetch("/api/clients"),
        fetch(`/api/work-logs?month=${filterMonth}&year=${filterYear}`)
      ]);

      const clients = await clientsRes.json();
      const logs = await logsRes.json();

      const calculatedStats = clients.map((client: any) => {
        const clientLogs = logs.filter((l: any) => l.client_id === client.id);
        const totalHours = clientLogs.reduce((acc: number, l: any) => acc + (l.time_spent || 0), 0);
        const retainer = Number(client.monthly_retainer) || 0;
        const hourlyRate = totalHours > 0 ? retainer / totalHours : 0;
        
        // Efficiency metric: Target is 50/hr. If hourlyRate > 50, efficiency > 100%
        const efficiency = Math.min(100, (hourlyRate / 100) * 100); 

        return {
          clientId: client.id,
          clientName: client.name,
          retainer,
          totalHours,
          hourlyRate,
          efficiency,
          tasksCompleted: clientLogs.filter((l: any) => l.status === "done").length
        };
      });

      setStats(calculatedStats.sort((a: any, b: any) => b.hourlyRate - a.hourlyRate));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = stats.reduce((acc, s) => acc + s.retainer, 0);
  const totalHours = stats.reduce((acc, s) => acc + s.totalHours, 0);
  const avgHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Agency Profitability</h1>
          <p className="text-slate-500 text-sm mt-1">Analyze ROI and hourly value across your client portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none"
          >
            {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -translate-y-16 translate-x-16" />
          <DollarSign className="text-blue-400 mb-4" size={24} />
          <p className="text-3xl font-black">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly Revenue</p>
          <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded-full border border-emerald-400/20">
            <ArrowUpRight size={10} /> +12% from last month
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <Clock className="text-violet-600 mb-4" size={24} />
          <p className="text-3xl font-black text-slate-800">{totalHours.toFixed(1)}h</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Billable Hours</p>
          <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded-full border border-slate-200">
            Avg. { (totalHours / (stats.length || 1)).toFixed(1) }h / client
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <TrendingUp className="text-emerald-600 mb-4" size={24} />
          <p className="text-3xl font-black text-slate-800">${avgHourlyRate.toFixed(2)}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Avg. Hourly Value</p>
          <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-full border border-blue-100">
            Target: $100.00/hr
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Retainer</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Hours</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Hourly Value</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profitability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 animate-pulse">Analyzing profitability...</td></tr>
              ) : stats.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No data found for this period.</td></tr>
              ) : stats.map(s => (
                <tr key={s.clientId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-800">{s.clientName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{s.tasksCompleted} tasks completed</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-black text-slate-700">${s.retainer.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600">
                      <Clock size={12} /> {s.totalHours.toFixed(1)}h
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-sm font-black ${s.hourlyRate >= 100 ? "text-emerald-600" : s.hourlyRate >= 50 ? "text-blue-600" : "text-amber-600"}`}>
                      ${s.hourlyRate.toFixed(2)}/hr
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${s.hourlyRate >= 100 ? "bg-emerald-500" : s.hourlyRate >= 50 ? "bg-blue-500" : "bg-amber-500"}`} 
                          style={{ width: `${Math.min(100, (s.hourlyRate / 150) * 100)}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{Math.round((s.hourlyRate / 150) * 100)}%</span>
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
