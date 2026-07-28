"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArticleReaderModal } from "@/components/ArticleReaderModal";
import { CausalTimeline } from "@/components/CausalTimeline";
import { EvidenceBoard } from "@/components/EvidenceBoard";
import { GraphControls } from "@/components/GraphControls";
import { GraphEvidencePopup } from "@/components/GraphEvidencePopup";
import { GraphNarrativePanel } from "@/components/GraphNarrativePanel";
import {
  fetchArticleBody,
  fetchGraphEvidence,
  fetchGraphNarrative,
  fetchGraphSubgraph,
  fetchGraphTimeline,
  regenerateGraphNarrative,
} from "@/lib/api";
import type { ArticleBodyPayload } from "@/lib/event-coverage-types";
import {
  DEFAULT_GRAPH_FILTERS,
  computeFilterHash,
  type GraphEvidence,
  type GraphEvidenceDetail,
  type GraphFilters,
  type GraphHopDepth,
  type GraphNarrative,
  type GraphSubgraph,
  type GraphTimelineStep,
} from "@/lib/graph-types";
import { buildGraphPath } from "@/lib/graph-path";

type ArticleReaderState = {
  title: string;
  body: string;
  author: string;
  date: string;
  url: string;
  outlet: string;
  accent: string;
};

function outletAccent(outlet?: string): string {
  const value = (outlet || "").toLowerCase();
  if (value.includes("fox")) return "text-west";
  if (value.includes("bbc")) return "text-mena";
  if (value.includes("jazeera")) return "text-finance";
  return "text-foreground";
}

