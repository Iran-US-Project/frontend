"use client";

import type { ReactNode } from "react";
import {
  ALL_GRAPH_CONFIDENCE,
  type GraphConfidence,
  type GraphFilters,
  type GraphHopDepth,
  type GraphViewMode,
} from "@/lib/graph-types";

type GraphControlsProps = {
  filters: GraphFilters;
  hopDepth: GraphHopDepth;
  availableRelations: string[];
  rangeSummary: string;
  rangeFrom: number;
  rangeTo: number;
  nodeCount: number;
  edgeCount: number;
  disabled?: boolean;
  onFiltersChange: (filters: GraphFilters) => void;
  onHopDepthChange: (depth: GraphHopDepth) => void;
};

function toggleListItem<T extends string>(list: T[], item: T): T[] {
  return list.includes(item)
    ? list.filter((value) => value !== item)
    : [...list, item];
}

function FilterChip({
  active,
  disabled,
  label,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-foreground/40 bg-foreground text-paper"
          : "border-border bg-paper/80 text-muted hover:border-foreground/20 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
      {children}
    </p>
  );
}

export function GraphControls({
  filters,
  hopDepth,
  availableRelations,
  rangeSummary,
  rangeFrom,
  rangeTo,
  nodeCount,
  edgeCount,
  disabled = false,
  onFiltersChange,
  onHopDepthChange,
}: GraphControlsProps) {
  const toggleConfidence = (level: GraphConfidence) => {
    const next = toggleListItem(filters.confidence, level);
    if (!next.length) return;
    onFiltersChange({ ...filters, confidence: next });
  };

  const toggleRelation = (relation: string) => {
    const active =
      filters.relations.length === 0 ||
      filters.relations.includes(relation);
    let next: string[];

    if (filters.relations.length === 0) {
      next = availableRelations.filter((item) => item !== relation);
    } else if (active) {
      if (filters.relations.length === 1) return;
      next = filters.relations.filter((item) => item !== relation);
    } else {
      next = [...filters.relations, relation];
    }

    if (next.length === availableRelations.length) {
      onFiltersChange({ ...filters, relations: [] });
      return;
    }

    onFiltersChange({ ...filters, relations: next });
  };

  const setViewMode = (viewMode: GraphViewMode) => {
    onFiltersChange({ ...filters, viewMode });
  };

  const relationActive = (relation: string) =>
    filters.relations.length === 0 || filters.relations.includes(relation);

  return (
    <aside className="border border-border bg-paper/60">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          Controls
        </p>
      </div>

      <div className="space-y-5 px-4 py-4">
        <div className="space-y-2">
          <p className="text-sm leading-relaxed text-muted">{rangeSummary}</p>
          <dl className="space-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            <div className="flex justify-between gap-3">
              <dt>Steps</dt>
              <dd className="text-foreground">
                {rangeFrom === rangeTo
                  ? String(rangeFrom)
                  : `${rangeFrom}–${rangeTo}`}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Visible nodes</dt>
              <dd className="text-foreground">{nodeCount}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Visible edges</dt>
              <dd className="text-foreground">{edgeCount}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3">
          <SectionLabel>Confidence</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {ALL_GRAPH_CONFIDENCE.map((level) => (
              <FilterChip
                key={level}
                label={level}
                active={filters.confidence.includes(level)}
                disabled={disabled}
                onClick={() => toggleConfidence(level)}
              />
            ))}
          </div>
        </div>

        {availableRelations.length > 0 ? (
          <div className="space-y-3">
            <SectionLabel>Relation types</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {availableRelations.map((relation) => (
                <FilterChip
                  key={relation}
                  label={relation}
                  active={relationActive(relation)}
                  disabled={disabled}
                  onClick={() => toggleRelation(relation)}
                />
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-muted/80">
              All types shown when every chip is active. Toggle off to hide
              specific relations.
            </p>
          </div>
        ) : null}

        <div className="space-y-3">
          <SectionLabel>Hop depth</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {([1, 2] as const).map((depth) => (
              <FilterChip
                key={depth}
                label={`${depth}-hop`}
                active={hopDepth === depth}
                disabled={disabled || filters.viewMode !== "focus"}
                onClick={() => onHopDepthChange(depth)}
              />
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-muted/80">
            Applies in focus view when exploring a focal event neighborhood.
          </p>
        </div>

        <div className="space-y-3">
          <SectionLabel>View mode</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              label="Cumulative"
              active={filters.viewMode === "cumulative"}
              disabled={disabled}
              onClick={() => setViewMode("cumulative")}
            />
            <FilterChip
              label="Focus"
              active={filters.viewMode === "focus"}
              disabled={disabled}
              onClick={() => setViewMode("focus")}
            />
          </div>
          <p className="text-[11px] leading-relaxed text-muted/80">
            Cumulative shows every development in the selected step window.
            Focus shows the neighborhood around the focal step.
          </p>
        </div>
      </div>
    </aside>
  );
}
