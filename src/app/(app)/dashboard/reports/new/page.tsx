import ReportForm from "@/components/ReportForm";
import { Suspense } from "react";

function NewReportContent({ clientId }: { clientId?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Create New Report</h1>
      <ReportForm initialClientId={clientId} />
    </div>
  );
}

export default async function NewReportPage({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  const { clientId } = await searchParams;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewReportContent clientId={clientId} />
    </Suspense>
  );
}
