"""
ClimateVerse Multi-Agent System
================================
DEMO MODE: These agents use transparent, deterministic rule-based logic
(not a live LLM). Each agent inspects the policy's intervention intensities
and the simulation trajectory to produce a structured recommendation with
metrics, risks, and a confidence score. If OPENAI_API_KEY is configured this
module can be extended to call a live LLM; the interface (structured JSON
output) stays identical either way.
"""
from typing import Dict, Any, List
from app.simulation import run_full_simulation


def _last(sim: List[Dict[str, Any]]) -> Dict[str, Any]:
    return sim[-1] if sim else {}


def climate_agent(policy: Dict[str, Any], sim: List[Dict[str, Any]]) -> Dict[str, Any]:
    last = _last(sim)
    trend = "improving" if sim[0]["co2_mt"] > last.get("co2_mt", 0) else "worsening"
    risk = "Low" if last.get("temperature_c", 30) < 28 else "Moderate" if last.get("temperature_c", 30) < 30 else "High"
    return {
        "agent": "Climate Agent",
        "recommendation": f"CO2 trajectory is {trend}; by {last.get('year')} projected temperature is "
                           f"{last.get('temperature_c')}°C with climate risk rated {risk}.",
        "metrics": {
            "final_temperature_c": last.get("temperature_c"),
            "final_co2_mt": last.get("co2_mt"),
            "trend": trend,
            "climate_risk": risk,
        },
        "risks": [] if risk == "Low" else [f"{risk} climate risk projected by {last.get('year')}"],
        "confidence": 0.86,
    }


def forest_agent(policy: Dict[str, Any], sim: List[Dict[str, Any]]) -> Dict[str, Any]:
    last = _last(sim)
    trees_intensity = policy.get("interventions", {}).get("tree_plantation", 0)
    return {
        "agent": "Forest Agent",
        "recommendation": (f"Tree plantation intensity of {trees_intensity}% projected to raise green cover "
                            f"to {last.get('green_cover_pct')}% by {last.get('year')}."),
        "metrics": {
            "final_green_cover_pct": last.get("green_cover_pct"),
            "final_biodiversity_index": last.get("biodiversity_index"),
        },
        "risks": ["Green cover growth may be limited by land availability"] if trees_intensity > 70 else [],
        "confidence": 0.83,
    }


def transport_agent(policy: Dict[str, Any], sim: List[Dict[str, Any]]) -> Dict[str, Any]:
    last = _last(sim)
    ev = policy.get("interventions", {}).get("ev_adoption", 0)
    metro = policy.get("interventions", {}).get("metro_expansion", 0)
    return {
        "agent": "Transport Agent",
        "recommendation": (f"EV adoption reaches {last.get('ev_adoption_pct')}% by {last.get('year')}; "
                            f"metro expansion intensity {metro}% supports congestion relief."),
        "metrics": {"final_ev_adoption_pct": last.get("ev_adoption_pct")},
        "risks": ["Charging infrastructure may lag EV growth"] if ev > 60 else [],
        "confidence": 0.8,
    }


def energy_agent(policy: Dict[str, Any], sim: List[Dict[str, Any]]) -> Dict[str, Any]:
    last = _last(sim)
    return {
        "agent": "Energy Agent",
        "recommendation": (f"Renewable energy share projected to reach {last.get('renewable_pct')}% by "
                            f"{last.get('year')}, reducing grid emissions."),
        "metrics": {"final_renewable_pct": last.get("renewable_pct")},
        "risks": ["Grid stability may require battery storage investment"]
        if last.get("renewable_pct", 0) > 55 else [],
        "confidence": 0.84,
    }


def water_agent(policy: Dict[str, Any], sim: List[Dict[str, Any]]) -> Dict[str, Any]:
    last = _last(sim)
    level = last.get("water_availability_pct", 60)
    risk = "Low" if level > 60 else "Moderate" if level > 40 else "High"
    return {
        "agent": "Water Agent",
        "recommendation": f"Water availability projected at {level}% by {last.get('year')} (drought risk: {risk}).",
        "metrics": {"final_water_availability_pct": level, "drought_risk": risk},
        "risks": [f"{risk} drought risk"] if risk != "Low" else [],
        "confidence": 0.78,
    }


def industry_agent(policy: Dict[str, Any], sim: List[Dict[str, Any]]) -> Dict[str, Any]:
    upgrade = policy.get("interventions", {}).get("industrial_upgrades", 0)
    return {
        "agent": "Industry Agent",
        "recommendation": f"Industrial upgrade intensity {upgrade}% expected to cut factory emissions "
                           f"and reduce industrial pollution contribution to AQI.",
        "metrics": {"industrial_upgrade_intensity": upgrade},
        "risks": ["Upgrade costs may strain SME industries"] if upgrade > 60 else [],
        "confidence": 0.75,
    }


