"use client";
import { useState, useEffect, useRef } from "react";
import { ImagePlus, Trash2, X, ZoomIn, ArrowLeftRight, Image } from "lucide-react";

interface Screenshot {
  id: string;
  report_id: string;
  label: string;
  url: string;
  type: "before" | "after" | "general";
  created_at: string;
}

export default function ReportScreenshots({ reportId }: { reportId: string }) {
  const [shots, setShots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"before" | "after" | "general">("before");
  const [preview, setPreview] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<Screenshot | null>(null);
  const [view, setView] = useState<"pairs" | "all">("pairs");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    fetch(`/api/screenshots?reportId=${reportId}`)
      .then(r => r.ok ? r.json() : []).catch(() => [])
      .then(d => setShots(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [reportId]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const upload = async () => {
    if (!preview) return;
    setUploading(true);
    await fetch("/api/screenshots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report_id: reportId, label: label || "Screenshot", url: preview, type }),
    });
    setPreview(null);
    setLabel("");
    setType("before");
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this screenshot?")) return;
    await fetch(`/api/screenshots/${id}`, { method: "DELETE" });
    load();
  };

  // Group before/after pairs by label similarity
  const beforeShots = shots.filter(s => s.type === "before");
  const afterShots = shots.filter(s => s.type === "after");
  const generalShots = shots.filter(s => s.type === "general");

  const TYPE_CFG = {
    before: { label: "Before", bg: "bg-red-50", border: "border-red-200", text: "text-red-600", badge: "bg-red-100 text-red-700 border-red-200" },
    after:  { label: "After",  bg: "bg-green-50", border: "border-green-200", text: "text-green-600", badge: "bg-green-100 text-green-700 border-green-200" },
    general:{ label: "General", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", badge: "bg-blue-100 text-blue-700 border-blue-200" },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <ImagePlus size={17} className="text-violet-600" />
        <h2 className="font-semibold text-slate-700">Before / After Screenshots</h2>
        <span className="text-xs text-slate-400">{shots.length} image{shots.length !== 1 ? "s" : ""}</span>
        {shots.length > 0 && (
          <div className="ml-auto flex gap-1">
            <button onClick={() => setView("pairs")}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${view === "pairs" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              Before/After
            </button>
            <button onClick={() => setView("all")}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${view === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              All
            </button>
          </div>
        )}
      </div>

      {/* Upload area */}
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 mb-5 hover:border-blue-300 transition-colors">
        {preview ? (
          <div className="space-y-3">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg bg-slate-50" />
              <button onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 bg-white text-slate-500 hover:text-red-600 rounded-full p-1 shadow">
                <X size={14} />
              </button>
            </div>
            {/* Type selector */}
            <div className="flex gap-2">
              {(["before", "after", "general"] as const).map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors capitalize ${type === t ? TYPE_CFG[t].badge + " " + TYPE_CFG[t].border : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}>
                  {t === "before" ? "Before" : t === "after" ? "After" : "General"}
                </button>
              ))}
            </div>
            <input value={label} onChange={e => setLabel(e.target.value)}
              placeholder={type === "before" ? "e.g. Homepage ranking — Before fix" : type === "after" ? "e.g. Homepage ranking — After fix" : "e.g. GSC impressions graph"}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={upload} disabled={uploading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors w-full justify-center">
              <ImagePlus size={14} /> {uploading ? "Uploading..." : `Add as ${TYPE_CFG[type].label}`}
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
            <ImagePlus size={28} className="text-slate-300" />
            <p className="text-sm text-slate-500 font-medium">Click to upload screenshot</p>
            <p className="text-xs text-slate-400">PNG, JPG, WebP supported</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1,2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : shots.length === 0 ? (
        <div className="text-center py-8 text-slate-300">
          <Image size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No screenshots added yet</p>
          <p className="text-xs mt-1 text-slate-400">Upload Before &amp; After screenshots to show your work</p>
        </div>
      ) : view === "pairs" ? (
        <div className="space-y-6">
          {/* Before/After pairs */}
          {(beforeShots.length > 0 || afterShots.length > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ArrowLeftRight size={14} className="text-slate-400" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Before &amp; After Comparison</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Before column */}
                <div>
                  <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1 mb-2 text-center">Before</p>
                  {beforeShots.length === 0 ? (
                    <div className="h-24 border-2 border-dashed border-red-200 rounded-xl flex items-center justify-center text-xs text-slate-400">No before screenshots</div>
                  ) : (
                    <div className="space-y-2">
                      {beforeShots.map(s => (
                        <ShotCard key={s.id} s={s} onZoom={setLightbox} onDel={del} />
                      ))}
                    </div>
                  )}
                </div>
                {/* After column */}
                <div>
                  <p className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 rounded-lg px-2 py-1 mb-2 text-center">After</p>
                  {afterShots.length === 0 ? (
                    <div className="h-24 border-2 border-dashed border-green-200 rounded-xl flex items-center justify-center text-xs text-slate-400">No after screenshots</div>
                  ) : (
                    <div className="space-y-2">
                      {afterShots.map(s => (
                        <ShotCard key={s.id} s={s} onZoom={setLightbox} onDel={del} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* General screenshots */}
          {generalShots.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">General Screenshots</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {generalShots.map(s => (
                  <ShotCard key={s.id} s={s} onZoom={setLightbox} onDel={del} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // All view — flat grid
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {shots.map(s => (
            <ShotCard key={s.id} s={s} onZoom={setLightbox} onDel={del} showType />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-5xl max-h-full flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            {lightbox.label && (
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${TYPE_CFG[lightbox.type ?? "general"].badge}`}>
                  {TYPE_CFG[lightbox.type ?? "general"].label}
                </span>
                <p className="text-white text-sm font-medium">{lightbox.label}</p>
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.url} alt={lightbox.label} className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
            <button onClick={() => setLightbox(null)}
              className="absolute -top-2 -right-2 bg-white text-slate-700 rounded-full p-2 shadow-lg hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShotCard({ s, onZoom, onDel, showType }: {
  s: Screenshot;
  onZoom: (s: Screenshot) => void;
  onDel: (id: string) => void;
  showType?: boolean;
}) {
  const TYPE_BADGE: Record<string, string> = {
    before: "bg-red-100 text-red-700 border-red-200",
    after:  "bg-green-100 text-green-700 border-green-200",
    general:"bg-blue-100 text-blue-700 border-blue-200",
  };
  return (
    <div className="group relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={s.url} alt={s.label} className="w-full h-32 object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button onClick={() => onZoom(s)} className="bg-white text-slate-700 p-2 rounded-full shadow hover:bg-slate-100 transition-colors">
          <ZoomIn size={14} />
        </button>
        <button onClick={() => onDel(s.id)} className="bg-white text-red-500 p-2 rounded-full shadow hover:bg-red-50 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1.5 flex items-center gap-1.5">
        {showType && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${TYPE_BADGE[s.type ?? "general"]} bg-opacity-90`}>
            {s.type ?? "general"}
          </span>
        )}
        <span className="truncate">{s.label}</span>
      </div>
    </div>
  );
}
