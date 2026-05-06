"use client";
import { useState, useEffect, useRef } from "react";
import { ImagePlus, Trash2, Upload, X, ZoomIn } from "lucide-react";

interface Screenshot { id: string; report_id: string; label: string; url: string; created_at: string; }

export default function ReportScreenshots({ reportId }: { reportId: string }) {
  const [shots, setShots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
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
      body: JSON.stringify({ report_id: reportId, label: label || "Screenshot", url: preview }),
    });
    setPreview(null);
    setLabel("");
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this screenshot?")) return;
    await fetch(`/api/screenshots/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <ImagePlus size={17} className="text-violet-600" />
        <h2 className="font-semibold text-slate-700">Screenshots</h2>
        <span className="text-xs text-slate-400 ml-auto">{shots.length} image{shots.length !== 1 ? "s" : ""}</span>
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
            <input value={label} onChange={e => setLabel(e.target.value)}
              placeholder="Label (e.g. Google Search Console, Before Fix)"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={upload} disabled={uploading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <Upload size={14} /> {uploading ? "Uploading..." : "Add Screenshot"}
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
            <ImagePlus size={28} className="text-slate-300" />
            <p className="text-sm text-slate-500 font-medium">Click to upload screenshot</p>
            <p className="text-xs text-slate-400">PNG, JPG, WebP — stored as data URL</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1,2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : shots.length === 0 ? (
        <p className="text-center text-slate-300 text-sm py-4">No screenshots added yet</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {shots.map(s => (
            <div key={s.id} className="group relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.url} alt={s.label} className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => setLightbox(s.url)}
                  className="bg-white text-slate-700 p-2 rounded-full shadow hover:bg-slate-100 transition-colors">
                  <ZoomIn size={14} />
                </button>
                <button onClick={() => del(s.id)}
                  className="bg-white text-red-500 p-2 rounded-full shadow hover:bg-red-50 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              {s.label && (
                <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                  {s.label}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="Screenshot" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
            <button onClick={() => setLightbox(null)}
              className="absolute -top-4 -right-4 bg-white text-slate-700 rounded-full p-2 shadow-lg hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
