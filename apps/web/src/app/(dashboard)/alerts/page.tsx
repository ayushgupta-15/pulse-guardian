"use client";

import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import { api, Patient, Vitals } from "@/services/api";

export default function AlertsPage() {
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

  const alerts = patients
    .map((patient) => {
      const vitals = vitalsMap[patient.patient_id];
      if (!vitals || vitals.risk_level === "Normal") return null;

      return {
        patient,
        vitals,
        timestamp: vitals.timestamp,
      };
    })
    .filter((alert) => alert !== null)
    .sort((a, b) => b!.vitals.risk_score - a!.vitals.risk_score);

  return (
    <div className="flex-1">
      <Header
        title="Active Alerts"
        subtitle={`${alerts.length} active alerts require attention`}
        onRefresh={fetchData}
      />

      <div className="p-8">
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => {
              if (!alert) return null;
              const { patient, vitals } = alert;
              const isCritical = vitals.risk_level === "Critical";

              return (
                <div
                  key={patient.patient_id}
                  className={`rounded-lg border-l-4 bg-white p-6 shadow-md ${
                    isCritical ? "border-red-500" : "border-yellow-500"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {isCritical ? (
                        <AlertCircle className="mt-1 h-6 w-6 text-red-500" />
                      ) : (
                        <AlertTriangle className="mt-1 h-6 w-6 text-yellow-500" />
                      )}
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            {patient.name}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isCritical
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {vitals.risk_level}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {patient.room} • ID: {patient.patient_id}
                        </p>
                        <p className="mt-2 text-sm font-medium text-gray-700">
                          {vitals.message}
                        </p>

                        <div className="mt-4 grid grid-cols-3 gap-4">
                          <div className="rounded bg-gray-50 p-3">
                            <div className="text-xs text-gray-600">
                              Heart Rate
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {vitals.heart_rate} BPM
                            </div>
                          </div>
                          <div className="rounded bg-gray-50 p-3">
                            <div className="text-xs text-gray-600">SpO2</div>
                            <div className="text-lg font-bold text-gray-900">
                              {vitals.spo2}%
                            </div>
                          </div>
                          <div className="rounded bg-gray-50 p-3">
                            <div className="text-xs text-gray-600">
                              Temperature
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {vitals.temperature}°C
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-600">Risk Score</div>
                      <div
                        className={`text-3xl font-bold ${
                          isCritical ? "text-red-600" : "text-yellow-600"
                        }`}
                      >
                        {vitals.risk_score.toFixed(1)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {new Date(vitals.timestamp * 1000).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow">
            <Info className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              No Active Alerts
            </h2>
            <p className="mt-2 text-gray-600">
              All patients are currently in normal condition
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
