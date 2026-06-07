import type { AnalysisResponse } from "@/lib/types";

interface Props {
  result: AnalysisResponse;
}

function Card({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function OverviewCards({ result }: Props) {
  const { analysis, anomalies, filename } = result;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card label="File" value={filename} sub={`${analysis.shape.rows.toLocaleString()} rows`} />
      <Card
        label="Columns"
        value={analysis.shape.columns}
        sub={`${analysis.numeric_columns.length} numeric · ${analysis.categorical_columns.length} categorical`}
      />
      <Card
        label="Anomalies"
        value={anomalies.anomaly_count.toLocaleString()}
        sub={`${(anomalies.anomaly_rate * 100).toFixed(1)}% of rows (Z > 3)`}
      />
      <Card
        label="Missing values"
        value={Object.values(analysis.summary).reduce((s, c) => s + c.missing, 0).toLocaleString()}
        sub="across all columns"
      />
    </div>
  );
}
