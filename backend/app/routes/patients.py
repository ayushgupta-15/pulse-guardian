from fastapi import APIRouter, HTTPException

from app.models.schemas import PatientInfo, PatientVitalsHistory
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

    return PatientVitalsHistory(
        patient_id=patient.patient_id,
        name=patient.name,
        current_vitals=current_vitals,
        history=history,
    )
