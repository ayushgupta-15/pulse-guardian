"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import { api, Patient, Vitals } from "@/services/api";

export default function PatientsPage() {
  const router = useRouter();
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
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex-1">
      <Header
        title="All Patients"
        subtitle={`Managing ${patients.length} patients`}
        onRefresh={fetchData}
      />

      <div className="p-8">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Heart Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  SpO2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Temperature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Risk Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {patients.map((patient) => {
                const vitals = vitalsMap[patient.patient_id];
                return (
                  <tr
                    key={patient.patient_id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/patient/${patient.patient_id}`)}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                            {patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {patient.patient_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {patient.room}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {vitals ? `${vitals.heart_rate} BPM` : "-"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {vitals ? `${vitals.spo2}%` : "-"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {vitals ? `${vitals.temperature}°C` : "-"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {vitals && (
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
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-blue-600 hover:text-blue-800">
                      View Details →
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
