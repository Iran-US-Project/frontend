"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatCoverageDate } from "@/lib/event-coverage-types";
import type {
  GraphConfidence,
  GraphEvidence,
  GraphEvidenceDetail,
} from "@/lib/graph-types";

type GraphEvidencePopupProps = {
  open: boolean;
  onClose: () => void;
  detail: GraphEvidenceDetail | null;
  path: string[];
  loading?: boolean;
  error?: string | null;
  loadingArticleId?: string | null;
  onReadArticle: (evidence: GraphEvidence) => void;
};

function confidenceLabel(confidence: GraphConfidence): string {
  if (confidence === "strong") return "Strong";
  if (confidence === "contested") return "Contested";
  return "Inferred";
}

function confidenceClass(confidence: GraphConfidence): string {
  if (confidence === "strong") return "text-mena";
  if (confidence === "contested") return "text-west";
  return "text-muted";
}

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  const nodes = root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  return Array.from(nodes).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
  );
}

export function GraphEvidencePopup({
  open,
  onClose,
  detail,
  path,
  loading = false,
  error = null,
  loadingArticleId = null,
  onReadArticle,
}: GraphEvidencePopupProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarGap =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }

    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus({ preventScroll: true });
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = getFocusableElements(panelRef.current);
      if (!focusable.length) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !panelRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !panelRef.current.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const evidence = detail?.evidence ?? [];
  const pathLabel = path.length ? path.join(" → ") : null;

  return createPortal(
    <div
      className="article-reader-root"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="article-reader-panel max-w-[38rem]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="h-1 w-full shrink-0 bg-mena" />

        <header className="shrink-0 border-b border-border px-6 pb-5 pt-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                {detail?.type === "edge" ? "Causal claim" : "Development"}
              </p>
              <h2
                id={titleId}
                className="mt-2 font-display text-[1.35rem] font-medium leading-[1.25] tracking-[-0.02em] text-foreground"
              >
                {loading
                  ? "Loading evidence…"
                  : detail?.claim || "Evidence"}
              </h2>

              {detail?.type === "edge" && detail.relation && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mena">
                    {detail.relation}
                  </span>
                  {detail.confidence && (
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.12em] ${confidenceClass(detail.confidence)}`}
                    >
                      {confidenceLabel(detail.confidence)}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-background/70 text-muted transition-colors hover:border-foreground/30 hover:bg-foreground/[0.04] hover:text-foreground"
              aria-label="Close evidence popup"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-7">
          {error ? (
            <p className="border border-border bg-paper/80 px-4 py-3 text-sm text-muted">
              {error}
            </p>
          ) : null}

          {pathLabel ? (
            <div className="mb-5 border border-border bg-paper/70 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Graph path
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {pathLabel}
              </p>
            </div>
          ) : null}

          {detail?.rationale && detail.type === "edge" ? (
            <p className="mb-5 text-sm leading-relaxed text-muted">
              {detail.rationale}
            </p>
          ) : null}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Corpus evidence
            </p>

            {loading ? (
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Fetching attached snippets…
              </p>
            ) : evidence.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                No evidence snippets attached to this element.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {evidence.map((item, index) => (
                  <li
                    key={`${item.articleId}-${index}`}
                    className="px-1 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {item.outlet ? (
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mena">
                          {item.outlet}
                        </span>
                      ) : null}
                      {item.date ? (
                        <>
                          {item.outlet ? (
                            <span className="font-mono text-[10px] text-muted">
                              ·
                            </span>
                          ) : null}
                          <time
                            dateTime={item.date}
                            className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted"
                          >
                            {formatCoverageDate(item.date)}
                          </time>
                        </>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                      {item.snippet}
                    </p>
                    <button
                      type="button"
                      onClick={() => onReadArticle(item)}
                      disabled={loadingArticleId === item.articleId}
                      className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-west transition-opacity hover:opacity-80 disabled:opacity-50"
                    >
                      {loadingArticleId === item.articleId
                        ? "Loading article…"
                        : "Read full article"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <footer className="shrink-0 border-t border-border bg-background/50 px-6 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="bg-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-paper transition-opacity hover:opacity-90"
          >
            Close
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
