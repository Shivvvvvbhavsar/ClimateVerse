"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, LoaderCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAppStore((s) => s.setAuth);
  const [email, setEmail] = useState("demo@climateverse.local");
  const [password, setPassword] = useState("ClimateVerse@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setAuth(data.user, data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-950 bg-grid-glow flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <Leaf className="h-6 w-6 text-emerald-400" />
          <span className="font-display text-xl">ClimateVerse</span>
        </Link>
        <div className="glass-panel rounded-2xl p-8">
          <h1 className="font-display text-2xl mb-1">Welcome back</h1>
          <p className="text-sm text-ink-400 mb-6">Log in to continue simulating Pune's future.</p>

          {error && (
            <div className="mb-4 rounded-lg border border-signal-coral/40 bg-signal-coral/10 px-4 py-2.5 text-sm text-signal-coral">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-ink-400 mb-1.5 block">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-base-800 border border-emerald-500/15 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/60"
              />
            </div>
            <div>
              <label className="text-xs text-ink-400 mb-1.5 block">Password</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-base-800 border border-emerald-500/15 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/60"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Log in"}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-emerald-500/15 bg-base-800/50 px-4 py-3 text-xs text-ink-400">
            <p className="mb-1 text-ink-300 font-medium">Demo account (pre-filled)</p>
            demo@climateverse.local / ClimateVerse@123
          </div>

          <p className="mt-6 text-center text-sm text-ink-400">
            Don't have an account? <Link href="/register" className="text-emerald-400 hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
