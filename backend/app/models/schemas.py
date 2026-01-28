from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class VitalsInput(BaseModel):
    """Incoming vitals from sensor/simulator."""

    patient_id: str
    heart_rate: int = Field(ge=0, le=300, description="Heart rate in BPM")
    spo2: int = Field(ge=0, le=100, description="Blood oxygen saturation %")
    temperature: float = Field(ge=30.0, le=45.0, description="Body temperature in Celsius")
    timestamp: Optional[float] = None

    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "P001",
                "heart_rate": 75,
                "spo2": 98,
                "temperature": 37.0,
            }
        }


class VitalsResponse(BaseModel):
    """Response after processing vitals."""

    patient_id: str
    heart_rate: int
    spo2: int
    temperature: float
    timestamp: float
    risk_score: float
    risk_level: str
    message: str


class RiskAssessment(BaseModel):
    """Risk analysis result."""

    risk_score: float = Field(ge=0, le=100, description="Risk score 0-100")
    risk_level: str = Field(description="Normal, Warning, or Critical")
    factors: List[str] = Field(description="Contributing risk factors")
    recommendation: str


class PatientInfo(BaseModel):
    """Patient basic information."""

    patient_id: str
    name: str
    age: int
    room: str
    status: str = "stable"


class PatientVitalsHistory(BaseModel):
    """Patient with recent vitals history."""

    patient_id: str
    name: str
    current_vitals: Optional[VitalsResponse] = None
    history: List[VitalsResponse] = Field(default_factory=list)
