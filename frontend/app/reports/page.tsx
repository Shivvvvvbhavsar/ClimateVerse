"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileText, LoaderCircle, Download } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { api, API_URL } from "@/lib/api";
import { useAppStore } from "@/lib/store";

const REPORT_TYPES = [
  "Executive Summary", "Climate Report", "Policy Report", "ESG Report",
  "Cost-Benefit Analysis", "Government Proposal", "University Report", "Research Summary",
];
const FORMATS = ["markdown", "html", "pdf"];

export default function ReportsPage() {
  const { scenarioId, policyId } = useAppStore();
  const [reportType, setReportType] = useState("Executive Summary");
  const [format, setFormat] = useState("pdf");

  const mutation = useMutation({
    mutationFn: async () => (await api.post("/api/reports/generate", {
      scenario_id: scenarioId, policy_id: policyId, report_type: reportType, format,
    })).data,
  });

  const data = mutation.data;

  return (
    <AppShell title="Reports" subtitle="Generate decision-ready reports in Markdown, HTML, or PDF">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <Card>
          <p className="text-sm text-ink-300 mb-4">Report configuration</p>
          <div className="mb-4">
            <label className="text-xs text-ink-500 block mb-2">Report type</label>
            <div className="space-y-1.5">
              {REPORT_TYPES.map((t) => (
                <button key={t} onClick={() => setReportType(t)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${reportType === t ? "bg-emerald-500/15 text-emerald-300" : "text-ink-400 hover:bg-base-800"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="text-xs text-ink-500 block mb-2">Format</label>
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs uppercase transition-colors ${format === f ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40" : "border border-emerald-500/10 text-ink-400 hover:bg-base-800"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Generate report
          </Button>
        </Card>

        <Card className="min-h-[400px]">
          {!data && !mutation.isPending && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <FileText className="h-10 w-10 text-emerald-500/40 mb-4" />
              <p className="text-ink-400">Configure a report and generate it to preview and download.</p>
            </div>
          )}
          {mutation.isPending && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <LoaderCircle className="h-8 w-8 text-emerald-400 animate-spin mb-4" />
              <p className="text-ink-400">Generating report…</p>
            </div>
          )}
          {data && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg">{data.title}</h3>
                <a href={`${API_URL}${data.download_url}`} target="_blank" rel="noreferrer">
                  <Button variant="outline"><Download className="h-4 w-4" /> Download {format.toUpperCase()}</Button>
                </a>
              </div>
              <pre className="whitespace-pre-wrap text-xs text-ink-300 bg-base-800/40 rounded-xl p-4 max-h-[60vh] overflow-y-auto">
                {data.content_preview}
              </pre>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
