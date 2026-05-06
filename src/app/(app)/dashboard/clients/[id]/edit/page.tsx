import { supabase } from "@/lib/supabase";
import ClientForm from "@/components/ClientForm";
import { notFound } from "next/navigation";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Client</h1>
      <ClientForm id={id} initial={{ ...client, phone: client.phone ?? undefined, company: client.company ?? undefined }} />
    </div>
  );
}
