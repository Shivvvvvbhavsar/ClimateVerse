"use client";
import { useQuery } from "@tanstack/react-query";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import AppShell from "@/components/AppShell";
import { Card } from "@/components/ui";
import { Skeleton, ErrorState } from "@/components/Kpi";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function ComparisonPage() {
  const { scenarioId } = useAppStore();

  const { data: policies, isLoading, isError, refetch } = useQuery({
    queryKey: ["policies-compare", scenarioId],
    queryFn: async () => (await api.get(`/api/policies/scenario/${scenarioId}`)).data,
    enabled: !!scenarioId,
  });

  const top3 = policies?.slice(0, 3) || [];

  const radarData = [
    "co2_reduction_pct", "renewable_pct", "green_cover_pct", "citizen_acceptance",
    "disaster_resilience", "roi_pct",
  ].map((metric) => {
    const row: any = { metric: metric.replace(/_/g, " ").replace("pct", "%") };
    top3.forEach((p: any) => { row[p.name] = Math.min(100, p[metric]); });
    return row;
  });

  const colors = ["#34e0a1", "#57c8e8", "#f2b544"];

  return (
    <AppShell title="Scenario Comparison" subtitle="Compare top-ranked policies side by side">
      {isLoading && <Skeleton className="h-96 w-full" />}
      {isError && <ErrorState message="Couldn't load policies to compare." onRetry={() => refetch()} />}

      {top3.length > 0 && (
        <>
          <Card className="mb-6">
            <p className="text-sm text-ink-300 mb-4">Multi-criteria radar comparison</p>
            <ResponsiveContainer width="100%" height={380}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#163a2c" />
                <PolarAngleAxis dataKey="metric" stroke="#7d9a8c" fontSize={11} />
                <PolarRadiusAxis stroke="#163a2c" />
                {top3.map((p: any, i: number) => (
                  <Radar key={p.id} name={p.name} dataKey={p.name} stroke={colors[i]} fill={colors[i]} fillOpacity={0.15} />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-500 border-b border-emerald-500/10">
                    <th className="py-2 pr-4">Metric</th>
                    {top3.map((p: any) => <th key={p.id} className="py-2 pr-4">{p.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Cost (₹cr)", "cost_crore"], ["CO2 Reduction", "co2_reduction_pct", "%"],
                    ["AQI Impact", "aqi_impact"], ["Water Impact", "water_impact_pct", "%"],
                    ["Jobs Created", "jobs_created"], ["GDP Impact", "gdp_impact_pct", "%"],
                    ["ROI", "roi_pct", "%"], ["Renewable Energy", "renewable_pct", "%"],
                    ["Green Cover", "green_cover_pct", "%"], ["Citizen Acceptance", "citizen_acceptance", "%"],
                    ["Disaster Resilience", "disaster_resilience", "/100"], ["Score", "score"],
                  ].map(([label, key, unit]) => (
                    <tr key={key} className="border-b border-emerald-500/5">
                      <td className="py-2 pr-4 text-ink-400">{label}</td>
                      {top3.map((p: any) => <td key={p.id} className="py-2 pr-4">{p[key as string]}{unit || ""}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {policies?.length === 0 && (
        <Card className="text-center py-10">
          <p className="text-ink-400">No policies to compare yet. Generate policies from the Policy Designer.</p>
        </Card>
      )}
    </AppShell>
  );
}
