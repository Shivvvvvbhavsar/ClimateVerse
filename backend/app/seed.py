"""
Seeds the ClimateVerse database with a complete, deterministic, clearly-labeled
DEMO DATA set for Pune, Maharashtra, India — plus a demo user, demo scenario,
demo policies, simulation run and reports so the app is fully usable immediately
after first startup.
"""
import random
import math
from app.database import SessionLocal, engine, Base
from app import models
from app.auth import hash_password
from app.simulation import run_full_simulation
from app.policy_engine import generate_policies
from app.agents import run_all_agents, coordinator_agent
from app.impact_engine import analyze_employment, analyze_economy, analyze_citizen

random.seed(42)

DISTRICT_DEFS = [
    ("Koregaon Park", "mixed", 120000),
    ("Hinjewadi (IT Hub)", "commercial", 210000),
    ("Kothrud", "residential", 340000),
    ("Hadapsar", "mixed", 280000),
    ("Pimpri-Chinchwad Industrial Belt", "industrial", 460000),
    ("Viman Nagar", "residential", 190000),
    ("Shivajinagar", "commercial", 150000),
    ("Aundh", "residential", 160000),
    ("Wagholi", "residential", 130000),
    ("Katraj", "mixed", 175000),
]

BUILDING_TYPES = ["residential", "commercial", "industrial", "institutional", "mixed"]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(models.City).filter(models.City.name == "Pune").first()
        if existing:
            print("Seed data already present — skipping.")
            return

        # --- Demo user ---
        user = models.User(
            email="demo@climateverse.local",
            hashed_password=hash_password("ClimateVerse@123"),
            full_name="Demo Planner",
            role="Planner",
        )
        db.add(user)
        db.flush()

        # --- City ---
        city = models.City(
            name="Pune", country="India", state="Maharashtra",
            latitude=18.5204, longitude=73.8567,
            population=7_400_000, area_sq_km=331.26, is_demo_data=True,
        )
        db.add(city)
        db.flush()

        db.add(models.DataSource(
            name="ClimateVerse Synthetic Pune Dataset",
            source_type="synthetic",
            description="Procedurally generated DEMO DATA inspired by publicly known Pune geography "
                        "and statistics. Not sourced from live measurements.",
            is_demo_data=True,
        ))

        # --- Districts ---
        district_objs = []
        for i, (name, dtype, pop) in enumerate(DISTRICT_DEFS):
            angle = (i / len(DISTRICT_DEFS)) * 2 * math.pi
            d = models.District(
                city_id=city.id, name=name, population=pop,
                center_lat=18.5204 + 0.06 * math.sin(angle),
                center_lng=73.8567 + 0.06 * math.cos(angle),
                district_type=dtype, is_demo_data=True,
            )
            db.add(d)
            district_objs.append((d, angle))
        db.flush()

        # --- Buildings (procedural, grid clusters around each district) ---
        for d, angle in district_objs:
            cx, cz = 300 * math.cos(angle), 300 * math.sin(angle)
            n_buildings = 25 if d.district_type != "industrial" else 12
            for j in range(n_buildings):
                bx = cx + random.uniform(-80, 80)
                bz = cz + random.uniform(-80, 80)
                btype = d.district_type if d.district_type in BUILDING_TYPES else random.choice(BUILDING_TYPES)
                height = random.uniform(8, 60) if btype == "commercial" else random.uniform(6, 25)
                b = models.Building(
                    city_id=city.id, district_id=d.id, building_type=btype,
                    lat=d.center_lat + random.uniform(-0.01, 0.01),
                    lng=d.center_lng + random.uniform(-0.01, 0.01),
                    x=bx, z=bz, height=height,
                    footprint_w=random.uniform(8, 20), footprint_d=random.uniform(8, 20),
                    energy_kwh=random.uniform(200, 5000),
                    water_liters=random.uniform(500, 8000),
                    co2_kg=random.uniform(100, 3000),
                    has_solar=random.random() < 0.12,
                    is_demo_data=True,
                )
                db.add(b)

        # --- Roads (simple radial + ring network) ---
        for i, (d, angle) in enumerate(district_objs):
            path = [[0, 0], [300 * math.cos(angle), 300 * math.sin(angle)]]
            db.add(models.Road(city_id=city.id, name=f"{d.name} Radial Road", road_type="arterial",
                                path=path, traffic_level=random.uniform(0.3, 0.9), is_demo_data=True))
        ring_path = [[220 * math.cos(a), 220 * math.sin(a)] for a in
                     [i / 20 * 2 * math.pi for i in range(21)]]
        db.add(models.Road(city_id=city.id, name="Outer Ring Road", road_type="highway",
                            path=ring_path, traffic_level=0.7, is_demo_data=True))
        metro_path = [[-350, 0], [-150, 20], [0, 0], [150, -20], [350, 0]]
        db.add(models.Road(city_id=city.id, name="Pune Metro Line 1 (Demo)", road_type="metro",
                            path=metro_path, traffic_level=0.2, is_demo_data=True))

        # --- Forests ---
        forest_defs = [("Aarey-style Green Belt North", 250, -150), ("Katraj Hills Forest", -280, 180),
                       ("Riverside Green Corridor", 0, 320), ("Urban Forest Patch East", 320, 60)]
        for name, cx, cz in forest_defs:
            db.add(models.Forest(city_id=city.id, name=name, center_x=cx, center_z=cz,
                                  radius=random.uniform(40, 90), tree_count=random.randint(5000, 40000),
                                  carbon_storage_tons=random.uniform(2000, 15000),
                                  biodiversity_index=random.uniform(0.4, 0.8), is_demo_data=True))

        # --- Water bodies ---
        river_path = [[-400 + i * 40, 15 * math.sin(i / 2)] for i in range(21)]
        db.add(models.WaterBody(city_id=city.id, name="Mula-Mutha River (Demo)", body_type="river",
                                 path=river_path, water_quality_index=52, water_level_pct=65,
                                 flood_risk=0.35, is_demo_data=True))
        db.add(models.WaterBody(city_id=city.id, name="Khadakwasla Reservoir (Demo)", body_type="reservoir",
                                 path=[[-200, 250]], water_quality_index=70, water_level_pct=78,
                                 flood_risk=0.15, is_demo_data=True))
        db.add(models.WaterBody(city_id=city.id, name="Pashan Lake (Demo)", body_type="lake",
                                 path=[[180, -220]], water_quality_index=60, water_level_pct=60,
                                 flood_risk=0.2, is_demo_data=True))

        # --- Industries ---
        industry_names = ["Auto Components Manufacturing", "IT & Electronics Assembly",
                           "Textile Processing Unit", "Chemical Processing Plant", "Food Processing Unit"]
        for i, name in enumerate(industry_names):
            angle = (i / len(industry_names)) * 2 * math.pi + 1
            db.add(models.Industry(city_id=city.id, name=name, sector=name.split(" ")[0],
                                    x=380 * math.cos(angle), z=380 * math.sin(angle),
                                    emissions_tons_co2=random.uniform(5000, 40000),
                                    employees=random.randint(500, 6000),
                                    upgraded=False, is_demo_data=True))

        # --- Energy systems ---
        db.add(models.EnergySystem(city_id=city.id, source_type="grid", capacity_mw=1800, x=0, z=0, is_demo_data=True))
        for i in range(6):
            db.add(models.EnergySystem(city_id=city.id, source_type="solar", capacity_mw=random.uniform(5, 40),
                                        x=random.uniform(-350, 350), z=random.uniform(-350, 350), is_demo_data=True))
        for i in range(2):
            db.add(models.EnergySystem(city_id=city.id, source_type="wind", capacity_mw=random.uniform(10, 30),
                                        x=random.uniform(-350, 350), z=random.uniform(-350, 350), is_demo_data=True))

        # --- Transport systems ---
        db.add(models.TransportSystem(city_id=city.id, mode="bus", fleet_size=1800, daily_ridership=850000, is_demo_data=True))
        db.add(models.TransportSystem(city_id=city.id, mode="metro", fleet_size=34, daily_ridership=140000, is_demo_data=True))
        db.add(models.TransportSystem(city_id=city.id, mode="ev", fleet_size=12000, daily_ridership=0, is_demo_data=True))
        db.add(models.TransportSystem(city_id=city.id, mode="private", fleet_size=2100000, daily_ridership=0, is_demo_data=True))

        db.flush()

        # --- Demo scenario: Pune Carbon Neutral 2045 ---
        scenario = models.Scenario(
            user_id=user.id, city_id=city.id, name="Pune Carbon Neutral 2045",
            goal="Reduce carbon emissions", target_pct=45, budget_crore=1000,
            start_year=2025, end_year=2050,
            interventions={
                "solar_expansion": 65, "ev_adoption": 55, "metro_expansion": 45,
                "tree_plantation": 55, "public_transport": 50, "green_buildings": 40,
            },
            constraints=["budget", "phased_rollout"],
        )
        db.add(scenario)
        db.flush()

        # --- Generate & store policies ---
        policies_data = generate_policies(scenario.start_year, scenario.end_year,
                                           scenario.budget_crore, count=8)
        policy_objs = []
        for p in policies_data:
            policy = models.Policy(
                scenario_id=scenario.id, name=p["name"], description=p["description"],
                interventions=p["interventions"], cost_crore=p["cost_crore"],
                co2_reduction_pct=p["co2_reduction_pct"], aqi_impact=p["aqi_impact"],
                water_impact_pct=p["water_impact_pct"], jobs_created=p["jobs_created"],
                gdp_impact_pct=p["gdp_impact_pct"], roi_pct=p["roi_pct"],
                renewable_pct=p["renewable_pct"], green_cover_pct=p["green_cover_pct"],
                citizen_acceptance=p["citizen_acceptance"],
                implementation_difficulty=p["implementation_difficulty"],
                disaster_resilience=p["disaster_resilience"], rank=p["rank"], score=p["score"],
            )
            db.add(policy)
            policy_objs.append((policy, p))
        db.flush()

        top_policy, top_policy_data = policy_objs[0]

        # --- Simulation run for top policy ---
        sim_run = models.SimulationRun(scenario_id=scenario.id, policy_id=top_policy.id, status="completed")
        db.add(sim_run)
        db.flush()

        sim_years = run_full_simulation(scenario.start_year, scenario.end_year, top_policy.interventions)
        for sy in sim_years:
            db.add(models.SimulationYear(
                simulation_run_id=sim_run.id, year=sy["year"], aqi=sy["aqi"], co2_mt=sy["co2_mt"],
                temperature_c=sy["temperature_c"], water_availability_pct=sy["water_availability_pct"],
                green_cover_pct=sy["green_cover_pct"], population=sy["population"],
                renewable_pct=sy["renewable_pct"], gdp_billion_usd=sy["gdp_billion_usd"],
                employment_index=sy["employment_index"], ev_adoption_pct=sy["ev_adoption_pct"],
                biodiversity_index=sy["biodiversity_index"], sustainability_score=sy["sustainability_score"],
                sdg_score=sy["sdg_score"], explanation=sy["explanation"],
            ))

        # --- Agent outputs + debate for top policy ---
        agent_outputs = run_all_agents(top_policy_data)
        for out in agent_outputs:
            db.add(models.AgentOutput(
                simulation_run_id=sim_run.id, policy_id=top_policy.id, agent_name=out["agent"],
                recommendation=out["recommendation"], reasoning=out.get("reasoning", ""),
                metrics=out["metrics"], risks=out["risks"], confidence=out["confidence"],
            ))
        coordinator = coordinator_agent(top_policy_data, agent_outputs)
        debate = models.Debate(policy_id=top_policy.id, topic=top_policy.name,
                                final_recommendation=coordinator["recommendation"],
                                coordinator_confidence=coordinator["confidence"])
        db.add(debate)
        db.flush()
        for i, out in enumerate(agent_outputs):
            db.add(models.DebateMessage(debate_id=debate.id, agent_name=out["agent"],
                                         message=out["recommendation"], confidence=out["confidence"], sequence=i))
        db.add(models.DebateMessage(debate_id=debate.id, agent_name="Coordinator Agent",
                                     message=coordinator["recommendation"],
                                     confidence=coordinator["confidence"], sequence=len(agent_outputs)))

        # --- Employment / Economy / Citizen demo records ---
        emp = analyze_employment([], [], top_policy.interventions)
        db.add(models.EmploymentImpact(scenario_id=scenario.id, sector="City-wide Transition",
                                        jobs_lost=emp["jobs_lost"], jobs_created=emp["jobs_created"],
                                        net_employment=emp["net_employment"],
                                        skill_transition=emp["skill_transition"],
                                        workforce_demand=emp["workforce_demand"]))

        econ = analyze_economy(top_policy.interventions, scenario.start_year, scenario.end_year, top_policy.cost_crore)
        for y in econ["yearly"][::5]:
            db.add(models.EconomicImpact(scenario_id=scenario.id, year=y["year"],
                                          gdp_billion_usd=y["gdp_billion_usd"], investment_crore=y["investment_crore"],
                                          roi_pct=y["roi_pct"], revenue_crore=y["revenue_crore"],
                                          tax_crore=y["tax_crore"], cost_crore=top_policy.cost_crore,
                                          payback_years=econ["payback_years"]))

        cit = analyze_citizen(top_policy.interventions, scenario.start_year, scenario.end_year,
                               top_policy.implementation_difficulty)
        for y in cit["yearly"][::5]:
            db.add(models.CitizenImpact(scenario_id=scenario.id, year=y["year"],
                                         public_acceptance_pct=y["public_acceptance_pct"],
                                         happiness_index=y["happiness_index"],
                                         health_impact_index=y["health_impact_index"],
                                         avg_commute_minutes=y["avg_commute_minutes"],
                                         electricity_cost_index=y["electricity_cost_index"],
                                         policy_adoption_pct=y["policy_adoption_pct"]))

        # --- Demo disaster record ---
        db.add(models.Disaster(city_id=city.id, disaster_type="flood", year=2032, severity=0.6,
                                affected_population=95000, affected_buildings=180,
                                economic_loss_crore=108, ai_recommendation="Invest in stormwater drainage.",
                                timeline=["Heavy rainfall begins", "River levels rise", "Roads flood"]))

        db.commit()
        print("✅ Seed complete: Pune demo city, scenario, 8 policies, simulation, agents, debate, "
              "employment/economy/citizen impacts, and 1 demo disaster created.")
        print(f"Demo login: demo@climateverse.local / ClimateVerse@123")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
