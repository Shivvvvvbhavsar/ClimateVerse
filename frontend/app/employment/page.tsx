"use client";
import { useMutation } from "@tanstack/react-query";
import { Briefcase, LoaderCircle, TrendingUp, TrendingDown } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function EmploymentPage() {
  const { scenarioId } = useAppStore();

  const mutation = useMutation({
    mutationFn: async () => (await api.post("/api/employment/analyze", { scenario_id: scenarioId, closures: [], expansions: [] })).data,
  });

  const data = mutation.data;

  return (
    <AppShell title="Employment Impact Analyzer" subtitle="Jobs lost, jobs created, and net employment effects">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-ink-400 max-w-xl">
          Derives employment effects from the current scenario's interventions — coal/fossil
          closures versus solar, EV, and green-building job creation.
        </p>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
          Analyze employment impact
        </Button>
      </div>

      {data && (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Card className="!p-4">
              <div className="flex items-center gap-2 mb-1"><TrendingDown className="h-4 w-4 text-signal-coral" /><p className="text-xs text-ink-500">Jobs lost</p></div>
              <p className="font-display text-2xl stat-tick">{data.jobs_lost.toLocaleString()}</p>
            </Card>
            <Card className="!p-4">
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-emerald-400" /><p className="text-xs text-ink-500">Jobs created</p></div>
              <p className="font-display text-2xl stat-tick">{data.jobs_created.toLocaleString()}</p>
            </Card>
            <Card className="!p-4 border border-emerald-500/30">
              <p className="text-xs text-ink-500 mb-1">Net employment</p>
              <p className="font-display text-2xl stat-tick text-emerald-400">+{data.net_employment.toLocaleString()}</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Card>
              <p className="text-sm text-ink-300 mb-4">Closures</p>
              <div className="space-y-2">
                {data.closures.map((c: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm rounded-lg bg-base-800/50 px-3 py-2">
                    <span className="text-ink-300">{c.sector}</span>
                    <span className="text-signal-coral">-{c.jobs.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <p className="text-sm text-ink-300 mb-4">Expansions</p>
              <div className="space-y-2">
                {data.expansions.map((e: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm rounded-lg bg-base-800/50 px-3 py-2">
                    <span className="text-ink-300">{e.sector}</span>
                    <span className="text-emerald-400">+{e.jobs.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="mt-5">
            <p className="text-sm text-ink-300 mb-4">Skill transition pathways</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {data.skill_transition.map((s: any, i: number) => (
                <div key={i} className="rounded-xl bg-base-800/50 p-3 text-xs">
                  <p className="text-ink-400">{s.from_role}</p>
                  <p className="text-emerald-400 my-1">↓ {s.retraining_weeks} wks retraining</p>
                  <p className="text-ink-200">{s.to_role}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {!data && !mutation.isPending && (
        <Card className="text-center py-16">
          <p className="text-ink-400">Run the analysis to see employment impact for this scenario.</p>
        </Card>
      )}
    </AppShell>
  );
}
