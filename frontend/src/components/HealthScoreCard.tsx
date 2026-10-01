import { useInsight, type HealthScore } from "../hooks/useInsights";
import InsightShell from "./InsightShell";

const tone = (v: number) =>
  v >= 75 ? "var(--income)" : v >= 50 ? "var(--brass)" : "var(--expense)";

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <svg width="112" height="112" viewBox="0 0 112 112" className="flex-shrink-0" role="img" aria-label={`Score ${score} out of 100`}>
      <circle cx="56" cy="56" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
      <circle
        cx="56"
        cy="56"
        r={r}
        fill="none"
        stroke={tone(score)}
        strokeWidth="8"
        strokeDasharray={c}
        strokeDashoffset={c - (score / 100) * c}
        strokeLinecap="round"
        transform="rotate(-90 56 56)"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="56" y="62" textAnchor="middle" className="font-display" fontSize="28" fill="var(--ink)">
        {score}
      </text>
    </svg>
  );
}

export default function HealthScoreCard() {
  const { data, loading, error, generate } =
    useInsight<HealthScore>("health_score");

  return (
    <InsightShell
      title="Health score"
      intro="A score out of 100 based on how much you save, how steady your spending is, and how balanced your categories are."
      action="Check my score"
      loadingText="Scoring your finances…"
      loading={loading}
      error={error}
      hasData={!!data}
      onGenerate={generate}
      badge={
        data && (
          <span className="font-display text-lg" style={{ color: tone(data.score) }}>
            {data.grade}
          </span>
        )
      }
    >
      {data && (
        <>
          <div className="flex items-center gap-5">
            <ScoreRing score={data.score} />
            <dl className="flex-1 min-w-0 space-y-3">
              {Object.entries(data.breakdown).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-[0.8125rem]">
                    <dt className="capitalize" style={{ color: "var(--ink-2)" }}>
                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </dt>
                    <dd className="font-medium">{val}</dd>
                  </div>
                  <div className="h-1.5 mt-1 rounded-full" style={{ background: "var(--surface-2)" }}>
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${val}%`, background: tone(val) }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {data.summary}
          </p>
          <ul className="space-y-2 text-sm leading-relaxed list-disc pl-5 marker:text-[var(--brass)]">
            {data.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </>
      )}
    </InsightShell>
  );
}
