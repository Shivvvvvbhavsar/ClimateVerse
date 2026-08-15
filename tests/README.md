Backend tests live in `backend/tests/`. Run them with:

    cd backend
    pytest tests/ -v

This top-level `tests/` folder is kept for structural consistency with the
project layout described in the README; the actual pytest suite (including
`test_demo_mode.py`, which verifies the whole platform works with no API
keys configured) is colocated with the backend app in `backend/tests/` so it
can share the app's virtual environment and imports.
