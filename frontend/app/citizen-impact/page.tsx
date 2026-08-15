"use client";
import { useMutation } from "@tanstack/react-query";
import { HeartHandshake, LoaderCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AppShell from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function CitizenImpactPage() {
  const { scenarioId } = useAppStore();

  const mutation = useMutation({
    mutationFn: async () => (await api.post("/api/citizen/analyze", { scenario_id: scenarioId })).data,
  });

  const data = mutation.data;
  const last = data?.yearly?.[data.yearly.length - 1];

  return (
    <AppShell title="Citizen Impact" subtitle="Public acceptance, happiness, health, and daily-life effects">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-ink-400 max-w-xl">Models how the scenario's interventions affect residents' daily lives over time.</p>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <HeartHandshake className="h-4 w-4" />}
          Analyze citizen impact
        </Button>
      </div>

      {last && (
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            ["Public acceptance", `${last.public_acceptance_pct}%`],
            ["Happiness index", last.happiness_index],
            ["Health impact", last.health_impact_index],
            ["Avg commute", `${last.avg_commute_minutes}m`],
            ["Electricity cost idx", last.electricity_cost_index],
            ["Policy adoption", `${last.policy_adoption_pct}%`],
          ].map(([label, value]) => (
            <Card key={label as string} className="!p-3 text-center">
              <p className="text-xs text-ink-500 mb-1">{label}</p>
              <p className="font-display text-xl stat-tick">{value}</p>
            </Card>
          ))}
        </div>
      )}

      {data && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <p className="text-sm text-ink-300 mb-4">Public acceptance & policy adoption</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.yearly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#163a2c" />
                <XAxis dataKey="year" stroke="#7d9a8c" fontSize={12} />
                <YAxis stroke="#7d9a8c" fontSize={12} />
                <Tooltip contentStyle={{ background: "#0b241c", border: "1px solid #163a2c", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="public_acceptance_pct" stroke="#34e0a1" name="Acceptance %" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="policy_adoption_pct" stroke="#57c8e8" name="Adoption %" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <p className="text-sm text-ink-300 mb-4">Happiness & health index</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.yearly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#163a2c" />
                <XAxis dataKey="year" stroke="#7d9a8c" fontSize={12} />
                <YAxis stroke="#7d9a8c" fontSize={12} />
                <Tooltip contentStyle={{ background: "#0b241c", border: "1px solid #163a2c", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="happiness_index" stroke="#f2b544" name="Happiness" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="health_impact_index" stroke="#ff6b5e" name="Health" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {!data && !mutation.isPending && (
        <Card className="text-center py-16">
          <p className="text-ink-400">Run the analysis to see citizen impact for this scenario.</p>
        </Card>
      )}
    </AppShell>
  );
}
