"use client";
import ClientForm from "@/components/ClientForm";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function NewClientContent() {
  const searchParams = useSearchParams();
  const initialData = {
    name: searchParams.get("name") || "",
    email: searchParams.get("email") || "",
    website: searchParams.get("website") || "",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Add New Client</h1>
      <ClientForm initial={initialData} />
    </div>
  );
}

export default function NewClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewClientContent />
    </Suspense>
  );
}
