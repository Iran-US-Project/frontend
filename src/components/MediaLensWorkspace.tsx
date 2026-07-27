"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComparisonReport } from "@/components/ComparisonReport";
import { EventTimeline } from "@/components/EventTimeline";
import { FramingMatrix } from "@/components/FramingMatrix";
import { fetchEventCoverage, fetchTimeline } from "@/lib/api";
import {
  getEventCoverage,
  type AnalysisStatus,
} from "@/lib/event-coverage";
import type { CoverageColumn } from "@/lib/event-coverage-types";
import type { SubEvent, TimelineEvent } from "@/lib/timeline-events";

const ANALYSIS_DELAY_MS = 2400;

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


export function MediaLensWorkspace() {
  const matrixRef = useRef<HTMLDivElement>(null);
  const analysisTimerRef = useRef<number | null>(null);

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

  const [coverageColumns, setCoverageColumns] =
    useState<CoverageColumn[]>(EMPTY_COLUMNS);
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [coverageError, setCoverageError] = useState<string | null>(null);

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

  const analysisCoverage = useMemo(
    () =>
      compareEvent ? getEventCoverage(compareEvent.id, compareEvent) : null,
    [compareEvent],
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
    return () => {
      if (analysisTimerRef.current !== null) {
        window.clearTimeout(analysisTimerRef.current);
      }
    };
  }, []);

  const handleToggleCompare = useCallback((eventId: string) => {
    setCompareEventId((current) => {
      if (current === eventId) {
        setSelectedSubEvent(null);
        return null;
      }
      return eventId;
    });
    setAnalysisStatus("idle");
  }, []);

  const handleSelectSubEvent = useCallback(
    (eventId: string, subEvent: SubEvent) => {
      setCompareEventId(eventId);
      setSelectedSubEvent((current) =>
        current?.id === subEvent.id && compareEventId === eventId
          ? null
          : subEvent,
      );
      setAnalysisStatus("idle");
    },
    [compareEventId],
  );

  const handleRunComparison = useCallback(() => {
    if (!compareEventId || !selectedSubEvent || analysisStatus === "running") {
      return;
    }

    setAnalysisStatus("running");
    if (analysisTimerRef.current !== null) {
      window.clearTimeout(analysisTimerRef.current);
    }

    analysisTimerRef.current = window.setTimeout(() => {
      setAnalysisStatus("complete");
      analysisTimerRef.current = null;
    }, ANALYSIS_DELAY_MS);
  }, [compareEventId, selectedSubEvent, analysisStatus]);

  useEffect(() => {
    if (!compareEventId || !selectedSubEvent) return;
    matrixRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [compareEventId, selectedSubEvent]);

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
        analysisStatus={analysisStatus}
        onToggleCompare={handleToggleCompare}
        onSelectSubEvent={handleSelectSubEvent}
        onRunComparison={handleRunComparison}
      />

      {compareEvent && (
        <div ref={matrixRef}>
          <FramingMatrix
            eventTitle={compareEvent.title}
            subEventTitle={selectedSubEvent?.title ?? null}
            columns={coverageColumns}
            loading={coverageLoading}
            error={coverageError}
            needsSubEvent
          />

          {analysisStatus === "complete" &&
            selectedSubEvent &&
            analysisCoverage?.analysis && (
              <ComparisonReport
                eventTitle={`${compareEvent.title} — ${selectedSubEvent.title}`}
                report={analysisCoverage.analysis.report}
              />
            )}
        </div>
      )}
    </>
  );
}
