"""
ClimateVerse Simulation Engine
================================
IMPORTANT: These are transparent, simplified decision-support models built for
this demo/prototype. They are NOT scientifically validated climate forecasting
models. All city data is DEMO DATA (synthetic, Pune-inspired) unless a live
data source has been configured.

The engine simulates a city year-by-year from start_year to end_year given a
set of "interventions" (0-100 intensity each), producing AQI, CO2, temperature,
water, green cover, energy, GDP, employment and SDG metrics using documented
formulas (see docs/FORMULAS.md).
"""
import math
from typing import Dict, List, Any

BASELINE = {
    "aqi": 168.0,               # Pune-like baseline AQI (demo)
    "co2_mt": 14.2,             # Million tonnes CO2/year (demo)
    "temperature_c": 26.8,      # Avg annual temp (demo)
    "water_availability_pct": 68.0,
    "green_cover_pct": 21.0,
    "population": 7_400_000,
    "renewable_pct": 12.0,
    "gdp_billion_usd": 52.0,
    "employment_index": 100.0,
    "ev_adoption_pct": 3.0,
    "biodiversity_index": 0.42,
}

INTERVENTION_KEYS = [
    "tree_plantation", "solar_expansion", "ev_adoption", "carbon_tax",
    "plastic_ban", "rainwater_harvesting", "smart_irrigation", "green_buildings",
    "public_transport", "smart_grid", "industrial_upgrades", "wind_energy",
    "battery_storage", "metro_expansion",
]


def _get(interventions: Dict[str, float], key: str) -> float:
    """Return intervention intensity 0-100, normalized to 0-1."""
    return max(0.0, min(100.0, float(interventions.get(key, 0)))) / 100.0


