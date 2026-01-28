import time

from fastapi import APIRouter, HTTPException

from app.models.schemas import VitalsInput, VitalsResponse
from packages.ml.ml_engine import ml_engine
from app.services.storage import storage

router = APIRouter(prefix="/vitals", tags=["Vitals"])


@router.post("/", response_model=VitalsResponse)
async def receive_vitals(vitals: VitalsInput):
    """Receive and process vitals from sensor/simulator."""

    # Add timestamp if not provided
    if vitals.timestamp is None:
        vitals.timestamp = time.time()

    # Calculate risk using ML engine
    risk_assessment = ml_engine.calculate_risk(vitals)

    # Create response
    vitals_response = VitalsResponse(
        patient_id=vitals.patient_id,
        heart_rate=vitals.heart_rate,
        spo2=vitals.spo2,
        temperature=vitals.temperature,
        timestamp=vitals.timestamp,
        risk_score=risk_assessment.risk_score,
        risk_level=risk_assessment.risk_level,
        message=risk_assessment.recommendation,
    )

    # Store in memory
    storage.add_vitals(vitals_response)

    return vitals_response


@router.get("/latest/{patient_id}", response_model=VitalsResponse)
async def get_latest_vitals(patient_id: str):
    """Get latest vitals for a patient."""
    vitals = storage.get_latest_vitals(patient_id)

    if vitals is None:
        raise HTTPException(status_code=404, detail="No vitals found for this patient")

    return vitals


@router.get("/history/{patient_id}")
async def get_vitals_history(patient_id: str, limit: int = 20):
    """Get vitals history for a patient."""
    history = storage.get_vitals_history(patient_id, limit)

    return {"patient_id": patient_id, "count": len(history), "history": history}
