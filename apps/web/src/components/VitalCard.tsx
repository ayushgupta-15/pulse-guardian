interface VitalCardProps {
  label: string;
  value: number | string;
  unit: string;
  icon?: string;
  status?: "normal" | "warning" | "critical";
}

export default function VitalCard({
  label,
  value,
  unit,
  icon = "📊",
  status = "normal",
}: VitalCardProps) {
  const statusColors = {
    normal: "border-green-200 bg-green-50",
    warning: "border-yellow-200 bg-yellow-50",
    critical: "border-red-200 bg-red-50",
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${statusColors[status]}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">{label}</div>
          <div className="mt-1 text-3xl font-bold">
            {value}
            <span className="ml-1 text-lg text-gray-500">{unit}</span>
          </div>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
