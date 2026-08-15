"""
ClimateVerse backend test suite. Run with: pytest -v
Uses a temporary SQLite DB (not the dev climateverse.db) via TestClient + fixture.
"""
import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

os.environ["DATABASE_URL"] = "sqlite:///./test_climateverse.db"
os.environ["DEMO_MODE"] = "true"
os.environ["OPENAI_API_KEY"] = ""

from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture(scope="session")
def client():
    if os.path.exists("./test_climateverse.db"):
        os.remove("./test_climateverse.db")
    from app.main import app
    with TestClient(app) as c:
        yield c
    if os.path.exists("./test_climateverse.db"):
        os.remove("./test_climateverse.db")


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_demo_mode_no_api_key_required(client):
    """Verify the app reports demo mode and no LLM key, and still functions fully."""
    r = client.get("/api/config")
    assert r.status_code == 200
    data = r.json()
    assert data["demo_mode"] is True
    assert data["has_llm_key"] is False


def test_register_and_login(client):
    r = client.post("/api/auth/register", json={
        "email": "tester@example.com", "password": "TestPass123", "full_name": "Tester"})
    assert r.status_code == 200
    assert "access_token" in r.json()

    r2 = client.post("/api/auth/login", json={"email": "tester@example.com", "password": "TestPass123"})
    assert r2.status_code == 200
    assert "access_token" in r2.json()


def test_demo_user_login(client):
    r = client.post("/api/auth/login", json={
        "email": "demo@climateverse.local", "password": "ClimateVerse@123"})
    assert r.status_code == 200


def test_cities_seeded(client):
    r = client.get("/api/cities")
    assert r.status_code == 200
    cities = r.json()
    assert len(cities) >= 1
    assert any(c["name"] == "Pune" for c in cities)
    assert all(c["is_demo_data"] for c in cities)


def test_scenario_create_and_list(client):
    cities = client.get("/api/cities").json()
    city_id = cities[0]["id"]
    r = client.post("/api/scenarios", json={
        "city_id": city_id, "name": "Test Scenario", "goal": "Reduce carbon emissions",
        "target_pct": 30, "budget_crore": 500, "start_year": 2025, "end_year": 2035,
        "interventions": {"solar_expansion": 50, "tree_plantation": 40}, "constraints": [],
    })
    assert r.status_code == 200
    scenario = r.json()
    assert scenario["name"] == "Test Scenario"

    r2 = client.get("/api/scenarios")
    assert r2.status_code == 200
    assert len(r2.json()) >= 1
    return scenario["id"]


def test_policy_generation_and_ranking(client):
    cities = client.get("/api/cities").json()
    city_id = cities[0]["id"]
    scenario = client.post("/api/scenarios", json={
        "city_id": city_id, "name": "Policy Test Scenario", "budget_crore": 800,
        "start_year": 2025, "end_year": 2050, "interventions": {}, "constraints": [],
    }).json()

    r = client.post("/api/policies/generate", json={"scenario_id": scenario["id"], "count": 5})
    assert r.status_code == 200
    policies = r.json()
    assert len(policies) >= 5
    for p in policies:
        assert p["cost_crore"] >= 0
        assert 0 <= p["co2_reduction_pct"] <= 100
    ranks = [p["rank"] for p in policies]
    assert ranks == sorted(ranks)
    return scenario["id"], policies[0]["id"]


def test_policy_optimize(client):
    scenario_id, _ = test_policy_generation_and_ranking(client)
    r = client.post("/api/policies/optimize", json={"scenario_id": scenario_id, "priority": "cost"})
    assert r.status_code == 200
    assert len(r.json()) >= 5


def test_simulation_run(client):
    scenario_id, policy_id = test_policy_generation_and_ranking(client)
    r = client.post("/api/simulation/run", json={"scenario_id": scenario_id, "policy_id": policy_id})
    assert r.status_code == 200
    data = r.json()
    assert len(data["years"]) == 26  # 2025-2050 inclusive
    assert data["years"][0]["year"] == 2025
    assert data["years"][-1]["year"] == 2050
    run_id = data["simulation_run_id"]

    r2 = client.get(f"/api/simulation/{run_id}")
    assert r2.status_code == 200
    assert len(r2.json()["years"]) == 26

    r3 = client.get(f"/api/simulation/{run_id}/year/2030")
    assert r3.status_code == 200
    assert r3.json()["year"] == 2030


def test_agents_and_debate(client):
    scenario_id, policy_id = test_policy_generation_and_ranking(client)
    r = client.post("/api/agents/run", json={"policy_id": policy_id})
    assert r.status_code == 200
    data = r.json()
    assert len(data["agent_outputs"]) == 10
    assert "coordinator" in data
    assert 0 <= data["coordinator"]["confidence"] <= 1

    r2 = client.post("/api/debate/run", json={"policy_id": policy_id})
    assert r2.status_code == 200
    assert len(r2.json()["messages"]) == 11


def test_disaster_simulation(client):
    cities = client.get("/api/cities").json()
    city_id = cities[0]["id"]
    for dtype in ["flood", "heatwave", "wildfire", "drought"]:
        r = client.post("/api/disasters/simulate", json={
            "city_id": city_id, "disaster_type": dtype, "year": 2035, "severity": 0.6})
        assert r.status_code == 200
        data = r.json()
        assert data["disaster_type"] == dtype
        assert data["affected_population"] >= 0
        assert len(data["timeline"]) >= 3


def test_employment_economy_citizen(client):
    scenario_id, _ = test_policy_generation_and_ranking(client)

    r = client.post("/api/employment/analyze", json={"scenario_id": scenario_id})
    assert r.status_code == 200
    assert "net_employment" in r.json()

    r2 = client.post("/api/economy/analyze", json={"scenario_id": scenario_id})
    assert r2.status_code == 200
    assert "final_gdp_billion_usd" in r2.json()

    r3 = client.post("/api/citizen/analyze", json={"scenario_id": scenario_id})
    assert r3.status_code == 200
    assert len(r3.json()["yearly"]) > 0


def test_reports_all_formats(client):
    scenario_id, policy_id = test_policy_generation_and_ranking(client)
    for fmt in ["markdown", "html", "pdf"]:
        r = client.post("/api/reports/generate", json={
            "scenario_id": scenario_id, "policy_id": policy_id,
            "report_type": "Executive Summary", "format": fmt})
        assert r.status_code == 200, f"format {fmt} failed: {r.text}"
        report_id = r.json()["id"]
        dl = client.get(f"/api/reports/{report_id}/download")
        assert dl.status_code == 200
        assert len(dl.content) > 100


def test_digital_twin_data(client):
    cities = client.get("/api/cities").json()
    city_id = cities[0]["id"]
    r = client.get(f"/api/digital-twin/{city_id}?year=2040")
    assert r.status_code == 200
    data = r.json()
    assert len(data["buildings"]) > 0
    assert len(data["roads"]) > 0
    assert len(data["forests"]) > 0
    assert len(data["water_bodies"]) > 0


def test_copilot_parsing(client):
    r = client.post("/api/copilot/analyze", json={
        "message": "Reduce AQI below 40 by 2040 with a budget of 1000 crore"})
    assert r.status_code == 200
    data = r.json()
    assert data["deadline"] == 2040
    assert data["budget"] == 1000
