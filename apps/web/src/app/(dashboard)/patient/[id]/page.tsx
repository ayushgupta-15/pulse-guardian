"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import ErrorMessage from "@/components/ErrorMessage";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import RiskBadge from "@/components/RiskBadge";
import VitalCard from "@/components/VitalCard";
import VitalsChart from "@/components/VitalsChart";
import { api, PatientWithVitals } from "@/services/api";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patientData, setPatientData] = useState<PatientWithVitals | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPatientData = async () => {
    try {
      const data = await api.getPatientWithVitals(patientId);
      setPatientData(data);
    } catch (err) {
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

  if (loading) return <LoadingSpinner />;
  if (!patientData) return <ErrorMessage message="Patient not found" />;

  const vitals = patientData.current_vitals;

  return (
    <div className="flex-1">
      <Header
        title={patientData.name}
        subtitle={`Patient ID: ${patientData.patient_id}`}
        onRefresh={fetchPatientData}
      />

      <div className="p-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 flex items-center text-blue-600 transition-colors hover:text-blue-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>

        {vitals ? (
          <div className="space-y-8">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Current Status
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{vitals.message}</p>
                </div>
                <RiskBadge
                  riskLevel={vitals.risk_level}
                  riskScore={vitals.risk_score}
                />
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Current Vitals
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
            </div>

            {patientData.history.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Trend Analysis
                </h2>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <VitalsChart data={patientData.history} metric="heart_rate" />
                  <VitalsChart data={patientData.history} metric="spo2" />
                  <VitalsChart data={patientData.history} metric="temperature" />
                </div>
              </div>
            )}

            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Recent History ({patientData.history.length} readings)
              </h2>
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                <div className="overflow-x-auto">
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
                          Temperature
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Risk Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {patientData.history
                        .slice(-20)
                        .reverse()
                        .map((record, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {new Date(
                                record.timestamp * 1000
                              ).toLocaleTimeString()}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                              {record.heart_rate} BPM
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                              {record.spo2}%
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                              {record.temperature}°C
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              {record.risk_score.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white py-12 text-center shadow">
            <div className="mb-4 text-4xl">📊</div>
            <p className="text-gray-600">No vitals data available yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Start the simulator to see live data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
