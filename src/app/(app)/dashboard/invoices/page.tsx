"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  Plus, Trash2, X, Search, Download,
  DollarSign, CheckCircle2, Clock, AlertCircle,
  ChevronDown, ChevronUp, FileText, Printer,
  RefreshCw, CreditCard, TrendingUp, Send,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface InvoiceItem { description: string; qty: number; rate: number; }

interface Invoice {
  id: string; invoice_no: string; client: string; issue_date: string; due_date: string;
  status: "draft"|"sent"|"paid"|"overdue"|"cancelled";
  items: InvoiceItem[]; tax_pct: number; discount: number; notes: string; created_at: string;
  currency?: string; payment_method?: string; recurring?: boolean; recurring_months?: number;
}

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD — US Dollar" },
  { code: "PKR", symbol: "₨", label: "PKR — Pakistani Rupee" },
  { code: "GBP", symbol: "£", label: "GBP — British Pound" },
  { code: "EUR", symbol: "€", label: "EUR — Euro" },
  { code: "AED", symbol: "د.إ", label: "AED — UAE Dirham" },
  { code: "SAR", symbol: "﷼", label: "SAR — Saudi Riyal" },
];

const PAYMENT_METHODS = ["Bank Transfer","JazzCash","EasyPaisa","PayPal","Wise","Stripe","Cash","Cheque","Other"];

const STATUSES = [
  { value: "draft",     label: "Draft",     color: "text-slate-500 bg-slate-100 border-slate-200" },
  { value: "sent",      label: "Sent",      color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "paid",      label: "Paid",      color: "text-green-600 bg-green-50 border-green-200" },
  { value: "overdue",   label: "Overdue",   color: "text-red-600 bg-red-50 border-red-200" },
  { value: "cancelled", label: "Cancelled", color: "text-slate-400 bg-slate-50 border-slate-200" },
];

