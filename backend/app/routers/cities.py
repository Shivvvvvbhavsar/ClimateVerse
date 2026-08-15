from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/api/cities", tags=["cities"])


@router.get("")
def list_cities(db: Session = Depends(get_db)):
    cities = db.query(models.City).all()
    return [{"id": c.id, "name": c.name, "country": c.country, "state": c.state,
             "latitude": c.latitude, "longitude": c.longitude, "population": c.population,
             "area_sq_km": c.area_sq_km, "is_demo_data": c.is_demo_data} for c in cities]


@router.get("/{city_id}")
def get_city(city_id: str, db: Session = Depends(get_db)):
    c = db.query(models.City).filter(models.City.id == city_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="City not found")
    districts = db.query(models.District).filter(models.District.city_id == city_id).all()
    return {
        "id": c.id, "name": c.name, "country": c.country, "state": c.state,
        "latitude": c.latitude, "longitude": c.longitude, "population": c.population,
        "area_sq_km": c.area_sq_km, "is_demo_data": c.is_demo_data,
        "districts": [{"id": d.id, "name": d.name, "population": d.population,
                        "district_type": d.district_type,
                        "center_lat": d.center_lat, "center_lng": d.center_lng} for d in districts],
    }
