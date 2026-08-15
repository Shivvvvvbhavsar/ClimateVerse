"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, MessageSquareText, FileSliders, SlidersHorizontal, PlayCircle, Box,
  Users2, Columns3, Flame, Briefcase, LineChart, HeartHandshake, FileText, Settings, LogOut, Leaf,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { clsx } from "clsx";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/copilot", label: "AI Copilot", icon: MessageSquareText },
  { href: "/policy-designer", label: "Policy Designer", icon: FileSliders },
  { href: "/scenario", label: "Scenario Builder", icon: SlidersHorizontal },
  { href: "/simulation", label: "Simulation", icon: PlayCircle },
  { href: "/digital-twin", label: "Digital Twin", icon: Box },
  { href: "/debate", label: "AI Debate Room", icon: Users2 },
  { href: "/comparison", label: "Scenario Comparison", icon: Columns3 },
  { href: "/disasters", label: "Disaster Simulation", icon: Flame },
  { href: "/employment", label: "Employment Impact", icon: Briefcase },
  { href: "/economy", label: "Economy Impact", icon: LineChart },
  { href: "/citizen-impact", label: "Citizen Impact", icon: HeartHandshake },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAppStore();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-emerald-500/10 bg-base-900/60 px-4 py-6">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8">
        <Leaf className="h-6 w-6 text-emerald-400" />
        <span className="font-display text-lg tracking-tight">ClimateVerse</span>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active ? "bg-emerald-500/15 text-emerald-300" : "text-ink-300 hover:bg-base-800 hover:text-ink-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 border-t border-emerald-500/10 pt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-medium">
            {user?.full_name?.[0] || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm truncate">{user?.full_name || "User"}</p>
            <p className="text-xs text-ink-500 truncate">{user?.role || ""}</p>
          </div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="text-ink-500 hover:text-signal-coral"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
