"use client";
import { Suspense } from "react";
import BriefForm from "@/components/BriefForm";
import { useSearchParams } from "next/navigation";

function NewBriefContent() {
  const params = useSearchParams();
  const clientId = params.get("clientId") || undefined;
  
  return <BriefForm initialClientId={clientId} />;
}

export default function NewBriefPage() {
  return (
    <div className="animate-fade-in pb-12">
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading form...</div>}>
        <NewBriefContent />
      </Suspense>
    </div>
  );
}
