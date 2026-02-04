"""
Lightweight health check endpoints for Render/Kubernetes.
No heavy imports - must respond instantly.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz")
async def healthz():
    """Liveness probe - is the service alive?"""
    return {"status": "alive"}


@router.get("/readyz")
async def readyz():
    """Readiness probe - is the service ready to accept traffic?"""
    return {"status": "ready"}
