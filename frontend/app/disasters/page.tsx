"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Flame, Droplets, Sun, CloudRain, LoaderCircle, AlertTriangle } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

const DISASTERS = [
  { key: "flood", label: "Flood", icon: Droplets, color: "#57c8e8" },
  { key: "heatwave", label: "Heatwave", icon: Sun, color: "#f2b544" },
  { key: "wildfire", label: "Wildfire", icon: Flame, color: "#ff6b5e" },
  { key: "drought", label: "Drought", icon: CloudRain, color: "#f2b544" },
];

export default function DisastersPage() {
  const { cityId } = useAppStore();
  const [disasterType, setDisasterType] = useState("flood");
  const [year, setYear] = useState(2032);
  const [severity, setSeverity] = useState(0.5);

  const simMutation = useMutation({
    mutationFn: async () => (await api.post("/api/disasters/simulate", {
      city_id: cityId, disaster_type: disasterType, year, severity,
    })).data,
  });

  const data = simMutation.data;

  return (
    <AppShell title="Disaster Simulation" subtitle="Model flood, heatwave, wildfire, and drought scenarios">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <Card>
          <p className="text-sm text-ink-300 mb-4">Configure scenario</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {DISASTERS.map((d) => (
              <button
                key={d.key} onClick={() => setDisasterType(d.key)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs transition-colors ${disasterType === d.key ? "border-emerald-500/50 bg-emerald-500/10" : "border-emerald-500/10 hover:bg-base-800"}`}
              >
                <d.icon className="h-5 w-5" style={{ color: d.color }} />
                {d.label}
              </button>
            ))}
          </div>
          <div className="mb-4">
            <label className="text-xs text-ink-500 block mb-1">Year</label>
            <input type="number" min={2025} max={2050} value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-lg bg-base-800 border border-emerald-500/15 px-3 py-2 text-sm outline-none focus:border-emerald-500/60" />
          </div>
          <div className="mb-6">
            <div className="flex justify-between text-xs mb-1">
              <label className="text-ink-500">Severity</label>
              <span className="text-emerald-400">{Math.round(severity * 100)}%</span>
            </div>
            <input type="range" min={0.1} max={1} step={0.05} value={severity} onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full accent-emerald-500" />
          </div>
          <Button className="w-full" onClick={() => simMutation.mutate()} disabled={simMutation.isPending}>
            {simMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
            Run disaster simulation
          </Button>
        </Card>

        <div className="space-y-5">
          {!data && !simMutation.isPending && (
            <Card className="text-center py-16">
              <p className="text-ink-400">Configure and run a disaster scenario to see its impact.</p>
            </Card>
          )}

          {data && (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="!p-4">
                  <p className="text-xs text-ink-500 mb-1">Affected population</p>
                  <p className="font-display text-2xl stat-tick">{data.affected_population.toLocaleString()}</p>
                </Card>
                <Card className="!p-4">
                  <p className="text-xs text-ink-500 mb-1">Affected buildings</p>
                  <p className="font-display text-2xl stat-tick">{data.affected_buildings.toLocaleString()}</p>
                </Card>
                <Card className="!p-4">
                  <p className="text-xs text-ink-500 mb-1">Economic loss</p>
                  <p className="font-display text-2xl stat-tick">₹{data.economic_loss_crore} cr</p>
                </Card>
              </div>

              <Card>
                <p className="text-sm text-ink-300 mb-4">Event timeline</p>
                <div className="space-y-3">
                  {data.timeline.map((t: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-signal-coral mt-1.5 shrink-0" />
                      <p className="text-sm text-ink-300">{t}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border border-emerald-500/25">
                <p className="eyebrow mb-2">AI recommendation</p>
                <p className="text-sm text-ink-200">{data.ai_recommendation}</p>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
