from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/api/digital-twin", tags=["digital-twin"])


@router.get("/{city_id}")
def get_digital_twin(city_id: str, year: int = 2025, db: Session = Depends(get_db)):
    city = db.query(models.City).filter(models.City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    buildings = db.query(models.Building).filter(models.Building.city_id == city_id).all()
    roads = db.query(models.Road).filter(models.Road.city_id == city_id).all()
    forests = db.query(models.Forest).filter(models.Forest.city_id == city_id).all()
    water_bodies = db.query(models.WaterBody).filter(models.WaterBody.city_id == city_id).all()
    industries = db.query(models.Industry).filter(models.Industry.city_id == city_id).all()
    energy = db.query(models.EnergySystem).filter(models.EnergySystem.city_id == city_id).all()
    transport = db.query(models.TransportSystem).filter(models.TransportSystem.city_id == city_id).all()

    # Progress factor 0..1 across the demo timeline 2025-2050, used by frontend to
    # interpolate visual growth (more solar panels, more trees, more EVs, less smoke).
    progress = max(0.0, min(1.0, (year - 2025) / (2050 - 2025)))

    return {
        "city": {"id": city.id, "name": city.name, "latitude": city.latitude,
                  "longitude": city.longitude, "population": city.population, "is_demo_data": True},
        "year": year,
        "progress": round(progress, 3),
        "buildings": [{"id": b.id, "type": b.building_type, "x": b.x, "z": b.z, "height": b.height,
                        "w": b.footprint_w, "d": b.footprint_d, "has_solar": b.has_solar or (progress > 0.4 and hash(b.id) % 5 == 0),
                        "co2_kg": b.co2_kg} for b in buildings],
        "roads": [{"id": r.id, "name": r.name, "type": r.road_type, "path": r.path,
                    "traffic_level": r.traffic_level} for r in roads],
        "forests": [{"id": f.id, "name": f.name, "x": f.center_x, "z": f.center_z, "radius": f.radius,
                      "tree_count": int(f.tree_count * (1 + 0.6 * progress)),
                      "carbon_storage_tons": f.carbon_storage_tons,
                      "biodiversity_index": f.biodiversity_index} for f in forests],
        "water_bodies": [{"id": w.id, "name": w.name, "type": w.body_type, "path": w.path,
                           "water_quality_index": min(100, w.water_quality_index * (1 + 0.3 * progress)),
                           "water_level_pct": w.water_level_pct, "flood_risk": w.flood_risk}
                          for w in water_bodies],
        "industries": [{"id": ind.id, "name": ind.name, "x": ind.x, "z": ind.z,
                         "emissions_tons_co2": ind.emissions_tons_co2 * max(0.3, 1 - 0.5 * progress),
                         "employees": ind.employees} for ind in industries],
        "energy_systems": [{"id": e.id, "type": e.source_type, "capacity_mw": e.capacity_mw,
                             "x": e.x, "z": e.z} for e in energy],
        "transport_systems": [{"id": t.id, "mode": t.mode,
                                "fleet_size": int(t.fleet_size * (1 + (0.8 * progress if t.mode == "ev" else 0.1 * progress))),
                                "daily_ridership": t.daily_ridership} for t in transport],
    }
