"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingDown, TrendingUp, Users } from "lucide-react";

import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatsCard from "@/components/StatsCard";
import { api, Patient, Vitals } from "@/services/api";

export default function AnalyticsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [vitalsMap, setVitalsMap] = useState<Record<string, Vitals>>({});
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;

  const allVitals = Object.values(vitalsMap);
  const avgHeartRate =
    allVitals.reduce((sum, v) => sum + v.heart_rate, 0) / allVitals.length || 0;
  const avgSpO2 =
    allVitals.reduce((sum, v) => sum + v.spo2, 0) / allVitals.length || 0;
  const avgTemp =
    allVitals.reduce((sum, v) => sum + v.temperature, 0) /
      allVitals.length || 0;
  const avgRisk =
    allVitals.reduce((sum, v) => sum + v.risk_score, 0) / allVitals.length || 0;

  return (
    <div className="flex-1">
      <Header
        title="Analytics"
        subtitle="System-wide health metrics and trends"
        onRefresh={fetchData}
      />

      <div className="p-8">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Avg Heart Rate"
            value={avgHeartRate.toFixed(1)}
            icon={Activity}
            color="red"
          />
          <StatsCard
            title="Avg Blood Oxygen"
            value={`${avgSpO2.toFixed(1)}%`}
            icon={TrendingUp}
            color="blue"
          />
          <StatsCard
            title="Avg Temperature"
            value={`${avgTemp.toFixed(1)}°C`}
            icon={TrendingDown}
            color="yellow"
          />
          <StatsCard
            title="Avg Risk Score"
            value={avgRisk.toFixed(1)}
            icon={Users}
            color={avgRisk > 70 ? "red" : avgRisk > 40 ? "yellow" : "green"}
          />
        </div>

        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Risk Distribution
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {["Normal", "Warning", "Critical"].map((level) => {
              const count = allVitals.filter((v) => v.risk_level === level)
                .length;
              const percentage = (count / allVitals.length) * 100 || 0;
              return (
                <div
                  key={level}
                  className={`rounded-lg p-6 text-center ${
                    level === "Critical"
                      ? "border-2 border-red-200 bg-red-50"
                      : level === "Warning"
                      ? "border-2 border-yellow-200 bg-yellow-50"
                      : "border-2 border-green-200 bg-green-50"
                  }`}
                >
                  <div className="text-4xl font-bold text-gray-900">
                    {count}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">{level}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">
              Detailed Patient Metrics
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    HR (BPM)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    SpO2 (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Temp (°C)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {patients.map((patient) => {
                  const vitals = vitalsMap[patient.patient_id];
                  if (!vitals) return null;

                  return (
                    <tr
                      key={patient.patient_id}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.room}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {vitals.heart_rate}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {vitals.spo2}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {vitals.temperature}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {vitals.risk_score.toFixed(1)}
                          </div>
                          <div className="ml-2 h-2 w-24 rounded-full bg-gray-200">
                            <div
                              className={`h-2 rounded-full ${
                                vitals.risk_level === "Critical"
                                  ? "bg-red-600"
                                  : vitals.risk_level === "Warning"
                                  ? "bg-yellow-600"
                                  : "bg-green-600"
                              }`}
                              style={{ width: `${vitals.risk_score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            vitals.risk_level === "Critical"
                              ? "bg-red-100 text-red-800"
                              : vitals.risk_level === "Warning"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {vitals.risk_level}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
