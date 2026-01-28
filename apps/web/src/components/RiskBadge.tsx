interface RiskBadgeProps {
  riskLevel: string;
  riskScore: number;
}

export default function RiskBadge({ riskLevel, riskScore }: RiskBadgeProps) {
  const colors = {
    Normal: "bg-green-100 text-green-800 border-green-300",
    Warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Critical: "bg-red-100 text-red-800 border-red-300",
  };

  const color = colors[riskLevel as keyof typeof colors] || colors.Normal;

  return (
    <div className={`rounded-lg border-2 px-4 py-2 font-semibold ${color}`}>
      <div className="text-sm">Risk Level</div>
      <div className="text-2xl">{riskLevel}</div>
      <div className="mt-1 text-xs">Score: {riskScore.toFixed(1)}</div>
    </div>
  );
}
