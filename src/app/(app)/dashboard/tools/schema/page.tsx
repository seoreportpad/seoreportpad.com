"use client";
import { useState } from "react";
import { 
  Building2, MapPin, Phone, Globe, Clock, 
  Copy, Check, Code, Sparkles, Languages,
  Info, ExternalLink
} from "lucide-react";

export default function SchemaBuilderPage() {
  const [data, setData] = useState({
    type: "LocalBusiness",
    name: "",
    description: "",
    url: "",
    telephone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Pakistan",
    openingHours: "Mo-Fr 09:00-18:00",
    priceRange: "$$",
  });

  const [copied, setCopied] = useState(false);

  const schema = {
    "@context": "https://schema.org",
    "@type": data.type,
    "name": data.name,
    "description": data.description,
    "url": data.url,
    "telephone": data.telephone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.address,
      "addressLocality": data.city,
      "addressRegion": data.state,
      "postalCode": data.zip,
      "addressCountry": data.country
    },
    "openingHours": data.openingHours,
    "priceRange": data.priceRange
  };

  const jsonString = JSON.stringify(schema, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`<script type="application/ld+json">\n${jsonString}\n</script>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">Local Schema Builder</h1>
        <p className="text-slate-500 text-sm mt-1">Generate SEO-friendly JSON-LD for local businesses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Building2 size={20} />
              </div>
              <h2 className="font-bold text-slate-800">Business Details</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Business Type</label>
                <select 
                  value={data.type}
                  onChange={e => setData({...data, type: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="LocalBusiness">General Local Business</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Dentist">Dentist</option>
                  <option value="LegalService">Lawyer / Legal</option>
                  <option value="RealEstateAgent">Real Estate Agent</option>
                  <option value="AutomotiveBusiness">Car / Auto</option>
                  <option value="HomeAndConstructionBusiness">Construction / Plumber</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Business Name</label>
                <input 
                  value={data.name}
                  onChange={e => setData({...data, name: e.target.value})}
                  placeholder="e.g. Acme SEO Lahore"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                <textarea 
                  value={data.description}
                  onChange={e => setData({...data, description: e.target.value})}
                  placeholder="Tell Google what you do..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Website URL</label>
                <input 
                  value={data.url}
                  onChange={e => setData({...data, url: e.target.value})}
                  placeholder="https://example.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone</label>
                <input 
                  value={data.telephone}
                  onChange={e => setData({...data, telephone: e.target.value})}
                  placeholder="+92 300 1234567"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <MapPin size={20} />
              </div>
              <h2 className="font-bold text-slate-800">Location & Hours</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Street Address</label>
                <input 
                  value={data.address}
                  onChange={e => setData({...data, address: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">City</label>
                <input 
                  value={data.city}
                  onChange={e => setData({...data, city: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">State / Region</label>
                <input 
                  value={data.state}
                  onChange={e => setData({...data, state: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Hours (Schema Format)</label>
                <input 
                  value={data.openingHours}
                  onChange={e => setData({...data, openingHours: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Price Range</label>
                <input 
                  value={data.priceRange}
                  onChange={e => setData({...data, priceRange: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6 lg:sticky lg:top-8 h-fit">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code size={18} className="text-blue-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">JSON-LD Output</span>
              </div>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>
            <pre className="text-[11px] text-blue-100 font-mono overflow-x-auto p-4 bg-black/30 rounded-2xl">
              {`<script type="application/ld+json">\n${jsonString}\n</script>`}
            </pre>
          </div>

          <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <Sparkles className="absolute top-4 right-4 text-white/20" size={60} />
            <h3 className="text-lg font-bold mb-2">Why Local Schema?</h3>
            <p className="text-sm text-blue-100 leading-relaxed mb-6">
              Structured data helps Google understand your business better, increasing your chances of appearing in the 
              <strong> Local Pack</strong> and getting rich snippets in search results.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs bg-white/10 p-3 rounded-xl border border-white/10">
                <Check size={16} className="text-blue-300" /> Boosts local search rankings
              </div>
              <div className="flex items-center gap-3 text-xs bg-white/10 p-3 rounded-xl border border-white/10">
                <Check size={16} className="text-blue-300" /> Enhances Google Maps profile
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
