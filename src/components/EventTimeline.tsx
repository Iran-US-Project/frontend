"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  TIMELINE_EVENTS,
  TIMELINE_END,
  TIMELINE_START,
  eventPosition,
  parseLocalDate,
  type EventTier,
  type SubEvent,
  type TimelineEvent,
  formatEventDate,
  formatMonthYear,
} from "@/lib/timeline-events";

type FilterTier = "all" | EventTier;

/** Pixel width of the scrollable timeline canvas */
const TRACK_WIDTH = 2400;
const CARD_WIDTH = 136;
const CARD_HEIGHT = 74; // approximate flag card height for layout
const LANE_STEP = 72; // vertical distance between stacked cards
const STEM_BASE = 16;
const TOP_PAD = 20;
const BOTTOM_PAD = 44; // room for month labels under the axis

type LaidOutEvent = TimelineEvent & {
  position: number; // 0–100 along the axis
  side: "above" | "below";
  lane: number; // 0 = closest to axis
  x: number; // px center on track
};

function tierLabel(tier: EventTier) {
  return tier === "major" ? "Major" : "Minor";
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={dir === "left" ? "rotate-180" : undefined}
    >
      <path
        d="M6 3.5L10.5 8L6 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

function buildMonthMarkers() {
  const markers: { label: string; position: number; key: string }[] = [];
  const cursor = parseLocalDate(TIMELINE_START);
  cursor.setDate(1);
  if (cursor < parseLocalDate(TIMELINE_START)) {
    cursor.setMonth(cursor.getMonth() + 1);
  }
  const end = parseLocalDate(TIMELINE_END);

  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth() + 1;
    const iso = `${y}-${String(m).padStart(2, "0")}-01`;
    markers.push({
      key: iso,
      label: cursor.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      position: eventPosition(iso),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return markers;
}

/** Place events on a chronological axis with collision-aware lanes. */
function layoutEvents(events: TimelineEvent[]): LaidOutEvent[] {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const placed: LaidOutEvent[] = [];
  const minGapPx = CARD_WIDTH + 12;

  for (let i = 0; i < sorted.length; i++) {
    const event = sorted[i];
    const position = eventPosition(event.date);
    const x = (position / 100) * TRACK_WIDTH;
    const side: "above" | "below" = i % 2 === 0 ? "above" : "below";

    let lane = 0;
    while (lane <= 3) {
      const conflict = placed.some(
        (p) =>
          p.side === side &&
          p.lane === lane &&
          Math.abs(p.x - x) < minGapPx,
      );
      if (!conflict) break;
      lane += 1;
    }

    placed.push({ ...event, position, side, lane, x });
  }

  return placed;
}

const SUB_EVENT_PREVIEW_COUNT = 2;

function formatSubEventDate(date: string): string {
  return parseLocalDate(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function EventSubEventsPanel({ subEvents }: { subEvents: SubEvent[] }) {
  const [expanded, setExpanded] = useState(false);
  const preview = subEvents.slice(0, SUB_EVENT_PREVIEW_COUNT);
  const hiddenCount = Math.max(0, subEvents.length - preview.length);
  const visible = expanded ? subEvents : preview;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Key developments
        </p>
        <p className="mt-1.5 font-mono text-[11px] text-muted/80">
          {subEvents.length} sub-events in this window
        </p>

        <ul className="mt-4 space-y-0 divide-y divide-border/70 border-y border-border/70">
          {visible.map((item) => (
            <li key={item.id} className="py-3">
              <p className="text-[14px] leading-snug text-foreground/90">
                {item.title}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                {formatSubEventDate(item.date)}
              </p>
            </li>
          ))}
        </ul>

        {!expanded && hiddenCount > 0 && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted/70">
            +{hiddenCount} more not shown
          </p>
        )}
      </div>

      {subEvents.length > SUB_EVENT_PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="mt-5 w-full border border-border bg-background/40 px-4 py-2.5 text-[12px] font-medium tracking-wide text-foreground transition-colors hover:border-foreground/30 hover:bg-foreground/[0.03]"
          aria-expanded={expanded}
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      )}
    </div>
  );
}

function EventDetailPanel({
  event,
  index,
  total,
  isCompared,
  onToggleCompare,
  onPrev,
  onNext,
}: {
  event: TimelineEvent;
  index: number;
  total: number;
  isCompared: boolean;
  onToggleCompare: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const subEvents = event.subEvents ?? [];

  return (
    <article
      key={event.id}
      className="timeline-detail-enter border border-border bg-paper/90"
    >
      <header className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.16em] ${
                event.tier === "major" ? "text-accent" : "text-muted"
              }`}
            >
              {tierLabel(event.tier)} event
            </span>
            <span className="font-mono text-[10px] text-muted">·</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {event.articleCount.toLocaleString()} articles
            </span>
            <span className="font-mono text-[10px] text-muted">·</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {index + 1} of {total}
            </span>
          </div>
          <h3 className="mt-2 font-display text-xl font-medium tracking-[-0.01em] text-foreground sm:text-2xl">
            {event.title}
          </h3>
          <p className="mt-1.5 font-mono text-[11px] text-muted">
            {formatEventDate(event.date, event.endDate)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="flex border border-border">
            <button
              type="button"
              onClick={onPrev}
              disabled={index === 0}
              className="flex h-10 w-10 items-center justify-center text-muted transition-colors hover:bg-foreground/[0.04] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous event"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={index >= total - 1}
              className="flex h-10 w-10 items-center justify-center border-l border-border text-muted transition-colors hover:bg-foreground/[0.04] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next event"
            >
              <Chevron dir="right" />
            </button>
          </div>
          <button
            type="button"
            onClick={onToggleCompare}
            className={`h-10 border px-4 text-[12px] font-medium tracking-wide transition-colors ${
              isCompared
                ? "border-west bg-west text-paper"
                : "border-border bg-paper text-foreground hover:border-foreground/30"
            }`}
          >
            {isCompared ? "In compare" : "Compare"}
          </button>
          <button
            type="button"
            disabled
            className="h-10 bg-foreground px-5 text-[12px] font-medium tracking-wide text-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            Run comparison
          </button>
        </div>
      </header>

      <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
        <p className="border-b border-border px-5 py-5 text-[15px] leading-relaxed text-muted md:border-b-0 md:border-r">
          {event.description}
        </p>
        <div className="flex flex-col px-5 py-5">
          {subEvents.length > 0 ? (
            <EventSubEventsPanel key={event.id} subEvents={subEvents} />
          ) : (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Key developments
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted/80">
                No nested sub-events for this window yet.
              </p>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Coverage volume
              </p>
              <div className="mt-3 h-1.5 w-full bg-border/60">
                <div
                  className="h-full bg-accent/70 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (event.articleCount / 400) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 font-mono text-[11px] tabular-nums text-muted">
                {event.articleCount.toLocaleString()} articles in window
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ComparisonPanel({
  events,
  onClear,
  onSelect,
}: {
  events: TimelineEvent[];
  onClear: () => void;
  onSelect: (id: string) => void;
}) {
  if (events.length === 0) return null;

  return (
    <section className="mt-6 border border-border bg-paper/60">
      <header className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-west">
            Side by side
          </p>
          <h3 className="mt-1 font-display text-xl font-medium text-foreground">
            {events.length < 2
              ? "Pick one more event to compare"
              : "Compare event windows"}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-foreground"
        >
          Clear
        </button>
      </header>

      <div className="grid md:grid-cols-2">
        {[0, 1].map((slot) => {
          const event = events[slot];
          if (!event) {
            return (
              <div
                key={slot}
                className={`flex min-h-[140px] items-center justify-center px-5 py-8 ${
                  slot === 0
                    ? "border-b border-border md:border-b-0 md:border-r"
                    : ""
                }`}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted/70">
                  Empty slot
                </p>
              </div>
            );
          }

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect(event.id)}
              className={`px-5 py-5 text-left transition-colors hover:bg-foreground/[0.02] ${
                slot === 0
                  ? "border-b border-border md:border-b-0 md:border-r"
                  : ""
              }`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Window {slot + 1}
              </p>
              <h4 className="mt-2 font-display text-lg text-foreground">
                {event.title}
              </h4>
              <p className="mt-1 font-mono text-[11px] text-muted">
                {formatEventDate(event.date, event.endDate)}
              </p>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                {event.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function EventTimeline() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number | null;
    startX: number;
    startScroll: number;
    dragging: boolean;
    suppressClick: boolean;
  }>({
    pointerId: null,
    startX: 0,
    startScroll: 0,
    dragging: false,
    suppressClick: false,
  });

  const [filter, setFilter] = useState<FilterTier>("all");
  const [selectedId, setSelectedId] = useState<string>(
    TIMELINE_EVENTS.find((e) => e.tier === "major")?.id ??
      TIMELINE_EVENTS[0].id,
  );
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const monthMarkers = useMemo(() => buildMonthMarkers(), []);

  const visibleEvents = useMemo(
    () =>
      [...TIMELINE_EVENTS]
        .filter((e) => filter === "all" || e.tier === filter)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [filter],
  );

  const laidOut = useMemo(() => layoutEvents(visibleEvents), [visibleEvents]);

  const maxLaneAbove = useMemo(
    () =>
      laidOut
        .filter((e) => e.side === "above")
        .reduce((m, e) => Math.max(m, e.lane), 0),
    [laidOut],
  );
  const maxLaneBelow = useMemo(
    () =>
      laidOut
        .filter((e) => e.side === "below")
        .reduce((m, e) => Math.max(m, e.lane), 0),
    [laidOut],
  );

  // Axis sits below the tallest above-card stack so nothing is clipped
  const axisTop =
    TOP_PAD +
    CARD_HEIGHT +
    STEM_BASE +
    maxLaneAbove * LANE_STEP +
    12;
  const trackHeight =
    axisTop +
    STEM_BASE +
    maxLaneBelow * LANE_STEP +
    CARD_HEIGHT +
    BOTTOM_PAD;

  const selectedIndex = visibleEvents.findIndex((e) => e.id === selectedId);
  const selectedEvent =
    selectedIndex >= 0
      ? visibleEvents[selectedIndex]
      : (visibleEvents[0] ?? TIMELINE_EVENTS[0]);

  const compareEvents = TIMELINE_EVENTS.filter((e) =>
    compareIds.includes(e.id),
  );

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(max > 4 && el.scrollLeft < max - 4);
    setScrollProgress(max > 0 ? Math.min(1, el.scrollLeft / max) : 0);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    const track = trackRef.current;
    if (!el) return;

    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(updateScrollState);
    });
    ro.observe(el);
    if (track) ro.observe(track);

    const t1 = window.setTimeout(updateScrollState, 50);
    const t2 = window.setTimeout(updateScrollState, 250);
    requestAnimationFrame(updateScrollState);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [updateScrollState, visibleEvents]);

  useEffect(() => {
    if (!visibleEvents.some((e) => e.id === selectedId) && visibleEvents[0]) {
      setSelectedId(visibleEvents[0].id);
    }
  }, [visibleEvents, selectedId]);

  const scrollByPage = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.min(el.clientWidth * 0.65, 480),
      behavior: "smooth",
    });
  }, []);

  const scrollToEvent = useCallback((id: string) => {
    const el = scrollerRef.current;
    if (!el) return;
    const marker = el.querySelector<HTMLElement>(`[data-event-id="${id}"]`);
    if (!marker) return;
    const center = marker.offsetLeft + marker.offsetWidth / 2;
    el.scrollTo({
      left: Math.max(0, center - el.clientWidth / 2),
      behavior: "smooth",
    });
  }, []);

  const selectEvent = useCallback(
    (id: string) => {
      setSelectedId(id);
      scrollToEvent(id);
    },
    [scrollToEvent],
  );

  const selectRelative = useCallback(
    (delta: -1 | 1) => {
      if (selectedIndex < 0) return;
      const next = selectedIndex + delta;
      if (next < 0 || next >= visibleEvents.length) return;
      selectEvent(visibleEvents[next].id);
    },
    [selectedIndex, visibleEvents, selectEvent],
  );

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      dragging: false,
      suppressClick: false,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = scrollerRef.current;
    if (drag.pointerId !== e.pointerId || !el) return;

    const dx = e.clientX - drag.startX;
    if (!drag.dragging && Math.abs(dx) > 8) {
      drag.dragging = true;
      setIsDragging(true);
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    if (drag.dragging) {
      e.preventDefault();
      el.scrollLeft = drag.startScroll - dx;
    }
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    if (dragRef.current.dragging) {
      dragRef.current.suppressClick = true;
      window.setTimeout(() => {
        dragRef.current.suppressClick = false;
      }, 0);
    }
    dragRef.current.pointerId = null;
    dragRef.current.dragging = false;
    setIsDragging(false);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      selectRelative(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      selectRelative(-1);
    }
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (ev: WheelEvent) => {
      if (Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return;
      if (el.scrollWidth <= el.clientWidth) return;
      ev.preventDefault();
      el.scrollLeft += ev.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section className="border border-border bg-paper/80">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Event timeline
          </p>
          <h2 className="mt-1 font-display text-2xl font-medium text-foreground">
            Chronology of the conflict
          </h2>
          <p className="mt-1 text-sm text-muted">
            {formatMonthYear(TIMELINE_START)}
            {" — "}
            {formatMonthYear(TIMELINE_END)}
            {" · "}
            {visibleEvents.length} events plotted by date
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex border border-border"
            role="group"
            aria-label="Filter events by tier"
          >
            {(["all", "major", "minor"] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setFilter(tier)}
                className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                  filter === tier
                    ? "bg-foreground text-paper"
                    : "bg-paper text-muted hover:text-foreground"
                }`}
              >
                {tier === "all" ? "All" : tier}
              </button>
            ))}
          </div>

          <div className="flex border border-border">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              disabled={!canScrollLeft}
              className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:bg-foreground/[0.04] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Scroll timeline left"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              disabled={!canScrollRight}
              className="flex h-9 w-9 items-center justify-center border-l border-border text-muted transition-colors hover:bg-foreground/[0.04] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Scroll timeline right"
            >
              <Chevron dir="right" />
            </button>
          </div>
        </div>
      </div>

      {/* Chronological track */}
      <div className="relative border-b border-border">
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 z-20 w-14 bg-gradient-to-r from-paper via-paper/85 to-transparent transition-opacity duration-300 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-20 w-14 bg-gradient-to-l from-paper via-paper/85 to-transparent transition-opacity duration-300 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden
        />

        <div
          ref={scrollerRef}
          role="listbox"
          aria-label="Event timeline"
          aria-activedescendant={
            selectedEvent ? `timeline-option-${selectedEvent.id}` : undefined
          }
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`timeline-scroll overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40 ${
            isDragging ? "is-dragging" : ""
          }`}
        >
          <div
            ref={trackRef}
            className="relative mx-8 sm:mx-12"
            style={{ width: TRACK_WIDTH, height: trackHeight }}
          >
            {/* Axis */}
            <div
              className="absolute left-0 right-0 h-[2px] bg-foreground/40"
              style={{ top: axisTop }}
              aria-hidden
            />

            {/* Year era labels — sit in the top margin, clear of event cards */}
            <div
              className="pointer-events-none absolute left-0 top-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
            >
              2025
            </div>
            <div
              className="pointer-events-none absolute top-1 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted"
              style={{ left: `${eventPosition("2026-01-01")}%` }}
            >
              2026
            </div>

            {/* Year boundary tick */}
            <div
              className="pointer-events-none absolute h-5 w-px -translate-x-1/2 -translate-y-1/2 bg-foreground/35"
              style={{
                left: `${eventPosition("2026-01-01")}%`,
                top: axisTop,
              }}
              aria-hidden
            />

            {/* Start / end caps */}
            <div
              className="absolute left-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground/50 bg-paper"
              style={{ top: axisTop }}
              aria-hidden
            />
            <div
              className="absolute right-0 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground/50 bg-paper"
              style={{ top: axisTop }}
              aria-hidden
            />

            {/* Month ticks */}
            {monthMarkers.map((m) => (
              <div
                key={m.key}
                className="absolute flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${m.position}%`, top: axisTop }}
              >
                <span className="h-3 w-px bg-foreground/30" aria-hidden />
                <span className="mt-2.5 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
                  {m.label}
                </span>
              </div>
            ))}

            {/* Duration spans for ranged events */}
            {laidOut.map((event) => {
              if (!event.endDate) return null;
              const start = event.position;
              const end = eventPosition(event.endDate);
              const width = Math.max(0.4, end - start);
              return (
                <div
                  key={`${event.id}-span`}
                  className={`absolute h-1.5 -translate-y-1/2 rounded-sm ${
                    event.tier === "major" ? "bg-accent/35" : "bg-muted/30"
                  }`}
                  style={{
                    left: `${start}%`,
                    width: `${width}%`,
                    top: axisTop,
                  }}
                  aria-hidden
                />
              );
            })}

            {/* Event markers + cards */}
            {laidOut.map((event, index) => {
              const isSelected = selectedEvent?.id === event.id;
              const isCompared = compareIds.includes(event.id);
              const isMajor = event.tier === "major";
              const stem = STEM_BASE + event.lane * LANE_STEP;
              const cardOffset = stem + 6;

              return (
                <div
                  key={event.id}
                  id={`timeline-option-${event.id}`}
                  data-event-id={event.id}
                  role="option"
                  aria-selected={isSelected}
                  className="timeline-card-enter absolute z-10"
                  style={{
                    left: `${event.position}%`,
                    top: axisTop,
                    animationDelay: `${Math.min(index, 8) * 40}ms`,
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      if (dragRef.current.suppressClick) {
                        e.preventDefault();
                        return;
                      }
                      selectEvent(event.id);
                    }}
                    className={`absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                      isMajor ? "h-3.5 w-3.5" : "h-2.5 w-2.5"
                    } ${
                      isSelected
                        ? "scale-125 border-accent bg-accent shadow-[0_0_0_5px_rgba(143,29,44,0.18)]"
                        : isCompared
                          ? "border-west bg-west"
                          : isMajor
                            ? "border-foreground/55 bg-paper hover:border-foreground"
                            : "border-muted bg-paper hover:border-foreground/40"
                    }`}
                    aria-label={`${event.title}, ${formatEventDate(event.date, event.endDate)}`}
                  />

                  <div
                    className={`pointer-events-none absolute left-1/2 w-px -translate-x-1/2 ${
                      isSelected ? "bg-accent/55" : "bg-foreground/20"
                    }`}
                    style={
                      event.side === "above"
                        ? { bottom: "50%", height: stem }
                        : { top: "50%", height: stem }
                    }
                    aria-hidden
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      if (dragRef.current.suppressClick) {
                        e.preventDefault();
                        return;
                      }
                      selectEvent(event.id);
                    }}
                    className={`absolute left-1/2 z-10 -translate-x-1/2 border px-2.5 py-2 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
                      isSelected
                        ? "border-accent bg-accent/[0.08] shadow-[0_8px_22px_-12px_rgba(143,29,44,0.4)]"
                        : isCompared
                          ? "border-west/40 bg-west/[0.05]"
                          : "border-border bg-paper shadow-[0_1px_0_rgba(18,21,26,0.04)] hover:border-foreground/30"
                    }`}
                    style={{
                      width: CARD_WIDTH,
                      ...(event.side === "above"
                        ? { bottom: cardOffset }
                        : { top: cardOffset }),
                    }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                        {formatMonthYear(event.date)}
                      </span>
                      <span
                        className={`font-mono text-[8px] uppercase tracking-[0.1em] ${
                          isMajor ? "text-accent" : "text-muted/80"
                        }`}
                      >
                        {tierLabel(event.tier)}
                      </span>
                    </div>
                    <span className="mt-1 block font-display text-[13px] leading-snug tracking-[-0.01em] text-foreground">
                      {event.shortLabel}
                    </span>
                    <span className="mt-1 block truncate font-mono text-[9px] text-muted">
                      {event.articleCount.toLocaleString()} articles
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              <span className="h-3 w-3 rounded-full border-2 border-foreground/45 bg-paper" />
              Major
            </span>
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              <span className="h-2 w-2 rounded-full border-2 border-muted/60 bg-paper" />
              Minor
            </span>
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              <span className="h-1.5 w-5 rounded-sm bg-accent/35" />
              Duration
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-muted sm:inline">
              Drag · scroll · click a marker
            </span>
          </div>

          <div className="flex items-center gap-3 sm:min-w-[200px]">
            <div className="h-0.5 flex-1 overflow-hidden bg-border">
              <div
                className="h-full bg-foreground/55 transition-[width] duration-150"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        {selectedEvent && (
          <EventDetailPanel
            event={selectedEvent}
            index={Math.max(0, selectedIndex)}
            total={visibleEvents.length}
            isCompared={compareIds.includes(selectedEvent.id)}
            onToggleCompare={() => toggleCompare(selectedEvent.id)}
            onPrev={() => selectRelative(-1)}
            onNext={() => selectRelative(1)}
          />
        )}
        <ComparisonPanel
          events={compareEvents}
          onClear={() => setCompareIds([])}
          onSelect={selectEvent}
        />
      </div>
    </section>
  );
}
