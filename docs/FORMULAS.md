# ClimateVerse Simulation Formulas

> **Disclaimer**: These are transparent, simplified formulas built for a
> decision-support demo/prototype. They are **not** scientifically validated
> climate forecasting models, and Pune data used throughout the app is
> **synthetic DEMO DATA** unless a live data source is configured. Treat all
> outputs as illustrative, not certified projections.

All formulas live in `backend/app/simulation.py` (`simulate_year`) and run
once per simulated year from `start_year` to `end_year`. Each intervention
(tree plantation, solar expansion, EV adoption, etc.) has an intensity from
0–100, normalized to 0–1 before use.

## CO2

```
transport_emissions = 4.8 * (1 - 0.55*ev - 0.25*public_transport - 0.15*metro)
industry_emissions  = 5.6 * (1 - 0.4*industrial_upgrades - 0.15*carbon_tax)
energy_emissions    = 3.8 * (1 - 0.5*solar - 0.3*wind - 0.2*smart_grid - 0.15*battery)

forest_absorption   = 0.4 + 1.8 * tree_plantation
renewable_reduction = 0.6 * avg(solar, wind)
ev_reduction        = 0.5 * ev

CO2_next = transport_emissions + industry_emissions + energy_emissions
           - forest_absorption - renewable_reduction - ev_reduction

# smoothed against the previous year to avoid unrealistic jumps:
CO2_next = 0.35 * CO2_previous + 0.65 * CO2_next
```

## AQI

```
AQI_next = base_pollution(120)
           + transport_pollution(55 * transport_emission_factor)
           + industry_pollution(45 * industry_emission_factor)
           - green_cover_effect(30 * green_cover_pct/100)
           - renewable_effect(20 * avg(solar, wind))
           - plastic_effect(5 * plastic_ban)

AQI_next = 0.4 * AQI_previous + 0.6 * AQI_next
```

## Water availability

```
rainfall     = 42 + 3*sin(year/3)          # seasonal variability signal
harvesting   = 12 * rainwater_harvesting
consumption  = 38 + population_growth_factor * 20
evaporation  = 6 + temperature_delta * 0.5
irrigation_saving = 8 * smart_irrigation

water_next = water_previous + 0.15 * (rainfall + harvesting + irrigation_saving
                                        - consumption - evaporation)
```

## Green cover

```
planted      = 1.6 * tree_plantation
natural_growth = 0.15
mortality      = 0.25
urban_loss     = 0.35 * (1 - green_buildings)

green_cover_next = green_cover_previous + planted + natural_growth
                    - mortality - urban_loss
```

## Energy / renewables

```
renewable_pct_next = renewable_pct_previous
                      + 3.2*solar + 1.8*wind + 1.0*battery + 0.8*smart_grid
```

## Temperature

```
temp_next = temp_previous
            + 0.02 * (CO2_next - CO2_previous)/CO2_previous * 10
            - 0.01 * (green_cover_next - green_cover_previous)
```

## Economy (GDP)

```
investment_effect = 0.015 * avg(solar, ev, metro, green_buildings, public_transport)
GDP_next = GDP_previous * (1 + 0.055 + investment_effect)
```

## Employment index

```
green_jobs_effect = 0.08 * (solar + wind + trees + metro + public_transport)
employment_next = employment_previous * (1 + 0.01 + green_jobs_effect*0.05)
```

## SDG scoring

```
SDG6  (clean water)        = min(100, water_availability_pct)
SDG7  (clean energy)       = min(100, renewable_pct)
SDG11 (sustainable cities) = (green_cover_pct/40*50) + (public_transport+metro)/2*50
SDG13 (climate action)     = 100 - (AQI/200*100)

SDG_score = average(SDG6, SDG7, SDG11, SDG13)
```

## Policy cost & jobs model

Each of the 14 interventions has a demo cost-per-intensity-point (₹ crore)
and jobs-per-intensity-point figure in `backend/app/policy_engine.py`
(`INTERVENTION_PROFILES`). Total policy cost and job creation are the sum of
`intensity * per_point_value` across all interventions in the policy mix.

## Policy ranking score

A weighted multi-criteria score combines CO2 reduction, AQI impact, jobs
created, ROI, citizen acceptance, and cost-efficiency, with weights that vary
by the selected optimization priority (`balanced`, `cost`, `co2`, `jobs`).
This is a simplified stand-in for full constrained optimization (e.g. with
OR-Tools) and is documented in `score_policy()`.

## Disaster impact model

`backend/app/disaster_engine.py` uses per-disaster-type profiles (affected
population %, affected buildings %, economic loss per severity point) applied
to the city's total population/building count, scaled by the chosen severity
(0–1).
