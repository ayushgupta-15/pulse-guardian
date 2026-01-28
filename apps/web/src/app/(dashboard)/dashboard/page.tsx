"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Users } from "lucide-react";

import ErrorMessage from "@/components/ErrorMessage";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import PatientCard from "@/components/PatientCard";
import StatsCard from "@/components/StatsCard";
import { api, Patient, Vitals } from "@/services/api";

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [vitalsMap, setVitalsMap] = useState<Record<string, Vitals>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  const criticalCount = Object.values(vitalsMap).filter(
    (v) => v.risk_level === "Critical"
  ).length;
  const warningCount = Object.values(vitalsMap).filter(
    (v) => v.risk_level === "Warning"
  ).length;
  const normalCount = patients.length - criticalCount - warningCount;
  const activeCount = Object.keys(vitalsMap).length;

  return (
    <div className="flex-1">
      <Header
        title="Dashboard"
        subtitle="Real-time patient monitoring overview"
        onRefresh={fetchData}
      />

      <div className="p-8">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Active Patients"
            value={activeCount}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Normal Status"
            value={normalCount}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Warnings"
            value={warningCount}
            icon={AlertTriangle}
            color="yellow"
          />
          <StatsCard
            title="Critical"
            value={criticalCount}
            icon={Activity}
            color="red"
          />
        </div>

        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Patient Overview
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
    </div>
  );
}
