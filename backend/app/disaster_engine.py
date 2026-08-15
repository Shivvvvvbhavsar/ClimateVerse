"""Disaster simulation: flood, heatwave, wildfire, drought (demo models)."""
from typing import Dict, Any


def simulate_disaster(disaster_type: str, year: int, severity: float,
                       population: int = 7_400_000, buildings_total: int = 5000) -> Dict[str, Any]:
    severity = max(0.05, min(1.0, severity))

    profiles = {
        "flood": {
            "affected_population_pct": 0.03 + 0.15 * severity,
            "affected_buildings_pct": 0.04 + 0.18 * severity,
            "economic_loss_per_severity": 180,
            "timeline": [
                "Heavy rainfall begins across catchment areas",
                "River and lake water levels rise above safe thresholds",
                "Low-lying roads and underpasses begin flooding",
                "Buildings in flood-prone districts report water ingress",
                "Emergency response and evacuation of affected zones",
            ],
        },
        "heatwave": {
            "affected_population_pct": 0.10 + 0.35 * severity,
            "affected_buildings_pct": 0.01 * severity,
            "economic_loss_per_severity": 90,
            "timeline": [
                "Temperatures rise 5-8°C above seasonal average",
                "Peak electricity demand surges for cooling",
                "Heat-health advisories issued for vulnerable groups",
                "Water demand spikes, stressing reservoirs",
                "Productivity losses in outdoor labor sectors",
            ],
        },
        "wildfire": {
            "affected_population_pct": 0.01 + 0.06 * severity,
            "affected_buildings_pct": 0.005 + 0.03 * severity,
            "economic_loss_per_severity": 140,
            "timeline": [
                "Dry vegetation and high temperatures raise fire risk",
                "Ignition detected in forest/green-cover zone",
                "Fire spreads driven by wind conditions",
                "Nearby structures and green cover threatened",
                "Firefighting and containment operations underway",
            ],
        },
        "drought": {
            "affected_population_pct": 0.08 + 0.30 * severity,
            "affected_buildings_pct": 0.0,
            "economic_loss_per_severity": 160,
            "timeline": [
                "Rainfall deficit accumulates over multiple months",
                "Reservoir and groundwater levels decline steadily",
                "Water rationing introduced in affected districts",
                "Agricultural and industrial water users curtailed",
                "Economic losses mount in water-intensive sectors",
            ],
        },
    }
    profile = profiles.get(disaster_type, profiles["flood"])

    affected_population = int(population * profile["affected_population_pct"])
    affected_buildings = int(buildings_total * profile["affected_buildings_pct"])
    economic_loss_crore = round(profile["economic_loss_per_severity"] * severity * 10, 1)

    recommendations = {
        "flood": "Invest in stormwater drainage upgrades, restore natural floodplains, and enforce "
                 "building codes in low-lying districts. Rainwater harvesting reduces runoff pressure.",
        "heatwave": "Expand urban tree canopy and reflective roofing, open public cooling centers, and "
                    "shift peak-demand industrial operations to off-peak hours.",
        "wildfire": "Create defensible buffer zones around forest-adjacent development and maintain "
                    "fire breaks; expand early-warning sensor networks.",
        "drought": "Accelerate rainwater harvesting and smart irrigation adoption, diversify water "
                   "sources, and implement tiered water pricing to curb non-essential use.",
    }

    return {
        "disaster_type": disaster_type,
        "year": year,
        "severity": severity,
        "affected_population": affected_population,
        "affected_buildings": affected_buildings,
        "economic_loss_crore": economic_loss_crore,
        "timeline": profile["timeline"],
        "ai_recommendation": recommendations.get(disaster_type, recommendations["flood"]),
    }
