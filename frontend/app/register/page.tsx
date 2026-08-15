"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, LoaderCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui";

const ROLES = ["User", "Researcher", "Planner", "Administrator"];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAppStore((s) => s.setAuth);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Planner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/register", { email, password, full_name: fullName, role });
      setAuth(data.user, data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-950 bg-grid-glow flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <Leaf className="h-6 w-6 text-emerald-400" />
          <span className="font-display text-xl">ClimateVerse</span>
        </Link>
        <div className="glass-panel rounded-2xl p-8">
          <h1 className="font-display text-2xl mb-1">Create your account</h1>
          <p className="text-sm text-ink-400 mb-6">Start simulating climate policy for Pune.</p>

          {error && (
            <div className="mb-4 rounded-lg border border-signal-coral/40 bg-signal-coral/10 px-4 py-2.5 text-sm text-signal-coral">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-ink-400 mb-1.5 block">Full name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl bg-base-800 border border-emerald-500/15 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/60" />
            </div>
            <div>
              <label className="text-xs text-ink-400 mb-1.5 block">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-base-800 border border-emerald-500/15 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/60" />
            </div>
            <div>
              <label className="text-xs text-ink-400 mb-1.5 block">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-base-800 border border-emerald-500/15 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/60" />
            </div>
            <div>
              <label className="text-xs text-ink-400 mb-1.5 block">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl bg-base-800 border border-emerald-500/15 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/60">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-400">
            Already have an account? <Link href="/login" className="text-emerald-400 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
