from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])


@router.post("")
def create_scenario(req: schemas.ScenarioCreate, db: Session = Depends(get_db)):
    city = db.query(models.City).filter(models.City.id == req.city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    scenario = models.Scenario(
        city_id=req.city_id, name=req.name, goal=req.goal, target_pct=req.target_pct,
        budget_crore=req.budget_crore, start_year=req.start_year, end_year=req.end_year,
        interventions=req.interventions, constraints=req.constraints,
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return _serialize(scenario)


@router.get("")
def list_scenarios(db: Session = Depends(get_db)):
    scenarios = db.query(models.Scenario).order_by(models.Scenario.created_at.desc()).all()
    return [_serialize(s) for s in scenarios]


@router.get("/{scenario_id}")
def get_scenario(scenario_id: str, db: Session = Depends(get_db)):
    s = db.query(models.Scenario).filter(models.Scenario.id == scenario_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return _serialize(s)


def _serialize(s: models.Scenario):
    return {
        "id": s.id, "city_id": s.city_id, "name": s.name, "goal": s.goal,
        "target_pct": s.target_pct, "budget_crore": s.budget_crore,
        "start_year": s.start_year, "end_year": s.end_year,
        "interventions": s.interventions, "constraints": s.constraints,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    }
