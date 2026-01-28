"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Vitals } from "@/services/api";

interface VitalsChartProps {
  data: Vitals[];
  metric: "heart_rate" | "spo2" | "temperature";
}

export default function VitalsChart({ data, metric }: VitalsChartProps) {
  const chartConfig = {
    heart_rate: {
      label: "Heart Rate (BPM)",
      color: "#ef4444",
      domain: [40, 160],
    },
    spo2: {
      label: "Blood Oxygen (%)",
      color: "#3b82f6",
      domain: [85, 100],
    },
    temperature: {
      label: "Temperature (°C)",
      color: "#f59e0b",
      domain: [35, 40],
    },
  };

  const config = chartConfig[metric];

  const chartData = data.map((v) => ({
    time: new Date(v.timestamp * 1000).toLocaleTimeString(),
    value: v[metric],
  }));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        {config.label}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis domain={config.domain} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke={config.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name={config.label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
