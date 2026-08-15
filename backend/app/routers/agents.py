from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.agents import run_all_agents, coordinator_agent, run_debate
from app.routers.policies import _policy_out

router = APIRouter(prefix="/api/agents", tags=["agents"])
debate_router = APIRouter(prefix="/api/debate", tags=["debate"])


@router.post("/run")
def run_agents(req: schemas.AgentRunRequest, db: Session = Depends(get_db)):
    policy = db.query(models.Policy).filter(models.Policy.id == req.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    pdict = _policy_out(policy)
    outputs = run_all_agents(pdict)
    coordinator = coordinator_agent(pdict, outputs)

    for out in outputs:
        db.add(models.AgentOutput(policy_id=policy.id, agent_name=out["agent"],
                                   recommendation=out["recommendation"], reasoning=out.get("reasoning", ""),
                                   metrics=out["metrics"], risks=out["risks"], confidence=out["confidence"]))
    db.commit()
    return {"agent_outputs": outputs, "coordinator": coordinator}


@debate_router.post("/run")
def run_debate_endpoint(req: schemas.DebateRunRequest, db: Session = Depends(get_db)):
    policy = db.query(models.Policy).filter(models.Policy.id == req.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    pdict = _policy_out(policy)
    result = run_debate(pdict)

    debate = models.Debate(policy_id=policy.id, topic=policy.name,
                            final_recommendation=result["coordinator"]["recommendation"],
                            coordinator_confidence=result["coordinator"]["confidence"])
    db.add(debate)
    db.flush()
    for m in result["messages"]:
        db.add(models.DebateMessage(debate_id=debate.id, agent_name=m["agent_name"],
                                     message=m["message"], confidence=m["confidence"],
                                     sequence=m["sequence"]))
    db.commit()
    return {"debate_id": debate.id, **result}


@debate_router.get("/{debate_id}")
def get_debate(debate_id: str, db: Session = Depends(get_db)):
    debate = db.query(models.Debate).filter(models.Debate.id == debate_id).first()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
    messages = db.query(models.DebateMessage).filter(models.DebateMessage.debate_id == debate_id)\
        .order_by(models.DebateMessage.sequence).all()
    return {
        "id": debate.id, "policy_id": debate.policy_id, "topic": debate.topic,
        "final_recommendation": debate.final_recommendation,
        "coordinator_confidence": debate.coordinator_confidence,
        "messages": [{"agent_name": m.agent_name, "message": m.message,
                      "confidence": m.confidence, "sequence": m.sequence} for m in messages],
    }
