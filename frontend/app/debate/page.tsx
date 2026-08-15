"use client";
import { useMutation } from "@tanstack/react-query";
import { Users2, LoaderCircle, Gavel } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

const AGENT_COLORS: Record<string, string> = {
  "Climate Agent": "#57c8e8", "Forest Agent": "#34e0a1", "Transport Agent": "#f2b544",
  "Energy Agent": "#f2b544", "Water Agent": "#57c8e8", "Industry Agent": "#a08a6b",
  "Citizen Agent": "#ff6b5e", "Economy Agent": "#34e0a1", "Policy Agent": "#b98ee8",
  "Disaster Agent": "#ff6b5e", "Coordinator Agent": "#eef6f1",
};

export default function DebatePage() {
  const { policyId } = useAppStore();

  const debateMutation = useMutation({
    mutationFn: async () => (await api.post("/api/debate/run", { policy_id: policyId })).data,
  });

  const data = debateMutation.data;

  return (
    <AppShell title="AI Debate Room" subtitle="Ten specialist agents debate a policy; the Coordinator decides">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-ink-400 max-w-xl">
          Each agent evaluates the selected policy from its own domain, then the Coordinator
          Agent aggregates outputs, resolves conflicts, and produces a final recommendation.
        </p>
        <Button onClick={() => debateMutation.mutate()} disabled={debateMutation.isPending || !policyId}>
          {debateMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Users2 className="h-4 w-4" />}
          Start debate
        </Button>
      </div>

      {!policyId && (
        <Card className="text-center py-10">
          <p className="text-ink-400">Select a policy from the Policy Designer first.</p>
        </Card>
      )}

      {data && (
        <div className="space-y-4">
          {data.messages.map((m: any, i: number) => (
            <Card key={i} className="flex gap-4 !p-4" style={{ borderLeft: `3px solid ${AGENT_COLORS[m.agent_name] || "#34e0a1"}` }}>
              <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-xs font-medium"
                   style={{ background: `${AGENT_COLORS[m.agent_name] || "#34e0a1"}22`, color: AGENT_COLORS[m.agent_name] || "#34e0a1" }}>
                {m.agent_name === "Coordinator Agent" ? <Gavel className="h-4 w-4" /> : m.agent_name.split(" ")[0][0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{m.agent_name}</span>
                  <span className="text-xs text-ink-500">{Math.round(m.confidence * 100)}% confidence</span>
                </div>
                <p className="text-sm text-ink-300">{m.message}</p>
              </div>
            </Card>
          ))}

          <Card className="border border-emerald-500/30">
            <p className="eyebrow mb-2">Coordinator's final recommendation</p>
            <p className="text-sm text-ink-200 mb-3">{data.coordinator.recommendation}</p>
            <p className="text-xs text-ink-500 mb-2"><strong className="text-ink-300">Reasoning:</strong> {data.coordinator.reasoning}</p>
            {data.coordinator.trade_offs?.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-ink-300 mb-1">Trade-offs</p>
                <ul className="text-xs text-ink-400 list-disc list-inside">
                  {data.coordinator.trade_offs.map((t: string, i: number) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
            <p className="text-xs text-ink-500"><strong className="text-ink-300">Alternative:</strong> {data.coordinator.alternative}</p>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
