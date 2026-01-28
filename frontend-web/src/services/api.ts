const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Patient {
  patient_id: string;
  name: string;
  age: number;
  room: string;
  status: string;
}

export interface Vitals {
  patient_id: string;
  heart_rate: number;
  spo2: number;
  temperature: number;
  timestamp: number;
  risk_score: number;
  risk_level: string;
  message: string;
}

export interface PatientWithVitals {
  patient_id: string;
  name: string;
  current_vitals: Vitals | null;
  history: Vitals[];
}

export const api = {
  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error("Backend not reachable");
    return response.json();
  },

  async getAllPatients(): Promise<Patient[]> {
    const response = await fetch(`${API_BASE_URL}/patients/`);
    if (!response.ok) throw new Error("Failed to fetch patients");
    return response.json();
  },

  async getPatientWithVitals(patientId: string): Promise<PatientWithVitals> {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`);
    if (!response.ok) throw new Error("Failed to fetch patient data");
    return response.json();
  },

  async getLatestVitals(patientId: string): Promise<Vitals> {
    const response = await fetch(`${API_BASE_URL}/vitals/latest/${patientId}`);
    if (!response.ok) throw new Error("No vitals found");
    return response.json();
  },

  async getVitalsHistory(patientId: string, limit: number = 20) {
    const response = await fetch(
      `${API_BASE_URL}/vitals/history/${patientId}?limit=${limit}`
    );
    if (!response.ok) throw new Error("Failed to fetch history");
    return response.json();
  },
};
