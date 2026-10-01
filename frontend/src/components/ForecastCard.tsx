import { useInsight, type Forecast } from "../hooks/useInsights";
import { money } from "../format";
import InsightShell from "./InsightShell";

export default function ForecastCard() {
  const { data, loading, error, generate } = useInsight<Forecast>("forecast");
  const max = data
    ? Math.max(data.projectedIncome, data.projectedExpenses, 1)
    : 1;

  return (
    <InsightShell
      title="Next month"
      intro="A projection of next month's income and spending, based on the patterns in your entries."
      action="Forecast next month"
      loadingText="Projecting next month…"
      loading={loading}
      error={error}
      hasData={!!data}
      onGenerate={generate}
      badge={
        data && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}>
            {data.confidence} confidence
          </span>
        )
      }
    >
      {data && (
        <>
          <div>
            <p className="text-sm" style={{ color: "var(--ink-3)" }}>
              Projected net
            </p>
            <p
              className="font-display text-3xl mt-0.5"
              style={{ color: data.projectedNet < 0 ? "var(--expense)" : "var(--ink)" }}
            >
              {money(data.projectedNet)}
            </p>
          </div>
          <dl className="space-y-2.5">
            {[
              ["Income", data.projectedIncome, "#2FA47C"],
              ["Expenses", data.projectedExpenses, "#E0614B"],
            ].map(([label, v, color]) => (
              <div key={label as string}>
                <div className="flex justify-between text-[0.8125rem]">
                  <dt style={{ color: "var(--ink-2)" }}>{label}</dt>
                  <dd className="font-medium">{money(v as number)}</dd>
                </div>
                <div className="h-1.5 mt-1 rounded-full" style={{ background: "var(--surface-2)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${((v as number) / max) * 100}%`, background: color as string }}
                  />
                </div>
              </div>
            ))}
          </dl>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {data.reasoning}
          </p>
          {data.categoryForecasts.length > 0 && (
            <dl className="text-sm divide-y" style={{ borderColor: "var(--line)" }}>
              {data.categoryForecasts.slice(0, 4).map((c) => (
                <div key={c.category} className="flex justify-between py-1.5" style={{ borderColor: "var(--line)" }}>
                  <dt style={{ color: "var(--ink-2)" }}>{c.category}</dt>
                  <dd>{money(c.projected)}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </InsightShell>
  );
}
