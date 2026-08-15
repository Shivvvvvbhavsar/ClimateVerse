import Link from "next/link";
import {
  Leaf, Bot, Box, PlayCircle, Columns3, LineChart, Briefcase, Target, FileText, ArrowRight,
  Sparkles, Users2, Flame, ShieldCheck,
} from "lucide-react";

const FEATURES = [
  { icon: Bot, title: "AI Climate Copilot", desc: "Describe a goal in plain language — \"carbon neutral by 2045\" — and ClimateVerse extracts the target, budget, and deadline automatically." },
  { icon: Target, title: "Policy Designer", desc: "Generates and ranks candidate climate policies across cost, CO2 reduction, jobs, ROI, and citizen acceptance." },
  { icon: PlayCircle, title: "2025 → 2050 Simulation", desc: "A transparent, year-by-year simulation engine models AQI, CO2, water, energy, and GDP with documented formulas." },
  { icon: Box, title: "Living Digital Twin", desc: "An interactive 3D city rendered from real data — buildings, roads, forests, rivers — that visibly evolves as policies take hold." },
  { icon: Users2, title: "Multi-Agent Debate Room", desc: "Ten specialist AI agents and a Coordinator debate trade-offs in structured, transparent reasoning." },
  { icon: Columns3, title: "Scenario Comparison", desc: "Compare policies side-by-side across environmental, economic, and social outcomes." },
  { icon: Flame, title: "Disaster Simulation", desc: "Model flood, heatwave, wildfire, and drought scenarios and see the city's resilience respond." },
  { icon: Briefcase, title: "Employment & Economic Impact", desc: "Quantify jobs lost and created, GDP effects, ROI, and payback periods for every strategy." },
  { icon: FileText, title: "Automated Reports", desc: "Generate Executive Summaries, ESG Reports, and Government Proposals as Markdown, HTML, or PDF." },
];

const STEPS = [
  { n: "01", title: "State a goal", desc: "Tell the Copilot your climate target, budget, and timeline for your city." },
  { n: "02", title: "Generate policies", desc: "ClimateVerse proposes and ranks multiple intervention strategies." },
  { n: "03", title: "Simulate & debate", desc: "Run the 2025–2050 simulation while AI agents evaluate trade-offs." },
  { n: "04", title: "Watch the twin evolve", desc: "See the 3D digital twin of the city transform year by year." },
  { n: "05", title: "Decide & report", desc: "Compare scenarios and export a decision-ready report." },
];

