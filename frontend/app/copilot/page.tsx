"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User, LoaderCircle } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Card, Button } from "@/components/ui";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";

interface Msg { role: "user" | "assistant"; text: string; parsed?: any }

const SUGGESTIONS = [
  "Make Pune carbon neutral by 2045.",
  "Reduce AQI below 40 by 2040 with a budget of ₹1000 crore.",
  "Increase EV adoption and solar energy over the next 15 years.",
];

export default function CopilotPage() {
  const router = useRouter();
  const { cityId, setScenario } = useAppStore();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi! I'm the ClimateVerse Copilot (demo mode — deterministic parsing, no LLM key required). Tell me your climate goal for Pune, including a target, budget, or deadline if you have one." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/copilot/analyze", { message: text, city: "Pune" });
      setMessages((m) => [...m, { role: "assistant", text: data.reply, parsed: data }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, I couldn't reach the analysis service. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function createScenarioFromParsed(parsed: any) {
    if (!cityId) return;
    setLoading(true);
    try {
      const { data } = await api.post("/api/scenarios", {
        city_id: cityId,
        name: `${parsed.goal} (Copilot)`,
        goal: parsed.goal,
        target_pct: parsed.target,
        budget_crore: parsed.budget,
        start_year: 2025,
        end_year: parsed.deadline,
        interventions: {},
        constraints: parsed.constraints,
      });
      setScenario(data.id);
      router.push("/policy-designer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="AI Climate Copilot" subtitle="Describe a goal in plain language">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <Card className="flex flex-col h-[70vh]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-base-800" : "bg-emerald-500/20 text-emerald-300"}`}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm ${m.role === "user" ? "bg-base-800" : "bg-emerald-500/10 border border-emerald-500/15"}`}>
                  <p>{m.text}</p>
                  {m.parsed && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-base-900/60 rounded-lg px-2 py-1.5"><span className="text-ink-500">City</span><br />{m.parsed.city}</div>
                      <div className="bg-base-900/60 rounded-lg px-2 py-1.5"><span className="text-ink-500">Target</span><br />{m.parsed.target}%</div>
                      <div className="bg-base-900/60 rounded-lg px-2 py-1.5"><span className="text-ink-500">Budget</span><br />₹{m.parsed.budget} cr</div>
                      <div className="bg-base-900/60 rounded-lg px-2 py-1.5"><span className="text-ink-500">Deadline</span><br />{m.parsed.deadline}</div>
                      <Button className="col-span-2 mt-1 !py-1.5 !text-xs" onClick={() => createScenarioFromParsed(m.parsed)}>
                        Create scenario from this
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="flex items-center gap-2 text-ink-500 text-sm"><LoaderCircle className="h-4 w-4 animate-spin" /> Thinking…</div>}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="mt-4 flex items-center gap-2 border-t border-emerald-500/10 pt-4"
          >
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Make Pune carbon neutral by 2045 with a ₹1000 crore budget"
              className="flex-1 rounded-full bg-base-800 border border-emerald-500/15 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/60"
            />
            <button type="submit" className="h-10 w-10 rounded-full bg-emerald-500 text-base-950 flex items-center justify-center hover:bg-emerald-400">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </Card>

        <Card>
          <p className="text-sm text-ink-300 mb-3">Try asking</p>
          <div className="space-y-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="w-full text-left text-sm rounded-xl bg-base-800/60 hover:bg-base-800 px-3 py-2.5 text-ink-300">
                {s}
              </button>
            ))}
          </div>
          <p className="mt-6 text-xs text-ink-500">
            The Copilot uses deterministic keyword/entity extraction in demo mode — no external
            LLM API key required. It detects city, goal, target, budget, deadline, and constraints.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
