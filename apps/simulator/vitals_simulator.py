import random
import time

import requests

API_URL = "http://localhost:8000"


def generate_vitals(patient_id="P001", scenario="normal"):
    """Generate vitals based on scenario."""

    if scenario == "normal":
        heart_rate = random.randint(65, 85)
        spo2 = random.randint(96, 100)
        temperature = round(random.uniform(36.5, 37.2), 1)

    elif scenario == "warning":
        heart_rate = random.randint(100, 120)
        spo2 = random.randint(92, 95)
        temperature = round(random.uniform(37.5, 38.5), 1)

    elif scenario == "critical":
        heart_rate = random.randint(140, 160)
        spo2 = random.randint(85, 90)
        temperature = round(random.uniform(38.5, 39.5), 1)

    return {
        "patient_id": patient_id,
        "heart_rate": heart_rate,
        "spo2": spo2,
        "temperature": temperature,
    }


def send_vitals(vitals):
    """Send vitals to backend API."""
    try:
        response = requests.post(
            f"{API_URL}/vitals/",
            json=vitals,
            headers={"Content-Type": "application/json"},
        )

        if response.status_code == 200:
            data = response.json()
            print(
                f"Sent: HR={vitals['heart_rate']}, "
                f"SpO2={vitals['spo2']}, "
                f"Temp={vitals['temperature']}"
            )
            print(f"  Risk: {data['risk_level']} (Score: {data['risk_score']})")
            return data
        print(f"Error: {response.status_code}")
        return None

    except requests.exceptions.ConnectionError:
        print("Connection Error: Is backend running on port 8000?")
        return None
    except Exception as exc:
        print(f"Error: {exc}")
        return None


def run_simulator(patient_id="P001", scenario="normal", duration_seconds=60):
    """Run simulator for specified duration."""
    print("Vitals Simulator Started")
    print(f"  Patient: {patient_id}")
    print(f"  Scenario: {scenario}")
    print(f"  Duration: {duration_seconds}s")
    print(f"  Sending to: {API_URL}\n")

    start_time = time.time()
    count = 0

    while time.time() - start_time < duration_seconds:
        vitals = generate_vitals(patient_id, scenario)
        send_vitals(vitals)
        count += 1
        time.sleep(2)

    print(f"\nSimulation complete! Sent {count} readings")


if __name__ == "__main__":
    # You can change these parameters:
    # scenario options: "normal", "warning", "critical"
    run_simulator(patient_id="P001", scenario="normal", duration_seconds=30)
