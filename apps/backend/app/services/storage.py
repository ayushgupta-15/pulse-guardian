from collections import deque
from typing import Dict, List, Optional

from app.models.schemas import PatientInfo, VitalsRecord


class InMemoryStorage:
    """Simple in-memory storage for vitals data."""

    def __init__(self, max_history_per_patient: int = 100):
        # Store vitals history per patient
        self.vitals_history: Dict[str, deque] = {}
        self.max_history = max_history_per_patient

        # Store patient information
        self.patients: Dict[str, PatientInfo] = {
            "P001": PatientInfo(
                patient_id="P001",
                name="John Doe",
                age=65,
                room="ICU-101",
                status="stable",
            ),
            "P002": PatientInfo(
                patient_id="P002",
                name="Jane Smith",
                age=52,
                room="ICU-102",
                status="stable",
            ),
            "P003": PatientInfo(
                patient_id="P003",
                name="Bob Johnson",
                age=71,
                room="ICU-103",
                status="stable",
            ),
        }

    def add_vitals(self, vitals: VitalsRecord):
        """Add new vitals reading."""
        patient_id = vitals.patient_id

        if patient_id not in self.vitals_history:
            self.vitals_history[patient_id] = deque(maxlen=self.max_history)

        self.vitals_history[patient_id].append(vitals)

        # Auto-create patient if missing
        if patient_id not in self.patients:
            self.patients[patient_id] = PatientInfo(
                patient_id=patient_id,
                name="Unknown",
                age=0,
                room="Unassigned",
                status="stable",
            )

        # Update patient status based on risk level
        self.patients[patient_id].status = vitals.risk_level.lower()

    def get_latest_vitals(self, patient_id: str) -> Optional[VitalsRecord]:
        """Get most recent vitals for a patient."""
        if patient_id in self.vitals_history and len(self.vitals_history[patient_id]) > 0:
            return self.vitals_history[patient_id][-1]
        return None

    def get_vitals_history(self, patient_id: str, limit: int = 20) -> List[VitalsRecord]:
        """Get recent vitals history."""
        if patient_id not in self.vitals_history:
            return []

        history = list(self.vitals_history[patient_id])
        return history[-limit:]

    def get_all_patients(self) -> List[PatientInfo]:
        """Get all patients."""
        return list(self.patients.values())

    def get_patient(self, patient_id: str) -> Optional[PatientInfo]:
        """Get specific patient info."""
        return self.patients.get(patient_id)


# Global storage instance
storage = InMemoryStorage()
