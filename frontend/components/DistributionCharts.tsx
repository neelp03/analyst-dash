"use client";

import type { AnalysisResponse } from "@/lib/types";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DistributionCharts({ result }: { result: AnalysisResponse }) {
  const dists = result.analysis.distributions;
  const entries = Object.entries(dists);

  if (entries.length === 0)
    return <p className="py-10 text-center text-sm text-gray-400">No numeric columns available.</p>;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {entries.map(([col, dist]) => {
        const data = dist.counts.map((count, i) => ({
          bin: dist.bin_edges[i].toFixed(1),
          count,
        }));
        return (
          <div key={col}>
            <p className="mb-2 text-sm font-semibold text-gray-700">{col}</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data} margin={{ top: 0, right: 4, left: -22, bottom: 0 }}>
                <XAxis dataKey="bin" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v: number) => [v.toLocaleString(), "count"]}
                  labelFormatter={(l) => `≥ ${l}`}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}
