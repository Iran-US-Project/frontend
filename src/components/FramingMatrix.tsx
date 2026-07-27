"use client";

import { useCallback, useRef, useState } from "react";
import { ArticleReaderModal } from "@/components/ArticleReaderModal";
import { fetchArticleBody } from "@/lib/api";
import type { AnalysisStatus, OutletFraming } from "@/lib/analysis-types";
import type { CoverageArticle, CoverageColumn } from "@/lib/event-coverage-types";
import { formatCoverageDate } from "@/lib/event-coverage-types";

type FramingMatrixProps = {
  eventTitle: string;
  subEventTitle?: string | null;
  columns: CoverageColumn[];
  outletFraming?: Partial<Record<CoverageColumn["outletId"], OutletFraming>>;
  loading?: boolean;
  error?: string | null;
  needsSubEvent?: boolean;
  analysisStatus?: AnalysisStatus;
  onRunComparison?: () => void;
};

type ReaderState = {
  article: CoverageArticle;
  outlet: string;
  accent: string;
  body: string;
};

function ArticleCard({
  article,
  accent,
  outlet,
  onReadMore,
  loadingBody,
}: {
  article: CoverageArticle;
  accent: string;
  outlet: string;
  onReadMore: () => void;
  loadingBody: boolean;
}) {
  return (
    <article className="px-5 py-4">
      <div className="flex items-baseline justify-between gap-3">
        {article.date ? (
          <time
            dateTime={article.date}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
          >
            {formatCoverageDate(article.date)}
          </time>
        ) : (
          <span />
        )}
        {article.url ? (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-mono text-[10px] uppercase tracking-[0.14em] ${accent} underline-offset-2 hover:underline`}
          >
            Source
          </a>
        ) : null}
      </div>

      <h3 className="mt-2 font-display text-[17px] leading-snug text-foreground">
        {article.url ? (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {article.title}
          </a>
        ) : (
          article.title
        )}
      </h3>

      {article.description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {article.description}
        </p>
      ) : (
        <p className="mt-2 text-sm italic text-muted/80">No excerpt available.</p>
      )}

      {article.author ? (
        <p className="mt-2 font-mono text-[10px] text-muted">{article.author}</p>
      ) : null}

      {article.hasFullText ? (
        <button
          type="button"
          onClick={onReadMore}
          disabled={loadingBody}
          className="mt-3 border border-border bg-background/50 px-3 py-1.5 text-[11px] font-medium tracking-wide text-foreground transition-colors hover:border-foreground/30 hover:bg-foreground/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingBody ? "Loading…" : "Read more"}
        </button>
      ) : (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted/70">
          Full text unavailable
        </p>
      )}
    </article>
  );
}

function OutletFramingSummary({
  framing,
  accent,
}: {
  framing: OutletFraming;
  accent: string;
}) {
  const loadedPreview = framing.loadedWords.slice(0, 4);

  return (
    <div className="mt-4 border-t border-border/80 pt-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        AI framing
      </p>
      <p className={`mt-2 text-sm font-medium ${accent}`}>{framing.tone}</p>
      <p className="mt-1 text-sm leading-snug text-foreground/90">
        {framing.frame}
      </p>
      {loadedPreview.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {loadedPreview.map((word) => (
            <span
              key={word}
              className="border border-border/80 bg-background/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-foreground/75"
            >
              {word}
            </span>
          ))}
          {framing.loadedWords.length > loadedPreview.length ? (
            <span className="font-mono text-[9px] text-muted">
              +{framing.loadedWords.length - loadedPreview.length}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function FramingMatrix({
  eventTitle,
  subEventTitle = null,
  columns,
  outletFraming,
  loading = false,
  error = null,
  needsSubEvent = false,
  analysisStatus = "idle",
  onRunComparison,
}: FramingMatrixProps) {
  const outletsWithArticles = columns.filter((col) => col.articles.length > 0)
    .length;
  const hasEnoughOutlets = outletsWithArticles >= 2;
  const hasSubEvent = !needsSubEvent || Boolean(subEventTitle);
  const canRunComparison =
    hasSubEvent &&
    !loading &&
    hasEnoughOutlets &&
    analysisStatus !== "running";
  const [reader, setReader] = useState<ReaderState | null>(null);
  const [loadingArticleId, setLoadingArticleId] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const bodyCacheRef = useRef(new Map<string, string>());

  const openReader = useCallback(
    async (article: CoverageArticle, outlet: string, accent: string) => {
      if (!article.hasFullText) return;

      setReadError(null);

      const cached = bodyCacheRef.current.get(article.id);
      if (cached) {
        setReader({ article, outlet, accent, body: cached });
        return;
      }

      setLoadingArticleId(article.id);
      try {
        const payload = await fetchArticleBody(article.id);
        bodyCacheRef.current.set(article.id, payload.body);
        setReader({ article, outlet, accent, body: payload.body });
      } catch (err) {
        setReadError(
          err instanceof Error ? err.message : "Failed to load full text",
        );
      } finally {
        setLoadingArticleId(null);
      }
    },
    [],
  );

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground">
            Framing matrix
          </h2>
          <p className="mt-1 text-sm text-muted">{eventTitle}</p>
          {subEventTitle ? (
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/70">
              Focus · {subEventTitle}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          {onRunComparison ? (
            <button
              type="button"
              onClick={onRunComparison}
              disabled={!canRunComparison}
              className="h-10 bg-foreground px-5 text-[12px] font-medium tracking-wide text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              {analysisStatus === "running"
                ? "Running…"
                : analysisStatus === "complete"
                  ? "Re-run analysis"
                  : analysisStatus === "error"
                    ? "Retry analysis"
                    : "Run comparison"}
            </button>
          ) : null}
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Fox · BBC · Al Jazeera
          </span>
        </div>
      </div>

      {needsSubEvent && !subEventTitle ? (
        <p className="mb-4 border border-border bg-paper/80 px-4 py-3 text-sm text-muted">
          Select a key development above to load outlet coverage for that
          sub-event.
        </p>
      ) : null}

      {hasSubEvent && !loading && !hasEnoughOutlets ? (
        <p className="mb-4 border border-border bg-paper/80 px-4 py-3 text-sm text-muted">
          Need at least 2 outlets with articles to run a comparison.
          {outletsWithArticles === 1
            ? " Only one outlet has coverage for this development."
            : " No outlet coverage is available for this development."}
        </p>
      ) : null}

      {(error || readError) && (
        <p className="mb-4 border border-border bg-paper/80 px-4 py-3 text-sm text-muted">
          {error || readError}
        </p>
      )}

      <div
        className={`grid border border-border md:grid-cols-3 ${
          loading ? "opacity-60" : ""
        }`}
      >
        {columns.map((col) => {
          const framing = outletFraming?.[col.outletId];

          return (
          <article
            key={col.outletId}
            className={`flex min-h-[280px] flex-col border-b border-border md:border-b-0 md:border-r md:last:border-r-0 ${col.wash}`}
          >
            <header className="border-b border-border px-5 py-4">
              <p
                className={`font-mono text-[10px] uppercase tracking-[0.18em] ${col.accent}`}
              >
                {col.regionLabel}
              </p>
              <p className="mt-2 font-display text-xl text-foreground">
                {col.outlet}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted">
                {col.articleCount}{" "}
                {col.articleCount === 1 ? "article" : "articles"}
              </p>
              {framing ? (
                <OutletFramingSummary framing={framing} accent={col.accent} />
              ) : null}
            </header>

            <div className="flex-1 divide-y divide-border">
              {needsSubEvent && !subEventTitle ? (
                <p className="px-5 py-5 text-sm text-muted">
                  Waiting for a key development selection.
                </p>
              ) : loading && col.articles.length === 0 ? (
                <p className="px-5 py-5 text-sm text-muted">Loading coverage…</p>
              ) : col.articles.length === 0 ? (
                <p className="px-5 py-5 text-sm text-muted">
                  No {col.outlet} coverage for this development in the corpus.
                </p>
              ) : (
                col.articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    accent={col.accent}
                    outlet={col.outlet}
                    loadingBody={loadingArticleId === article.id}
                    onReadMore={() =>
                      openReader(article, col.outlet, col.accent)
                    }
                  />
                ))
              )}
            </div>
          </article>
          );
        })}
      </div>

      {loading && (
        <p className="mt-3 font-mono text-[11px] text-muted">
          Loading outlet coverage for this development…
        </p>
      )}

      {reader ? (
        <ArticleReaderModal
          open
          onClose={() => setReader(null)}
          title={reader.article.title}
          body={reader.body}
          author={reader.article.author}
          date={reader.article.date}
          url={reader.article.url}
          outlet={reader.outlet}
          accent={reader.accent}
        />
      ) : null}
    </section>
  );
}
