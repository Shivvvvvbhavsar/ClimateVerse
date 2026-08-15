"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, Rewind, FastForward, SkipBack } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { Skeleton, ErrorState } from "@/components/Kpi";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

const DigitalTwinScene = dynamic(() => import("@/components/DigitalTwinScene"), { ssr: false });

const YEARS = [2025, 2030, 2035, 2040, 2045, 2050];

export default function DigitalTwinPage() {
  const { cityId, currentYear, setYear } = useAppStore();
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["digital-twin", cityId, currentYear],
    queryFn: async () => (await api.get(`/api/digital-twin/${cityId}`, { params: { year: currentYear } })).data,
    enabled: !!cityId,
  });

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setYear(currentYear >= 2050 ? 2025 : currentYear + 1);
      }, 900);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, currentYear]);

  return (
    <AppShell title="Living Digital Twin" subtitle="Interactive 3D city, generated from scenario data">
      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setYear(2025)}><SkipBack className="h-4 w-4" /></Button>
            <Button variant="ghost" onClick={() => setYear(Math.max(2025, currentYear - 1))}><Rewind className="h-4 w-4" /></Button>
            <Button onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Pause" : "Play"}
            </Button>
            <Button variant="ghost" onClick={() => setYear(Math.min(2050, currentYear + 1))}><FastForward className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-2">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${currentYear === y ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300" : "border-emerald-500/10 text-ink-400 hover:bg-base-800"}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <input
          type="range" min={2025} max={2050} value={currentYear}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full accent-emerald-500 mt-4"
        />
      </Card>

      {isLoading && <Skeleton className="h-[60vh] w-full" />}
      {isError && <ErrorState message="Couldn't load the digital twin." onRetry={() => refetch()} />}

      {data && (
        <div className="grid lg:grid-cols-[1fr_280px] gap-5">
          <Card className="!p-0 overflow-hidden h-[65vh]">
            <DigitalTwinScene data={data} />
          </Card>
          <div className="space-y-4">
            <Card>
              <p className="text-sm text-ink-300 mb-3">City state — {currentYear}</p>
              <div className="space-y-2 text-xs text-ink-400">
                <div className="flex justify-between"><span>Buildings</span><span className="text-ink-200">{data.buildings.length}</span></div>
                <div className="flex justify-between"><span>Roads / Metro</span><span className="text-ink-200">{data.roads.length}</span></div>
                <div className="flex justify-between"><span>Forest patches</span><span className="text-ink-200">{data.forests.length}</span></div>
                <div className="flex justify-between"><span>Total trees</span><span className="text-ink-200">{data.forests.reduce((a: number, f: any) => a + f.tree_count, 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Water bodies</span><span className="text-ink-200">{data.water_bodies.length}</span></div>
                <div className="flex justify-between"><span>Industries</span><span className="text-ink-200">{data.industries.length}</span></div>
                <div className="flex justify-between"><span>EV fleet size</span><span className="text-ink-200">{data.transport_systems.find((t: any) => t.mode === "ev")?.fleet_size?.toLocaleString()}</span></div>
              </div>
            </Card>
            <Card>
              <p className="text-sm text-ink-300 mb-2">How to explore</p>
              <ul className="text-xs text-ink-400 space-y-1.5">
                <li>→ Drag to orbit, scroll to zoom</li>
                <li>→ Use Play to animate 2025 → 2050</li>
                <li>→ Jump to a year with the chips above</li>
                <li>→ Solar roofs, tree density, and EV fleet grow as the timeline advances</li>
              </ul>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
