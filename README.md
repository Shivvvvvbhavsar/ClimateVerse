# 🌍 ClimateVerse

**Simulate Today. Protect Tomorrow.**

An agentic AI-powered living climate digital twin & decision intelligence
platform. Define a climate goal, generate and rank policies, simulate their
impact from 2025 to 2050, watch specialist AI agents debate trade-offs, and
explore the outcome in an interactive 3D digital twin of Pune.

> **Runs fully offline / demo mode by default — no API keys required.**
> ClimateVerse ships with a complete synthetic ("DEMO DATA") dataset for
> Pune, Maharashtra, and deterministic rule-based AI agents. Everything
> works the moment you start it.

---

## Requirements

- **Windows 10/11** (macOS/Linux also work — see "Local development" below)
- **Docker Desktop** (recommended, easiest path), **or**
- **Python 3.11+** and **Node.js 18+** for the no-Docker fallback

---

## Quick start (Docker — recommended)

```bat
setup.bat
run.bat
```

Or manually:

```bash
docker compose up --build
```

Then open:

| Service      | URL                          |
|--------------|-------------------------------|
| Frontend     | http://localhost:3000        |
| Backend API  | http://localhost:8000        |
| Swagger docs | http://localhost:8000/docs   |

Stop everything with `stop.bat` or `docker compose down`.

### Demo login

```
Email:    demo@climateverse.local
Password: ClimateVerse@123
```

The demo account, Pune city data, and a fully-simulated "Pune Carbon Neutral
2045" scenario (with 8 ranked policies, agent outputs, a debate transcript,
and employment/economy/citizen impact data) are created automatically on
first startup — nothing to configure.

---

## Quick start (no Docker)

If Docker isn't available, `setup.bat` automatically falls back to a local
Python + Node setup. Manually:

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Then visit http://localhost:3000.

---

## What's inside

```
ClimateVerse/
├── frontend/          Next.js + TypeScript + Tailwind + Three.js app
├── backend/            FastAPI + SQLAlchemy + SQLite backend
├── database/            SQL schema reference (see below)
├── scripts/              PowerShell scripts, DB seed helper
├── docs/                   FORMULAS.md — documented simulation formulas
├── tests/                    (backend tests live in backend/tests)
├── docker-compose.yml
├── .env.example
├── setup.bat / run.bat / stop.bat
└── README.md
```

### Backend (`backend/`)

FastAPI + SQLAlchemy, with:
- 23 database tables (users, cities, districts, buildings, roads, forests,
  water bodies, industries, energy/transport systems, scenarios, policies,
  simulation runs/years, agent outputs, debates, disasters, employment /
  economic / citizen impacts, reports, data sources, audit logs).
- **SQLite by default** — zero external database setup. The schema is
  created automatically via SQLAlchemy `create_all()` on startup (see
  `database/schema.sql` for the reference DDL if you want to inspect the
  shape, or to port to PostgreSQL/PostGIS).
- A transparent, documented year-by-year **simulation engine**
  (`app/simulation.py`) — see `docs/FORMULAS.md`.
- A **policy generation & ranking engine** (`app/policy_engine.py`) using
  weighted multi-criteria scoring across 10 policy templates.
- A **rule-based, deterministic multi-agent system**
  (`app/agents.py`) — Climate, Forest, Transport, Energy, Water, Industry,
  Citizen, Economy, Policy, Disaster, and Coordinator agents, each producing
  structured JSON (recommendation, metrics, risks, confidence).
- A **disaster simulation engine** (flood, heatwave, wildfire, drought).
- **Employment / economic / citizen impact calculators**.
- A **report generator** producing Markdown, HTML, and PDF output across 8
  report templates (Executive Summary, ESG Report, Government Proposal, etc).
- A **demo climate copilot** (`app/copilot.py`) that parses natural-language
  goals ("Make Pune carbon neutral by 2045") into structured parameters using
  deterministic keyword/entity extraction — no LLM required.
- Automatic seeding of a complete Pune demo dataset on first startup
  (`app/seed.py`).

### Frontend (`frontend/`)

Next.js 14 (App Router) + TypeScript + Tailwind + TanStack Query + Framer
Motion + Three.js / React Three Fiber / Drei for the 3D digital twin +
Recharts for charts. Routes:

```
/                  Landing page
/login /register   Auth
/dashboard         KPI overview + charts + ranked policies
/copilot           AI Climate Copilot chat
/policy-designer   Generate & rank policies
/scenario          Interactive scenario builder (14 intervention sliders)
/simulation        Run + scrub the 2025–2050 simulation, explainability
/digital-twin      Interactive 3D city (Three.js), timeline playback
/debate            Multi-agent AI Debate Room
/comparison        Side-by-side / radar comparison of top policies
/disasters          Flood / heatwave / wildfire / drought simulation
/employment        Employment impact analyzer
/economy           Economic impact analyzer
/citizen-impact    Citizen impact analyzer
/reports           Generate & download Markdown/HTML/PDF reports
/settings          Account & demo-mode status
```

