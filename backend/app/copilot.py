"""
DemoClimateCopilot
===================
Deterministic keyword/entity extraction copilot used when no LLM API key is
configured (DEMO_MODE). Parses natural-language climate goals into structured
parameters: city, goal, target, budget, deadline, constraints.
"""
import re
from typing import Dict, Any, List

KEYWORD_GOALS = {
    "carbon neutral": "Achieve carbon neutrality",
    "carbon": "Reduce CO2 emissions",
    "co2": "Reduce CO2 emissions",
    "aqi": "Reduce AQI / improve air quality",
    "air quality": "Reduce AQI / improve air quality",
    "pollution": "Reduce pollution",
    "tree": "Increase green cover",
    "forest": "Increase green cover",
    "ev": "Increase EV adoption",
    "electric vehicle": "Increase EV adoption",
    "solar": "Increase solar energy adoption",
    "renewable": "Increase renewable energy",
    "water": "Improve water sustainability",
    "flood": "Improve flood resilience",
    "transport": "Improve public transport",
}

CONSTRAINT_KEYWORDS = ["ev", "solar", "trees", "water", "transport", "budget", "industry", "carbon tax"]

CITY_PATTERN = re.compile(r"\b(pune|mumbai|delhi|bangalore|bengaluru|chennai|hyderabad|kolkata)\b", re.I)
TARGET_PATTERN = re.compile(r"(\d{1,3})\s*%|\bbelow\s+(\d{1,4})\b")
BUDGET_PATTERN = re.compile(r"₹?\s*(\d{1,6})\s*(crore|cr|lakh)?", re.I)
YEAR_PATTERN = re.compile(r"\b(20[2-6]\d)\b")


def parse_message(message: str, default_city: str = "Pune") -> Dict[str, Any]:
    text = message.lower()

    city_match = CITY_PATTERN.search(text)
    city = city_match.group(1).title() if city_match else default_city

    goal = "Reduce carbon emissions"
    detected_keywords: List[str] = []
    for kw, mapped_goal in KEYWORD_GOALS.items():
        if kw in text:
            detected_keywords.append(kw)
            goal = mapped_goal
            if "carbon neutral" in text:
                goal = "Achieve carbon neutrality"
                break

    target = 40.0
    target_match = TARGET_PATTERN.search(text)
    if target_match:
        val = target_match.group(1) or target_match.group(2)
        if val:
            target = float(val)

    budget = 1000.0
    budget_match = re.search(r"₹\s*(\d{1,6})\s*(crore|cr)", text, re.I)
    if not budget_match:
        budget_match = re.search(r"budget\s+of\s+₹?\s*(\d{1,6})\s*(crore|cr)?", text, re.I)
    if budget_match:
        budget = float(budget_match.group(1))

    deadline = 2045
    year_matches = YEAR_PATTERN.findall(text)
    if year_matches:
        deadline = int(year_matches[-1])

    constraints = [kw for kw in CONSTRAINT_KEYWORDS if kw in text]

    reply = (
        f"Understood — building a plan for {city} targeting \"{goal}\" "
        f"({target:.0f}% target) by {deadline}, within a budget of ₹{budget:.0f} crore. "
        f"I detected these focus areas: {', '.join(detected_keywords) if detected_keywords else 'general climate action'}. "
        f"I'll generate and rank policy options next."
    )

    return {
        "city": city,
        "goal": goal,
        "target": target,
        "budget": budget,
        "deadline": deadline,
        "constraints": constraints,
        "detected_keywords": detected_keywords,
        "reply": reply,
    }
