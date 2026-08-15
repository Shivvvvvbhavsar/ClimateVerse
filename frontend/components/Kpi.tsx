import { clsx } from "clsx";
import { LucideIcon } from "lucide-react";
import { Card } from "./ui";

export function KpiCard({ label, value, unit, change, icon: Icon, positive }: {
  label: string; value: string | number; unit?: string; change?: string; icon?: LucideIcon; positive?: boolean;
}) {
  return (
    <Card className="!p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-ink-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-emerald-500/70" />}
      </div>
      <p className="font-display text-2xl stat-tick">
        {value}<span className="text-sm text-ink-500 ml-1">{unit}</span>
      </p>
      {change && (
        <p className={clsx("text-xs mt-1", positive ? "text-emerald-400" : "text-signal-amber")}>{change}</p>
      )}
    </Card>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse bg-base-800 rounded-xl", className)} />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="text-center py-10">
      <p className="text-signal-coral mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-emerald-400 hover:underline">Retry</button>
      )}
    </Card>
  );
}
