"use client";

import type { GraphNarrative } from "@/lib/graph-types";

type GraphNarrativePanelProps = {
  narrative: GraphNarrative | null;
  loading?: boolean;
  regenerating?: boolean;
  error?: string | null;
  emptyMessage?: string | null;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
};

function NarrativeSkeleton() {
  return (
    <div className="space-y-4 px-5 py-5">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse bg-border/80" />
        <div className="h-4 w-full max-w-2xl animate-pulse bg-border/60" />
        <div className="h-4 w-full max-w-xl animate-pulse bg-border/50" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-28 animate-pulse bg-border/80" />
        <div className="h-4 w-full animate-pulse bg-border/60" />
        <div className="h-4 w-full animate-pulse bg-border/50" />
        <div className="h-4 w-4/5 animate-pulse bg-border/40" />
      </div>
    </div>
  );
}

export function GraphNarrativePanel({
  narrative,
  loading = false,
  regenerating = false,
  error = null,
  emptyMessage = null,
  canRegenerate = true,
  onRegenerate,
}: GraphNarrativePanelProps) {
  const showSkeleton = loading && !narrative;
  const generatedLabel = (() => {
    if (!narrative?.generatedAt) return null;
    const parsed = new Date(narrative.generatedAt);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleString();
  })();

  return (
    <section className="border border-border bg-paper/60">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Summary &amp; analysis
          </p>
          <p className="mt-1 text-[12px] text-muted/90">
            GraphRAG narrative for the visible subgraph
          </p>
        </div>
        {onRegenerate ? (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={!canRegenerate || loading || regenerating}
            className="border border-border bg-paper px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            {regenerating ? "Regenerating…" : "Regenerate analysis"}
          </button>
        ) : null}
      </header>

      {error ? (
        <div className="border-b border-border px-5 py-4">
          <p className="text-sm text-muted">{error}</p>
        </div>
      ) : null}

      {showSkeleton ? <NarrativeSkeleton /> : null}

      {!showSkeleton && narrative ? (
        <div className="space-y-6 px-5 py-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Range summary
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {narrative.summary}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Causal analysis
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {narrative.analysis}
            </p>
          </div>
        </div>
      ) : null}

      {!showSkeleton && !narrative && !loading && !error ? (
        <div className="px-5 py-5">
          <p className="text-sm text-muted">
            {emptyMessage ||
              "Select a timeline range to generate analysis."}
          </p>
        </div>
      ) : null}

      {narrative ? (
        <footer className="border-t border-border px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Steps {narrative.rangeStart}
            {narrative.rangeStart !== narrative.rangeEnd
              ? `–${narrative.rangeEnd}`
              : ""}{" "}
            · {narrative.cached ? "cached" : "fresh"}
            {generatedLabel ? ` · generated ${generatedLabel}` : ""}
          </p>
        </footer>
      ) : null}
    </section>
  );
}
