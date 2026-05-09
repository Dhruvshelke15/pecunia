import { Loader2, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useInsight, type Forecast } from "../hooks/useInsights";

const CONFIDENCE_COLOR = { high: "#14b8a6", medium: "#f59e0b", low: "#94a3b8" };

export default function ForecastCard() {
  const { data, loading, error, generate } = useInsight<Forecast>("forecast");

  const chartData = data
    ? [
        { name: "Income", value: data.projectedIncome, color: "#14b8a6" },
        { name: "Expenses", value: data.projectedExpenses, color: "#f43f5e" },
        {
          name: "Net",
          value: Math.abs(data.projectedNet),
          color: data.projectedNet >= 0 ? "#818cf8" : "#f97316",
        },
      ]
    : [];

  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#818cf8" }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Forecast
          </span>
        </div>
        {data && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0"
            style={{
              background: `${CONFIDENCE_COLOR[data.confidence]}20`,
              color: CONFIDENCE_COLOR[data.confidence],
            }}
          >
            {data.confidence}
          </span>
        )}
      </div>

      {!data && !loading && (
        <div className="flex flex-col items-center gap-4 py-4">
          <p
            className="text-xs text-center"
            style={{ color: "var(--text-muted)" }}
          >
            AI forecasts next month&apos;s income and expenses based on your
            spending patterns.
          </p>
          <button
            onClick={generate}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "rgba(129,140,248,0.15)",
              border: "1px solid rgba(129,140,248,0.25)",
              color: "#818cf8",
            }}
          >
            Generate Forecast
          </button>
          {error && (
            <p className="text-xs" style={{ color: "#f43f5e" }}>
              {error}
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-2 py-6">
          <Loader2
            className="w-6 h-6 animate-spin"
            style={{ color: "#818cf8" }}
          />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Forecasting patterns...
          </p>
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-4">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={32}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(val: number | undefined) => [
                    `$${(val ?? 0).toFixed(0)}`,
                    "",
                  ]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {data.reasoning}
          </p>

          {data.categoryForecasts.length > 0 && (
            <div className="space-y-1.5">
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                By Category
              </p>
              {data.categoryForecasts.slice(0, 4).map((c) => (
                <div
                  key={c.category}
                  className="flex justify-between items-center text-xs"
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    {c.category}
                  </span>
                  <span
                    className="font-mono tabular-nums"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ${c.projected.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={generate}
            className="text-xs self-end"
            style={{ color: "var(--text-muted)" }}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
