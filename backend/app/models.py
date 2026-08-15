import uuid
import datetime
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, ForeignKey, DateTime, JSON, Text
)
from sqlalchemy.orm import relationship
from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


def now():
    return datetime.datetime.utcnow()


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, default="")
    role = Column(String, default="User")  # User, Researcher, Planner, Administrator
    created_at = Column(DateTime, default=now)


class City(Base):
    __tablename__ = "cities"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    country = Column(String, default="India")
    state = Column(String, default="Maharashtra")
    latitude = Column(Float, default=18.5204)
    longitude = Column(Float, default=73.8567)
    population = Column(Integer, default=0)
    area_sq_km = Column(Float, default=0)
    is_demo_data = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now)


class District(Base):
    __tablename__ = "districts"
    id = Column(String, primary_key=True, default=gen_uuid)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    name = Column(String, nullable=False)
    population = Column(Integer, default=0)
    center_lat = Column(Float)
    center_lng = Column(Float)
    district_type = Column(String, default="residential")  # residential, commercial, industrial, mixed
    is_demo_data = Column(Boolean, default=True)


class Building(Base):
    __tablename__ = "buildings"
    id = Column(String, primary_key=True, default=gen_uuid)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    district_id = Column(String, ForeignKey("districts.id"), nullable=True)
    building_type = Column(String, default="residential")
    lat = Column(Float)
    lng = Column(Float)
    x = Column(Float, default=0)
    z = Column(Float, default=0)
    height = Column(Float, default=10)
    footprint_w = Column(Float, default=10)
    footprint_d = Column(Float, default=10)
    energy_kwh = Column(Float, default=0)
    water_liters = Column(Float, default=0)
    co2_kg = Column(Float, default=0)
    has_solar = Column(Boolean, default=False)
    is_demo_data = Column(Boolean, default=True)


class Road(Base):
    __tablename__ = "roads"
    id = Column(String, primary_key=True, default=gen_uuid)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    name = Column(String, default="")
    road_type = Column(String, default="local")  # highway, arterial, local, metro
    path = Column(JSON, default=list)  # list of [x, z] points
    traffic_level = Column(Float, default=0.5)
    is_demo_data = Column(Boolean, default=True)


class Forest(Base):
    __tablename__ = "forests"
    id = Column(String, primary_key=True, default=gen_uuid)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    name = Column(String, default="")
    center_x = Column(Float, default=0)
    center_z = Column(Float, default=0)
    radius = Column(Float, default=20)
    tree_count = Column(Integer, default=0)
    carbon_storage_tons = Column(Float, default=0)
    biodiversity_index = Column(Float, default=0.5)
    is_demo_data = Column(Boolean, default=True)


class WaterBody(Base):
    __tablename__ = "water_bodies"
    id = Column(String, primary_key=True, default=gen_uuid)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    name = Column(String, default="")
    body_type = Column(String, default="river")  # river, lake, reservoir
    path = Column(JSON, default=list)
    water_quality_index = Column(Float, default=60)
    water_level_pct = Column(Float, default=70)
    flood_risk = Column(Float, default=0.2)
    is_demo_data = Column(Boolean, default=True)


class Industry(Base):
    __tablename__ = "industries"
    id = Column(String, primary_key=True, default=gen_uuid)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    name = Column(String, default="")
    sector = Column(String, default="manufacturing")
    x = Column(Float, default=0)
    z = Column(Float, default=0)
    emissions_tons_co2 = Column(Float, default=0)
    employees = Column(Integer, default=0)
    upgraded = Column(Boolean, default=False)
    is_demo_data = Column(Boolean, default=True)


class EnergySystem(Base):
    __tablename__ = "energy_systems"
    id = Column(String, primary_key=True, default=gen_uuid)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    source_type = Column(String, default="grid")  # grid, solar, wind, battery, hydro
    capacity_mw = Column(Float, default=0)
    x = Column(Float, default=0)
    z = Column(Float, default=0)
    is_demo_data = Column(Boolean, default=True)


