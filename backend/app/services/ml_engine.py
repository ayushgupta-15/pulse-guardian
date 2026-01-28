from typing import List

from app.models.schemas import RiskAssessment, VitalsInput


class MLEngine:
    """Simple rule-based risk assessment (we'll enhance this later)."""

    # Normal ranges
    NORMAL_RANGES = {
        "heart_rate": (60, 100),
        "spo2": (95, 100),
        "temperature": (36.1, 37.2),
    }

    # Critical thresholds
    CRITICAL_THRESHOLDS = {
        "heart_rate": (40, 140),
        "spo2": (90, 100),
        "temperature": (35.0, 39.0),
    }

    def calculate_risk(self, vitals: VitalsInput, history: List = None) -> RiskAssessment:
        """Calculate risk score based on current vitals."""

        risk_score = 0.0
        risk_factors = []

        # Check heart rate
        hr = vitals.heart_rate
        if hr < self.CRITICAL_THRESHOLDS["heart_rate"][0]:
            risk_score += 35
            risk_factors.append(f"Critically low heart rate: {hr} BPM")
        elif hr > self.CRITICAL_THRESHOLDS["heart_rate"][1]:
            risk_score += 35
            risk_factors.append(f"Critically high heart rate: {hr} BPM")
        elif hr < self.NORMAL_RANGES["heart_rate"][0] or hr > self.NORMAL_RANGES["heart_rate"][1]:
            risk_score += 15
            risk_factors.append(f"Abnormal heart rate: {hr} BPM")

        # Check SpO2
        spo2 = vitals.spo2
        if spo2 < self.CRITICAL_THRESHOLDS["spo2"][0]:
            risk_score += 40
            risk_factors.append(f"Critically low oxygen: {spo2}%")
        elif spo2 < self.NORMAL_RANGES["spo2"][0]:
            risk_score += 20
            risk_factors.append(f"Low oxygen saturation: {spo2}%")

        # Check temperature
        temp = vitals.temperature
        if temp < self.CRITICAL_THRESHOLDS["temperature"][0]:
            risk_score += 30
            risk_factors.append(f"Hypothermia risk: {temp}°C")
        elif temp > self.CRITICAL_THRESHOLDS["temperature"][1]:
            risk_score += 30
            risk_factors.append(f"High fever: {temp}°C")
        elif temp < self.NORMAL_RANGES["temperature"][0] or temp > self.NORMAL_RANGES["temperature"][1]:
            risk_score += 10
            risk_factors.append(f"Abnormal temperature: {temp}°C")

        # Cap risk score at 100
        risk_score = min(risk_score, 100)

        # Determine risk level
        if risk_score >= 70:
            risk_level = "Critical"
            recommendation = "Immediate medical attention required"
        elif risk_score >= 40:
            risk_level = "Warning"
            recommendation = "Close monitoring recommended"
        else:
            risk_level = "Normal"
            recommendation = "Continue routine monitoring"

        if not risk_factors:
            risk_factors.append("All vitals within normal range")

        return RiskAssessment(
            risk_score=round(risk_score, 2),
            risk_level=risk_level,
            factors=risk_factors,
            recommendation=recommendation,
        )


# Global ML engine instance
ml_engine = MLEngine()
