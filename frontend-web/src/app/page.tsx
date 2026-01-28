import Image from "next/image";
import Link from "next/link";
import { Bell, Shield, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/Logo.png"
                alt="Pulse Guardian logo"
                width={32}
                height={32}
              />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                Pulse Guardian
              </span>
            </div>
            <Link
              href="/dashboard"
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900">
            AI-Powered Patient Monitoring
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600">
            Protecting Lives Through Intelligent Monitoring
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              href="/analytics"
              className="rounded-lg border-2 border-gray-300 px-8 py-3 text-lg font-semibold text-gray-700 transition-colors hover:border-gray-400"
            >
              View Demo
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={
              <Image
                src="/Logo.png"
                alt="Pulse Guardian logo"
                width={32}
                height={32}
              />
            }
            title="Real-Time Monitoring"
            description="Continuous vitals tracking with instant updates"
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="AI Risk Detection"
            description="Predictive analytics to catch issues early"
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8" />}
            title="Trend Analysis"
            description="Identify patterns before they become critical"
          />
          <FeatureCard
            icon={<Bell className="h-8 w-8" />}
            title="Smart Alerts"
            description="Intelligent notifications for medical staff"
          />
        </div>
      </section>

      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-1 gap-8 text-center text-white md:grid-cols-3">
            <div>
              <p className="text-5xl font-bold">99.9%</p>
              <p className="mt-2 text-lg">Detection Accuracy</p>
            </div>
            <div>
              <p className="text-5xl font-bold">&lt;2s</p>
              <p className="mt-2 text-lg">Alert Response Time</p>
            </div>
            <div>
              <p className="text-5xl font-bold">24/7</p>
              <p className="mt-2 text-lg">Continuous Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-8 text-center text-gray-600">
          <p>&copy; 2026 Pulse Guardian. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <div className="text-blue-600">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
