import time
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    RiskOut,
    VitalsCore,
    VitalsHistoryResponse,
    VitalsInput,
    VitalsOut,
    VitalsRecord,
)
from packages.ml.ml_engine import ml_engine
from app.services.storage import storage

router = APIRouter(prefix="/vitals", tags=["Vitals"])


def _to_iso(timestamp: float) -> str:
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()


def _risk_message(level: str) -> str:
    if level == "CRITICAL":
        return "Immediate medical attention required"
    if level == "WARNING":
        return "Close monitoring recommended"
    return "Continue routine monitoring"


def _format_response(record: VitalsRecord) -> VitalsOut:
    return VitalsOut(
        patient_id=record.patient_id,
        timestamp=_to_iso(record.timestamp),
        vitals=VitalsCore(
            heart_rate=record.heart_rate,
            spo2=record.spo2,
            temperature=record.temperature,
        ),
        risk=RiskOut(
            score=record.risk_score,
            level=record.risk_level,
            message=record.message,
            reasons=record.reasons,
        ),
    )


@router.post("/", response_model=VitalsOut)
async def receive_vitals(vitals: VitalsInput):
    """Receive and process vitals from sensor/simulator."""

    # Add timestamp if not provided
    if vitals.timestamp is None:
        vitals.timestamp = time.time()

    # Calculate risk using ML engine
    risk_assessment = ml_engine.calculate_risk(vitals)

    risk_level = risk_assessment.risk_level.upper()
    record = VitalsRecord(
        patient_id=vitals.patient_id,
        heart_rate=vitals.heart_rate,
        spo2=vitals.spo2,
        temperature=vitals.temperature,
        timestamp=vitals.timestamp,
        risk_score=risk_assessment.risk_score,
        risk_level=risk_level,
        message=_risk_message(risk_level),
        reasons=risk_assessment.factors,
    )

    storage.add_vitals(record)

    return _format_response(record)


@router.get("/latest/{patient_id}", response_model=VitalsOut)
async def get_latest_vitals(patient_id: str):
    """Get latest vitals for a patient."""
    vitals = storage.get_latest_vitals(patient_id)

    if vitals is None:
        raise HTTPException(status_code=404, detail="No vitals found for this patient")

    return _format_response(vitals)


@router.get("/history/{patient_id}", response_model=VitalsHistoryResponse)
async def get_vitals_history(patient_id: str, limit: int = 20):
    """Get vitals history for a patient."""
    history = storage.get_vitals_history(patient_id, limit)

    if not history:
        raise HTTPException(status_code=404, detail="No vitals found for this patient")

    return VitalsHistoryResponse(
        patient_id=patient_id,
        history=[_format_response(item) for item in history],
    )
