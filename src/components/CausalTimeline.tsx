"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { GraphTimelineStep } from "@/lib/graph-types";

function formatStepDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function shortTitle(title: string, max = 42): string {
  if (title.length <= max) return title;
  return `${title.slice(0, max - 1)}…`;
}

type CausalTimelineProps = {
  steps: GraphTimelineStep[];
  rangeFrom: number;
  rangeTo: number;
  loading?: boolean;
  error?: string | null;
  onRangeChange: (from: number, to: number) => void;
  onShowFullRange: () => void;
};

export function CausalTimeline({
  steps,
  rangeFrom,
  rangeTo,
  loading = false,
  error = null,
  onRangeChange,
  onShowFullRange,
}: CausalTimelineProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef(rangeFrom);

  const isFullRange =
    steps.length > 0 &&
    rangeFrom === steps[0].step &&
    rangeTo === steps[steps.length - 1].step;
  const isFocal = rangeFrom === rangeTo;

  const scrollToStep = useCallback((step: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const marker = el.querySelector<HTMLElement>(`[data-step="${step}"]`);
    if (!marker) return;
    const center = marker.offsetLeft + marker.offsetWidth / 2;
    el.scrollTo({
      left: Math.max(0, center - el.clientWidth / 2),
      behavior: "smooth",
    });
  }, []);

  const handleStepClick = useCallback(
    (step: number, shiftKey: boolean) => {
      if (shiftKey) {
        const anchor = anchorRef.current;
        const from = Math.min(anchor, step);
        const to = Math.max(anchor, step);
        onRangeChange(from, to);
      } else {
        anchorRef.current = step;
        onRangeChange(step, step);
      }
      scrollToStep(step);
    },
    [onRangeChange, scrollToStep],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!steps.length) return;
      const currentIndex = steps.findIndex((item) => item.step === rangeFrom);
      const index = currentIndex >= 0 ? currentIndex : 0;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        const next = Math.min(steps.length - 1, index + 1);
        const step = steps[next].step;
        if (event.shiftKey) {
          onRangeChange(rangeFrom, Math.max(rangeTo, step));
        } else {
          anchorRef.current = step;
          onRangeChange(step, step);
        }
        scrollToStep(step);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        const prev = Math.max(0, index - 1);
        const step = steps[prev].step;
        if (event.shiftKey) {
          onRangeChange(Math.min(rangeFrom, step), rangeTo);
        } else {
          anchorRef.current = step;
          onRangeChange(step, step);
        }
        scrollToStep(step);
      }
    },
    [onRangeChange, rangeFrom, rangeTo, scrollToStep, steps],
  );

  useEffect(() => {
    if (isFocal) {
      scrollToStep(rangeFrom);
    }
  }, [isFocal, rangeFrom, scrollToStep]);

  return (
    <section className="border border-border bg-paper/80">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Causal timeline
          </p>
          <h2 className="mt-1 font-display text-xl font-medium text-foreground sm:text-2xl">
            Developments in order
          </h2>
          <p className="mt-1 text-sm text-muted">
            {loading
              ? "Loading graph timeline…"
              : error
                ? error
                : steps.length
                  ? isFullRange
                    ? `Full arc · ${steps.length} steps`
                    : isFocal
                      ? `Focal event · step ${rangeFrom}`
                      : `Steps ${rangeFrom}–${rangeTo}`
                  : "No graph timeline available"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onShowFullRange}
            disabled={loading || !steps.length || isFullRange}
            className="border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted transition-colors hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            Full arc
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted/80">
            Click · Shift+click range · ← →
          </span>
        </div>
      </div>

      <div
        ref={scrollerRef}
        role="listbox"
        aria-label="Causal timeline steps"
        aria-multiselectable="true"
        aria-activedescendant={
          steps.length
            ? `causal-step-${isFocal ? rangeFrom : rangeTo}`
            : undefined
        }
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="timeline-scroll overflow-x-auto px-5 py-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
      >
        {loading ? (
          <p className="py-8 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Loading steps…
          </p>
        ) : error ? (
          <p className="py-8 text-sm text-muted">{error}</p>
        ) : !steps.length ? (
          <p className="py-8 text-sm text-muted">
            No graph built yet. Run graph extraction on the backend.
          </p>
        ) : (
          <ol className="flex min-w-max items-stretch gap-2">
            {steps.map((item) => {
              const inRange = item.step >= rangeFrom && item.step <= rangeTo;
              const isFocalStep = rangeFrom === rangeTo && item.step === rangeFrom;
              const isRangeEnd =
                item.step === rangeFrom || item.step === rangeTo;

              return (
                <li key={item.nodeId} className="flex items-center gap-2">
                  <button
                    type="button"
                    id={`causal-step-${item.step}`}
                    data-step={item.step}
                    role="option"
                    aria-selected={inRange}
                    aria-label={`Step ${item.step}: ${item.title} (${formatStepDate(item.date)})`}
                    onClick={(event) =>
                      handleStepClick(item.step, event.shiftKey)
                    }
                    className={`group w-[148px] border px-3 py-3 text-left transition-all ${
                      isFocalStep
                        ? "border-accent bg-paper shadow-[0_8px_22px_-12px_rgba(143,29,44,0.35)]"
                        : inRange
                          ? isRangeEnd
                            ? "border-mena/50 bg-paper"
                            : "border-border bg-paper"
                          : "border-border/70 bg-paper/50 opacity-55 hover:opacity-80"
                    }`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      Step {item.step}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-muted/90">
                      {formatStepDate(item.date)}
                    </p>
                    <p className="mt-2 font-display text-[13px] leading-snug text-foreground">
                      {shortTitle(item.title)}
                    </p>
                  </button>
                  {item.step < steps[steps.length - 1].step && (
                    <span
                      className={`h-px w-3 shrink-0 ${
                        inRange && item.step < rangeTo
                          ? "bg-mena/40"
                          : "bg-border"
                      }`}
                      aria-hidden
                    />
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
