"use client";

import { useEffect, useState } from "react";

import PatientCard from "@/components/PatientCard";
import { api, Patient, Vitals } from "@/services/api";

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [vitalsMap, setVitalsMap] = useState<Record<string, Vitals>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const patientsData = await api.getAllPatients();
      setPatients(patientsData);

      const vitalsPromises = patientsData.map(async (patient) => {
        try {
          const vitals = await api.getLatestVitals(patient.patient_id);
          return { patientId: patient.patient_id, vitals };
        } catch {
          return { patientId: patient.patient_id, vitals: null };
        }
      });

      const vitalsResults = await Promise.all(vitalsPromises);
      const newVitalsMap: Record<string, Vitals> = {};
      vitalsResults.forEach((result) => {
        if (result.vitals) {
          newVitalsMap[result.patientId] = result.vitals;
        }
      });

      setVitalsMap(newVitalsMap);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError("Failed to fetch data. Is the backend running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-4xl">❌</div>
          <div className="mb-4 text-xl text-red-600">{error}</div>
          <button
            onClick={fetchData}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const criticalCount = Object.values(vitalsMap).filter(
    (v) => v.risk_level === "Critical"
  ).length;
  const warningCount = Object.values(vitalsMap).filter(
    (v) => v.risk_level === "Warning"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏥 Health Risk AI Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Real-time patient monitoring
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Last Updated</div>
              <div className="text-lg font-semibold">
                {lastUpdate.toLocaleTimeString()}
              </div>
              <div className="mt-1 text-xs text-green-600">● Live</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">Total Patients</div>
            <div className="text-3xl font-bold text-gray-900">
              {patients.length}
            </div>
          </div>
          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 shadow">
            <div className="text-sm text-gray-600">Normal</div>
            <div className="text-3xl font-bold text-green-700">
              {patients.length - criticalCount - warningCount}
            </div>
          </div>
          <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 shadow">
            <div className="text-sm text-gray-600">Warning</div>
            <div className="text-3xl font-bold text-yellow-700">
              {warningCount}
            </div>
          </div>
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 shadow">
            <div className="text-sm text-gray-600">Critical</div>
            <div className="text-3xl font-bold text-red-700">
              {criticalCount}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 pb-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Active Patients
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <PatientCard
              key={patient.patient_id}
              patient={patient}
              vitals={vitalsMap[patient.patient_id] || null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
