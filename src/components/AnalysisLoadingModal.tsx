"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type AnalysisLoadingPhase =
  | "gathering"
  | "analyzing"
  | "synthesizing";

const PHASE_LABELS: Record<AnalysisLoadingPhase, string> = {
  gathering: "Gathering outlet coverage",
  analyzing: "Analyzing framing per source",
  synthesizing: "Synthesizing cross-source comparison",
};

const PHASE_ORDER: AnalysisLoadingPhase[] = [
  "gathering",
  "analyzing",
  "synthesizing",
];

type AnalysisLoadingModalProps = {
  open: boolean;
  phase: AnalysisLoadingPhase;
  error?: string | null;
  onCancel?: () => void;
  onDismissError?: () => void;
  onRetry?: () => void;
};

export function AnalysisLoadingModal({
  open,
  phase,
  error = null,
  onCancel,
  onDismissError,
  onRetry,
}: AnalysisLoadingModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarGap =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (error) {
          onDismissError?.();
        } else {
          onCancel?.();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, error, onCancel, onDismissError]);

  if (!mounted || !open) return null;

  const phaseIndex = PHASE_ORDER.indexOf(phase);

  return createPortal(
    <div
      className="article-reader-root"
      role="presentation"
      onMouseDown={(event) => {
        if (error && event.target === event.currentTarget) {
          onDismissError?.();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={!error}
        className="article-reader-panel max-w-lg"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="h-1 w-full shrink-0 bg-accent" />

        <div className="px-8 py-10">
          <h2
            id={titleId}
            className="font-display text-2xl font-medium text-foreground"
          >
            {error ? "Analysis failed" : "Running comparison"}
          </h2>

          {error ? (
            <div className="mt-6 space-y-6">
              <p className="text-sm leading-relaxed text-muted">{error}</p>
              <div className="flex flex-wrap items-center gap-3">
                {onRetry ? (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="h-10 bg-foreground px-5 text-[12px] font-medium tracking-wide text-paper"
                  >
                    Retry
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onDismissError}
                  className={
                    onRetry
                      ? "h-10 border border-border bg-transparent px-5 text-[12px] font-medium tracking-wide text-foreground"
                      : "h-10 bg-foreground px-5 text-[12px] font-medium tracking-wide text-paper"
                  }
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              <ol className="space-y-4">
                {PHASE_ORDER.map((step, index) => {
                  const isActive = index === phaseIndex;
                  const isComplete = index < phaseIndex;

                  return (
                    <li
                      key={step}
                      className={`flex items-start gap-3 text-sm ${
                        isActive
                          ? "text-foreground"
                          : isComplete
                            ? "text-muted"
                            : "text-muted/60"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center font-mono text-[10px] ${
                          isComplete
                            ? "bg-foreground text-paper"
                            : isActive
                              ? "border border-foreground text-foreground"
                              : "border border-border text-muted"
                        }`}
                        aria-hidden
                      >
                        {isComplete ? "✓" : index + 1}
                      </span>
                      <span className={isActive ? "font-medium" : undefined}>
                        {PHASE_LABELS[step]}
                        {isActive ? (
                          <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent align-[-2px]" />
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {onCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted underline-offset-2 hover:underline"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
