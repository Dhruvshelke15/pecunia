import { Loader2, HeartPulse } from "lucide-react";
import { useInsight, type HealthScore } from "../hooks/useInsights";

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#14b8a6" : score >= 50 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className="relative w-28 h-28">
        <svg
          width="112"
          height="112"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* background track */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
            transform="rotate(-90 56 56)"
          />
          {/* progress arc */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 56 56)"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        {/* score centered inside circle */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="text-2xl font-bold" style={{ color }}>
            {score}
          </span>
        </div>
      </div>

      {/* grade below circle */}
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{
          color,
          background: `${color}18`,
          border: `1px solid ${color}40`,
        }}
      >
        {grade}
      </span>
    </div>
  );
}

export default function HealthScoreCard() {
  const { data, loading, error, generate } =
    useInsight<HealthScore>("health_score");

  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        <HeartPulse className="w-4 h-4" style={{ color: "#14b8a6" }} />
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Financial Health Score
        </span>
      </div>

      {!data && !loading && (
        <div className="flex flex-col items-center gap-4 py-4">
          <p
            className="text-xs text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Get an AI-powered score based on your savings rate, spending
            consistency, and category balance.
          </p>
          <button
            onClick={generate}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "rgba(20,184,166,0.15)",
              border: "1px solid rgba(20,184,166,0.25)",
              color: "#14b8a6",
            }}
          >
            Check Score
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
            style={{ color: "#14b8a6" }}
          />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Analyzing your finances...
          </p>
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <ScoreRing score={data.score} grade={data.grade} />
            <div className="flex-1 min-w-0 space-y-3">
              {Object.entries(data.breakdown).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span
                      style={{ color: "var(--text-muted)" }}
                      className="capitalize"
                    >
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span
                      style={{ color: "var(--text-secondary)" }}
                      className="font-mono tabular-nums ml-1"
                    >
                      {val}
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full w-full"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{
                        width: `${val}%`,
                        background:
                          (val as number) >= 75
                            ? "#14b8a6"
                            : (val as number) >= 50
                              ? "#f59e0b"
                              : "#f43f5e",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {data.summary}
          </p>

          <div className="space-y-2">
            {data.tips.map((tip, i) => (
              <div
                key={i}
                className="flex gap-2 text-xs leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="flex-shrink-0" style={{ color: "#14b8a6" }}>
                  →
                </span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

          <button
            onClick={generate}
            className="text-xs self-end"
            style={{ color: "var(--text-muted)" }}
          >
            Recalculate
          </button>
        </div>
      )}
    </div>
  );
}
