"use client";
import { useMutation } from "@tanstack/react-query";
import { LineChart as LineIcon, LoaderCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AppShell from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function EconomyPage() {
  const { scenarioId } = useAppStore();

  const mutation = useMutation({
    mutationFn: async () => (await api.post("/api/economy/analyze", { scenario_id: scenarioId })).data,
  });

  const data = mutation.data;

  return (
    <AppShell title="Economic Impact" subtitle="GDP, investment, ROI, revenue, tax, and payback period">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-ink-400 max-w-xl">Projects economic outcomes of the current scenario's interventions over its full timeline.</p>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LineIcon className="h-4 w-4" />}
          Analyze economy
        </Button>
      </div>

      {data && (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Card className="!p-4">
              <p className="text-xs text-ink-500 mb-1">Final GDP</p>
              <p className="font-display text-2xl stat-tick">${data.final_gdp_billion_usd}B</p>
            </Card>
            <Card className="!p-4">
              <p className="text-xs text-ink-500 mb-1">Total cost</p>
              <p className="font-display text-2xl stat-tick">₹{data.total_cost_crore} cr</p>
            </Card>
            <Card className="!p-4">
              <p className="text-xs text-ink-500 mb-1">Payback period</p>
              <p className="font-display text-2xl stat-tick">{data.payback_years} yrs</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Card>
              <p className="text-sm text-ink-300 mb-4">GDP trajectory</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.yearly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#163a2c" />
                  <XAxis dataKey="year" stroke="#7d9a8c" fontSize={12} />
                  <YAxis stroke="#7d9a8c" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#0b241c", border: "1px solid #163a2c", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="gdp_billion_usd" stroke="#34e0a1" name="GDP ($B)" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <p className="text-sm text-ink-300 mb-4">ROI over time</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.yearly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#163a2c" />
                  <XAxis dataKey="year" stroke="#7d9a8c" fontSize={12} />
                  <YAxis stroke="#7d9a8c" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#0b241c", border: "1px solid #163a2c", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="roi_pct" stroke="#57c8e8" name="ROI %" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <p className="text-sm text-ink-300 mb-4">Revenue vs Tax (₹ crore)</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.yearly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#163a2c" />
                  <XAxis dataKey="year" stroke="#7d9a8c" fontSize={12} />
                  <YAxis stroke="#7d9a8c" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#0b241c", border: "1px solid #163a2c", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue_crore" stroke="#34e0a1" name="Revenue" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="tax_crore" stroke="#f2b544" name="Tax" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <p className="text-sm text-ink-300 mb-4">Investment (₹ crore / yr)</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.yearly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#163a2c" />
                  <XAxis dataKey="year" stroke="#7d9a8c" fontSize={12} />
                  <YAxis stroke="#7d9a8c" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#0b241c", border: "1px solid #163a2c", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="investment_crore" stroke="#ff6b5e" name="Investment" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {!data && !mutation.isPending && (
        <Card className="text-center py-16">
          <p className="text-ink-400">Run the analysis to see economic projections for this scenario.</p>
        </Card>
      )}
    </AppShell>
  );
}
