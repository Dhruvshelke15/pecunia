import { Loader2, Sparkles } from "lucide-react";
import { useInsight, type Personality } from "../hooks/useInsights";

export default function PersonalityCard() {
  const { data, loading, error, generate } =
    useInsight<Personality>("personality");

  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" style={{ color: "#f59e0b" }} />
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Spending Personality
        </span>
      </div>

      {!data && !loading && (
        <div className="flex flex-col items-center gap-4 py-4">
          <p
            className="text-xs text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Discover your financial archetype based on how you actually spend.
          </p>
          <button
            onClick={generate}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "#f59e0b",
            }}
          >
            Reveal Personality
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
            style={{ color: "#f59e0b" }}
          />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Reading your patterns...
          </p>
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-4">
          {/* Archetype hero */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ background: "rgba(245,158,11,0.12)" }}
            >
              {data.emoji || "✨"}
            </div>
            <div className="min-w-0">
              <p
                className="font-bold text-sm leading-snug mb-1"
                style={{ color: "#f59e0b" }}
              >
                {data.archetype}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {data.tagline}
              </p>
            </div>
          </div>

          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {data.description}
          </p>

          {/* Strengths / Watch Out */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 min-w-0">
              <p className="text-xs font-semibold" style={{ color: "#14b8a6" }}>
                Strengths
              </p>
              {data.strengths.map((s, i) => (
                <p
                  key={i}
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  + {s}
                </p>
              ))}
            </div>
            <div className="space-y-1.5 min-w-0">
              <p className="text-xs font-semibold" style={{ color: "#f43f5e" }}>
                Watch Out
              </p>
              {data.watchouts.map((w, i) => (
                <p
                  key={i}
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  - {w}
                </p>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div
            className="p-3 rounded-xl text-xs leading-relaxed"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <span style={{ color: "#f59e0b" }}>Tip: </span>
            {data.recommendation}
          </div>

          <button
            onClick={generate}
            className="text-xs self-end"
            style={{ color: "var(--text-muted)" }}
          >
            Redo
          </button>
        </div>
      )}
    </div>
  );
}
