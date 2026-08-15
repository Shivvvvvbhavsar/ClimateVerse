from fastapi import APIRouter
from app import schemas
from app.copilot import parse_message

router = APIRouter(prefix="/api/copilot", tags=["copilot"])


@router.post("/analyze", response_model=schemas.CopilotResponse)
def analyze(req: schemas.CopilotRequest):
    result = parse_message(req.message, default_city=req.city or "Pune")
    return result
