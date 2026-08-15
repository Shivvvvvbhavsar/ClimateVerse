"""
Policy generation & ranking engine.

Generates a set of candidate policy "mixes" (combinations of intervention
intensities), evaluates each with the simulation engine, computes cost/impact
metrics via transparent formulas, then ranks candidates using a weighted
multi-criteria score (a simplified stand-in for full OR-Tools constrained
optimization — documented in docs/FORMULAS.md).
"""
import itertools
from typing import Dict, Any, List
from app.simulation import run_full_simulation, BASELINE

# Cost per intensity-point (crore) and jobs per intensity-point for each intervention (demo estimates)
INTERVENTION_PROFILES = {
    "tree_plantation":       {"cost_per_pt": 2.2, "jobs_per_pt": 45, "difficulty": 0.2},
    "solar_expansion":       {"cost_per_pt": 6.5, "jobs_per_pt": 60, "difficulty": 0.4},
    "ev_adoption":           {"cost_per_pt": 5.0, "jobs_per_pt": 35, "difficulty": 0.45},
    "carbon_tax":            {"cost_per_pt": 0.5, "jobs_per_pt": -5, "difficulty": 0.6},
    "plastic_ban":           {"cost_per_pt": 0.8, "jobs_per_pt": 8,  "difficulty": 0.3},
    "rainwater_harvesting":  {"cost_per_pt": 1.5, "jobs_per_pt": 20, "difficulty": 0.25},
    "smart_irrigation":      {"cost_per_pt": 1.8, "jobs_per_pt": 15, "difficulty": 0.3},
    "green_buildings":       {"cost_per_pt": 4.0, "jobs_per_pt": 40, "difficulty": 0.5},
    "public_transport":      {"cost_per_pt": 5.5, "jobs_per_pt": 55, "difficulty": 0.45},
    "smart_grid":            {"cost_per_pt": 3.8, "jobs_per_pt": 25, "difficulty": 0.5},
    "industrial_upgrades":   {"cost_per_pt": 6.0, "jobs_per_pt": 18, "difficulty": 0.65},
    "wind_energy":           {"cost_per_pt": 5.8, "jobs_per_pt": 28, "difficulty": 0.55},
    "battery_storage":       {"cost_per_pt": 4.5, "jobs_per_pt": 22, "difficulty": 0.5},
    "metro_expansion":       {"cost_per_pt": 9.0, "jobs_per_pt": 70, "difficulty": 0.7},
}

POLICY_TEMPLATES = [
    {"name": "Solar + EV + Metro + Trees", "mix": {
        "solar_expansion": 70, "ev_adoption": 65, "metro_expansion": 50, "tree_plantation": 60}},
    {"name": "Public Transport + Carbon Tax", "mix": {
        "public_transport": 75, "carbon_tax": 60, "smart_grid": 30}},
    {"name": "Solar + Green Buildings + EV", "mix": {
        "solar_expansion": 65, "green_buildings": 55, "ev_adoption": 50}},
    {"name": "Tree Plantation + Smart Irrigation", "mix": {
        "tree_plantation": 80, "smart_irrigation": 55, "rainwater_harvesting": 50}},
    {"name": "Mixed Strategy (Balanced)", "mix": {
        "solar_expansion": 45, "ev_adoption": 40, "tree_plantation": 45, "public_transport": 40,
        "rainwater_harvesting": 35, "green_buildings": 30}},
    {"name": "Aggressive Decarbonization", "mix": {
        "solar_expansion": 85, "wind_energy": 60, "ev_adoption": 80, "metro_expansion": 70,
        "industrial_upgrades": 65, "carbon_tax": 70}},
    {"name": "Water & Resilience Focus", "mix": {
        "rainwater_harvesting": 75, "smart_irrigation": 70, "tree_plantation": 65,
        "battery_storage": 30}},
    {"name": "Low-Cost Quick Wins", "mix": {
        "plastic_ban": 80, "carbon_tax": 50, "smart_irrigation": 40, "tree_plantation": 40}},
    {"name": "Industrial Transition", "mix": {
        "industrial_upgrades": 80, "smart_grid": 60, "battery_storage": 45, "carbon_tax": 40}},
    {"name": "Transit-Oriented Development", "mix": {
        "metro_expansion": 80, "public_transport": 70, "green_buildings": 50, "ev_adoption": 40}},
]


