import { supabase } from "@/lib/supabase";
import ReportForm from "@/components/ReportForm";
import { notFound } from "next/navigation";

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: report } = await supabase
    .from("reports")
    .select("*, keywords(*), work_done(*), metrics(*)")
    .eq("id", id)
    .single();

  if (!report) notFound();

  const m = report.metrics;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Report</h1>
      <ReportForm
        reportId={id}
        initial={{
          client_id: report.client_id,
          month: report.month,
          year: report.year,
          status: report.status,
          keywords: (report.keywords ?? []).map((k: Record<string, unknown>) => ({
            keyword: String(k.keyword ?? ""),
            prev_ranking: String(k.prev_ranking ?? ""),
            curr_ranking: String(k.curr_ranking ?? ""),
            search_volume: String(k.search_volume ?? ""),
            url: String(k.url ?? ""),
          })),
          work_done: report.work_done ?? [],
          metrics: m ? {
            organic_traffic: String(m.organic_traffic ?? ""),
            prev_traffic: String(m.prev_traffic ?? ""),
            backlinks: String(m.backlinks ?? ""),
            prev_backlinks: String(m.prev_backlinks ?? ""),
            domain_authority: String(m.domain_authority ?? ""),
            prev_da: String(m.prev_da ?? ""),
            impressions: String(m.impressions ?? ""),
            clicks: String(m.clicks ?? ""),
            avg_position: String(m.avg_position ?? ""),
            technical_fixed: String(m.technical_fixed ?? ""),
            pages_indexed: String(m.pages_indexed ?? ""),
            notes: m.notes ?? "",
            recommendations: m.recommendations ?? "",
          } : undefined,
        }}
      />
    </div>
  );
}