def simulate_year(prev: Dict[str, Any], year: int, interventions: Dict[str, float],
                   population_growth_pct: float = 1.2) -> Dict[str, Any]:
    """Advance the city state by one year given intervention intensities."""
    trees = _get(interventions, "tree_plantation")
    solar = _get(interventions, "solar_expansion")
    ev = _get(interventions, "ev_adoption")
    ctax = _get(interventions, "carbon_tax")
    plastic = _get(interventions, "plastic_ban")
    rainwater = _get(interventions, "rainwater_harvesting")
    irrigation = _get(interventions, "smart_irrigation")
    green_bldg = _get(interventions, "green_buildings")
    pub_transport = _get(interventions, "public_transport")
    smart_grid = _get(interventions, "smart_grid")
    industrial_upgrade = _get(interventions, "industrial_upgrades")
    wind = _get(interventions, "wind_energy")
    battery = _get(interventions, "battery_storage")
    metro = _get(interventions, "metro_expansion")

    # --- Population ---
    population = prev["population"] * (1 + population_growth_pct / 100.0)

    # --- Transport & industry emissions (reduced by EV/transport/industry interventions) ---
    transport_emission_factor = 1 - 0.55 * ev - 0.25 * pub_transport - 0.15 * metro
    industry_emission_factor = 1 - 0.4 * industrial_upgrade - 0.15 * ctax
    energy_emission_factor = 1 - 0.5 * solar - 0.3 * wind - 0.2 * smart_grid - 0.15 * battery

    transport_emissions = 4.8 * max(0.1, transport_emission_factor)
    industry_emissions = 5.6 * max(0.1, industry_emission_factor)
    energy_emissions = 3.8 * max(0.05, energy_emission_factor)

    forest_absorption = 0.4 + 1.8 * trees
    renewable_reduction = 0.6 * (solar + wind) / 2
    ev_reduction = 0.5 * ev

    co2_next = max(1.0, (transport_emissions + industry_emissions + energy_emissions)
                    - forest_absorption - renewable_reduction - ev_reduction)
    # Smooth against previous value to avoid unrealistic year-over-year jumps
    co2_next = prev["co2_mt"] * 0.35 + co2_next * 0.65

    # --- AQI ---
    base_pollution = 120
    transport_pollution = 55 * max(0.1, transport_emission_factor)
    industry_pollution = 45 * max(0.1, industry_emission_factor)
    green_cover_effect = 30 * (prev["green_cover_pct"] / 100.0)
    renewable_effect = 20 * ((solar + wind) / 2)
    plastic_effect = 5 * plastic

    aqi_next = max(15, base_pollution + transport_pollution + industry_pollution
                   - green_cover_effect - renewable_effect - plastic_effect)
    aqi_next = prev["aqi"] * 0.4 + aqi_next * 0.6

    # --- Water ---
    rainfall = 42.0 + 3 * math.sin(year / 3.0)  # demo seasonal variability signal
    harvesting = 12 * rainwater
    consumption = 38 + (population / BASELINE["population"] - 1) * 20
    evaporation = 6 + 0.05 * (prev["temperature_c"] - BASELINE["temperature_c"]) * 10
    irrigation_saving = 8 * irrigation

    water_next = prev["water_availability_pct"] + (rainfall + harvesting + irrigation_saving
                                                      - consumption - evaporation) * 0.15
    water_next = max(10, min(100, water_next))

    # --- Forest / green cover ---
    planted = 1.6 * trees
    natural_growth = 0.15
    mortality = 0.25
    urban_loss = 0.35 * (1 - green_bldg)
    green_cover_next = prev["green_cover_pct"] + planted + natural_growth - mortality - urban_loss
    green_cover_next = max(5, min(65, green_cover_next))

    # --- Energy / renewables ---
    renewable_pct_next = min(100, prev["renewable_pct"] + 3.2 * solar + 1.8 * wind
                              + 1.0 * battery + 0.8 * smart_grid)

    # --- Temperature (slow-moving, influenced by CO2 & green cover) ---
    temp_next = prev["temperature_c"] + 0.02 * (co2_next - prev["co2_mt"]) / max(1, prev["co2_mt"]) * 10 \
        - 0.01 * (green_cover_next - prev["green_cover_pct"])
    temp_next = max(20, min(34, temp_next))

    # --- EV adoption ---
    ev_adoption_next = min(100, prev["ev_adoption_pct"] + 4.5 * ev + 1.2 * metro)

    # --- Biodiversity ---
    biodiversity_next = max(0.1, min(1.0, prev["biodiversity_index"]
                                       + 0.01 * trees - 0.005 * (industry_emissions / 10)))

    # --- Economy (GDP) ---
    investment_effect = 0.015 * (solar + ev + metro + green_bldg + pub_transport) / 5
    gdp_next = prev["gdp_billion_usd"] * (1 + 0.055 + investment_effect)

    # --- Employment index ---
    green_jobs_effect = 0.08 * (solar + wind + trees + metro + pub_transport)
    employment_next = prev["employment_index"] * (1 + 0.01 + green_jobs_effect * 0.05)

    # --- Sustainability & SDG scoring ---
    sdg6_water = min(100, water_next)
    sdg7_energy = min(100, renewable_pct_next)
    sdg11_cities = min(100, (green_cover_next / 40 * 50) + (pub_transport + metro) / 2 * 50)
    sdg13_climate = max(0, min(100, 100 - (aqi_next / 200 * 100)))
    sdg_score = (sdg6_water + sdg7_energy + sdg11_cities + sdg13_climate) / 4

    sustainability_score = max(0, min(100, (sdg_score * 0.5) + (biodiversity_next * 100 * 0.2)
                                       + ((100 - aqi_next / 3) * 0.3)))

    explanation = {
        "co2": f"CO2 driven by transport ({transport_emissions:.2f}Mt), industry ({industry_emissions:.2f}Mt), "
               f"energy ({energy_emissions:.2f}Mt) minus forest absorption ({forest_absorption:.2f}Mt) and "
               f"renewable/EV reductions ({renewable_reduction + ev_reduction:.2f}Mt).",
        "aqi": f"AQI reflects transport pollution, industrial pollution, offset by green cover "
               f"({green_cover_effect:.1f}) and renewable energy ({renewable_effect:.1f}) effects.",
        "water": f"Water availability shaped by rainfall ({rainfall:.1f}), harvesting ({harvesting:.1f}) "
                 f"vs consumption ({consumption:.1f}) and evaporation ({evaporation:.1f}).",
        "green_cover": f"Green cover changed by planting ({planted:.2f}pp) and natural growth minus "
                        f"mortality/urban loss.",
        "energy": f"Renewable share grew via solar/wind/battery/smart-grid investment intensity.",
        "economy": f"GDP grew from baseline growth plus climate-investment multiplier "
                   f"({investment_effect*100:.2f}pp bonus).",
    }

    return {
        "year": year,
        "aqi": round(aqi_next, 1),
        "co2_mt": round(co2_next, 2),
        "temperature_c": round(temp_next, 2),
        "water_availability_pct": round(water_next, 1),
        "green_cover_pct": round(green_cover_next, 1),
        "population": int(population),
        "renewable_pct": round(renewable_pct_next, 1),
        "gdp_billion_usd": round(gdp_next, 2),
        "employment_index": round(employment_next, 1),
        "ev_adoption_pct": round(ev_adoption_next, 1),
        "biodiversity_index": round(biodiversity_next, 3),
        "sustainability_score": round(sustainability_score, 1),
        "sdg_score": round(sdg_score, 1),
        "sdg_breakdown": {
            "sdg6_water": round(sdg6_water, 1),
            "sdg7_energy": round(sdg7_energy, 1),
            "sdg11_cities": round(sdg11_cities, 1),
            "sdg13_climate": round(sdg13_climate, 1),
        },
        "explanation": explanation,
    }


def run_full_simulation(start_year: int, end_year: int, interventions: Dict[str, float],
                         population_growth_pct: float = 1.2) -> List[Dict[str, Any]]:
    state = dict(BASELINE)
    state["year"] = start_year
    results = []
    for year in range(start_year, end_year + 1):
        state = simulate_year(state, year, interventions, population_growth_pct)
        results.append(state)
    return results