def evaluate_policy(name: str, interventions: Dict[str, float], start_year: int,
                     end_year: int, budget_crore: float) -> Dict[str, Any]:
    sim = run_full_simulation(start_year, end_year, interventions)
    first, last = sim[0], sim[-1]

    cost = sum(INTERVENTION_PROFILES[k]["cost_per_pt"] * v for k, v in interventions.items()
               if k in INTERVENTION_PROFILES)
    jobs = sum(INTERVENTION_PROFILES[k]["jobs_per_pt"] * v for k, v in interventions.items()
               if k in INTERVENTION_PROFILES)
    difficulty = 100 * (sum(INTERVENTION_PROFILES[k]["difficulty"] * v for k, v in interventions.items()
                             if k in INTERVENTION_PROFILES) / max(1, sum(interventions.values())))

    co2_reduction_pct = max(0, (BASELINE["co2_mt"] - last["co2_mt"]) / BASELINE["co2_mt"] * 100)
    aqi_impact = BASELINE["aqi"] - last["aqi"]
    water_impact_pct = last["water_availability_pct"] - BASELINE["water_availability_pct"]
    gdp_gain = last["gdp_billion_usd"] - first["gdp_billion_usd"]
    roi_pct = (gdp_gain * 1000 * 83 / max(1, cost)) if cost > 0 else 0  # rough demo ROI in %
    renewable_pct = last["renewable_pct"]
    green_cover_pct = last["green_cover_pct"]
    citizen_acceptance = max(30, 95 - difficulty * 0.5)
    disaster_resilience = min(100, (green_cover_pct / 40 * 50) + (last["water_availability_pct"] / 100 * 50))

    over_budget = cost > budget_crore

    return {
        "name": name,
        "description": f"{name}: a policy mix combining {', '.join(k.replace('_',' ') for k in interventions)}.",
        "interventions": interventions,
        "cost_crore": round(cost, 1),
        "co2_reduction_pct": round(co2_reduction_pct, 1),
        "aqi_impact": round(aqi_impact, 1),
        "water_impact_pct": round(water_impact_pct, 1),
        "jobs_created": int(max(0, jobs)),
        "gdp_impact_pct": round((gdp_gain / first["gdp_billion_usd"]) * 100, 2),
        "roi_pct": round(min(400, roi_pct), 1),
        "renewable_pct": round(renewable_pct, 1),
        "green_cover_pct": round(green_cover_pct, 1),
        "citizen_acceptance": round(citizen_acceptance, 1),
        "implementation_difficulty": round(difficulty, 1),
        "disaster_resilience": round(disaster_resilience, 1),
        "over_budget": over_budget,
        "simulation_preview": [{"year": s["year"], "co2_mt": s["co2_mt"], "aqi": s["aqi"]}
                                for s in sim[::5]],
    }


def score_policy(p: Dict[str, Any], priority: str = "balanced") -> float:
    weights = {
        "balanced": {"co2": 0.25, "aqi": 0.15, "jobs": 0.15, "roi": 0.15, "acceptance": 0.15, "cost": 0.15},
        "cost": {"co2": 0.15, "aqi": 0.1, "jobs": 0.1, "roi": 0.15, "acceptance": 0.1, "cost": 0.4},
        "co2": {"co2": 0.5, "aqi": 0.2, "jobs": 0.05, "roi": 0.1, "acceptance": 0.05, "cost": 0.1},
        "jobs": {"co2": 0.15, "aqi": 0.1, "jobs": 0.45, "roi": 0.1, "acceptance": 0.1, "cost": 0.1},
    }.get(priority, None) or {"co2": 0.25, "aqi": 0.15, "jobs": 0.15, "roi": 0.15, "acceptance": 0.15, "cost": 0.15}

    cost_score = max(0, 100 - p["cost_crore"] / 15)  # cheaper = higher score
    score = (
        weights["co2"] * p["co2_reduction_pct"]
        + weights["aqi"] * min(100, p["aqi_impact"])
        + weights["jobs"] * min(100, p["jobs_created"] / 100)
        + weights["roi"] * min(100, p["roi_pct"])
        + weights["acceptance"] * p["citizen_acceptance"]
        + weights["cost"] * cost_score
    )
    if p["over_budget"]:
        score *= 0.8
    return round(score, 2)


def generate_policies(start_year: int, end_year: int, budget_crore: float, count: int = 5,
                       priority: str = "balanced") -> List[Dict[str, Any]]:
    candidates = []
    for template in POLICY_TEMPLATES:
        evaluated = evaluate_policy(template["name"], template["mix"], start_year, end_year, budget_crore)
        candidates.append(evaluated)

    for c in candidates:
        c["score"] = score_policy(c, priority)

    candidates.sort(key=lambda c: c["score"], reverse=True)
    for i, c in enumerate(candidates):
        c["rank"] = i + 1

    return candidates[:max(count, 5)]
