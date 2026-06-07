"use client";

import type { AnalysisResponse, NumericStats } from "@/lib/types";

function BoxPlot({ stats }: { stats: NumericStats }) {
  const { min, q25, median, q75, max } = stats;
  const range = max - min;
  if (range === 0 || !isFinite(range)) return <span className="text-xs text-gray-400">constant</span>;

  // Map a value to SVG x coordinate within [20, 580]
  const x = (v: number) => ((v - min) / range) * 560 + 20;
  const cy = 32;

  return (
    <svg viewBox="0 0 600 64" width="100%" className="overflow-visible">
      {/* Whiskers */}
      <line x1={x(min)} y1={cy} x2={x(q25)} y2={cy} stroke="#cbd5e1" strokeWidth={1.5} />
      <line x1={x(q75)} y1={cy} x2={x(max)} y2={cy} stroke="#cbd5e1" strokeWidth={1.5} />
      {/* Min / Max caps */}
      <line x1={x(min)} y1={cy - 6} x2={x(min)} y2={cy + 6} stroke="#94a3b8" strokeWidth={1.5} />
      <line x1={x(max)} y1={cy - 6} x2={x(max)} y2={cy + 6} stroke="#94a3b8" strokeWidth={1.5} />
      {/* IQR box */}
      <rect
        x={x(q25)} y={cy - 13}
        width={Math.max(x(q75) - x(q25), 2)} height={26}
        fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.5} rx={3}
      />
      {/* Median line */}
      <line x1={x(median)} y1={cy - 13} x2={x(median)} y2={cy + 13}
        stroke="#1d4ed8" strokeWidth={2.5} />
      {/* Labels */}
      <text x={x(min)}    y={cy + 24} textAnchor="middle" fontSize={9} fill="#6b7280">{min.toFixed(2)}</text>
      <text x={x(median)} y={cy - 17} textAnchor="middle" fontSize={9} fill="#1d4ed8" fontWeight={600}>{median.toFixed(2)}</text>
      <text x={x(max)}    y={cy + 24} textAnchor="middle" fontSize={9} fill="#6b7280">{max.toFixed(2)}</text>
    </svg>
  );
}

export default function BoxPlots({ result }: { result: AnalysisResponse }) {
  const numeric = result.analysis.numeric_columns;

  if (numeric.length === 0)
    return <p className="py-10 text-center text-sm text-gray-400">No numeric columns available.</p>;

  return (
    <div className="space-y-1">
      <div className="mb-4 flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-6 rounded border border-blue-300 bg-blue-100" />
          IQR (Q1–Q3)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-4 w-0.5 bg-blue-700" />
          Median
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-6 bg-slate-300" />
          Whiskers (min–max)
        </span>
      </div>

      {numeric.map((col) => {
        const stats = result.analysis.summary[col] as NumericStats;
        return (
          <div key={col} className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-1 hover:border-gray-200 hover:bg-gray-50">
            <div className="w-36 shrink-0 text-right text-sm font-medium text-gray-700 truncate" title={col}>{col}</div>
            <div className="min-w-0 flex-1">
              <BoxPlot stats={stats} />
            </div>
            <div className="w-28 shrink-0 text-right text-xs text-gray-400 space-y-0.5">
              <div>IQR {(stats.q75 - stats.q25).toFixed(2)}</div>
              <div>skew {stats.skewness >= 0 ? "+" : ""}{stats.skewness.toFixed(2)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
