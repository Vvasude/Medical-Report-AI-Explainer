"""Vercel FastAPI entrypoint.

Exposes `app` from `backend/main.py` for platform auto-detection.
"""

from backend.main import app  # noqa: F401
