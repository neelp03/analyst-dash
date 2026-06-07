import type { AnalysisResponse, CategoricalStats, NumericStats } from "@/lib/types";

function NumericRow({ col, s }: { col: string; s: NumericStats }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2.5 font-medium text-gray-900">{col}</td>
      <td className="px-4 py-2.5"><span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">numeric</span></td>
      <td className="px-4 py-2.5 text-right tabular-nums">{s.count.toLocaleString()}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{s.missing}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{s.mean.toFixed(3)}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{s.std.toFixed(3)}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{s.min.toFixed(3)}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{s.median.toFixed(3)}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{s.max.toFixed(3)}</td>
    </tr>
  );
}

function CatRow({ col, s }: { col: string; s: CategoricalStats }) {
  const top = Object.entries(s.top_values)[0];
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2.5 font-medium text-gray-900">{col}</td>
      <td className="px-4 py-2.5"><span className="rounded bg-purple-50 px-1.5 py-0.5 text-xs text-purple-700">categorical</span></td>
      <td className="px-4 py-2.5 text-right tabular-nums">{s.count.toLocaleString()}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{s.missing}</td>
      <td className="px-4 py-2.5 text-center text-gray-400" colSpan={4}>{s.unique} unique values</td>
      <td className="px-4 py-2.5 text-right text-gray-600">{top ? `"${top[0]}"` : "—"}</td>
    </tr>
  );
}

export default function StatsTable({ result }: { result: AnalysisResponse }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
            <th className="px-4 py-3">Column</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-right">Count</th>
            <th className="px-4 py-3 text-right">Missing</th>
            <th className="px-4 py-3 text-right">Mean</th>
            <th className="px-4 py-3 text-right">Std</th>
            <th className="px-4 py-3 text-right">Min</th>
            <th className="px-4 py-3 text-right">Median</th>
            <th className="px-4 py-3 text-right">Max</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Object.entries(result.analysis.summary).map(([col, s]) =>
            s.type === "numeric"
              ? <NumericRow key={col} col={col} s={s as NumericStats} />
              : <CatRow key={col} col={col} s={s as CategoricalStats} />,
          )}
        </tbody>
      </table>
    </div>
  );
}
