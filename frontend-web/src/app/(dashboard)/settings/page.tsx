"use client";

import { Bell, Database, Settings as SettingsIcon, Shield } from "lucide-react";

import Header from "@/components/Header";

export default function SettingsPage() {
  return (
    <div className="flex-1">
      <Header title="Settings" subtitle="Configure system preferences" />

      <div className="p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <div className="mb-4 flex items-center">
              <SettingsIcon className="mr-2 h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">General</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Refresh Interval
                </label>
                <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                  <option>2 seconds</option>
                  <option>3 seconds</option>
                  <option>5 seconds</option>
                  <option>10 seconds</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Theme
                </label>
                <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <div className="mb-4 flex items-center">
              <Bell className="mr-2 h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Critical Alerts
                </span>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Warning Alerts
                </span>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Sound Notifications
                </span>
                <input type="checkbox" className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <div className="mb-4 flex items-center">
              <Shield className="mr-2 h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Security</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Session Timeout
                </label>
                <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>Never</option>
                </select>
              </div>
              <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                Change Password
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <div className="mb-4 flex items-center">
              <Database className="mr-2 h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Data Management</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  History Retention
                </label>
                <select className="w-full rounded-lg border border-gray-300 px-4 py-2">
                  <option>24 hours</option>
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>90 days</option>
                </select>
              </div>
              <button className="w-full rounded-lg border-2 border-red-600 px-4 py-2 text-red-600 transition-colors hover:bg-red-50">
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
