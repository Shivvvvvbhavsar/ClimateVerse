"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PlayCircle, LoaderCircle } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { useAppStore, } from "@/lib/store";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function SimulationPage() {
  const { scenarioId, policyId, currentYear, setYear } = useAppStore();
  const [years, setYears] = useState<any[]>([]);

  const runMutation = useMutation({
    mutationFn: async () => (await api.post("/api/simulation/run", { scenario_id: scenarioId, policy_id: policyId })).data,
    onSuccess: (data) => { setYears(data.years); setYear(data.years[0]?.year || 2025); },
  });

  const selectedYearData = years.find((y) => y.year === currentYear) || years[years.length - 1];

  return (
    <AppShell title="Simulation" subtitle="2025 → 2050 year-by-year climate simulation">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-ink-400 max-w-xl">
          Runs the selected policy's interventions through ClimateVerse's transparent
          simulation engine across the full timeline, backed by documented formulas.
        </p>
        <Button onClick={() => runMutation.mutate()} disabled={runMutation.isPending || !scenarioId}>
          {runMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
          Run simulation
        </Button>
      </div>

      {years.length > 0 && (
        <>
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-ink-300">Timeline scrubber</p>
              <span className="text-emerald-400 font-display text-lg stat-tick">{currentYear}</span>
            </div>
            <input
              type="range" min={years[0].year} max={years[years.length - 1].year}
              value={currentYear} onChange={(e) => setYear(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-ink-500 mt-1">
              <span>{years[0].year}</span><span>{years[years.length - 1].year}</span>
            </div>
          </Card>

          {selectedYearData && (
            <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {[
                ["AQI", selectedYearData.aqi],
                ["CO2 (Mt)", selectedYearData.co2_mt],
                ["Temp (°C)", selectedYearData.temperature_c],
                ["Water %", selectedYearData.water_availability_pct],
                ["Green %", selectedYearData.green_cover_pct],
                ["Renewable %", selectedYearData.renewable_pct],
              ].map(([label, value]) => (
                <Card key={label as string} className="!p-3 text-center">
                  <p className="text-xs text-ink-500 mb-1">{label}</p>
                  <p className="font-display text-xl stat-tick">{value as number}</p>
                </Card>
              ))}
            </div>
          )}

          {selectedYearData?.explanation && (
            <Card className="mb-6">
              <p className="text-sm text-ink-300 mb-3">Why these numbers? (explainable AI)</p>
              <div className="grid sm:grid-cols-2 gap-3 text-xs text-ink-400">
                {Object.entries(selectedYearData.explanation).map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-base-800/50 px-3 py-2">
                    <span className="text-emerald-400 uppercase text-[10px] tracking-wider">{k.replace("_", " ")}</span>
                    <p className="mt-1">{v as string}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-5">
            <Card>
              <p className="text-sm text-ink-300 mb-4">CO2 & AQI trajectory</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={years}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#163a2c" />
                  <XAxis dataKey="year" stroke="#7d9a8c" fontSize={12} />
                  <YAxis stroke="#7d9a8c" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#0b241c", border: "1px solid #163a2c", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="co2_mt" stroke="#ff6b5e" name="CO2 (Mt)" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="aqi" stroke="#f2b544" name="AQI" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <p className="text-sm text-ink-300 mb-4">SDG & Sustainability score</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={years}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#163a2c" />
                  <XAxis dataKey="year" stroke="#7d9a8c" fontSize={12} />
                  <YAxis stroke="#7d9a8c" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#0b241c", border: "1px solid #163a2c", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="sdg_score" stroke="#34e0a1" name="SDG Score" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="sustainability_score" stroke="#57c8e8" name="Sustainability" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {years.length === 0 && !runMutation.isPending && (
        <Card className="text-center py-12">
          <p className="text-ink-400 mb-4">No simulation results yet. Run the simulation to see the 2025–2050 trajectory.</p>
          <Button onClick={() => runMutation.mutate()}>Run simulation</Button>
        </Card>
      )}
    </AppShell>
  );
}