const LS_KEY = "seo_invoices_v1";
function loadInvoices(): Invoice[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function persist(d: Invoice[]) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function nextInvoiceNo(invoices: Invoice[]) {
  const nums = invoices.map(i => parseInt(i.invoice_no.replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `INV-${String(max + 1).padStart(4, "0")}`;
}

const stCfg = (v: string) => STATUSES.find(s => s.value === v) ?? STATUSES[0];
function calcSubtotal(items: InvoiceItem[]) { return items.reduce((s, i) => s + i.qty * i.rate, 0); }
function calcTotal(inv: Pick<Invoice,"items"|"discount"|"tax_pct">) {
  const sub = calcSubtotal(inv.items);
  const disc = inv.discount || 0;
  const taxable = sub - disc;
  return taxable + (taxable * (inv.tax_pct || 0)) / 100;
}
const emptyItem = (): InvoiceItem => ({ description: "", qty: 1, rate: 0 });
const emptyForm = (invoices: Invoice[], today = ""): Omit<Invoice, "id" | "created_at"> => ({
  invoice_no: nextInvoiceNo(invoices), client: "", issue_date: today, due_date: "",
  status: "draft", items: [emptyItem()], tax_pct: 0, discount: 0, notes: "",
  currency: "USD", payment_method: "Bank Transfer", recurring: false, recurring_months: 1,
});

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Invoice,"id"|"created_at">>(emptyForm([]));
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClient, setFilterClient] = useState("all");
  const [expandedInv, setExpandedInv] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list"|"chart">("list");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = loadInvoices();
    const today = new Date().toISOString().slice(0, 10);
    // Auto-mark overdue
    const now = Date.now();
    const updated = data.map(i => {
      if (i.status === "sent" && i.due_date && new Date(i.due_date).getTime() < now) {
        return { ...i, status: "overdue" as const };
      }
      return i;
    });
    setInvoices(updated);
    persist(updated);
    setForm(emptyForm(updated, today));
  }, []);

  const save = (d: Invoice[]) => { setInvoices(d); persist(d); };

  const addInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const inv: Invoice = { ...form, id: uid(), created_at: new Date().toISOString() };
    const updated = [inv, ...invoices];
    save(updated);
    setForm(emptyForm(updated));
    setShowForm(false);

    // If recurring, generate next months
    if (form.recurring && form.recurring_months && form.recurring_months > 1) {
      const extras: Invoice[] = [];
      const baseDate = new Date(form.issue_date || new Date());
      const baseDue = form.due_date ? new Date(form.due_date) : null;
      let currentInvs = [...updated];
      for (let m = 1; m < form.recurring_months; m++) {
        const issueDate = new Date(baseDate);
        issueDate.setMonth(issueDate.getMonth() + m);
        const dueDate = baseDue ? new Date(baseDue) : null;
        if (dueDate) dueDate.setMonth(dueDate.getMonth() + m);
        const recInv: Invoice = {
          ...form,
          id: uid(),
          created_at: new Date().toISOString(),
          invoice_no: nextInvoiceNo([...currentInvs, ...extras]),
          issue_date: issueDate.toISOString().slice(0,10),
          due_date: dueDate ? dueDate.toISOString().slice(0,10) : "",
          status: "draft",
        };
        extras.push(recInv);
        currentInvs = [...currentInvs, recInv];
      }
      if (extras.length > 0) {
        const withExtras = [...updated, ...extras];
        save(withExtras);
      }
    }
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    save(invoices.map(i => i.id === id ? { ...i, ...data } : i));
  };

  const deleteInvoice = (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    save(invoices.filter(i => i.id !== id));
  };

  const setItem = (idx: number, field: keyof InvoiceItem, val: string | number) => {
    setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }));
  };
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const allClients = useMemo(() => [...new Set(invoices.map(i => i.client).filter(Boolean))], [invoices]);

  const filtered = useMemo(() => invoices.filter(i => {
    const q = search.toLowerCase();
    return (!q || i.client.toLowerCase().includes(q) || i.invoice_no.toLowerCase().includes(q))
      && (filterStatus === "all" || i.status === filterStatus)
      && (filterClient === "all" || i.client === filterClient);
  }), [invoices, search, filterStatus, filterClient]);

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + calcTotal(i), 0);
  const totalPending = invoices.filter(i => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + calcTotal(i), 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;
  const overdueItems = invoices.filter(i => i.status === "overdue");

  // Revenue per month chart
  const revenueChart = useMemo(() => {
    const map = new Map<string,number>();
    for (const inv of invoices) {
      if (inv.status === "paid" && inv.issue_date) {
        const key = inv.issue_date.slice(0,7);
        map.set(key, (map.get(key)??0) + calcTotal(inv));
      }
    }
    return Array.from(map.entries()).sort(([a],[b])=>a.localeCompare(b)).slice(-8).map(([k,v])=>({ month:k, revenue:Math.round(v) }));
  }, [invoices]);

  const getCurrencySymbol = (code?: string) => CURRENCIES.find(c => c.code === code)?.symbol ?? "$";
  const fmt = (n: number, currency?: string) => {
    const sym = getCurrencySymbol(currency);
    return `${sym}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const fmtShort = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const exportCSV = () => {
    const rows = [["Invoice #","Client","Issue Date","Due Date","Status","Currency","Payment Method","Subtotal","Discount","Tax %","Total"]];
    for (const i of filtered) rows.push([
      i.invoice_no, i.client, i.issue_date, i.due_date, i.status, i.currency||"USD", i.payment_method||"",
      fmtShort(calcSubtotal(i.items)), fmtShort(i.discount), String(i.tax_pct), fmtShort(calcTotal(i)),
    ]);
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = "invoices.csv"; a.click();
  };

  const printInvoice = (inv: Invoice) => {
    const sym = getCurrencySymbol(inv.currency);
    const total = calcTotal(inv);
    const sub = calcSubtotal(inv.items);
    const html = `
      <html><head><title>${inv.invoice_no}</title>
      <style>body{font-family:sans-serif;padding:40px;max-width:700px;margin:auto}h1{font-size:28px;margin:0}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#f8fafc;padding:10px;text-align:left;font-size:12px;text-transform:uppercase;color:#64748b}td{padding:10px;border-bottom:1px solid #f1f5f9;font-size:14px}.total{font-size:20px;font-weight:900;color:#0f172a}.badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:#dcfce7;color:#16a34a}</style>
      </head><body>
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:40px">
        <div><h1>${inv.invoice_no}</h1><p style="color:#64748b;margin:4px 0">${inv.client}</p></div>
        <span class="badge">${inv.status.toUpperCase()}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px">
        <div><p style="color:#64748b;font-size:12px;margin:0">ISSUE DATE</p><p style="margin:4px 0;font-weight:600">${inv.issue_date}</p></div>
        <div><p style="color:#64748b;font-size:12px;margin:0">DUE DATE</p><p style="margin:4px 0;font-weight:600">${inv.due_date||"—"}</p></div>
        ${inv.payment_method?`<div><p style="color:#64748b;font-size:12px;margin:0">PAYMENT METHOD</p><p style="margin:4px 0;font-weight:600">${inv.payment_method}</p></div>`:""}
        ${inv.currency?`<div><p style="color:#64748b;font-size:12px;margin:0">CURRENCY</p><p style="margin:4px 0;font-weight:600">${inv.currency}</p></div>`:""}
      </div>
      <table><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>${inv.items.map(it=>`<tr><td>${it.description||"—"}</td><td>${it.qty}</td><td>${sym}${fmtShort(it.rate)}</td><td>${sym}${fmtShort(it.qty*it.rate)}</td></tr>`).join("")}</tbody>
      </table>
      <div style="text-align:right;margin-top:10px">
        <p>Subtotal: ${sym}${fmtShort(sub)}</p>
        ${inv.discount>0?`<p>Discount: -${sym}${fmtShort(inv.discount)}</p>`:""}
        ${inv.tax_pct>0?`<p>Tax (${inv.tax_pct}%): ${sym}${fmtShort((sub-inv.discount)*inv.tax_pct/100)}</p>`:""}
        <p class="total">Total: ${sym}${fmtShort(total)}</p>
      </div>
      ${inv.notes?`<p style="margin-top:30px;color:#64748b;font-size:13px;border-top:1px solid #f1f5f9;padding-top:20px">${inv.notes}</p>`:""}
      </body></html>`;
    const w = window.open("","_blank")!;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white";
  const labelCls = "text-xs font-semibold text-slate-600 block mb-1.5";

  const daysUntilDue = (due: string) => {
    if (!due) return null;
    return Math.ceil((new Date(due).getTime() - Date.now()) / (1000*60*60*24));
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Invoices & Billing</h1>
          <p className="text-slate-500 text-sm mt-1">Create invoices, track payments, and monitor agency revenue</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm">
            <Download size={15} /> Export
          </button>
          <button onClick={() => { setShowForm(true); setForm(emptyForm(invoices, new Date().toISOString().slice(0,10))); }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
            <Plus size={16} /> New Invoice
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total Invoices", value: invoices.length, suffix:"", color: "text-slate-700", bg: "bg-slate-50", Icon: FileText },
          { label: "Revenue Collected", value: fmt(totalRevenue), suffix:"", color: "text-green-600", bg: "bg-green-50", Icon: CheckCircle2 },
          { label: "Pending", value: fmt(totalPending), suffix:"", color: "text-amber-600", bg: "bg-amber-50", Icon: Clock },
          { label: "Overdue", value: overdueCount, suffix:"", color: "text-red-600", bg: "bg-red-50", Icon: AlertCircle },
        ].map(({ label, value, color, bg, Icon }) => (
          <div key={label} className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3`}>
            <Icon size={20} className={`${color} shrink-0 opacity-70`} />
            <div className="min-w-0">
              <p className={`text-xl font-black ${color} truncate`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue alerts */}
      {overdueItems.length > 0 && (
        <div className="mb-5 space-y-2">
          {overdueItems.slice(0,3).map(inv => {
            const days = daysUntilDue(inv.due_date);
            return (
              <div key={inv.id} className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertCircle size={14} className="text-red-500 shrink-0"/>
                <p className="text-sm text-red-800 flex-1">
                  <span className="font-semibold">{inv.invoice_no}</span> — {inv.client} —
                  <span className="font-bold ml-1">{fmt(calcTotal(inv), inv.currency)}</span>
                  {days !== null && <span className="ml-2 text-xs">({Math.abs(days)} days overdue)</span>}
                </p>
                <button onClick={() => updateInvoice(inv.id, {status:"paid"})}
                  className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-xl hover:bg-red-200 shrink-0">
                  Mark Paid
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm mb-5 w-fit">
        {(["list","chart"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${activeTab===tab?"bg-slate-800 text-white":"text-slate-500 hover:bg-slate-50"}`}>
            {tab === "chart" ? "Revenue Chart" : "Invoices"}
          </button>
        ))}
      </div>

      {/* New Invoice Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-emerald-50 to-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center gap-2"><DollarSign size={16} className="text-emerald-600" />New Invoice — {form.invoice_no}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={16} /></button>
          </div>
          <form onSubmit={addInvoice} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Invoice #</label>
                <input value={form.invoice_no} onChange={e => setForm({...form, invoice_no: e.target.value})} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Client <span className="text-red-500">*</span></label>
                <input required value={form.client} onChange={e => setForm({...form, client: e.target.value})}
                  placeholder="Client name" className={inputCls} list="client-list" />
                <datalist id="client-list">{allClients.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value as Invoice["status"]})} className={inputCls}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <select value={form.currency||"USD"} onChange={e => setForm({...form, currency: e.target.value})} className={inputCls}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Payment Method</label>
                <select value={form.payment_method||"Bank Transfer"} onChange={e => setForm({...form, payment_method: e.target.value})} className={inputCls}>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Issue Date</label>
                <input type="date" value={form.issue_date} onChange={e => setForm({...form, issue_date: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Due Date</label>
                <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className={inputCls} />
              </div>
            </div>

            {/* Recurring */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input type="checkbox" checked={!!form.recurring} onChange={e => setForm({...form, recurring: e.target.checked})} className="w-4 h-4 rounded"/>
                <span className="text-sm font-semibold text-blue-800 flex items-center gap-1.5"><RefreshCw size={14}/> Recurring Invoice</span>
              </label>
              {form.recurring && (
                <div className="flex items-center gap-3">
                  <label className="text-xs text-blue-700 font-semibold">Generate for</label>
                  <input type="number" min="2" max="24" value={form.recurring_months||1} onChange={e => setForm({...form, recurring_months: Number(e.target.value)})}
                    className="w-16 border border-blue-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-center"/>
                  <label className="text-xs text-blue-700 font-semibold">months (monthly copies in Draft)</label>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div>
              <label className={labelCls}>Line Items</label>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase px-1">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input value={item.description} onChange={e => setItem(idx,"description",e.target.value)}
                      placeholder="e.g. Monthly SEO Retainer" className="col-span-6 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                    <input type="number" min="1" value={item.qty} onChange={e => setItem(idx,"qty",Number(e.target.value))}
                      className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                    <input type="number" min="0" step="0.01" value={item.rate} onChange={e => setItem(idx,"rate",Number(e.target.value))}
                      className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                    <div className="col-span-1 text-right text-sm font-semibold text-slate-700">
                      {getCurrencySymbol(form.currency)}{fmtShort(item.qty * item.rate)}
                    </div>
                    <button type="button" onClick={() => removeItem(idx)} className="col-span-1 text-slate-300 hover:text-red-500 flex justify-center">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addItem}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold hover:underline mt-1">
                  <Plus size={12} /> Add Line Item
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Discount ({getCurrencySymbol(form.currency)})</label>
                <input type="number" min="0" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tax (%)</label>
                <input type="number" min="0" max="100" value={form.tax_pct} onChange={e => setForm({...form, tax_pct: Number(e.target.value)})} className={inputCls} />
              </div>
              <div className="flex items-end pb-2.5">
                <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-emerald-700 font-semibold mb-0.5">Total</p>
                  <p className="text-xl font-black text-emerald-700">{fmt(calcTotal({items:form.items,discount:form.discount,tax_pct:form.tax_pct}), form.currency)}</p>
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                rows={2} placeholder="Payment instructions, thank you note, terms..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700">
                Save Invoice {form.recurring && form.recurring_months && form.recurring_months > 1 ? `(+${form.recurring_months-1} recurring)` : ""}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* CHART TAB */}
      {activeTab === "chart" && (
        <div className="space-y-5">
          {revenueChart.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <TrendingUp size={36} className="mx-auto text-slate-200 mb-3"/>
              <p className="text-slate-400 font-medium">No paid invoices yet — revenue chart will appear here</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-emerald-600"/>
                <h2 className="font-bold text-slate-700">Monthly Revenue (Paid Invoices)</h2>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenueChart} margin={{top:5,right:10,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="month" tick={{fontSize:11,fill:"#94a3b8"}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fontSize:11,fill:"#94a3b8"}} tickLine={false} axisLine={false} tickFormatter={v=>v>=1000?`$${(v/1000).toFixed(0)}k`:`$${v}`}/>
                  <Tooltip contentStyle={{borderRadius:"12px",border:"1px solid #e2e8f0",fontSize:"12px"}} formatter={v=>[`$${Number(v).toLocaleString()}`,"Revenue"]}/>
                  <Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Client-wise breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-700 mb-4">Revenue by Client</h2>
            <div className="space-y-3">
              {allClients.map(client => {
                const clientTotal = invoices.filter(i => i.client === client && i.status === "paid").reduce((s,i)=>s+calcTotal(i),0);
                const maxTotal = Math.max(...allClients.map(c => invoices.filter(i=>i.client===c&&i.status==="paid").reduce((s,i)=>s+calcTotal(i),0)));
                if (clientTotal === 0) return null;
                return (
                  <div key={client} className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-slate-700 w-32 truncate shrink-0">{client}</p>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{width:`${(clientTotal/maxTotal)*100}%`}}/>
                    </div>
                    <p className="text-sm font-black text-emerald-600 shrink-0">${fmtShort(clientTotal)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LIST TAB */}
      {activeTab === "list" && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-5">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client or invoice number..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white" />
              </div>
              <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white">
                <option value="all">All Clients</option>
                {allClients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-1 flex-wrap">
                {STATUSES.map(s => (
                  <button key={s.value} onClick={() => setFilterStatus(filterStatus===s.value?"all":s.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${filterStatus===s.value?"bg-slate-800 text-white border-slate-800":`${s.color} hover:opacity-80`}`}>
                    {s.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400 ml-auto">{filtered.length} invoices</span>
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <DollarSign size={40} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-slate-600 font-bold text-lg mb-2">No invoices yet</h3>
              <p className="text-slate-400 text-sm mb-6">Create your first invoice and start tracking payments</p>
              <button onClick={() => { setShowForm(true); setForm(emptyForm(invoices, new Date().toISOString().slice(0,10))); }}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700">
                <Plus size={15} /> New Invoice
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    {["Invoice","Client","Status","Issue Date","Due Date","Method","Total","Actions"].map(h=>(
                      <th key={h} className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(inv => {
                    const st = stCfg(inv.status);
                    const total = calcTotal(inv);
                    const isExpanded = expandedInv === inv.id;
                    const days = daysUntilDue(inv.due_date);
                    const dueUrgent = days !== null && days <= 3 && inv.status !== "paid" && inv.status !== "cancelled";
                    const sym = getCurrencySymbol(inv.currency);
                    return (
                      <>
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setExpandedInv(isExpanded ? null : inv.id)}
                                className="text-slate-400 hover:text-slate-600">
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                              <div>
                                <span className="font-bold text-slate-800 text-sm">{inv.invoice_no}</span>
                                {inv.recurring && <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">Recurring</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-700">{inv.client}</td>
                          <td className="px-5 py-4">
                            <select value={inv.status}
                              onChange={e => updateInvoice(inv.id, { status: e.target.value as Invoice["status"] })}
                              className={`text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${st.color}`}>
                              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {inv.issue_date ? new Date(inv.issue_date+"T00:00:00").toLocaleDateString() : "—"}
                          </td>
                          <td className="px-5 py-4">
                            {inv.due_date ? (
                              <div>
                                <span className={`text-sm ${inv.status==="overdue"?"text-red-600 font-semibold":"text-slate-600"}`}>
                                  {new Date(inv.due_date+"T00:00:00").toLocaleDateString()}
                                </span>
                                {dueUrgent && (
                                  <span className="block text-[10px] text-red-600 font-bold">{days===0?"Due today":`${days}d left`}</span>
                                )}
                              </div>
                            ) : <span className="text-slate-300 text-sm">—</span>}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500">{inv.payment_method||"—"}</td>
                          <td className="px-5 py-4 text-right">
                            <div>
                              <span className={`text-sm font-black ${inv.status==="paid"?"text-green-600":"text-slate-800"}`}>
                                {sym}{fmtShort(total)}
                              </span>
                              {inv.currency && inv.currency !== "USD" && (
                                <span className="block text-[10px] text-slate-400">{inv.currency}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => printInvoice(inv)}
                                title="Print PDF" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                <Printer size={14}/>
                              </button>
                              <button onClick={() => deleteInvoice(inv.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${inv.id}-exp`} className="bg-slate-50/40">
                            <td colSpan={8} className="px-8 pb-5 pt-2">
                              <table className="w-full text-sm mb-3">
                                <thead>
                                  <tr className="text-xs text-slate-500 font-semibold">
                                    <th className="text-left pb-1.5">Description</th>
                                    <th className="text-center pb-1.5">Qty</th>
                                    <th className="text-right pb-1.5">Rate</th>
                                    <th className="text-right pb-1.5">Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {inv.items.map((item, idx) => (
                                    <tr key={idx} className="text-slate-700">
                                      <td className="py-1.5">{item.description || "—"}</td>
                                      <td className="py-1.5 text-center">{item.qty}</td>
                                      <td className="py-1.5 text-right">{sym}{fmtShort(item.rate)}</td>
                                      <td className="py-1.5 text-right font-semibold">{sym}{fmtShort(item.qty*item.rate)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="flex justify-between items-end border-t border-slate-100 pt-2">
                                <div className="text-xs text-slate-500 space-y-0.5">
                                  {inv.payment_method && <p>Payment: <span className="font-semibold text-slate-700">{inv.payment_method}</span></p>}
                                  {inv.currency && <p>Currency: <span className="font-semibold text-slate-700">{inv.currency}</span></p>}
                                </div>
                                <div className="text-right space-y-1 text-sm">
                                  <div className="flex gap-8 text-slate-500"><span>Subtotal</span><span>{sym}{fmtShort(calcSubtotal(inv.items))}</span></div>
                                  {inv.discount > 0 && <div className="flex gap-8 text-red-500"><span>Discount</span><span>-{sym}{fmtShort(inv.discount)}</span></div>}
                                  {inv.tax_pct > 0 && <div className="flex gap-8 text-slate-500"><span>Tax ({inv.tax_pct}%)</span><span>{sym}{fmtShort((calcSubtotal(inv.items)-inv.discount)*inv.tax_pct/100)}</span></div>}
                                  <div className="flex gap-8 font-black text-slate-800 text-base"><span>Total</span><span>{sym}{fmtShort(total)}</span></div>
                                </div>
                              </div>
                              {inv.notes && <p className="text-xs text-slate-500 mt-3 italic border-t border-slate-100 pt-2">{inv.notes}</p>}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
