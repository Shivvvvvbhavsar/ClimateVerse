import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.disaster_engine import simulate_disaster
from app.impact_engine import analyze_employment, analyze_economy, analyze_citizen
from app.report_engine import build_markdown, save_report, REPORT_TEMPLATES
from app.simulation import run_full_simulation
from app.policy_engine import evaluate_policy
from app.agents import run_all_agents

disasters_router = APIRouter(prefix="/api/disasters", tags=["disasters"])
employment_router = APIRouter(prefix="/api/employment", tags=["employment"])
economy_router = APIRouter(prefix="/api/economy", tags=["economy"])
citizen_router = APIRouter(prefix="/api/citizen", tags=["citizen"])
reports_router = APIRouter(prefix="/api/reports", tags=["reports"])

REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "generated_reports")


@disasters_router.post("/simulate")
def simulate(req: schemas.DisasterSimulateRequest, db: Session = Depends(get_db)):
    city = db.query(models.City).filter(models.City.id == req.city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    buildings_total = db.query(models.Building).filter(models.Building.city_id == req.city_id).count() or 5000
    result = simulate_disaster(req.disaster_type, req.year, req.severity,
                                population=city.population, buildings_total=buildings_total)
    d = models.Disaster(city_id=city.id, disaster_type=result["disaster_type"], year=result["year"],
                         severity=result["severity"], affected_population=result["affected_population"],
                         affected_buildings=result["affected_buildings"],
                         economic_loss_crore=result["economic_loss_crore"],
                         ai_recommendation=result["ai_recommendation"], timeline=result["timeline"])
    db.add(d)
    db.commit()
    db.refresh(d)
    result["id"] = d.id
    return result


@disasters_router.get("/city/{city_id}")
def list_disasters(city_id: str, db: Session = Depends(get_db)):
    items = db.query(models.Disaster).filter(models.Disaster.city_id == city_id)\
        .order_by(models.Disaster.created_at.desc()).all()
    return [{"id": d.id, "disaster_type": d.disaster_type, "year": d.year, "severity": d.severity,
             "affected_population": d.affected_population, "affected_buildings": d.affected_buildings,
             "economic_loss_crore": d.economic_loss_crore, "ai_recommendation": d.ai_recommendation,
             "timeline": d.timeline} for d in items]


@employment_router.post("/analyze")
def employment_analyze(req: schemas.EmploymentAnalyzeRequest, db: Session = Depends(get_db)):
    interventions = None
    if req.scenario_id:
        scenario = db.query(models.Scenario).filter(models.Scenario.id == req.scenario_id).first()
        if scenario:
            interventions = scenario.interventions
    result = analyze_employment(req.closures, req.expansions, interventions)
    if req.scenario_id:
        db.add(models.EmploymentImpact(scenario_id=req.scenario_id, sector="City-wide Transition",
                                        jobs_lost=result["jobs_lost"], jobs_created=result["jobs_created"],
                                        net_employment=result["net_employment"],
                                        skill_transition=result["skill_transition"],
                                        workforce_demand=result["workforce_demand"]))
        db.commit()
    return result


@economy_router.post("/analyze")
def economy_analyze(req: schemas.EconomyAnalyzeRequest, db: Session = Depends(get_db)):
    scenario = db.query(models.Scenario).filter(models.Scenario.id == req.scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    result = analyze_economy(scenario.interventions, scenario.start_year, scenario.end_year,
                              scenario.budget_crore)
    return result


@citizen_router.post("/analyze")
def citizen_analyze(req: schemas.CitizenAnalyzeRequest, db: Session = Depends(get_db)):
    scenario = db.query(models.Scenario).filter(models.Scenario.id == req.scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    result = analyze_citizen(scenario.interventions, scenario.start_year, scenario.end_year)
    return result


@reports_router.get("/templates")
def list_templates():
    return REPORT_TEMPLATES


@reports_router.post("/generate")
def generate_report(req: schemas.ReportGenerateRequest, db: Session = Depends(get_db)):
    scenario = db.query(models.Scenario).filter(models.Scenario.id == req.scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    city = db.query(models.City).filter(models.City.id == scenario.city_id).first()

    policy = None
    if req.policy_id:
        policy = db.query(models.Policy).filter(models.Policy.id == req.policy_id).first()
    if not policy:
        policy = db.query(models.Policy).filter(models.Policy.scenario_id == scenario.id)\
            .order_by(models.Policy.rank).first()

    interventions = policy.interventions if policy else scenario.interventions
    sim = run_full_simulation(scenario.start_year, scenario.end_year, interventions)
    sim_summary = sim[-1]

    policy_dict = {
        "name": policy.name if policy else "Baseline Scenario",
        "description": policy.description if policy else "",
        "cost_crore": policy.cost_crore if policy else 0,
        "co2_reduction_pct": policy.co2_reduction_pct if policy else 0,
        "aqi_impact": policy.aqi_impact if policy else 0,
        "jobs_created": policy.jobs_created if policy else 0,
        "roi_pct": policy.roi_pct if policy else 0,
        "renewable_pct": policy.renewable_pct if policy else 0,
        "green_cover_pct": policy.green_cover_pct if policy else 0,
        "citizen_acceptance": policy.citizen_acceptance if policy else 0,
        "disaster_resilience": policy.disaster_resilience if policy else 0,
        "interventions": interventions,
        "implementation_difficulty": policy.implementation_difficulty if policy else 40,
    } if policy else {"name": "Baseline Scenario", "description": "", "interventions": interventions}

    agents = run_all_agents(policy_dict) if policy else None
    employment = analyze_employment([], [], interventions)
    economy = analyze_economy(interventions, scenario.start_year, scenario.end_year, scenario.budget_crore)
    citizen = analyze_citizen(interventions, scenario.start_year, scenario.end_year)

    scenario_dict = {"name": scenario.name, "city_name": city.name if city else "Pune",
                      "goal": scenario.goal, "target_pct": scenario.target_pct,
                      "budget_crore": scenario.budget_crore, "start_year": scenario.start_year,
                      "end_year": scenario.end_year}

    md_content = build_markdown(req.report_type, scenario_dict, policy_dict, sim_summary,
                                 agents=agents, employment=employment, economy=economy, citizen=citizen)

    report = models.Report(scenario_id=scenario.id, policy_id=policy.id if policy else None,
                            report_type=req.report_type, title=f"{req.report_type}: {scenario.name}",
                            format=req.format)
    db.add(report)
    db.flush()

    path = save_report(md_content, REPORTS_DIR, report.id, fmt=req.format)
    report.content_path = path
    db.commit()
    db.refresh(report)

    return {"id": report.id, "title": report.title, "format": report.format,
            "report_type": report.report_type, "download_url": f"/api/reports/{report.id}/download",
            "content_preview": md_content[:2000]}


@reports_router.get("/{report_id}")
def get_report(report_id: str, db: Session = Depends(get_db)):
    r = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    content = ""
    if r.content_path and os.path.exists(r.content_path) and r.format != "pdf":
        with open(r.content_path) as f:
            content = f.read()
    return {"id": r.id, "title": r.title, "format": r.format, "report_type": r.report_type,
            "content": content, "download_url": f"/api/reports/{r.id}/download"}


@reports_router.get("/{report_id}/download")
def download_report(report_id: str, db: Session = Depends(get_db)):
    r = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not r or not r.content_path or not os.path.exists(r.content_path):
        raise HTTPException(status_code=404, detail="Report file not found")
    filename = os.path.basename(r.content_path)
    return FileResponse(r.content_path, filename=filename)
