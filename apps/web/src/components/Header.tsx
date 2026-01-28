"use client";

import { useState } from "react";
import { Bell, RefreshCw, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export default function Header({ title, subtitle, onRefresh }: HeaderProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-64 rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {onRefresh && (
            <button
              onClick={handleRefresh}
              className="rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-50"
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-5 w-5 text-gray-600 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          )}

          <button className="relative rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-50">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              3
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
