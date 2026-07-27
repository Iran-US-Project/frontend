"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnalysisLoadingModal,
  type AnalysisLoadingPhase,
} from "@/components/AnalysisLoadingModal";
import { ComparisonReport } from "@/components/ComparisonReport";
import { EventTimeline } from "@/components/EventTimeline";
import { FramingMatrix } from "@/components/FramingMatrix";
import {
  fetchEventAnalysis,
  fetchEventCoverage,
  fetchTimeline,
} from "@/lib/api";
import {
  mapMatrixToOutletFraming,
  mapMatrixToReport,
  type AnalysisPayload,
  type AnalysisStatus,
} from "@/lib/analysis-types";
import type { CoverageColumn } from "@/lib/event-coverage-types";
import type { SubEvent, TimelineEvent } from "@/lib/timeline-events";

const EMPTY_COLUMNS: CoverageColumn[] = [
  {
    region: "western",
    regionLabel: "Right",
    outlet: "Fox News",
    outletId: "fox",
    accent: "text-west",
    wash: "bg-west/[0.06]",
    articleCount: 0,
    articles: [],
  },
  {
    region: "mena",
    regionLabel: "Center",
    outlet: "BBC",
    outletId: "bbc",
    accent: "text-mena",
    wash: "bg-mena/[0.06]",
    articleCount: 0,
    articles: [],
  },
  {
    region: "financial",
    regionLabel: "Middle East",
    outlet: "Al Jazeera",
    outletId: "aljazeera",
    accent: "text-finance",
    wash: "bg-finance/[0.06]",
    articleCount: 0,
    articles: [],
  },
];

function resetAnalysisState(setters: {
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setAnalysisResult: (result: AnalysisPayload | null) => void;
  setAnalysisError: (error: string | null) => void;
  setLoadingPhase: (phase: AnalysisLoadingPhase) => void;
}) {
  setters.setAnalysisStatus("idle");
  setters.setAnalysisResult(null);
  setters.setAnalysisError(null);
  setters.setLoadingPhase("gathering");
}

