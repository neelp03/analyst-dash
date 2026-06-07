"use client";

import type { AnalysisResponse } from "@/lib/types";

function corrColor(v: number): string {
  const a = Math.abs(v);
  const i = Math.round(a * 200);
  return v >= 0 ? `rgb(${255 - i},${255 - i},255)` : `rgb(255,${255 - i},${255 - i})`;
}

export default function CorrelationHeatmap({ result }: { result: AnalysisResponse }) {
  const cols = result.analysis.numeric_columns;

  if (cols.length < 2)
    return <p className="py-10 text-center text-sm text-gray-400">Need at least 2 numeric columns.</p>;

  const label = (s: string) => (s.length > 9 ? s.slice(0, 9) + "…" : s);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-max">
        <div className="flex">
          <div className="w-24" />
          {cols.map((c) => (
            <div key={c} className="flex w-14 items-end justify-center pb-1">
              <span
                className="text-xs text-gray-500"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {label(c)}
              </span>
            </div>
          ))}
        </div>

        {cols.map((row) => (
          <div key={row} className="flex items-center">
            <div className="w-24 truncate pr-2 text-right text-xs text-gray-500">{label(row)}</div>
            {cols.map((col) => {
              const v = result.analysis.correlation[row]?.[col] ?? 0;
              return (
                <div
                  key={col}
                  title={`${row} / ${col}: ${v}`}
                  className="flex h-11 w-14 items-center justify-center border border-white text-xs font-medium"
                  style={{ backgroundColor: corrColor(v) }}
                >
                  {v.toFixed(2)}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
        <span className="inline-block h-3 w-8 rounded" style={{ background: corrColor(1) }} />
        <span>+1 perfect positive</span>
        <span className="ml-2 inline-block h-3 w-8 rounded border border-gray-200" style={{ background: corrColor(0) }} />
        <span>0 no correlation</span>
        <span className="ml-2 inline-block h-3 w-8 rounded" style={{ background: corrColor(-1) }} />
        <span>−1 perfect negative</span>
      </div>
    </div>
  );
}
