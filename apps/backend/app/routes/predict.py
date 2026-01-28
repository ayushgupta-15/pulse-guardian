from fastapi import APIRouter

from app.models.schemas import RiskAssessment, VitalsInput
from packages.ml.ml_engine import ml_engine

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("/risk", response_model=RiskAssessment)
async def predict_risk(vitals: VitalsInput):
    """Get risk assessment without storing data."""
    return ml_engine.calculate_risk(vitals)
