import { clsx } from "clsx";
import { ButtonHTMLAttributes, HTMLAttributes } from "react";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && "bg-emerald-500 text-base-950 hover:bg-emerald-400 shadow-[0_0_0_1px_rgba(52,224,161,0.4)] hover:shadow-[0_0_20px_rgba(52,224,161,0.35)]",
        variant === "outline" && "border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10",
        variant === "ghost" && "text-ink-300 hover:text-ink-100 hover:bg-base-800",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("glass-panel rounded-2xl p-5", className)} {...props} />;
}

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", className)}>
      {children}
    </span>
  );
}

export function DemoDataBadge({ className }: { className?: string }) {
  return <Badge className={clsx("demo-badge", className)}>● DEMO DATA</Badge>;
}