class TransportSystem(Base):
    __tablename__ = "transport_systems"
    id = Column(String, primary_key=True, default=gen_uuid)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    mode = Column(String, default="bus")  # bus, metro, ev, private
    fleet_size = Column(Integer, default=0)
    daily_ridership = Column(Integer, default=0)
    is_demo_data = Column(Boolean, default=True)


class Scenario(Base):
    __tablename__ = "scenarios"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    name = Column(String, nullable=False)
    goal = Column(String, default="")
    target_pct = Column(Float, default=40)
    budget_crore = Column(Float, default=1000)
    start_year = Column(Integer, default=2025)
    end_year = Column(Integer, default=2050)
    interventions = Column(JSON, default=dict)  # {intervention_key: intensity 0-100}
    constraints = Column(JSON, default=list)
    created_at = Column(DateTime, default=now)


class Policy(Base):
    __tablename__ = "policies"
    id = Column(String, primary_key=True, default=gen_uuid)
    scenario_id = Column(String, ForeignKey("scenarios.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    interventions = Column(JSON, default=dict)
    cost_crore = Column(Float, default=0)
    co2_reduction_pct = Column(Float, default=0)
    aqi_impact = Column(Float, default=0)
    water_impact_pct = Column(Float, default=0)
    jobs_created = Column(Integer, default=0)
    gdp_impact_pct = Column(Float, default=0)
    roi_pct = Column(Float, default=0)
    renewable_pct = Column(Float, default=0)
    green_cover_pct = Column(Float, default=0)
    citizen_acceptance = Column(Float, default=0)
    implementation_difficulty = Column(Float, default=0)
    disaster_resilience = Column(Float, default=0)
    rank = Column(Integer, default=0)
    score = Column(Float, default=0)
    created_at = Column(DateTime, default=now)


class PolicyMetric(Base):
    __tablename__ = "policy_metrics"
    id = Column(String, primary_key=True, default=gen_uuid)
    policy_id = Column(String, ForeignKey("policies.id"), nullable=False)
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, default=0)
    unit = Column(String, default="")


class SimulationRun(Base):
    __tablename__ = "simulation_runs"
    id = Column(String, primary_key=True, default=gen_uuid)
    scenario_id = Column(String, ForeignKey("scenarios.id"), nullable=False)
    policy_id = Column(String, ForeignKey("policies.id"), nullable=True)
    status = Column(String, default="completed")  # queued, running, completed, failed
    started_at = Column(DateTime, default=now)
    completed_at = Column(DateTime, default=now)


class SimulationYear(Base):
    __tablename__ = "simulation_years"
    id = Column(String, primary_key=True, default=gen_uuid)
    simulation_run_id = Column(String, ForeignKey("simulation_runs.id"), nullable=False)
    year = Column(Integer, nullable=False)
    aqi = Column(Float, default=0)
    co2_mt = Column(Float, default=0)
    temperature_c = Column(Float, default=0)
    water_availability_pct = Column(Float, default=0)
    green_cover_pct = Column(Float, default=0)
    population = Column(Integer, default=0)
    renewable_pct = Column(Float, default=0)
    gdp_billion_usd = Column(Float, default=0)
    employment_index = Column(Float, default=0)
    ev_adoption_pct = Column(Float, default=0)
    biodiversity_index = Column(Float, default=0)
    sustainability_score = Column(Float, default=0)
    sdg_score = Column(Float, default=0)
    explanation = Column(JSON, default=dict)


class AgentOutput(Base):
    __tablename__ = "agent_outputs"
    id = Column(String, primary_key=True, default=gen_uuid)
    simulation_run_id = Column(String, ForeignKey("simulation_runs.id"), nullable=True)
    policy_id = Column(String, ForeignKey("policies.id"), nullable=True)
    agent_name = Column(String, nullable=False)
    recommendation = Column(Text, default="")
    reasoning = Column(Text, default="")
    metrics = Column(JSON, default=dict)
    risks = Column(JSON, default=list)
    confidence = Column(Float, default=0.8)
    created_at = Column(DateTime, default=now)


class Debate(Base):
    __tablename__ = "debates"
    id = Column(String, primary_key=True, default=gen_uuid)
    policy_id = Column(String, ForeignKey("policies.id"), nullable=False)
    topic = Column(String, default="")
    final_recommendation = Column(Text, default="")
    coordinator_confidence = Column(Float, default=0.8)
    created_at = Column(DateTime, default=now)


class DebateMessage(Base):
    __tablename__ = "debate_messages"
    id = Column(String, primary_key=True, default=gen_uuid)
    debate_id = Column(String, ForeignKey("debates.id"), nullable=False)
    agent_name = Column(String, nullable=False)
    message = Column(Text, default="")
    confidence = Column(Float, default=0.8)
    sequence = Column(Integer, default=0)
    created_at = Column(DateTime, default=now)


class Disaster(Base):
    __tablename__ = "disasters"
    id = Column(String, primary_key=True, default=gen_uuid)
    city_id = Column(String, ForeignKey("cities.id"), nullable=False)
    disaster_type = Column(String, nullable=False)  # flood, heatwave, wildfire, drought
    year = Column(Integer, default=2030)
    severity = Column(Float, default=0.5)
    affected_population = Column(Integer, default=0)
    affected_buildings = Column(Integer, default=0)
    economic_loss_crore = Column(Float, default=0)
    ai_recommendation = Column(Text, default="")
    timeline = Column(JSON, default=list)
    created_at = Column(DateTime, default=now)


class EmploymentImpact(Base):
    __tablename__ = "employment_impacts"
    id = Column(String, primary_key=True, default=gen_uuid)
    scenario_id = Column(String, ForeignKey("scenarios.id"), nullable=True)
    sector = Column(String, nullable=False)
    jobs_lost = Column(Integer, default=0)
    jobs_created = Column(Integer, default=0)
    net_employment = Column(Integer, default=0)
    skill_transition = Column(JSON, default=list)
    workforce_demand = Column(JSON, default=dict)
    created_at = Column(DateTime, default=now)


class EconomicImpact(Base):
    __tablename__ = "economic_impacts"
    id = Column(String, primary_key=True, default=gen_uuid)
    scenario_id = Column(String, ForeignKey("scenarios.id"), nullable=True)
    year = Column(Integer, default=2025)
    gdp_billion_usd = Column(Float, default=0)
    investment_crore = Column(Float, default=0)
    roi_pct = Column(Float, default=0)
    revenue_crore = Column(Float, default=0)
    tax_crore = Column(Float, default=0)
    cost_crore = Column(Float, default=0)
    payback_years = Column(Float, default=0)


class CitizenImpact(Base):
    __tablename__ = "citizen_impacts"
    id = Column(String, primary_key=True, default=gen_uuid)
    scenario_id = Column(String, ForeignKey("scenarios.id"), nullable=True)
    year = Column(Integer, default=2025)
    public_acceptance_pct = Column(Float, default=0)
    happiness_index = Column(Float, default=0)
    health_impact_index = Column(Float, default=0)
    avg_commute_minutes = Column(Float, default=0)
    electricity_cost_index = Column(Float, default=0)
    policy_adoption_pct = Column(Float, default=0)


class Report(Base):
    __tablename__ = "reports"
    id = Column(String, primary_key=True, default=gen_uuid)
    scenario_id = Column(String, ForeignKey("scenarios.id"), nullable=True)
    policy_id = Column(String, ForeignKey("policies.id"), nullable=True)
    report_type = Column(String, nullable=False)
    title = Column(String, default="")
    format = Column(String, default="markdown")  # markdown, html, pdf
    content_path = Column(String, default="")
    created_at = Column(DateTime, default=now)


class DataSource(Base):
    __tablename__ = "data_sources"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    source_type = Column(String, default="synthetic")  # synthetic, live
    description = Column(Text, default="")
    is_demo_data = Column(Boolean, default=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    detail = Column(JSON, default=dict)
    created_at = Column(DateTime, default=now)
