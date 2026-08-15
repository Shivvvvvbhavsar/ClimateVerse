from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""
    role: str = "User"


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str

    class Config:
        from_attributes = True


class CopilotRequest(BaseModel):
    message: str
    city: Optional[str] = "Pune"


class CopilotResponse(BaseModel):
    city: str
    goal: str
    target: float
    budget: float
    deadline: int
    constraints: List[str]
    detected_keywords: List[str]
    reply: str


class ScenarioCreate(BaseModel):
    city_id: str
    name: str
    goal: str = "Reduce carbon emissions"
    target_pct: float = 40
    budget_crore: float = 1000
    start_year: int = 2025
    end_year: int = 2050
    interventions: Dict[str, float] = {}
    constraints: List[str] = []


class ScenarioOut(BaseModel):
    id: str
    city_id: str
    name: str
    goal: str
    target_pct: float
    budget_crore: float
    start_year: int
    end_year: int
    interventions: Dict[str, Any]
    constraints: List[Any]

    class Config:
        from_attributes = True


class PolicyGenerateRequest(BaseModel):
    scenario_id: str
    count: int = 5


class PolicyOptimizeRequest(BaseModel):
    scenario_id: str
    priority: str = "balanced"  # balanced, cost, co2, jobs


class SimulationRunRequest(BaseModel):
    scenario_id: str
    policy_id: Optional[str] = None


class AgentRunRequest(BaseModel):
    policy_id: str


class DebateRunRequest(BaseModel):
    policy_id: str


class DisasterSimulateRequest(BaseModel):
    city_id: str
    disaster_type: str
    year: int = 2030
    severity: float = 0.5


class EmploymentAnalyzeRequest(BaseModel):
    scenario_id: Optional[str] = None
    closures: List[Dict[str, Any]] = []
    expansions: List[Dict[str, Any]] = []


class EconomyAnalyzeRequest(BaseModel):
    scenario_id: str


class CitizenAnalyzeRequest(BaseModel):
    scenario_id: str


class ReportGenerateRequest(BaseModel):
    scenario_id: str
    policy_id: Optional[str] = None
    report_type: str = "Executive Summary"
    format: str = "markdown"
