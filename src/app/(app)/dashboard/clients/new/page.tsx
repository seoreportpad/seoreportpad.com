import ClientForm from "@/components/ClientForm";

export default function NewClientPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Add New Client</h1>
      <ClientForm />
    </div>
  );
}
