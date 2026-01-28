from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib

# =====================================================
# LOAD TRAINED PIPELINE
# =====================================================
bundle = joblib.load("model/health_risk_pipeline_v2_final.pkl")

iso_model = bundle["iso_model"]
scaler = bundle["scaler"]
rf_model = bundle["rf_model"]
unsup_features = bundle["unsup_features"]
sup_features = bundle["sup_features"]
thresholds = bundle["thresholds"]

# =====================================================
# FASTAPI APP
# =====================================================
app = FastAPI(title="AI Wearable Health Risk API")

# =====================================================
# IN-MEMORY STORAGE (Demo Scope)
# =====================================================
patient_history = {}
reference_anomaly_scores = []

# =====================================================
# INPUT SCHEMA
# =====================================================
class VitalInput(BaseModel):
    patient_id: str
    heart_rate: float
    oxygen_saturation: float
    body_temperature: float
    respiratory_rate: float
    timestamp: str

# =====================================================
# BUILD REFERENCE ANOMALY DISTRIBUTION
# =====================================================
def build_reference_distribution():
    global reference_anomaly_scores
    X_ref = np.random.normal(0, 1, (2000, len(unsup_features)))
    reference_anomaly_scores = -iso_model.decision_function(X_ref)

build_reference_distribution()

# =====================================================
# HELPER FUNCTIONS
# =====================================================
def update_patient_baseline(pid, vitals):
    if pid not in patient_history:
        patient_history[pid] = []
    patient_history[pid].append(vitals)
    return pd.DataFrame(patient_history[pid]).tail(10).mean()


def reading_count(pid):
    return len(patient_history.get(pid, []))


def anomaly_percentile(score):
    return float(np.sum(reference_anomaly_scores < score) / len(reference_anomaly_scores))


# =====================================================
# FINAL RISK DECISION LOGIC (FIXED)
# =====================================================
def assign_risk(anomaly, prob, count, vitals):
    hr, spo2, temp, rr = vitals.values()

    # 1️⃣ HARD SAFETY OVERRIDE (ABSOLUTE DANGER)
    if hr >= 120 or spo2 <= 88 or temp >= 39.0 or rr >= 28:
        return "Critical", "Clinical danger threshold breached"

    # 2️⃣ COLD START (IMPROVED)
    if count < 3:
        if anomaly > thresholds["anomaly_critical"]:
            return "Critical", "Severe anomaly detected during baseline formation"
        elif anomaly > thresholds["anomaly_warning"]:
            return "Warning", "Early anomaly during baseline formation"
        else:
            return "Normal", "Baseline forming"

    # 3️⃣ CLINICAL RISK BOOST
    clinical_flags = sum([
        hr >= 100,
        spo2 <= 92,
        temp >= 38.0,
        rr >= 22
    ])

    if clinical_flags >= 2 and prob > 0.5:
        return "Critical", "Multiple clinical risks with elevated ML probability"

    # 4️⃣ STANDARD ML DECISION
    if anomaly > thresholds["anomaly_critical"] and prob > thresholds["risk_critical"]:
        return "Critical", "High anomaly + ML agreement"
    elif anomaly > thresholds["anomaly_warning"] or prob > thresholds["risk_warning"]:
        return "Warning", "Moderate anomaly or ML risk"
    else:
        return "Normal", "Vitals within learned safe patterns"


# =====================================================
# MAIN PREDICTION ENDPOINT
# =====================================================
@app.post("/predict")
def predict(v: VitalInput):

    baseline = update_patient_baseline(
        v.patient_id,
        {
            "heart_rate": v.heart_rate,
            "oxygen_saturation": v.oxygen_saturation,
            "body_temperature": v.body_temperature
        }
    )

    count = reading_count(v.patient_id)

    row = {
        "Heart Rate": v.heart_rate,
        "Oxygen Saturation": v.oxygen_saturation,
        "Body Temperature": v.body_temperature,
        "Respiratory Rate": v.respiratory_rate,

        "Heart Rate_delta": v.heart_rate - baseline["heart_rate"],
        "Oxygen Saturation_delta": v.oxygen_saturation - baseline["oxygen_saturation"],
        "Body Temperature_delta": v.body_temperature - baseline["body_temperature"],

        "Derived_HRV": 0.1,
        "Derived_MAP": 95,
        "Derived_Pulse_Pressure": 40
    }

    df = pd.DataFrame([row])

    # UNSUPERVISED
    X_unsup = scaler.transform(df[unsup_features])
    anomaly_score = -iso_model.decision_function(X_unsup)[0]
    anomaly_pct = anomaly_percentile(anomaly_score)

    df["anomaly_percentile"] = anomaly_pct

    # SUPERVISED
    risk_prob = rf_model.predict_proba(df[sup_features])[0][1]

    # FINAL DECISION
    risk, reason = assign_risk(
        anomaly_pct,
        risk_prob,
        count,
        {
            "hr": v.heart_rate,
            "spo2": v.oxygen_saturation,
            "temp": v.body_temperature,
            "rr": v.respiratory_rate
        }
    )

    return {
        "patient_id": v.patient_id,
        "risk_level": risk,
        "risk_probability": round(float(risk_prob), 3),
        "anomaly_percentile": round(float(anomaly_pct), 3),
        "reading_count": count,
        "reason": reason,
        "timestamp": v.timestamp,
        "status": "success"
    }
