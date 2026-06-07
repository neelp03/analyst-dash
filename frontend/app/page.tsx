"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import AnomalySection from "@/components/AnomalySection";
import BoxPlots from "@/components/BoxPlots";
import FileUpload from "@/components/FileUpload";
import InsightsBanner from "@/components/InsightsBanner";
import OverviewCards from "@/components/OverviewCards";
import StatsTable from "@/components/StatsTable";
import { analyzeCSV } from "@/lib/api";
import type { AnalysisResponse } from "@/lib/types";

const DistributionCharts = dynamic(() => import("@/components/DistributionCharts"), { ssr: false });
const CorrelationHeatmap  = dynamic(() => import("@/components/CorrelationHeatmap"),  { ssr: false });

type Tab = "stats" | "box-plots" | "distributions" | "correlation" | "anomalies";

const TABS: { id: Tab; label: (r: AnalysisResponse) => string }[] = [
  { id: "stats",         label: () => "Summary Stats" },
  { id: "box-plots",     label: (r) => `Box Plots (${r.analysis.numeric_columns.length})` },
  { id: "distributions", label: (r) => `Distributions (${r.analysis.numeric_columns.length})` },
  { id: "correlation",   label: () => "Correlation" },
  { id: "anomalies",     label: (r) => `Anomalies (${r.anomalies.anomaly_count})` },
];

type HistoryEntry = AnalysisResponse & { id: string };

export default function Page() {
  const [history, setHistory]   = useState<HistoryEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [tab, setTab]           = useState<Tab>("stats");

  const result = history.find((h) => h.id === activeId) ?? null;

  async function handleUpload(file: File) {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeCSV(file);
      const id = `${Date.now()}`;
      setHistory((prev) => [{ ...data, id }, ...prev].slice(0, 5));
      setActiveId(id);
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
        <p className="mt-1 text-gray-500">Upload a CSV for instant EDA, box plots, correlation analysis, and anomaly detection.</p>
      </div>

      <FileUpload onUpload={handleUpload} loading={loading} />

      {/* Recent analyses history */}
      {history.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400">Recent:</span>
          {history.map((h) => (
            <button
              key={h.id}
              onClick={() => { setActiveId(h.id); setTab("stats"); }}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                h.id === activeId
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {h.filename}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <OverviewCards result={result} />

          {/* Auto-insights banner — shown only when there are findings */}
          <InsightsBanner insights={result.insights} />

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap border-b border-gray-200">
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
              {tab === "stats"         && <StatsTable result={result} />}
              {tab === "box-plots"     && <BoxPlots result={result} />}
              {tab === "distributions" && <DistributionCharts result={result} />}
              {tab === "correlation"   && <CorrelationHeatmap result={result} />}
              {tab === "anomalies"     && <AnomalySection result={result} />}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
