const API_BASE_URL = "http://localhost:8000";

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

export const api = {
  async getAllPatients(): Promise<Patient[]> {
    const response = await fetch(`${API_BASE_URL}/patients/`);
    if (!response.ok) throw new Error("Failed to fetch patients");
    return response.json();
  },

  async getLatestVitals(patientId: string): Promise<Vitals> {
    const response = await fetch(`${API_BASE_URL}/vitals/latest/${patientId}`);
    if (!response.ok) throw new Error("No vitals found");
    return response.json();
  },
};
