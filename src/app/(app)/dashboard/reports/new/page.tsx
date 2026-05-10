import ReportForm from "@/components/ReportForm";
import { Suspense } from "react";

function NewReportContent({ clientId, websiteId }: { clientId?: string; websiteId?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Create New Report</h1>
      <ReportForm initialClientId={clientId} initialWebsiteId={websiteId} />
    </div>
  );
}

export default async function NewReportPage({ searchParams }: { searchParams: Promise<{ clientId?: string; websiteId?: string }> }) {
  const { clientId, websiteId } = await searchParams;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewReportContent clientId={clientId} websiteId={websiteId} />
    </Suspense>
  );
}
