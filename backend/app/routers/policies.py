from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.policy_engine import generate_policies, score_policy

router = APIRouter(prefix="/api/policies", tags=["policies"])


def _policy_out(p: models.Policy):
    return {
        "id": p.id, "scenario_id": p.scenario_id, "name": p.name, "description": p.description,
        "interventions": p.interventions, "cost_crore": p.cost_crore,
        "co2_reduction_pct": p.co2_reduction_pct, "aqi_impact": p.aqi_impact,
        "water_impact_pct": p.water_impact_pct, "jobs_created": p.jobs_created,
        "gdp_impact_pct": p.gdp_impact_pct, "roi_pct": p.roi_pct, "renewable_pct": p.renewable_pct,
        "green_cover_pct": p.green_cover_pct, "citizen_acceptance": p.citizen_acceptance,
        "implementation_difficulty": p.implementation_difficulty,
        "disaster_resilience": p.disaster_resilience, "rank": p.rank, "score": p.score,
    }


@router.post("/generate")
def generate(req: schemas.PolicyGenerateRequest, db: Session = Depends(get_db)):
    scenario = db.query(models.Scenario).filter(models.Scenario.id == req.scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    # clear old auto-generated policies for this scenario to avoid duplicates on regenerate
    db.query(models.Policy).filter(models.Policy.scenario_id == scenario.id).delete()
    db.flush()

    generated = generate_policies(scenario.start_year, scenario.end_year, scenario.budget_crore,
                                   count=req.count)
    out = []
    for p in generated:
        policy = models.Policy(
            scenario_id=scenario.id, name=p["name"], description=p["description"],
            interventions=p["interventions"], cost_crore=p["cost_crore"],
            co2_reduction_pct=p["co2_reduction_pct"], aqi_impact=p["aqi_impact"],
            water_impact_pct=p["water_impact_pct"], jobs_created=p["jobs_created"],
            gdp_impact_pct=p["gdp_impact_pct"], roi_pct=p["roi_pct"], renewable_pct=p["renewable_pct"],
            green_cover_pct=p["green_cover_pct"], citizen_acceptance=p["citizen_acceptance"],
            implementation_difficulty=p["implementation_difficulty"],
            disaster_resilience=p["disaster_resilience"], rank=p["rank"], score=p["score"],
        )
        db.add(policy)
        db.flush()
        out.append(_policy_out(policy))
    db.commit()
    return out


@router.post("/optimize")
def optimize(req: schemas.PolicyOptimizeRequest, db: Session = Depends(get_db)):
    policies = db.query(models.Policy).filter(models.Policy.scenario_id == req.scenario_id).all()
    if not policies:
        raise HTTPException(status_code=404, detail="No policies found for scenario; generate first")

    scored = []
    for p in policies:
        pdict = _policy_out(p)
        pdict["over_budget"] = False
        new_score = score_policy({**pdict, "over_budget": False}, req.priority)
        p.score = new_score
        scored.append(p)
    scored.sort(key=lambda x: x.score, reverse=True)
    for i, p in enumerate(scored):
        p.rank = i + 1
    db.commit()
    return [_policy_out(p) for p in scored]


@router.get("/scenario/{scenario_id}")
def list_by_scenario(scenario_id: str, db: Session = Depends(get_db)):
    policies = db.query(models.Policy).filter(models.Policy.scenario_id == scenario_id)\
        .order_by(models.Policy.rank).all()
    return [_policy_out(p) for p in policies]


@router.get("/{policy_id}")
def get_policy(policy_id: str, db: Session = Depends(get_db)):
    p = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Policy not found")
    return _policy_out(p)
