"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  countWords,
  estimateReadingMinutes,
  formatArticleBody,
} from "@/lib/format-article-body";
import { formatCoverageDate } from "@/lib/event-coverage-types";

type ArticleReaderModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  author?: string;
  date?: string;
  url?: string;
  outlet?: string;
  accent?: string;
};

function accentBarClass(accent: string): string {
  if (accent.includes("west")) return "bg-west";
  if (accent.includes("mena")) return "bg-mena";
  if (accent.includes("finance")) return "bg-finance";
  return "bg-foreground/40";
}

export function ArticleReaderModal({
  open,
  onClose,
  title,
  body,
  author,
  date,
  url,
  outlet,
  accent = "text-foreground",
}: ArticleReaderModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const paragraphs = formatArticleBody(body);
  const minutes = estimateReadingMinutes(body);
  const words = countWords(body);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setScrollProgress(0);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarGap =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }

    // Focus close control after paint so the panel is already in the viewport.
    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus({ preventScroll: true });
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;

    const updateProgress = () => {
      const max = el.scrollHeight - el.clientHeight;
      setScrollProgress(max <= 0 ? 1 : Math.min(1, el.scrollTop / max));
    };

    updateProgress();
    el.addEventListener("scroll", updateProgress, { passive: true });
    return () => el.removeEventListener("scroll", updateProgress);
  }, [open, body]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="article-reader-root"
      role="presentation"
      onMouseDown={(event) => {
        // Close only when pressing the dimmed backdrop, not when dragging from panel.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="article-reader-panel"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={`h-1 w-full shrink-0 ${accentBarClass(accent)}`} />

        <div className="h-0.5 w-full shrink-0 bg-border/70">
          <div
            className={`h-full ${accentBarClass(accent)}`}
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        <header className="shrink-0 border-b border-border px-6 pb-5 pt-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {outlet ? (
                  <p
                    className={`font-mono text-[10px] uppercase tracking-[0.18em] ${accent}`}
                  >
                    {outlet}
                  </p>
                ) : null}
                <span className="font-mono text-[10px] text-muted">·</span>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  {minutes} min read
                </p>
                <span className="font-mono text-[10px] text-muted">·</span>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  {words.toLocaleString()} words
                </p>
              </div>

              <h2
                id={titleId}
                className="mt-3 font-display text-[1.55rem] font-medium leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[1.75rem]"
              >
                {title}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/70 pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                {date ? (
                  <time dateTime={date}>{formatCoverageDate(date)}</time>
                ) : null}
                {author ? (
                  <>
                    {date ? <span aria-hidden>·</span> : null}
                    <span>By {author}</span>
                  </>
                ) : null}
              </div>
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-background/70 text-muted transition-colors hover:border-foreground/30 hover:bg-foreground/[0.04] hover:text-foreground"
              aria-label="Close article reader"
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

        <div ref={scrollRef} className="reader-scroll min-h-0 flex-1 overflow-y-auto">
          <div className="px-6 py-7 sm:px-8 sm:py-8">
            <article className="mx-auto max-w-[34rem]">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={`font-display text-[1.05rem] leading-[1.85] text-foreground/90 sm:text-[1.1rem] sm:leading-[1.9] ${
                    index === 0
                      ? "mb-6 first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-display first-letter:text-[3.1rem] first-letter:font-medium first-letter:leading-[0.85] first-letter:text-foreground"
                      : "mb-5 last:mb-0"
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </article>
          </div>
        </div>

        <footer className="shrink-0 border-t border-border bg-background/50 px-6 py-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-[16rem] font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Corpus text · may differ slightly from live page
            </p>
            <div className="flex items-center gap-2">
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`border border-border bg-paper px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors hover:border-foreground/30 ${accent}`}
                >
                  Original source
                </a>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="bg-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-paper transition-opacity hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
