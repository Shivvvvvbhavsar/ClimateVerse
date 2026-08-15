from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app import models
from app.routers import auth, cities, copilot, scenarios, policies, simulation, agents, dashboard, digital_twin
from app.routers.misc import disasters_router, employment_router, economy_router, citizen_router, reports_router

app = FastAPI(
    title="ClimateVerse API",
    description="Agentic AI-Powered Living Climate Digital Twin & Decision Intelligence Platform. "
                 "DEMO_MODE uses synthetic Pune data and deterministic rule-based agents — no external "
                 "API keys required.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    try:
        from app.seed import seed
        seed()
    except Exception as e:
        print(f"Seed skipped/failed (may already exist): {e}")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/config")
def config():
    return {"demo_mode": settings.DEMO_MODE, "app_name": settings.APP_NAME,
            "has_llm_key": bool(settings.OPENAI_API_KEY)}


app.include_router(auth.router)
app.include_router(cities.router)
app.include_router(copilot.router)
app.include_router(scenarios.router)
app.include_router(policies.router)
app.include_router(simulation.router)
app.include_router(agents.router)
app.include_router(agents.debate_router)
app.include_router(dashboard.router)
app.include_router(digital_twin.router)
app.include_router(disasters_router)
app.include_router(employment_router)
app.include_router(economy_router)
app.include_router(citizen_router)
app.include_router(reports_router)
