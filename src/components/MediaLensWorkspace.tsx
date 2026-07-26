"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComparisonReport } from "@/components/ComparisonReport";
import { EventTimeline } from "@/components/EventTimeline";
import { FramingMatrix } from "@/components/FramingMatrix";
import {
  getEventCoverage,
  type AnalysisStatus,
} from "@/lib/event-coverage";
import { TIMELINE_EVENTS } from "@/lib/timeline-events";

const ANALYSIS_DELAY_MS = 2400;

export function MediaLensWorkspace() {
  const matrixRef = useRef<HTMLDivElement>(null);
  const analysisTimerRef = useRef<number | null>(null);

  const [compareEventId, setCompareEventId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");

  const compareEvent = useMemo(
    () => TIMELINE_EVENTS.find((e) => e.id === compareEventId) ?? null,
    [compareEventId],
  );

  const coverage = useMemo(
    () => (compareEvent ? getEventCoverage(compareEvent.id, compareEvent) : null),
    [compareEvent],
  );

  useEffect(() => {
    return () => {
      if (analysisTimerRef.current !== null) {
        window.clearTimeout(analysisTimerRef.current);
      }
    };
  }, []);

  const handleToggleCompare = useCallback((eventId: string) => {
    setCompareEventId((current) => {
      if (current === eventId) return null;
      return eventId;
    });
    setAnalysisStatus("idle");
  }, []);

  const handleRunComparison = useCallback(() => {
    if (!compareEventId || analysisStatus === "running") return;

    setAnalysisStatus("running");
    if (analysisTimerRef.current !== null) {
      window.clearTimeout(analysisTimerRef.current);
    }

    analysisTimerRef.current = window.setTimeout(() => {
      setAnalysisStatus("complete");
      analysisTimerRef.current = null;
    }, ANALYSIS_DELAY_MS);
  }, [compareEventId, analysisStatus]);

  useEffect(() => {
    if (!compareEventId) return;
    matrixRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [compareEventId]);

  const matrixFrames =
    analysisStatus === "complete" && coverage?.analysis
      ? coverage.analysis.sources
      : coverage?.sources ?? [];

  return (
    <>
      <EventTimeline
        compareEventId={compareEventId}
        analysisStatus={analysisStatus}
        onToggleCompare={handleToggleCompare}
        onRunComparison={handleRunComparison}
      />

      {compareEvent && coverage && (
        <div ref={matrixRef}>
          <FramingMatrix
            eventTitle={compareEvent.title}
            frames={matrixFrames}
            mode={analysisStatus === "complete" ? "analysis" : "sources"}
            isAnalyzing={analysisStatus === "running"}
          />

          {analysisStatus === "complete" && coverage.analysis && (
            <ComparisonReport
              eventTitle={compareEvent.title}
              report={coverage.analysis.report}
            />
          )}
        </div>
      )}
    </>
  );
}