function uniqueRelations(edges: { relation: string }[]): string[] {
  return Array.from(new Set(edges.map((edge) => edge.relation))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function GraphRAGWorkspace() {
  const bodyCacheRef = useRef(new Map<string, ArticleBodyPayload>());

  const [steps, setSteps] = useState<GraphTimelineStep[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(1);

  const [filters, setFilters] = useState<GraphFilters>(DEFAULT_GRAPH_FILTERS);
  const [hopDepth, setHopDepth] = useState<GraphHopDepth>(1);
  const [availableRelations, setAvailableRelations] = useState<string[]>([]);

  const [subgraph, setSubgraph] = useState<GraphSubgraph | null>(null);
  const [subgraphLoading, setSubgraphLoading] = useState(false);
  const [subgraphError, setSubgraphError] = useState<string | null>(null);

  const [narrative, setNarrative] = useState<GraphNarrative | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeRegenerating, setNarrativeRegenerating] = useState(false);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);

  const filterHash = useMemo(
    () => computeFilterHash(filters, hopDepth),
    [filters, hopDepth],
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [evidenceDetail, setEvidenceDetail] =
    useState<GraphEvidenceDetail | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  const [reader, setReader] = useState<ArticleReaderState | null>(null);
  const [loadingArticleId, setLoadingArticleId] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);

  const minStep = steps[0]?.step ?? 1;
  const maxStep = steps[steps.length - 1]?.step ?? 1;
  const isFocal = rangeFrom === rangeTo;
  const queryDepth = filters.viewMode === "focus" ? hopDepth : undefined;

  useEffect(() => {
    let cancelled = false;

    async function loadTimeline() {
      setTimelineLoading(true);
      setTimelineError(null);
      try {
        const payload = await fetchGraphTimeline();
        if (cancelled) return;
        const nextSteps = payload.steps ?? [];
        setSteps(nextSteps);
        if (nextSteps.length) {
          const first = nextSteps[0].step;
          const last = nextSteps[nextSteps.length - 1].step;
          setRangeFrom(first);
          setRangeTo(last);
        }
      } catch (err) {
        if (cancelled) return;
        setTimelineError(
          err instanceof Error ? err.message : "Failed to load graph timeline",
        );
        setSteps([]);
      } finally {
        if (!cancelled) setTimelineLoading(false);
      }
    }

    loadTimeline();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!steps.length) {
      setAvailableRelations([]);
      return;
    }

    let cancelled = false;

    async function loadRelationTypes() {
      try {
        const payload = await fetchGraphSubgraph({
          from: minStep,
          to: maxStep,
          filters: DEFAULT_GRAPH_FILTERS,
        });
        if (cancelled) return;
        setAvailableRelations(uniqueRelations(payload.edges));
      } catch {
        if (!cancelled) setAvailableRelations([]);
      }
    }

    loadRelationTypes();
    return () => {
      cancelled = true;
    };
  }, [maxStep, minStep, steps.length]);

  useEffect(() => {
    if (!steps.length) {
      setSubgraph(null);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function loadSubgraph() {
      setSubgraphLoading(true);
      setSubgraphError(null);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setEvidenceDetail(null);

      try {
        const payload = await fetchGraphSubgraph({
          from: rangeFrom,
          to: rangeTo,
          depth: queryDepth,
          filters,
          signal: controller.signal,
        });
        if (cancelled) return;
        setSubgraph(payload);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setSubgraph(null);
        setSubgraphError(
          err instanceof Error ? err.message : "Failed to load subgraph",
        );
      } finally {
        if (!cancelled) setSubgraphLoading(false);
      }
    }

    loadSubgraph();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [steps.length, rangeFrom, rangeTo, queryDepth, filters]);

  useEffect(() => {
    if (!steps.length || subgraphLoading) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function loadNarrative() {
      setNarrativeLoading(true);
      setNarrativeError(null);

      try {
        const payload = await fetchGraphNarrative({
          from: rangeFrom,
          to: rangeTo,
          depth: queryDepth,
          filters,
          filterHash,
          signal: controller.signal,
        });
        if (cancelled) return;
        setNarrative(payload);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setNarrative(null);
        setNarrativeError(
          err instanceof Error ? err.message : "Failed to load narrative",
        );
      } finally {
        if (!cancelled) setNarrativeLoading(false);
      }
    }

    loadNarrative();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    steps.length,
    rangeFrom,
    rangeTo,
    queryDepth,
    filters,
    filterHash,
    subgraphLoading,
  ]);

  const handleRegenerateNarrative = useCallback(async () => {
    if (!steps.length) return;

    setNarrativeRegenerating(true);
    setNarrativeError(null);

    try {
      const payload = await regenerateGraphNarrative({
        from: rangeFrom,
        to: rangeTo,
        depth: queryDepth,
        filters,
        filterHash,
      });
      setNarrative(payload);
    } catch (err) {
      setNarrativeError(
        err instanceof Error ? err.message : "Failed to regenerate narrative",
      );
    } finally {
      setNarrativeRegenerating(false);
    }
  }, [filterHash, filters, queryDepth, rangeFrom, rangeTo, steps.length]);

  useEffect(() => {
    if (!selectedNodeId && !selectedEdgeId) {
      setEvidenceDetail(null);
      setEvidenceError(null);
      return;
    }

    let cancelled = false;
    const type = selectedNodeId ? "node" : "edge";
    const id = (selectedNodeId ?? selectedEdgeId)!;

    async function loadEvidence() {
      setEvidenceLoading(true);
      setEvidenceError(null);
      try {
        const detail = await fetchGraphEvidence(type, id);
        if (cancelled) return;
        setEvidenceDetail(detail);
      } catch (err) {
        if (cancelled) return;
        setEvidenceDetail(null);
        setEvidenceError(
          err instanceof Error ? err.message : "Failed to load evidence",
        );
      } finally {
        if (!cancelled) setEvidenceLoading(false);
      }
    }

    loadEvidence();
    return () => {
      cancelled = true;
    };
  }, [selectedEdgeId, selectedNodeId]);

  const handleRangeChange = useCallback((from: number, to: number) => {
    setRangeFrom(from);
    setRangeTo(to);
    // Flow B: a single selected step switches into focus (ego) mode.
    // Multi-step / full-arc exploration returns to cumulative.
    setFilters((prev) => {
      const nextMode = from === to ? "focus" : "cumulative";
      if (prev.viewMode === nextMode) return prev;
      return { ...prev, viewMode: nextMode };
    });
  }, []);

  const handleShowFullRange = useCallback(() => {
    if (!steps.length) return;
    setRangeFrom(minStep);
    setRangeTo(maxStep);
    setFilters((prev) =>
      prev.viewMode === "cumulative"
        ? prev
        : { ...prev, viewMode: "cumulative" },
    );
  }, [maxStep, minStep, steps.length]);

  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId) setSelectedEdgeId(null);
  }, []);

  const handleSelectEdge = useCallback((edgeId: string | null) => {
    setSelectedEdgeId(edgeId);
    if (edgeId) setSelectedNodeId(null);
  }, []);

  const handleCloseEvidence = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const openReader = useCallback(async (evidence: GraphEvidence) => {
    setReadError(null);

    const cached = bodyCacheRef.current.get(evidence.articleId);
    if (cached) {
      setReader({
        title: cached.title,
        body: cached.body,
        author: cached.author,
        date: cached.date || evidence.date || "",
        url: cached.url,
        outlet: evidence.outlet || cached.author || "Corpus",
        accent: outletAccent(evidence.outlet),
      });
      return;
    }

    setLoadingArticleId(evidence.articleId);
    try {
      const payload = await fetchArticleBody(evidence.articleId);
      bodyCacheRef.current.set(evidence.articleId, payload);
      setReader({
        title: payload.title,
        body: payload.body,
        author: payload.author,
        date: payload.date,
        url: payload.url,
        outlet: evidence.outlet || payload.author || "Corpus",
        accent: outletAccent(evidence.outlet),
      });
    } catch (err) {
      setReadError(
        err instanceof Error ? err.message : "Failed to load full article",
      );
    } finally {
      setLoadingArticleId(null);
    }
  }, []);

  const boardNodes = useMemo(
    () => subgraph?.nodes ?? [],
    [subgraph?.nodes],
  );
  const boardEdges = useMemo(
    () => subgraph?.edges ?? [],
    [subgraph?.edges],
  );

  const evidencePath = useMemo(() => {
    if (!selectedNodeId && !selectedEdgeId) return [];
    return buildGraphPath(boardNodes, boardEdges, {
      type: selectedNodeId ? "node" : "edge",
      id: (selectedNodeId ?? selectedEdgeId)!,
    });
  }, [boardEdges, boardNodes, selectedEdgeId, selectedNodeId]);

  const rangeSummary = useMemo(() => {
    if (!steps.length) return "";
    if (rangeFrom === minStep && rangeTo === maxStep) {
      return filters.viewMode === "focus"
        ? "Full arc · focus neighborhood."
        : "Showing the full causal arc.";
    }
    if (isFocal) {
      const step = steps.find((item) => item.step === rangeFrom);
      const prefix =
        filters.viewMode === "focus"
          ? `Focus · ${hopDepth}-hop neighborhood`
          : "Focal event";
      return step ? `${prefix}: ${step.title}` : `${prefix} · step ${rangeFrom}`;
    }
    return filters.viewMode === "focus"
      ? `Focus window: steps ${rangeFrom}–${rangeTo}`
      : `Sub-period: steps ${rangeFrom}–${rangeTo}`;
  }, [filters.viewMode, hopDepth, isFocal, maxStep, minStep, rangeFrom, rangeTo, steps]);

  const popupOpen = Boolean(selectedNodeId || selectedEdgeId);
  const graphMissing = !timelineLoading && !steps.length;
  const boardEmptyMessage = timelineError
    ? timelineError
    : graphMissing
      ? "No graph built yet. Run `npm run import:graph` or `npm run build:graph -- --import` in the backend."
      : null;
  const narrativeEmptyMessage = timelineError
    ? timelineError
    : graphMissing
      ? "No graph built yet. Import or extract a graph before generating analysis."
      : null;

  return (
    <>
      <div className="space-y-6">
        <CausalTimeline
          steps={steps}
          rangeFrom={rangeFrom}
          rangeTo={rangeTo}
          loading={timelineLoading}
          error={timelineError}
          onRangeChange={handleRangeChange}
          onShowFullRange={handleShowFullRange}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <EvidenceBoard
            nodes={boardNodes}
            edges={boardEdges}
            loading={timelineLoading || subgraphLoading}
            analyzing={narrativeLoading || narrativeRegenerating}
            error={subgraphError}
            emptyMessage={boardEmptyMessage}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onSelectNode={handleSelectNode}
            onSelectEdge={handleSelectEdge}
          />

          <GraphControls
            filters={filters}
            hopDepth={hopDepth}
            availableRelations={availableRelations}
            rangeSummary={rangeSummary}
            rangeFrom={rangeFrom}
            rangeTo={rangeTo}
            nodeCount={boardNodes.length}
            edgeCount={boardEdges.length}
            disabled={timelineLoading || subgraphLoading || graphMissing}
            onFiltersChange={setFilters}
            onHopDepthChange={setHopDepth}
          />
        </div>

        {readError ? (
          <p className="border border-border bg-paper/80 px-4 py-3 text-[12px] text-muted">
            {readError}
          </p>
        ) : null}

        <GraphNarrativePanel
          narrative={narrative}
          loading={narrativeLoading}
          regenerating={narrativeRegenerating}
          error={narrativeError}
          emptyMessage={narrativeEmptyMessage}
          canRegenerate={Boolean(steps.length)}
          onRegenerate={handleRegenerateNarrative}
        />
      </div>

      <GraphEvidencePopup
        open={popupOpen}
        onClose={handleCloseEvidence}
        detail={evidenceDetail}
        path={evidencePath}
        loading={evidenceLoading}
        error={evidenceError}
        loadingArticleId={loadingArticleId}
        onReadArticle={openReader}
      />

      {reader ? (
        <ArticleReaderModal
          open
          onClose={() => setReader(null)}
          title={reader.title}
          body={reader.body}
          author={reader.author}
          date={reader.date}
          url={reader.url}
          outlet={reader.outlet}
          accent={reader.accent}
        />
      ) : null}
    </>
  );
}
