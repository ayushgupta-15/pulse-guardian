import Link from "next/link";

import { Patient, Vitals } from "@/services/api";
import RiskBadge from "./RiskBadge";

interface PatientCardProps {
  patient: Patient;
  vitals: Vitals | null;
}

export default function PatientCard({ patient, vitals }: PatientCardProps) {
  return (
    <Link href={`/patient/${patient.patient_id}`}>
      <div className="cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-6 shadow-md transition-shadow hover:border-blue-400 hover:shadow-lg">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
            <p className="text-sm text-gray-600">ID: {patient.patient_id}</p>
            <p className="text-sm text-gray-600">Room: {patient.room}</p>
            <p className="text-sm text-gray-600">Age: {patient.age}</p>
          </div>
          {vitals && (
            <RiskBadge
              riskLevel={vitals.risk_level}
              riskScore={vitals.risk_score}
            />
          )}
        </div>

        {vitals ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded bg-gray-50 p-2 text-center">
              <div className="text-xs text-gray-600">Heart Rate</div>
              <div className="text-lg font-bold">{vitals.heart_rate} BPM</div>
            </div>
            <div className="rounded bg-gray-50 p-2 text-center">
              <div className="text-xs text-gray-600">SpO2</div>
              <div className="text-lg font-bold">{vitals.spo2}%</div>
            </div>
            <div className="rounded bg-gray-50 p-2 text-center">
              <div className="text-xs text-gray-600">Temperature</div>
              <div className="text-lg font-bold">{vitals.temperature}°C</div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500">
            No vitals data available
          </div>
        )}

        <div className="mt-4 text-right text-sm text-blue-600">
          View Details →
        </div>
      </div>
    </Link>
  );
}
