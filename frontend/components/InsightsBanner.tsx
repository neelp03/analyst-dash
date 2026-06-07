import type { Insight } from "@/lib/types";

const STYLES = {
  error:   "border-red-200   bg-red-50   text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info:    "border-blue-200  bg-blue-50  text-blue-700",
} as const;

const BADGE = {
  error:   "bg-red-100   text-red-600   border-red-300",
  warning: "bg-amber-100 text-amber-600 border-amber-300",
  info:    "bg-blue-100  text-blue-600  border-blue-300",
} as const;

const LABEL = { error: "Issue", warning: "Warning", info: "Info" } as const;

export default function InsightsBanner({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-gray-700">
        Auto-detected insights
        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
          {insights.length}
        </span>
      </p>
      <div className="space-y-2">
        {insights.map((ins, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${STYLES[ins.severity]}`}
          >
            <span className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-xs font-semibold ${BADGE[ins.severity]}`}>
              {LABEL[ins.severity]}
            </span>
            <span>{ins.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
