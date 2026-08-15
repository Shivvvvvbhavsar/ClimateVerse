"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { LoaderCircle, Save } from "lucide-react";

const INTERVENTIONS = [
  { key: "tree_plantation", label: "Tree Plantation" },
  { key: "solar_expansion", label: "Solar Expansion" },
  { key: "ev_adoption", label: "EV Adoption" },
  { key: "carbon_tax", label: "Carbon Tax" },
  { key: "plastic_ban", label: "Plastic Ban" },
  { key: "rainwater_harvesting", label: "Rainwater Harvesting" },
  { key: "smart_irrigation", label: "Smart Irrigation" },
  { key: "green_buildings", label: "Green Buildings" },
  { key: "public_transport", label: "Public Transport" },
  { key: "smart_grid", label: "Smart Grid" },
  { key: "industrial_upgrades", label: "Industrial Upgrades" },
  { key: "wind_energy", label: "Wind Energy" },
  { key: "battery_storage", label: "Battery Storage" },
  { key: "metro_expansion", label: "Metro Expansion" },
];

export default function ScenarioBuilderPage() {
  const router = useRouter();
  const { cityId, scenarioId, setScenario } = useAppStore();
  const [name, setName] = useState("My Custom Scenario");
  const [goal, setGoal] = useState("Reduce carbon emissions");
  const [budget, setBudget] = useState(1000);
  const [startYear, setStartYear] = useState(2025);
  const [endYear, setEndYear] = useState(2050);
  const [popGrowth, setPopGrowth] = useState(1.2);
  const [interventions, setInterventions] = useState<Record<string, number>>(
    Object.fromEntries(INTERVENTIONS.map((i) => [i.key, 30]))
  );

  const { data: existing } = useQuery({
    queryKey: ["scenario", scenarioId],
    queryFn: async () => (await api.get(`/api/scenarios/${scenarioId}`)).data,
    enabled: !!scenarioId,
  });

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setGoal(existing.goal);
      setBudget(existing.budget_crore);
      setStartYear(existing.start_year);
      setEndYear(existing.end_year);
      if (existing.interventions && Object.keys(existing.interventions).length > 0) {
        setInterventions((prev) => ({ ...prev, ...existing.interventions }));
      }
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async () => (await api.post("/api/scenarios", {
      city_id: cityId, name, goal, target_pct: 40, budget_crore: budget,
      start_year: startYear, end_year: endYear, interventions, constraints: [],
    })).data,
    onSuccess: (data) => {
      setScenario(data.id);
      router.push("/policy-designer");
    },
  });

  return (
    <AppShell title="Scenario Builder" subtitle="Set interventions and parameters for a custom scenario">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <Card>
          <p className="text-sm text-ink-300 mb-4">Interventions (intensity 0–100)</p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
            {INTERVENTIONS.map((i) => (
              <div key={i.key}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-ink-200">{i.label}</span>
                  <span className="text-emerald-400 stat-tick">{interventions[i.key]}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={interventions[i.key]}
                  onChange={(e) => setInterventions((s) => ({ ...s, [i.key]: Number(e.target.value) }))}
                  className="w-full accent-emerald-500"
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <p className="text-sm text-ink-300 mb-4">Scenario details</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-ink-500 block mb-1">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg bg-base-800 border border-emerald-500/15 px-3 py-2 text-sm outline-none focus:border-emerald-500/60" />
              </div>
              <div>
                <label className="text-xs text-ink-500 block mb-1">Goal</label>
                <input value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full rounded-lg bg-base-800 border border-emerald-500/15 px-3 py-2 text-sm outline-none focus:border-emerald-500/60" />
              </div>
              <div>
                <label className="text-xs text-ink-500 block mb-1">Budget (₹ crore)</label>
                <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full rounded-lg bg-base-800 border border-emerald-500/15 px-3 py-2 text-sm outline-none focus:border-emerald-500/60" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-ink-500 block mb-1">Start year</label>
                  <input type="number" value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className="w-full rounded-lg bg-base-800 border border-emerald-500/15 px-3 py-2 text-sm outline-none focus:border-emerald-500/60" />
                </div>
                <div>
                  <label className="text-xs text-ink-500 block mb-1">End year</label>
                  <input type="number" value={endYear} onChange={(e) => setEndYear(Number(e.target.value))} className="w-full rounded-lg bg-base-800 border border-emerald-500/15 px-3 py-2 text-sm outline-none focus:border-emerald-500/60" />
                </div>
              </div>
              <div>
                <label className="text-xs text-ink-500 block mb-1">Population growth %/yr</label>
                <input type="number" step="0.1" value={popGrowth} onChange={(e) => setPopGrowth(Number(e.target.value))} className="w-full rounded-lg bg-base-800 border border-emerald-500/15 px-3 py-2 text-sm outline-none focus:border-emerald-500/60" />
              </div>
            </div>
          </Card>
          <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save & generate policies
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
