"""Employment, economic, and citizen impact calculators (demo models)."""
from typing import Dict, Any, List
from app.simulation import run_full_simulation, BASELINE


def analyze_employment(closures: List[Dict[str, Any]], expansions: List[Dict[str, Any]],
                        interventions: Dict[str, float] = None) -> Dict[str, Any]:
    """
    closures: [{"sector": "Coal Plant", "jobs": 5000}]
    expansions: [{"sector": "Solar", "jobs": 9000}]
    If none supplied, derive demo defaults from interventions.
    """
    if not closures and not expansions and interventions:
        solar = interventions.get("solar_expansion", 0)
        ev = interventions.get("ev_adoption", 0)
        coal_closure_jobs = int(2000 + 40 * solar)
        expansions = [
            {"sector": "Solar Installation & Maintenance", "jobs": int(3000 + 65 * solar)},
            {"sector": "EV Manufacturing & Charging Infra", "jobs": int(1500 + 45 * ev)},
            {"sector": "Green Building Trades", "jobs": int(1200 + 20 * solar)},
        ]
        closures = [{"sector": "Coal & Fossil Fuel Plants", "jobs": coal_closure_jobs}]

    jobs_lost = sum(c.get("jobs", 0) for c in closures)
    jobs_created = sum(e.get("jobs", 0) for e in expansions)
    net = jobs_created - jobs_lost

    skill_transition = [
        {"from_role": "Fossil fuel plant technician", "to_role": "Solar/wind technician",
         "retraining_weeks": 12},
        {"from_role": "Diesel vehicle mechanic", "to_role": "EV maintenance technician",
         "retraining_weeks": 8},
        {"from_role": "Manual construction labor", "to_role": "Green building certified labor",
         "retraining_weeks": 6},
    ]
    workforce_demand = {e["sector"]: e["jobs"] for e in expansions}

    return {
        "closures": closures,
        "expansions": expansions,
        "jobs_lost": jobs_lost,
        "jobs_created": jobs_created,
        "net_employment": net,
        "skill_transition": skill_transition,
        "workforce_demand": workforce_demand,
    }


def analyze_economy(interventions: Dict[str, float], start_year: int, end_year: int,
                     cost_crore: float) -> Dict[str, Any]:
    sim = run_full_simulation(start_year, end_year, interventions)
    yearly = []
    for s in sim:
        gdp = s["gdp_billion_usd"]
        investment = cost_crore / max(1, (end_year - start_year))
        revenue = gdp * 1000 * 0.02  # demo: 2% of GDP as climate-linked revenue
        tax = revenue * 0.18
        roi = ((gdp - BASELINE["gdp_billion_usd"]) * 1000 * 83) / max(1, cost_crore) * 100
        yearly.append({
            "year": s["year"],
            "gdp_billion_usd": gdp,
            "investment_crore": round(investment, 1),
            "revenue_crore": round(revenue, 1),
            "tax_crore": round(tax, 1),
            "roi_pct": round(min(500, max(-50, roi)), 1),
        })
    payback_years = next((y["year"] - start_year for y in yearly if y["roi_pct"] > 100), end_year - start_year)
    return {
        "yearly": yearly,
        "total_cost_crore": cost_crore,
        "payback_years": payback_years,
        "final_gdp_billion_usd": yearly[-1]["gdp_billion_usd"] if yearly else 0,
    }


def analyze_citizen(interventions: Dict[str, float], start_year: int, end_year: int,
                     implementation_difficulty: float = 40) -> Dict[str, Any]:
    sim = run_full_simulation(start_year, end_year, interventions)
    yearly = []
    base_acceptance = max(30, 95 - implementation_difficulty * 0.5)
    for i, s in enumerate(sim):
        progress = i / max(1, len(sim) - 1)
        acceptance = base_acceptance + progress * (100 - base_acceptance) * 0.3
        happiness = 55 + (s["green_cover_pct"] - BASELINE["green_cover_pct"]) * 0.8 \
            - (s["aqi"] - BASELINE["aqi"]) * 0.05
        health = 100 - s["aqi"] / 3
        commute = 42 - (s["ev_adoption_pct"] * 0.15)
        electricity_cost_index = 100 - s["renewable_pct"] * 0.3
        policy_adoption = min(100, acceptance + 10)
        yearly.append({
            "year": s["year"],
            "public_acceptance_pct": round(min(100, acceptance), 1),
            "happiness_index": round(max(0, min(100, happiness)), 1),
            "health_impact_index": round(max(0, min(100, health)), 1),
            "avg_commute_minutes": round(max(15, commute), 1),
            "electricity_cost_index": round(max(40, electricity_cost_index), 1),
            "policy_adoption_pct": round(policy_adoption, 1),
        })
    return {"yearly": yearly}