export function MediaLensWorkspace() {
  const matrixRef = useRef<HTMLDivElement>(null);
  const analysisAbortRef = useRef<AbortController | null>(null);
  const phaseTimersRef = useRef<number[]>([]);

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [timelineStart, setTimelineStart] = useState("");
  const [timelineEnd, setTimelineEnd] = useState("");
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const [compareEventId, setCompareEventId] = useState<string | null>(null);
  const [selectedSubEvent, setSelectedSubEvent] = useState<SubEvent | null>(
    null,
  );
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [analysisResult, setAnalysisResult] = useState<AnalysisPayload | null>(
    null,
  );
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] =
    useState<AnalysisLoadingPhase>("gathering");

  const [coverageColumns, setCoverageColumns] =
    useState<CoverageColumn[]>(EMPTY_COLUMNS);
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [coverageError, setCoverageError] = useState<string | null>(null);

  const clearPhaseTimers = useCallback(() => {
    for (const timerId of phaseTimersRef.current) {
      window.clearTimeout(timerId);
    }
    phaseTimersRef.current = [];
  }, []);

  const stopAnalysis = useCallback(() => {
    analysisAbortRef.current?.abort();
    analysisAbortRef.current = null;
    clearPhaseTimers();
  }, [clearPhaseTimers]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setTimelineLoading(true);
      setTimelineError(null);
      try {
        const payload = await fetchTimeline();
        if (cancelled) return;
        setEvents(payload.events ?? []);
        setTimelineStart(payload.start ?? "");
        setTimelineEnd(payload.end ?? "");
      } catch (err) {
        if (cancelled) return;
        setTimelineError(
          err instanceof Error ? err.message : "Failed to load timeline",
        );
        setEvents([]);
      } finally {
        if (!cancelled) setTimelineLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const compareEvent = useMemo(
    () => events.find((e) => e.id === compareEventId) ?? null,
    [events, compareEventId],
  );

  const analysisReport = useMemo(
    () =>
      analysisResult ? mapMatrixToReport(analysisResult.result) : null,
    [analysisResult],
  );

  const outletFraming = useMemo(
    () =>
      analysisResult
        ? mapMatrixToOutletFraming(analysisResult.result)
        : undefined,
    [analysisResult],
  );

  useEffect(() => {
    if (!compareEventId || !selectedSubEvent) {
      setCoverageColumns(EMPTY_COLUMNS);
      setCoverageError(null);
      setCoverageLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCoverage() {
      setCoverageLoading(true);
      setCoverageError(null);
      try {
        const payload = await fetchEventCoverage(compareEventId!, {
          subEventTitle: selectedSubEvent!.title,
        });
        if (cancelled) return;
        setCoverageColumns(
          payload.columns?.length ? payload.columns : EMPTY_COLUMNS,
        );
      } catch (err) {
        if (cancelled) return;
        setCoverageColumns(EMPTY_COLUMNS);
        setCoverageError(
          err instanceof Error ? err.message : "Failed to load coverage",
        );
      } finally {
        if (!cancelled) setCoverageLoading(false);
      }
    }

    loadCoverage();
    return () => {
      cancelled = true;
    };
  }, [compareEventId, selectedSubEvent]);

  useEffect(() => {
    stopAnalysis();
    resetAnalysisState({
      setAnalysisStatus,
      setAnalysisResult,
      setAnalysisError,
      setLoadingPhase,
    });
  }, [compareEventId, selectedSubEvent?.id, stopAnalysis]);

  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, [stopAnalysis]);

  const handleToggleCompare = useCallback((eventId: string) => {
    setCompareEventId((current) => {
      if (current === eventId) {
        setSelectedSubEvent(null);
        return null;
      }
      return eventId;
    });
  }, []);

  const handleSelectSubEvent = useCallback(
    (eventId: string, subEvent: SubEvent) => {
      setCompareEventId(eventId);
      setSelectedSubEvent((current) =>
        current?.id === subEvent.id && compareEventId === eventId
          ? null
          : subEvent,
      );
    },
    [compareEventId],
  );

  const startPhaseProgression = useCallback(() => {
    clearPhaseTimers();
    setLoadingPhase("gathering");
    phaseTimersRef.current = [
      window.setTimeout(() => setLoadingPhase("analyzing"), 2500),
      window.setTimeout(() => setLoadingPhase("synthesizing"), 9000),
    ];
  }, [clearPhaseTimers]);

  const handleRunComparison = useCallback(async () => {
    if (
      !compareEventId ||
      !selectedSubEvent ||
      analysisStatus === "running" ||
      coverageLoading
    ) {
      return;
    }

    const outletsWithArticles = coverageColumns.filter(
      (col) => col.articles.length > 0,
    ).length;
    if (outletsWithArticles < 2) {
      setAnalysisError(
        "Need at least 2 outlets with articles to run a comparison.",
      );
      setAnalysisStatus("error");
      return;
    }

    stopAnalysis();
    setAnalysisError(null);
    setAnalysisStatus("running");
    startPhaseProgression();

    const controller = new AbortController();
    analysisAbortRef.current = controller;
    const force = analysisStatus === "complete" || analysisStatus === "error";

    try {
      const payload = await fetchEventAnalysis(compareEventId, {
        subEventId: selectedSubEvent.id,
        subEventTitle: selectedSubEvent.title,
        force,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      setAnalysisResult(payload);
      setAnalysisStatus("complete");
    } catch (err) {
      if (
        controller.signal.aborted ||
        (err instanceof DOMException && err.name === "AbortError") ||
        (err instanceof Error && err.name === "AbortError")
      ) {
        setAnalysisStatus("idle");
        return;
      }

      setAnalysisError(
        err instanceof Error ? err.message : "Failed to run comparison",
      );
      setAnalysisStatus("error");
    } finally {
      clearPhaseTimers();
      if (analysisAbortRef.current === controller) {
        analysisAbortRef.current = null;
      }
    }
  }, [
    analysisStatus,
    clearPhaseTimers,
    compareEventId,
    coverageColumns,
    coverageLoading,
    selectedSubEvent,
    startPhaseProgression,
    stopAnalysis,
  ]);

  const handleCancelAnalysis = useCallback(() => {
    stopAnalysis();
    setAnalysisStatus("idle");
    setAnalysisError(null);
    setLoadingPhase("gathering");
  }, [stopAnalysis]);

  const handleDismissAnalysisError = useCallback(() => {
    setAnalysisError(null);
    setAnalysisStatus("error");
  }, []);

  useEffect(() => {
    if (!compareEventId || !selectedSubEvent) return;
    matrixRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [compareEventId, selectedSubEvent]);

  const showLoadingModal =
    analysisStatus === "running" || Boolean(analysisError);

  return (
    <>
      <EventTimeline
        events={events}
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        loading={timelineLoading}
        error={timelineError}
        compareEventId={compareEventId}
        selectedSubEventId={selectedSubEvent?.id ?? null}
        onToggleCompare={handleToggleCompare}
        onSelectSubEvent={handleSelectSubEvent}
      />

      {compareEvent && (
        <div ref={matrixRef}>
          <FramingMatrix
            eventTitle={compareEvent.title}
            subEventTitle={selectedSubEvent?.title ?? null}
            columns={coverageColumns}
            outletFraming={outletFraming}
            loading={coverageLoading}
            error={coverageError}
            needsSubEvent
            analysisStatus={analysisStatus}
            onRunComparison={handleRunComparison}
          />

          {analysisStatus === "complete" &&
            selectedSubEvent &&
            analysisReport &&
            analysisResult && (
              <ComparisonReport
                eventTitle={`${compareEvent.title} — ${selectedSubEvent.title}`}
                report={analysisReport}
                meta={{
                  articleCount: analysisResult.articleCount,
                  outletCount:
                    analysisResult.result.sources_analyzed?.length ??
                    coverageColumns.filter((col) => col.articles.length > 0)
                      .length,
                  cached: analysisResult.cached,
                  generatedAt: analysisResult.generatedAt,
                }}
              />
            )}
        </div>
      )}

      <AnalysisLoadingModal
        open={showLoadingModal}
        phase={loadingPhase}
        error={analysisError}
        onCancel={
          analysisStatus === "running" ? handleCancelAnalysis : undefined
        }
        onDismissError={handleDismissAnalysisError}
        onRetry={
          analysisStatus === "error" ? handleRunComparison : undefined
        }
      />
    </>
  );
}
