import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString();
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString();
}

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "Critical":
      return "red";
    case "Warning":
      return "yellow";
    default:
      return "green";
  }
}
