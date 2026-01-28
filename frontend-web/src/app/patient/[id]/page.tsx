"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import RiskBadge from "@/components/RiskBadge";
import VitalCard from "@/components/VitalCard";
import { api, PatientWithVitals } from "@/services/api";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patientData, setPatientData] = useState<PatientWithVitals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatientData = async () => {
    try {
      const data = await api.getPatientWithVitals(patientId);
      setPatientData(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch patient data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
    const interval = setInterval(fetchPatientData, 2000);
    return () => clearInterval(interval);
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading patient data...</div>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-600">{error}</div>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const vitals = patientData.current_vitals;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {patientData.name}
          </h1>
          <p className="text-sm text-gray-600">ID: {patientData.patient_id}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-8">
        {vitals ? (
          <>
            <div className="mb-6">
              <RiskBadge
                riskLevel={vitals.risk_level}
                riskScore={vitals.risk_score}
              />
              <p className="mt-2 text-sm text-gray-600">{vitals.message}</p>
            </div>

            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Current Vitals
            </h2>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <VitalCard
                label="Heart Rate"
                value={vitals.heart_rate}
                unit="BPM"
                icon="❤️"
                status={
                  vitals.heart_rate < 60 || vitals.heart_rate > 100
                    ? vitals.heart_rate < 40 || vitals.heart_rate > 140
                      ? "critical"
                      : "warning"
                    : "normal"
                }
              />
              <VitalCard
                label="Blood Oxygen"
                value={vitals.spo2}
                unit="%"
                icon="🫁"
                status={
                  vitals.spo2 < 95
                    ? vitals.spo2 < 90
                      ? "critical"
                      : "warning"
                    : "normal"
                }
              />
              <VitalCard
                label="Temperature"
                value={vitals.temperature}
                unit="°C"
                icon="🌡️"
                status={
                  vitals.temperature < 36.1 || vitals.temperature > 37.2
                    ? vitals.temperature < 35 || vitals.temperature > 39
                      ? "critical"
                      : "warning"
                    : "normal"
                }
              />
            </div>

            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Recent History ({patientData.history.length} readings)
            </h2>
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Heart Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      SpO2
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Temp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Risk
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {patientData.history
                    .slice(-10)
                    .reverse()
                    .map((record, idx) => (
                      <tr key={idx}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(
                            record.timestamp * 1000
                          ).toLocaleTimeString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          {record.heart_rate} BPM
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          {record.spo2}%
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          {record.temperature}°C
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`rounded px-2 py-1 text-xs font-semibold ${
                              record.risk_level === "Critical"
                                ? "bg-red-100 text-red-800"
                                : record.risk_level === "Warning"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {record.risk_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="rounded-lg bg-white py-12 text-center shadow">
            <div className="mb-4 text-4xl">📊</div>
            <p className="text-gray-600">No vitals data available yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Start the simulator to see data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
