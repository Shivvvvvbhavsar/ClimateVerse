"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { KpiCard, Skeleton, ErrorState } from "@/components/Kpi";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Wind, Thermometer, Droplets, Leaf, Zap, Users, DollarSign, Award, Rocket } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { scenarioId } = useAppStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", scenarioId],
    queryFn: async () => (await api.get(`/api/dashboard/${scenarioId}`)).data,
    enabled: !!scenarioId,
  });

  return (
    <AppShell title="Dashboard" subtitle="Pune Carbon Neutral 2045 — overview">
      {isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      )}

      {isError && <ErrorState message="Couldn't load the dashboard. Is the backend running?" onRetry={() => refetch()} />}

      {data && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl">{data.scenario?.name}</h2>
              <p className="text-sm text-ink-400">
                Goal: {data.scenario?.goal} · Budget ₹{data.scenario?.budget_crore} crore · {data.scenario?.start_year}–{data.scenario?.end_year}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/simulation")}>View simulation</Button>
              <Button onClick={() => router.push("/digital-twin")}>Explore Pune 2050 <Rocket className="h-4 w-4" /></Button>
            </div>
          </div>

          {data.kpi && Object.keys(data.kpi).length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard label="AQI (final year)" value={data.kpi.aqi} icon={Wind} change={`${data.kpi.aqi_change_pct}% vs 2025`} positive={data.kpi.aqi_change_pct > 0} />
              <KpiCard label="CO2 (final year)" value={data.kpi.co2_mt} unit="Mt" icon={Thermometer} change={`${data.kpi.co2_change_pct}% vs 2025`} positive={data.kpi.co2_change_pct > 0} />
              <KpiCard label="Temperature" value={data.kpi.temperature_c} unit="°C" icon={Thermometer} />
              <KpiCard label="Green Cover" value={data.kpi.green_cover_pct} unit="%" icon={Leaf} positive />
              <KpiCard label="Renewable Energy" value={data.kpi.renewable_pct} unit="%" icon={Zap} positive />
              <KpiCard label="Water Availability" value={data.kpi.water_availability_pct} unit="%" icon={Droplets} />
              <KpiCard label="Population" value={(data.kpi.population / 1e6).toFixed(2)} unit="M" icon={Users} />
              <KpiCard label="GDP" value={data.kpi.gdp_billion_usd} unit="$B" icon={DollarSign} positive />
              <KpiCard label="Employment Index" value={data.kpi.employment_index} icon={Users} positive />
              <KpiCard label="Sustainability Score" value={data.kpi.sustainability_score} unit="/100" icon={Award} positive />
              <KpiCard label="SDG Score" value={data.kpi.sdg_score} unit="/100" icon={Award} positive />
            </div>
          ) : (
            <Card className="mb-8 text-center py-8">
              <p className="text-ink-400 mb-3">No simulation has been run for this scenario yet.</p>
              <Button onClick={() => router.push("/simulation")}>Run simulation</Button>
            </Card>
          )}

          {data.timeline?.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-5 mb-8">
              <Card>
                <p className="text-sm text-ink-300 mb-4">CO2 & AQI over time</p>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.timeline}>
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
                <p className="text-sm text-ink-300 mb-4">Green cover & renewable energy</p>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#163a2c" />
                    <XAxis dataKey="year" stroke="#7d9a8c" fontSize={12} />
                    <YAxis stroke="#7d9a8c" fontSize={12} />
                    <Tooltip contentStyle={{ background: "#0b241c", border: "1px solid #163a2c", borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="green_cover_pct" stroke="#34e0a1" name="Green Cover %" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="renewable_pct" stroke="#57c8e8" name="Renewable %" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <p className="text-sm text-ink-300 mb-4">GDP growth</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#163a2c" />
                    <XAxis dataKey="year" stroke="#7d9a8c" fontSize={12} />
                    <YAxis stroke="#7d9a8c" fontSize={12} />
                    <Tooltip contentStyle={{ background: "#0b241c", border: "1px solid #163a2c", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="gdp_billion_usd" stroke="#34e0a1" name="GDP ($B)" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <p className="text-sm text-ink-300 mb-4">SDG score progression</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#163a2c" />
                    <XAxis dataKey="year" stroke="#7d9a8c" fontSize={12} />
                    <YAxis stroke="#7d9a8c" fontSize={12} />
                    <Tooltip contentStyle={{ background: "#0b241c", border: "1px solid #163a2c", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="sdg_score" stroke="#f2b544" name="SDG Score" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {data.policies?.length > 0 && (
            <Card>
              <p className="text-sm text-ink-300 mb-4">Ranked policies for this scenario</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-ink-500 border-b border-emerald-500/10">
                      <th className="py-2 pr-4">Rank</th>
                      <th className="py-2 pr-4">Policy</th>
                      <th className="py-2 pr-4">Cost (₹cr)</th>
                      <th className="py-2 pr-4">CO2 Reduction</th>
                      <th className="py-2 pr-4">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.policies.map((p: any) => (
                      <tr key={p.id} className="border-b border-emerald-500/5">
                        <td className="py-2 pr-4">#{p.rank}</td>
                        <td className="py-2 pr-4">{p.name}</td>
                        <td className="py-2 pr-4">{p.cost_crore}</td>
                        <td className="py-2 pr-4">{p.co2_reduction_pct}%</td>
                        <td className="py-2 pr-4 text-emerald-400">{p.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </AppShell>
  );
}
