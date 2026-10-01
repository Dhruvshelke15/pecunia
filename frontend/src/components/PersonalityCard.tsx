import { useInsight, type Personality } from "../hooks/useInsights";
import InsightShell from "./InsightShell";

export default function PersonalityCard() {
  const { data, loading, error, generate } =
    useInsight<Personality>("personality");

  return (
    <InsightShell
      title="Spending style"
      intro="Find out what kind of spender you are, judged by where your money actually goes."
      action="Show my style"
      loadingText="Reading your patterns…"
      loading={loading}
      error={error}
      hasData={!!data}
      onGenerate={generate}
    >
      {data && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {data.emoji || "✨"}
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl leading-tight" style={{ color: "var(--brass)" }}>
                {data.archetype}
              </p>
              <p className="text-sm mt-0.5" style={{ color: "var(--ink-2)" }}>
                {data.tagline}
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {data.description}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold" style={{ color: "var(--income)" }}>
                Strengths
              </p>
              <ul className="mt-1.5 space-y-1.5 leading-snug" style={{ color: "var(--ink-2)" }}>
                {data.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--expense)" }}>
                Watch for
              </p>
              <ul className="mt-1.5 space-y-1.5 leading-snug" style={{ color: "var(--ink-2)" }}>
                {data.watchouts.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
          <p
            className="text-sm leading-relaxed pl-3"
            style={{ borderLeft: "2px solid var(--brass)", color: "var(--ink)" }}
          >
            {data.recommendation}
          </p>
        </>
      )}
    </InsightShell>
  );
}
