from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/{scenario_id}")
def get_dashboard(scenario_id: str, db: Session = Depends(get_db)):
    scenario = db.query(models.Scenario).filter(models.Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    city = db.query(models.City).filter(models.City.id == scenario.city_id).first()
    policies = db.query(models.Policy).filter(models.Policy.scenario_id == scenario_id)\
        .order_by(models.Policy.rank).all()

    latest_run = db.query(models.SimulationRun).filter(models.SimulationRun.scenario_id == scenario_id)\
        .order_by(models.SimulationRun.completed_at.desc()).first()

    years = []
    if latest_run:
        years = db.query(models.SimulationYear)\
            .filter(models.SimulationYear.simulation_run_id == latest_run.id)\
            .order_by(models.SimulationYear.year).all()

    kpi = {}
    if years:
        first, last = years[0], years[-1]
        kpi = {
            "aqi": last.aqi, "co2_mt": last.co2_mt, "temperature_c": last.temperature_c,
            "green_cover_pct": last.green_cover_pct, "renewable_pct": last.renewable_pct,
            "water_availability_pct": last.water_availability_pct, "population": last.population,
            "gdp_billion_usd": last.gdp_billion_usd, "employment_index": last.employment_index,
            "sustainability_score": last.sustainability_score, "sdg_score": last.sdg_score,
            "co2_change_pct": round((first.co2_mt - last.co2_mt) / first.co2_mt * 100, 1) if first.co2_mt else 0,
            "aqi_change_pct": round((first.aqi - last.aqi) / first.aqi * 100, 1) if first.aqi else 0,
        }

    return {
        "scenario": {"id": scenario.id, "name": scenario.name, "goal": scenario.goal,
                      "start_year": scenario.start_year, "end_year": scenario.end_year,
                      "budget_crore": scenario.budget_crore},
        "city": {"id": city.id, "name": city.name, "population": city.population,
                 "is_demo_data": city.is_demo_data} if city else None,
        "kpi": kpi,
        "timeline": [{"year": y.year, "aqi": y.aqi, "co2_mt": y.co2_mt, "temperature_c": y.temperature_c,
                       "green_cover_pct": y.green_cover_pct, "renewable_pct": y.renewable_pct,
                       "water_availability_pct": y.water_availability_pct,
                       "gdp_billion_usd": y.gdp_billion_usd, "employment_index": y.employment_index,
                       "sdg_score": y.sdg_score} for y in years],
        "policies": [{"id": p.id, "name": p.name, "score": p.score, "rank": p.rank,
                       "cost_crore": p.cost_crore, "co2_reduction_pct": p.co2_reduction_pct}
                      for p in policies],
        "simulation_run_id": latest_run.id if latest_run else None,
    }
