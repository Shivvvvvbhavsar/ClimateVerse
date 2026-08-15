"use client";
import { DemoDataBadge } from "./ui";
import { useAppStore } from "@/lib/store";
import { Menu } from "lucide-react";

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { currentYear } = useAppStore();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-emerald-500/10 bg-base-950/80 backdrop-blur px-4 sm:px-8 py-4">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-ink-300"><Menu className="h-5 w-5" /></button>
        <div>
          <h1 className="font-display text-xl sm:text-2xl leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center rounded-full border border-emerald-500/20 px-3 py-1 text-xs text-ink-300">
          Pune, India
        </span>
        <span className="hidden sm:inline-flex items-center rounded-full border border-emerald-500/20 px-3 py-1 text-xs text-ink-300 stat-tick">
          Year {currentYear}
        </span>
        <DemoDataBadge />
      </div>
    </header>
  );
}