---

## Demo mode

`DEMO_MODE=true` (the default) means:

- All city data (Pune) is **clearly-labeled synthetic DEMO DATA** — you'll
  see a "● DEMO DATA" badge throughout the UI.
- The AI Copilot and all 11 agents use **deterministic, rule-based logic** —
  no OpenAI/Anthropic/etc. API key is called or required.
- The app **never crashes** due to a missing API key; `OPENAI_API_KEY` can
  be left blank indefinitely.

### Live mode (optional)

If you want to extend ClimateVerse with a real LLM for the Copilot or
agents, set `OPENAI_API_KEY` in `.env`. The current codebase ships with the
deterministic implementation only — `has_llm_key` is exposed via
`GET /api/config` so you can see whether a key is configured, but the
call-out logic itself is left as a documented extension point in
`app/copilot.py` and `app/agents.py` (the structured JSON contract is
identical either way, so swapping in a live model doesn't change any
frontend code).

---

## API

Full interactive documentation: **http://localhost:8000/docs**

Key endpoints:

```
POST /api/auth/register            POST /api/auth/login          GET /api/auth/me
GET  /api/cities                   GET  /api/cities/{id}
POST /api/copilot/analyze
POST /api/scenarios                GET  /api/scenarios           GET /api/scenarios/{id}
POST /api/policies/generate        POST /api/policies/optimize
GET  /api/policies/scenario/{id}   GET  /api/policies/{id}
POST /api/simulation/run           GET  /api/simulation/{id}     GET /api/simulation/{id}/year/{year}
POST /api/agents/run               POST /api/debate/run          GET /api/debate/{id}
GET  /api/dashboard/{scenario_id}
GET  /api/digital-twin/{city_id}?year=2040
POST /api/disasters/simulate       GET  /api/disasters/city/{city_id}
POST /api/employment/analyze
POST /api/economy/analyze
POST /api/citizen/analyze
POST /api/reports/generate         GET  /api/reports/{id}        GET /api/reports/{id}/download
GET  /health                       GET  /api/config
```

---

## Environment variables

See `.env.example` for the full list with inline comments. Everything has a
safe default — you do not need to create a `.env` file to run ClimateVerse.

| Variable | Default | Purpose |
|---|---|---|
| `DEMO_MODE` | `true` | Use synthetic data + deterministic agents |
| `DATABASE_URL` | `sqlite:///./climateverse.db` | Database connection string |
| `JWT_SECRET` | demo value | JWT signing secret (change for real deployments) |
| `OPENAI_API_KEY` | *(blank)* | Optional, for future live-LLM extension |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Frontend → backend URL |

---

## Testing

```bash
cd backend
.venv\Scripts\activate      # or: source .venv/bin/activate
pytest tests/ -v
```

`tests/test_demo_mode.py` explicitly verifies the platform works end-to-end
(auth, scenarios, policy generation/ranking, simulation, all 11 agents +
debate, disaster simulation, employment/economy/citizen analysis, and report
generation in all 3 formats) **with no API keys configured**.

---

## Data & accuracy

**ClimateVerse demo simulations use transparent simplified models and
synthetic data unless live datasets are configured. This is a
decision-support prototype, not a certified scientific forecasting system.**

All Pune geography, population, infrastructure, and climate figures are
procedurally generated demo data inspired by publicly known facts about
Pune (approximate population, districts, the Mula-Mutha river, etc.) — they
are not sourced from live sensors or official statistics. Every simulation
formula is documented in `docs/FORMULAS.md` so results are explainable, not
opaque.

---

## Troubleshooting

**Docker: "port already in use"** — another process is using 3000 or 8000.
Stop it, or edit the port mappings in `docker-compose.yml`.

**Backend fails to start locally** — make sure you're using Python 3.11+
and have activated the virtual environment before `pip install`.

**Frontend build fails on fonts** — the app uses system font stacks (no
Google Fonts network dependency), so this shouldn't occur; if you've
customized `app/layout.tsx` to use `next/font/google`, ensure you have
outbound internet access or revert to system fonts.

**"No API keys required" but I see a key warning** — that's expected and
informational only (`has_llm_key: false` in Settings); the app is fully
functional without any key.

**Resetting demo data** — delete `backend/climateverse.db` (or the
`climateverse_data` Docker volume) and restart; it will reseed automatically.

---

## License / attribution

This is a decision-support prototype built for demonstration purposes. City
geometry is procedurally generated demo data, not licensed GIS data.
