"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";

export default function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const router = useRouter();
  const { user, token, hydrate, cityId, scenarioId, policyId, setCity, setScenario, setPolicy } = useAppStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("cv_token") : null;
    if (!t) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        if (!cityId) {
          const { data: cities } = await api.get("/api/cities");
          if (cities[0]) setCity(cities[0].id);
        }
        if (!scenarioId) {
          const { data: scenarios } = await api.get("/api/scenarios");
          if (scenarios[0]) setScenario(scenarios[0].id);
        }
      } catch (e) {
        // handled by page-level error states
      }
    })();
  }, [ready, cityId, scenarioId, setCity, setScenario]);

  useEffect(() => {
    if (!ready || !scenarioId || policyId) return;
    (async () => {
      try {
        const { data: policies } = await api.get(`/api/policies/scenario/${scenarioId}`);
        if (policies[0]) setPolicy(policies[0].id);
      } catch (e) {}
    })();
  }, [ready, scenarioId, policyId, setPolicy]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-950 text-ink-300">
        Loading ClimateVerse…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-base-950 bg-grid-glow">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="px-4 sm:px-8 py-8 max-w-[1400px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
