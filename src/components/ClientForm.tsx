"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Globe, Mail, Phone, Building2, ArrowLeft, Save } from "lucide-react";

interface ClientData { name: string; email: string; website: string; phone: string; company: string; autoRoadmap?: boolean; monthly_retainer?: string; }
interface Props { initial?: Partial<ClientData>; id?: string; }

export default function ClientForm({ initial, id }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ClientData>({
    name: initial?.name ?? "", email: initial?.email ?? "",
    website: initial?.website ?? "", phone: initial?.phone ?? "", company: initial?.company ?? "",
    autoRoadmap: true, monthly_retainer: initial?.monthly_retainer ?? "",
  });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = id ? `/api/clients/${id}` : "/api/clients";
    await fetch(url, { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    router.push("/dashboard/clients");
    router.refresh();
  };

  const fields = [
    { key: "name" as const, label: "Client Name", icon: User, type: "text", placeholder: "e.g. ABC Company", required: true },
    { key: "company" as const, label: "Company Name", icon: Building2, type: "text", placeholder: "e.g. ABC Pvt Ltd", required: false },
    { key: "email" as const, label: "Email Address", icon: Mail, type: "email", placeholder: "client@example.com", required: true },
    { key: "website" as const, label: "Website URL", icon: Globe, type: "url", placeholder: "https://example.com", required: true },
    { key: "phone" as const, label: "Phone Number", icon: Phone, type: "tel", placeholder: "+92 300 1234567", required: false },
    { key: "monthly_retainer" as const, label: "Monthly Retainer ($)", icon: Save, type: "number", placeholder: "e.g. 500", required: false },
  ];

  return (
    <div className="animate-fade-in max-w-xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> Back
      </button>

      <form onSubmit={save} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
          <h2 className="font-bold text-slate-700">{id ? "Edit Client" : "New Client"} Details</h2>
          <p className="text-xs text-slate-400 mt-0.5">Fields marked with * are required</p>
        </div>

        <div className="p-6 space-y-4">
          {fields.map(({ key, label, icon: Icon, type, placeholder, required }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={type} required={required} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-shadow" />
              </div>
            </div>
          ))}

          {!id && (
            <div className="pt-2">
              <label className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={form.autoRoadmap}
                  onChange={e => setForm({ ...form, autoRoadmap: e.target.checked })}
                  className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-bold text-blue-900">Auto-generate SEO Roadmap</p>
                  <p className="text-[10px] text-blue-700 font-medium">Populate a 3-month strategy automatically (Technical, On-Page, Off-Page)</p>
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30 flex gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm shadow-blue-200">
            <Save size={15} />
            {saving ? "Saving..." : id ? "Update Client" : "Add Client"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
