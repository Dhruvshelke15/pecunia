import type { ReactNode } from "react";
import { Loader2, RotateCw } from "lucide-react";

interface Props {
  title: string;
  intro: string;
  action: string;
  loadingText: string;
  loading: boolean;
  error: string | null;
  hasData: boolean;
  onGenerate: () => void;
  badge?: ReactNode;
  children?: ReactNode;
}

export default function InsightShell({
  title,
  intro,
  action,
  loadingText,
  loading,
  error,
  hasData,
  onGenerate,
  badge,
  children,
}: Props) {
  return (
    <section className="panel p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="panel-title">{title}</h3>
        <div className="flex items-center gap-1.5">
          {badge}
          {hasData && !loading && (
            <button
              onClick={onGenerate}
              className="btn-quiet w-7 h-7"
              aria-label={`Regenerate ${title.toLowerCase()}`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2.5 py-8 justify-center text-sm" style={{ color: "var(--ink-3)" }}>
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--brass)" }} />
          {loadingText}
        </div>
      ) : hasData ? (
        children
      ) : (
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {intro}
          </p>
          <button onClick={onGenerate} className="btn-quiet h-9 px-4" style={{ color: "var(--brass)", borderColor: "var(--brass-soft)", background: "var(--brass-soft)" }}>
            {action}
          </button>
          {error && (
            <p role="alert" className="text-sm" style={{ color: "var(--expense)" }}>
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
