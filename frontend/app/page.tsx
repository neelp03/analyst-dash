"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import AnomalySection from "@/components/AnomalySection";
import FileUpload from "@/components/FileUpload";
import OverviewCards from "@/components/OverviewCards";
import StatsTable from "@/components/StatsTable";
import { analyzeCSV } from "@/lib/api";
import type { AnalysisResponse } from "@/lib/types";

// Recharts uses browser APIs — must be loaded client-side only
const DistributionCharts = dynamic(() => import("@/components/DistributionCharts"), { ssr: false });
const CorrelationHeatmap = dynamic(() => import("@/components/CorrelationHeatmap"), { ssr: false });

type Tab = "stats" | "distributions" | "correlation" | "anomalies";

const TABS: { id: Tab; label: (r: AnalysisResponse) => string }[] = [
  { id: "stats", label: () => "Summary Stats" },
  { id: "distributions", label: (r) => `Distributions (${r.analysis.numeric_columns.length})` },
  { id: "correlation", label: () => "Correlation" },
  { id: "anomalies", label: (r) => `Anomalies (${r.anomalies.anomaly_count})` },
];

export default function Page() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("stats");

  async function handleUpload(file: File) {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeCSV(file);
      setResult(data);
      setTab("stats");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analyst Dash</h1>
        <p className="mt-1 text-gray-500">Upload a CSV for instant statistical analysis and anomaly detection.</p>
      </div>

      <FileUpload onUpload={handleUpload} loading={loading} />

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="mt-8 space-y-5">
          <OverviewCards result={result} />

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex border-b border-gray-200">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${
                    tab === id
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {label(result)}
                </button>
              ))}
            </div>

            <div className="p-6">
              {tab === "stats" && <StatsTable result={result} />}
              {tab === "distributions" && <DistributionCharts result={result} />}
              {tab === "correlation" && <CorrelationHeatmap result={result} />}
              {tab === "anomalies" && <AnomalySection result={result} />}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
