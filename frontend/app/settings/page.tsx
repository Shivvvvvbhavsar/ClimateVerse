"use client";
import { useQuery } from "@tanstack/react-query";
import AppShell from "@/components/AppShell";
import { Card } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user } = useAppStore();
  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: async () => (await api.get("/api/config")).data,
  });

  return (
    <AppShell title="Settings" subtitle="Account and platform configuration">
      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <p className="text-sm text-ink-300 mb-4">Account</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-500">Name</span><span>{user?.full_name}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Email</span><span>{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Role</span><span>{user?.role}</span></div>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-ink-300 mb-4">Platform mode</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500">Demo mode</span>
              <span className={config?.demo_mode ? "text-emerald-400" : "text-signal-coral"}>{config?.demo_mode ? "Enabled" : "Disabled"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">LLM API key configured</span>
              <span className={config?.has_llm_key ? "text-emerald-400" : "text-ink-400"}>{config?.has_llm_key ? "Yes" : "No (using deterministic agents)"}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-ink-500">
            ClimateVerse demo simulations use transparent simplified models and synthetic data
            for Pune unless live datasets are configured. This is a decision-support prototype,
            not a certified scientific forecasting system.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
