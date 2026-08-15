"""
Standalone helper to (re)seed the ClimateVerse database with demo data.
Run from the backend directory with its virtual environment activated:

    cd backend
    python ../scripts/seed_db.py

To force a full reseed, delete backend/climateverse.db first.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.database import Base, engine  # noqa: E402
from app.seed import seed  # noqa: E402

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed()
