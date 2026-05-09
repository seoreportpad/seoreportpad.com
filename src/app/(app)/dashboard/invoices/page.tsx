"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Plus, Trash2, Pencil, Save, X, Search, Download,
  DollarSign, CheckCircle2, Clock, AlertCircle, Filter,
  ChevronDown, ChevronUp, FileText, Printer,
} from "lucide-react";

interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
}

interface Invoice {
  id: string;
  invoice_no: string;
  client: string;
  issue_date: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  items: InvoiceItem[];
  tax_pct: number;
  discount: number;
  notes: string;
  created_at: string;
}

const STATUSES = [
  { value: "draft",     label: "Draft",     color: "text-slate-500 bg-slate-100 border-slate-200" },
  { value: "sent",      label: "Sent",      color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "paid",      label: "Paid",      color: "text-green-600 bg-green-50 border-green-200" },
  { value: "overdue",   label: "Overdue",   color: "text-red-600 bg-red-50 border-red-200" },
  { value: "cancelled", label: "Cancelled", color: "text-slate-400 bg-slate-50 border-slate-200" },
];

const LS_KEY = "seo_invoices_v1";
function load(): Invoice[] { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function persist(d: Invoice[]) { localStorage.setItem(LS_KEY, JSON.stringify(d)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function nextInvoiceNo(invoices: Invoice[]) {
  const nums = invoices.map(i => parseInt(i.invoice_no.replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `INV-${String(max + 1).padStart(4, "0")}`;
}

const stCfg = (v: string) => STATUSES.find(s => s.value === v) ?? STATUSES[0];
function calcSubtotal(items: InvoiceItem[]) { return items.reduce((s, i) => s + i.qty * i.rate, 0); }
function calcTotal(inv: Invoice) {
  const sub = calcSubtotal(inv.items);
  const disc = inv.discount || 0;
  const taxable = sub - disc;
  return taxable + (taxable * (inv.tax_pct || 0)) / 100;
}

const emptyItem = (): InvoiceItem => ({ description: "", qty: 1, rate: 0 });

const emptyForm = (invoices: Invoice[], today = ""): Omit<Invoice, "id" | "created_at"> => ({
  invoice_no: nextInvoiceNo(invoices),
  client: "", issue_date: today,
  due_date: "", status: "draft",
  items: [emptyItem()], tax_pct: 0, discount: 0, notes: "",
});

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Invoice, "id" | "created_at">>(emptyForm([]));
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedInv, setExpandedInv] = useState<string | null>(null);

  useEffect(() => {
    const data = load();
    const today = new Date().toISOString().slice(0, 10);
    setInvoices(data);
    setForm(emptyForm(data, today));
  }, []);

  const save = (d: Invoice[]) => { setInvoices(d); persist(d); };

  const addInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const inv: Invoice = { ...form, id: uid(), created_at: new Date().toISOString() };
    const updated = [inv, ...invoices];
    save(updated);
    setForm(emptyForm(updated));
    setShowForm(false);
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    save(invoices.map(i => i.id === id ? { ...i, ...data } : i));
    setEditing(null);
  };

  const deleteInvoice = (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    save(invoices.filter(i => i.id !== id));
  };

  const setItem = (idx: number, field: keyof InvoiceItem, val: string | number) => {
    setForm(f => ({
      ...f,
      items: f.items.map((it, i) => i === idx ? { ...it, [field]: val } : it),
    }));
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const allClients = useMemo(() => [...new Set(invoices.map(i => i.client).filter(Boolean))], [invoices]);

  const filtered = useMemo(() => invoices.filter(i => {
    const q = search.toLowerCase();
    return (!q || i.client.toLowerCase().includes(q) || i.invoice_no.toLowerCase().includes(q))
      && (filterStatus === "all" || i.status === filterStatus);
  }), [invoices, search, filterStatus]);

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + calcTotal(i), 0);
  const totalPending = invoices.filter(i => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + calcTotal(i), 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white";
  const labelCls = "text-xs font-semibold text-slate-600 block mb-1.5";

  const exportCSV = () => {
    const rows = [["Invoice #", "Client", "Issue Date", "Due Date", "Status", "Subtotal", "Discount", "Tax %", "Total"]];
    for (const i of filtered) rows.push([
      i.invoice_no, i.client, i.issue_date, i.due_date, i.status,
      fmt(calcSubtotal(i.items)), fmt(i.discount), String(i.tax_pct), fmt(calcTotal(i)),
    ]);
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "invoices.csv";
    a.click();
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
          <button onClick={() => { setShowForm(true); setForm(emptyForm(invoices, new Date().toISOString().slice(0, 10))); }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
            <Plus size={16} /> New Invoice
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Invoices", value: invoices.length,           suffix: "",   color: "text-slate-700",   bg: "bg-slate-50",   Icon: FileText },
          { label: "Revenue Collected", value: `$${fmt(totalRevenue)}`, suffix: "",  color: "text-green-600",   bg: "bg-green-50",   Icon: CheckCircle2 },
          { label: "Pending",        value: `$${fmt(totalPending)}`,   suffix: "",   color: "text-amber-600",   bg: "bg-amber-50",   Icon: Clock },
          { label: "Overdue",        value: overdueCount,              suffix: "",   color: "text-red-600",     bg: "bg-red-50",     Icon: AlertCircle },
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

      {/* New invoice form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-gradient-to-r from-emerald-50 to-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center gap-2"><DollarSign size={16} className="text-emerald-600" />New Invoice — {form.invoice_no}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"><X size={16} /></button>
          </div>
          <form onSubmit={addInvoice} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Invoice # </label>
                <input value={form.invoice_no} onChange={e => setForm({ ...form, invoice_no: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Client <span className="text-red-500">*</span></label>
                <input required value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}
                  placeholder="Client name" className={inputCls} list="client-list" />
                <datalist id="client-list">{allClients.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Invoice["status"] })} className={inputCls}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Issue Date</label>
                <input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Due Date</label>
                <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className={inputCls} />
              </div>
            </div>

            {/* Line items */}
            <div>
              <label className={labelCls}>Line Items</label>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase px-1">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Rate ($)</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input value={item.description} onChange={e => setItem(idx, "description", e.target.value)}
                      placeholder="e.g. Monthly SEO Retainer" className="col-span-6 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                    <input type="number" min="1" value={item.qty} onChange={e => setItem(idx, "qty", Number(e.target.value))}
                      className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                    <input type="number" min="0" step="0.01" value={item.rate} onChange={e => setItem(idx, "rate", Number(e.target.value))}
                      className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                    <div className="col-span-1 text-right text-sm font-semibold text-slate-700">
                      ${fmt(item.qty * item.rate)}
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
                <label className={labelCls}>Discount ($)</label>
                <input type="number" min="0" value={form.discount} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tax (%)</label>
                <input type="number" min="0" max="100" value={form.tax_pct} onChange={e => setForm({ ...form, tax_pct: Number(e.target.value) })} className={inputCls} />
              </div>
              <div className="flex items-end pb-2.5">
                <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-emerald-700 font-semibold mb-0.5">Total</p>
                  <p className="text-xl font-black text-emerald-700">${fmt(calcTotal({ ...form, id: "", created_at: "" } as Invoice))}</p>
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2} placeholder="Payment instructions, thank you note, terms..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700">
                <Save size={14} /> Save Invoice
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client or invoice number..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map(s => (
              <button key={s.value} onClick={() => setFilterStatus(filterStatus === s.value ? "all" : s.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${filterStatus === s.value ? "bg-slate-800 text-white border-slate-800" : `${s.color} hover:opacity-80`}`}>
                {s.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} invoices</span>
        </div>
      </div>

      {/* Invoice table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <DollarSign size={40} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-slate-600 font-bold text-lg mb-2">No invoices yet</h3>
          <p className="text-slate-400 text-sm mb-6">Create your first invoice and start tracking payments</p>
          <button onClick={() => { setShowForm(true); setForm(emptyForm(invoices, new Date().toISOString().slice(0, 10))); }}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700">
            <Plus size={15} /> New Invoice
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Invoice</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Client</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Issue Date</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Due Date</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Total</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(inv => {
                const st = stCfg(inv.status);
                const total = calcTotal(inv);
                const isExpanded = expandedInv === inv.id;
                return (
                  <>
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setExpandedInv(isExpanded ? null : inv.id)}
                            className="text-slate-400 hover:text-slate-600">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <span className="font-bold text-slate-800 text-sm">{inv.invoice_no}</span>
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
                        {inv.issue_date ? new Date(inv.issue_date + "T00:00:00").toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-4">
                        {inv.due_date ? (
                          <span className={`text-sm ${inv.status === "overdue" ? "text-red-600 font-semibold" : "text-slate-600"}`}>
                            {new Date(inv.due_date + "T00:00:00").toLocaleDateString()}
                          </span>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`text-sm font-black ${inv.status === "paid" ? "text-green-600" : "text-slate-800"}`}>
                          ${fmt(total)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => deleteInvoice(inv.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${inv.id}-exp`} className="bg-slate-50/40">
                        <td colSpan={7} className="px-8 pb-5 pt-2">
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
                                  <td className="py-1.5 text-right">${fmt(item.rate)}</td>
                                  <td className="py-1.5 text-right font-semibold">${fmt(item.qty * item.rate)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="flex justify-end gap-8 text-sm border-t border-slate-100 pt-2">
                            <div className="text-right space-y-1">
                              <div className="flex gap-8 text-slate-500"><span>Subtotal</span><span>${fmt(calcSubtotal(inv.items))}</span></div>
                              {inv.discount > 0 && <div className="flex gap-8 text-red-500"><span>Discount</span><span>-${fmt(inv.discount)}</span></div>}
                              {inv.tax_pct > 0 && <div className="flex gap-8 text-slate-500"><span>Tax ({inv.tax_pct}%)</span><span>${fmt((calcSubtotal(inv.items) - inv.discount) * inv.tax_pct / 100)}</span></div>}
                              <div className="flex gap-8 font-black text-slate-800 text-base"><span>Total</span><span>${fmt(total)}</span></div>
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
    </div>
  );
}
