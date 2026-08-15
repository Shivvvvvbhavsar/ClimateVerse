import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cv_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface City {
  id: string; name: string; country: string; state: string;
  latitude: number; longitude: number; population: number;
  area_sq_km: number; is_demo_data: boolean;
}

export interface Scenario {
  id: string; city_id: string; name: string; goal: string;
  target_pct: number; budget_crore: number; start_year: number; end_year: number;
  interventions: Record<string, number>; constraints: string[];
}

export interface Policy {
  id: string; scenario_id: string; name: string; description: string;
  interventions: Record<string, number>; cost_crore: number; co2_reduction_pct: number;
  aqi_impact: number; water_impact_pct: number; jobs_created: number; gdp_impact_pct: number;
  roi_pct: number; renewable_pct: number; green_cover_pct: number; citizen_acceptance: number;
  implementation_difficulty: number; disaster_resilience: number; rank: number; score: number;
}

export interface SimYear {
  year: number; aqi: number; co2_mt: number; temperature_c: number;
  water_availability_pct: number; green_cover_pct: number; population: number;
  renewable_pct: number; gdp_billion_usd: number; employment_index: number;
  ev_adoption_pct: number; biodiversity_index: number; sustainability_score: number;
  sdg_score: number; explanation?: Record<string, string>;
}
