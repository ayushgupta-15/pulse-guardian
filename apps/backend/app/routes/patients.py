from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.models.schemas import PatientInfo, PatientVitalsHistory, RiskOut, VitalsCore, VitalsOut, VitalsRecord
from app.services.storage import storage

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("/", response_model=list[PatientInfo])
async def get_all_patients():
    """Get all patients."""
    return storage.get_all_patients()


@router.get("/{patient_id}", response_model=PatientVitalsHistory)
async def get_patient_with_vitals(patient_id: str):
    """Get patient info with recent vitals."""

    patient = storage.get_patient(patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    current_vitals = storage.get_latest_vitals(patient_id)
    history = storage.get_vitals_history(patient_id, limit=10)

    def to_out(record: VitalsRecord) -> VitalsOut:
        return VitalsOut(
            patient_id=record.patient_id,
            timestamp=datetime.fromtimestamp(record.timestamp, tz=timezone.utc).isoformat(),
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

    return PatientVitalsHistory(
        patient_id=patient.patient_id,
        name=patient.name,
        current_vitals=to_out(current_vitals) if current_vitals else None,
        history=[to_out(item) for item in history],
    )