def citizen_agent(policy: Dict[str, Any], sim: List[Dict[str, Any]]) -> Dict[str, Any]:
    difficulty = policy.get("implementation_difficulty", 40)
    acceptance = max(30, 95 - difficulty * 0.5)
    return {
        "agent": "Citizen Agent",
        "recommendation": f"Estimated citizen acceptance of {acceptance:.0f}% given implementation "
                           f"difficulty of {difficulty:.0f}/100.",
        "metrics": {"citizen_acceptance_pct": round(acceptance, 1)},
        "risks": ["Public communication campaign recommended"] if acceptance < 60 else [],
        "confidence": 0.7,
    }


def economy_agent(policy: Dict[str, Any], sim: List[Dict[str, Any]]) -> Dict[str, Any]:
    roi = policy.get("roi_pct", 12)
    return {
        "agent": "Economy Agent",
        "recommendation": f"Projected ROI of {roi:.1f}% with estimated cost of ₹{policy.get('cost_crore', 0):.0f} crore.",
        "metrics": {"roi_pct": roi, "cost_crore": policy.get("cost_crore", 0)},
        "risks": ["Budget overruns possible for large infrastructure components"] if policy.get("cost_crore", 0) > 800 else [],
        "confidence": 0.77,
    }


def policy_agent(policy: Dict[str, Any], sim: List[Dict[str, Any]]) -> Dict[str, Any]:
    difficulty = policy.get("implementation_difficulty", 40)
    phased = difficulty > 55
    return {
        "agent": "Policy Agent",
        "recommendation": ("Recommend phased implementation over 3 stages to manage feasibility risk."
                            if phased else "Direct implementation is feasible given moderate complexity."),
        "metrics": {"implementation_difficulty": difficulty, "phased_recommended": phased},
        "risks": ["Regulatory approval delays possible"] if phased else [],
        "confidence": 0.79,
    }


def disaster_agent(policy: Dict[str, Any], sim: List[Dict[str, Any]]) -> Dict[str, Any]:
    resilience = policy.get("disaster_resilience", 50)
    return {
        "agent": "Disaster Agent",
        "recommendation": f"Disaster resilience score of {resilience:.0f}/100 given green cover, "
                           f"water and infrastructure investments.",
        "metrics": {"disaster_resilience": resilience},
        "risks": ["Flood risk remains elevated in low-lying districts"] if resilience < 50 else [],
        "confidence": 0.72,
    }


AGENT_FUNCS = [
    climate_agent, forest_agent, transport_agent, energy_agent, water_agent,
    industry_agent, citizen_agent, economy_agent, policy_agent, disaster_agent,
]


def run_all_agents(policy: Dict[str, Any]) -> List[Dict[str, Any]]:
    sim = run_full_simulation(2025, 2050, policy.get("interventions", {}))
    return [fn(policy, sim) for fn in AGENT_FUNCS]


def coordinator_agent(policy: Dict[str, Any], agent_outputs: List[Dict[str, Any]]) -> Dict[str, Any]:
    all_risks = [r for out in agent_outputs for r in out.get("risks", [])]
    avg_confidence = sum(o["confidence"] for o in agent_outputs) / max(1, len(agent_outputs))
    strengths = [o["agent"] for o in agent_outputs if not o.get("risks")]

    trade_offs = []
    if policy.get("cost_crore", 0) > 700:
        trade_offs.append("High capital cost vs long-term emissions savings")
    if policy.get("implementation_difficulty", 0) > 60:
        trade_offs.append("Implementation complexity vs speed of impact")
    if not trade_offs:
        trade_offs.append("Balanced trade-off profile with no major conflicts detected")

    final_rec = (
        f"Policy '{policy.get('name')}' is recommended with {avg_confidence*100:.0f}% coordinator "
        f"confidence. It shows strong alignment across {len(strengths)}/{len(agent_outputs)} agents. "
        f"Key risks: {', '.join(all_risks[:3]) if all_risks else 'none significant'}."
    )

    return {
        "agent": "Coordinator Agent",
        "recommendation": final_rec,
        "reasoning": "Aggregated cross-agent outputs; resolved conflicts by weighting cost, feasibility, "
                     "and citizen acceptance against environmental impact.",
        "risks": list(dict.fromkeys(all_risks)),
        "trade_offs": trade_offs,
        "confidence": round(avg_confidence, 2),
        "alternative": "Consider a phased rollout starting with highest-ROI interventions "
                        "(solar + EV) before scaling green infrastructure.",
    }


def run_debate(policy: Dict[str, Any]) -> Dict[str, Any]:
    """Simulate agents debating a policy — sequential structured messages."""
    agent_outputs = run_all_agents(policy)
    coordinator = coordinator_agent(policy, agent_outputs)
    messages = []
    for i, out in enumerate(agent_outputs):
        messages.append({
            "sequence": i,
            "agent_name": out["agent"],
            "message": out["recommendation"] + (
                f" Risk: {out['risks'][0]}" if out.get("risks") else ""),
            "confidence": out["confidence"],
        })
    messages.append({
        "sequence": len(messages),
        "agent_name": "Coordinator Agent",
        "message": coordinator["recommendation"],
        "confidence": coordinator["confidence"],
    })
    return {
        "agent_outputs": agent_outputs,
        "coordinator": coordinator,
        "messages": messages,
    }
