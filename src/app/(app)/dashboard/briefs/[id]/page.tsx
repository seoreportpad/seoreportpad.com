"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BriefForm from "@/components/BriefForm";
import { Loader2 } from "lucide-react";

export default function EditBriefPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can fetch the brief from the API. We need a way to get a single brief.
    // For now, let's fetch all for the user and find this one, or just update the GET API to handle id.
    // Wait, the API GET /api/briefs doesn't return a single brief by ID yet, but we can filter the array.
    fetch(`/api/briefs`)
      .then(r => r.ok ? r.json() : [])
      .then(briefs => {
        if (Array.isArray(briefs)) {
          const b = briefs.find(x => x.id === id);
          if (b) setData(b);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>;
  if (!data) return <div className="text-center p-20 text-slate-500">Brief not found</div>;

  return (
    <div className="animate-fade-in pb-12">
      <BriefForm briefId={id} initialData={data} />
    </div>
  );
}
