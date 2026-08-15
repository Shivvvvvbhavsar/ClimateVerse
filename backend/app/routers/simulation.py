from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.simulation import run_full_simulation

router = APIRouter(prefix="/api/simulation", tags=["simulation"])


@router.post("/run")
def run_simulation(req: schemas.SimulationRunRequest, db: Session = Depends(get_db)):
    scenario = db.query(models.Scenario).filter(models.Scenario.id == req.scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    interventions = scenario.interventions
    policy = None
    if req.policy_id:
        policy = db.query(models.Policy).filter(models.Policy.id == req.policy_id).first()
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        interventions = policy.interventions

    sim_run = models.SimulationRun(scenario_id=scenario.id, policy_id=req.policy_id, status="completed")
    db.add(sim_run)
    db.flush()

    results = run_full_simulation(scenario.start_year, scenario.end_year, interventions)
    for r in results:
        db.add(models.SimulationYear(
            simulation_run_id=sim_run.id, year=r["year"], aqi=r["aqi"], co2_mt=r["co2_mt"],
            temperature_c=r["temperature_c"], water_availability_pct=r["water_availability_pct"],
            green_cover_pct=r["green_cover_pct"], population=r["population"],
            renewable_pct=r["renewable_pct"], gdp_billion_usd=r["gdp_billion_usd"],
            employment_index=r["employment_index"], ev_adoption_pct=r["ev_adoption_pct"],
            biodiversity_index=r["biodiversity_index"], sustainability_score=r["sustainability_score"],
            sdg_score=r["sdg_score"], explanation=r["explanation"],
        ))
    db.commit()
    db.refresh(sim_run)
    return {"simulation_run_id": sim_run.id, "years": results}


@router.get("/{simulation_run_id}")
def get_simulation(simulation_run_id: str, db: Session = Depends(get_db)):
    run = db.query(models.SimulationRun).filter(models.SimulationRun.id == simulation_run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Simulation run not found")
    years = db.query(models.SimulationYear)\
        .filter(models.SimulationYear.simulation_run_id == simulation_run_id)\
        .order_by(models.SimulationYear.year).all()
    return {
        "id": run.id, "scenario_id": run.scenario_id, "policy_id": run.policy_id, "status": run.status,
        "years": [_year_out(y) for y in years],
    }


@router.get("/{simulation_run_id}/year/{year}")
def get_simulation_year(simulation_run_id: str, year: int, db: Session = Depends(get_db)):
    y = db.query(models.SimulationYear).filter(
        models.SimulationYear.simulation_run_id == simulation_run_id,
        models.SimulationYear.year == year).first()
    if not y:
        raise HTTPException(status_code=404, detail="Year not found in this simulation run")
    return _year_out(y)


def _year_out(y: models.SimulationYear):
    return {
        "year": y.year, "aqi": y.aqi, "co2_mt": y.co2_mt, "temperature_c": y.temperature_c,
        "water_availability_pct": y.water_availability_pct, "green_cover_pct": y.green_cover_pct,
        "population": y.population, "renewable_pct": y.renewable_pct,
        "gdp_billion_usd": y.gdp_billion_usd, "employment_index": y.employment_index,
        "ev_adoption_pct": y.ev_adoption_pct, "biodiversity_index": y.biodiversity_index,
        "sustainability_score": y.sustainability_score, "sdg_score": y.sdg_score,
        "explanation": y.explanation,
    }