export default function LandingPage() {
  return (
    <div className="bg-base-950 text-ink-100 bg-grid-glow">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-emerald-500/10 bg-base-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-400" />
            <span className="font-display text-lg">ClimateVerse</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-ink-300">
            <a href="#features" className="hover:text-ink-100">Features</a>
            <a href="#agents" className="hover:text-ink-100">AI Agents</a>
            <a href="#twin" className="hover:text-ink-100">Digital Twin</a>
            <a href="#how" className="hover:text-ink-100">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-ink-300 hover:text-ink-100">Log in</Link>
            <Link href="/register" className="rounded-full bg-emerald-500 text-base-950 px-4 py-2 text-sm font-medium hover:bg-emerald-400 transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        <div className="animate-rise">
          <span className="eyebrow">Agentic climate decision intelligence</span>
          <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] mt-4 mb-6">
            Simulate today.
            <br />
            <span className="text-emerald-400">Protect tomorrow.</span>
          </h1>
          <p className="text-lg text-ink-300 max-w-xl mb-8">
            ClimateVerse is an agentic AI-powered living climate digital twin and decision
            intelligence platform. Define a goal, generate policies, simulate their impact
            from 2025 to 2050, and watch your city evolve in an interactive 3D twin.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-base-950 px-6 py-3 font-medium hover:bg-emerald-400 transition-colors">
              Explore Pune 2050 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 px-6 py-3 text-ink-100 hover:bg-emerald-500/10 transition-colors">
              Demo login
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            No API keys required — runs fully in demo mode on synthetic Pune data.
          </div>
        </div>

        <div className="relative">
          <div className="glass-panel rounded-3xl p-6 animate-rise" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="eyebrow">Live scenario · Pune Carbon Neutral 2045</span>
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulseSlow" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "CO2 by 2050", value: "10.3 Mt", change: "-28%" },
                { label: "AQI by 2050", value: "189", change: "-11%" },
                { label: "Renewable Energy", value: "48%", change: "+36pp" },
                { label: "Green Cover", value: "31%", change: "+10pp" },
                { label: "Jobs Created", value: "11,325", change: "net +7,525" },
                { label: "SDG Score", value: "41 / 100", change: "trending up" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-base-800/60 border border-emerald-500/10 p-4">
                  <p className="text-xs text-ink-500 mb-1">{s.label}</p>
                  <p className="text-2xl font-display stat-tick">{s.value}</p>
                  <p className="text-xs text-emerald-400 mt-1">{s.change}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 glass-panel rounded-2xl px-4 py-3 text-xs text-ink-300 hidden sm:block">
            ● DEMO DATA · transparent simplified models
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">
        <div>
          <span className="eyebrow">The problem</span>
          <h2 className="font-display text-3xl mt-3 mb-4">Climate policy is guesswork at city scale.</h2>
          <p className="text-ink-300">
            Planners juggle emissions targets, budgets, employment effects, and citizen
            sentiment with spreadsheets and static reports — with no way to see how a policy
            actually plays out over 25 years, or to compare trade-offs across dozens of
            interventions at once.
          </p>
        </div>
        <div>
          <span className="eyebrow">The solution</span>
          <h2 className="font-display text-3xl mt-3 mb-4">A living, simulated, explainable city.</h2>
          <p className="text-ink-300">
            ClimateVerse turns a stated goal into ranked policy options, runs a transparent
            year-by-year simulation, lets specialist AI agents debate trade-offs, and renders
            the outcome as an interactive 3D digital twin — so decisions are visible, not just numeric.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <span className="eyebrow">Platform</span>
        <h2 className="font-display text-3xl mt-3 mb-12">Everything a climate decision needs, in one place.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-panel rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
              <f.icon className="h-6 w-6 text-emerald-400 mb-4" />
              <h3 className="font-display text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-ink-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Agents */}
      <section id="agents" className="max-w-7xl mx-auto px-6 py-20">
        <span className="eyebrow">Multi-agent intelligence</span>
        <h2 className="font-display text-3xl mt-3 mb-6">Eleven specialist agents, one Coordinator.</h2>
        <p className="text-ink-300 max-w-2xl mb-10">
          Climate, Forest, Transport, Energy, Water, Industry, Citizen, Economy, Policy, and
          Disaster agents each evaluate a policy from their domain. The Coordinator resolves
          conflicts and produces a final, explainable recommendation.
        </p>
        <div className="flex flex-wrap gap-3">
          {["Climate", "Forest", "Transport", "Energy", "Water", "Industry", "Citizen", "Economy", "Policy", "Disaster", "Coordinator"].map((a) => (
            <span key={a} className="rounded-full border border-emerald-500/25 px-4 py-2 text-sm text-ink-200">{a} Agent</span>
          ))}
        </div>
      </section>

      {/* Digital Twin */}
      <section id="twin" className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="eyebrow">The living digital twin</span>
          <h2 className="font-display text-3xl mt-3 mb-4">Watch Pune transform, year by year.</h2>
          <p className="text-ink-300 mb-6">
            An interactive 3D city — buildings, roads, forests, the Mula-Mutha river, and
            industrial zones — generated from real scenario data. Scrub the timeline from 2025
            to 2050 and see solar panels appear, trees multiply, and EV fleets grow.
          </p>
          <ul className="space-y-2 text-sm text-ink-300">
            <li>→ Click any building, forest, or river for live metrics</li>
            <li>→ Toggle energy, transport, and green-cover layers</li>
            <li>→ Play, pause, rewind, or jump to any year</li>
          </ul>
        </div>
        <div className="glass-panel rounded-3xl aspect-video flex items-center justify-center">
          <Box className="h-16 w-16 text-emerald-500/50" />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-20">
        <span className="eyebrow">Workflow</span>
        <h2 className="font-display text-3xl mt-3 mb-12">From goal to decision in five steps.</h2>
        <div className="grid md:grid-cols-5 gap-6">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className="font-display text-3xl text-emerald-500/50">{s.n}</span>
              <h3 className="font-display text-lg mt-2 mb-2">{s.title}</h3>
              <p className="text-sm text-ink-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-4xl mb-4">Ready to simulate Pune's future?</h2>
        <p className="text-ink-300 mb-8">No API keys, no setup friction — log in with the demo account and explore.</p>
        <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-base-950 px-8 py-3.5 font-medium hover:bg-emerald-400 transition-colors">
          Get started free <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-6 text-xs text-ink-500">
          ClimateVerse demo simulations use transparent simplified models and synthetic data.
          This is a decision-support prototype, not a certified scientific forecasting system.
        </p>
      </section>

      <footer className="border-t border-emerald-500/10 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-500">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-emerald-500" /> ClimateVerse
          </div>
          <p>Simulate Today. Protect Tomorrow.</p>
        </div>
      </footer>
    </div>
  );
}
