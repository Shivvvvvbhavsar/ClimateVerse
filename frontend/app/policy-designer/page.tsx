"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Sparkles, LoaderCircle, TrendingUp, Users, Leaf, DollarSign } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { ErrorState, Skeleton } from "@/components/Kpi";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

const PRIORITIES = [
  { key: "balanced", label: "Balanced" },
  { key: "cost", label: "Lowest cost" },
  { key: "co2", label: "Max CO2 reduction" },
  { key: "jobs", label: "Max jobs created" },
];

export default function PolicyDesignerPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { scenarioId, setPolicy } = useAppStore();
  const [priority, setPriority] = useState("balanced");

  const { data: policies, isLoading, isError, refetch } = useQuery({
    queryKey: ["policies", scenarioId],
    queryFn: async () => (await api.get(`/api/policies/scenario/${scenarioId}`)).data,
    enabled: !!scenarioId,
  });

  const generateMutation = useMutation({
    mutationFn: async () => (await api.post("/api/policies/generate", { scenario_id: scenarioId, count: 8 })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies", scenarioId] }),
  });

  const optimizeMutation = useMutation({
    mutationFn: async (p: string) => (await api.post("/api/policies/optimize", { scenario_id: scenarioId, priority: p })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies", scenarioId] }),
  });

  function selectPolicy(id: string) {
    setPolicy(id);
    router.push("/simulation");
  }

  return (
    <AppShell title="Policy Designer" subtitle="AI-generated and ranked climate policy options">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.key}
              onClick={() => { setPriority(p.key); optimizeMutation.mutate(p.key); }}
              className={`rounded-full px-4 py-2 text-sm border transition-colors ${priority === p.key ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" : "border-emerald-500/10 text-ink-400 hover:bg-base-800"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
          {generateMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate policies
        </Button>
      </div>

      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      )}

      {isError && <ErrorState message="Couldn't load policies." onRetry={() => refetch()} />}

      {policies?.length === 0 && !isLoading && (
        <Card className="text-center py-10">
          <p className="text-ink-400 mb-4">No policies yet for this scenario.</p>
          <Button onClick={() => generateMutation.mutate()}>Generate policies</Button>
        </Card>
      )}

      {policies?.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map((p: any) => (
            <Card key={p.id} className="flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <span className="rounded-full bg-emerald-500/15 text-emerald-300 text-xs px-2.5 py-1">Rank #{p.rank}</span>
                <span className="text-xs text-ink-500">Score {p.score}</span>
              </div>
              <h3 className="font-display text-lg mb-2">{p.name}</h3>
              <p className="text-xs text-ink-400 mb-4 line-clamp-2">{p.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="flex items-center gap-1.5 text-ink-300"><DollarSign className="h-3.5 w-3.5 text-signal-amber" /> ₹{p.cost_crore} cr</div>
                <div className="flex items-center gap-1.5 text-ink-300"><TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> -{p.co2_reduction_pct}% CO2</div>
                <div className="flex items-center gap-1.5 text-ink-300"><Users className="h-3.5 w-3.5 text-signal-sky" /> {p.jobs_created} jobs</div>
                <div className="flex items-center gap-1.5 text-ink-300"><Leaf className="h-3.5 w-3.5 text-emerald-400" /> {p.green_cover_pct}% green</div>
              </div>
              <div className="mt-auto flex gap-2">
                <Button variant="outline" className="flex-1 !text-xs" onClick={() => { setPolicy(p.id); router.push("/debate"); }}>
                  Debate this
                </Button>
                <Button className="flex-1 !text-xs" onClick={() => selectPolicy(p.id)}>Simulate</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
