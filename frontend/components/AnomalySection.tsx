"use client";

import type { AnalysisResponse } from "@/lib/types";

export default function AnomalySection({ result }: { result: AnalysisResponse }) {
  const { anomalies } = result;
  const colEntries = Object.entries(anomalies.column_details);
  const sampleCols = anomalies.anomaly_sample[0] ? Object.keys(anomalies.anomaly_sample[0]) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Stat color="orange" label="Anomalous rows" value={anomalies.anomaly_count.toLocaleString()} />
        <Stat color="orange" label="Anomaly rate" value={`${(anomalies.anomaly_rate * 100).toFixed(2)}%`} />
        <Stat color="gray" label="Total rows" value={anomalies.total_rows.toLocaleString()} />
      </div>

      {colEntries.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Per-column outliers (|Z| &gt; 3.0)</p>
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {colEntries.map(([col, d]) => (
              <div key={col} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="font-medium text-gray-800">{col}</span>
                <div className="flex gap-5 text-xs text-gray-500">
                  <span><strong>{d.outlier_count}</strong> outliers</span>
                  <span>mean {d.mean}</span>
                  <span>std {d.std}</span>
                  <span>upper {d.upper_threshold}</span>
                  <span>lower {d.lower_threshold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {anomalies.anomaly_sample.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">
            Sample anomalous rows (first {Math.min(10, anomalies.anomaly_sample.length)})
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-xs">
              <thead className="bg-orange-50">
                <tr>
                  {sampleCols.map((k) => (
                    <th key={k} className="px-3 py-2 text-left font-medium text-gray-500">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {anomalies.anomaly_sample.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-orange-50/50">
                    {sampleCols.map((k) => (
                      <td key={k} className="px-3 py-2 tabular-nums text-gray-700">
                        {typeof row[k] === "number" ? (row[k] as number).toFixed(3) : String(row[k] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ color, label, value }: { color: "orange" | "gray"; label: string; value: string }) {
  const cls = color === "orange"
    ? "bg-orange-50 border-orange-200 text-orange-600"
    : "bg-gray-50 border-gray-200 text-gray-500";
  return (
    <div className={`rounded-lg border p-4 ${cls}`}>
      <p className="text-sm">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color === "orange" ? "text-orange-700" : "text-gray-700"}`}>{value}</p>
    </div>
  );
}
