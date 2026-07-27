export type EventTier = "major" | "minor";

export type SubEvent = {
  id: string;
  title: string;
  date: string;
};

export type TimelineEvent = {
  id: string;
  title: string;
  shortLabel: string;
  date: string;
  endDate?: string;
  tier: EventTier;
  description: string;
  keywords: string[];
  articleCount: number;
  subEvents?: SubEvent[];
};

export type TimelinePayload = {
  start: string;
  end: string;
  articleCount: number;
  events: TimelineEvent[];
};

/** Parse YYYY-MM-DD as local calendar date (avoids UTC off-by-one). */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function eventPosition(
  date: string,
  start: string,
  end: string,
): number {
  const d = parseLocalDate(date).getTime();
  const total =
    parseLocalDate(end).getTime() - parseLocalDate(start).getTime();
  if (total <= 0) return 0;
  const offset = d - parseLocalDate(start).getTime();
  return Math.min(100, Math.max(0, (offset / total) * 100));
}

export function formatEventDate(date: string, endDate?: string): string {
  const fmt = (iso: string) =>
    parseLocalDate(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (endDate && endDate !== date) {
    return `${fmt(date)} – ${fmt(endDate)}`;
  }
  return fmt(date);
}

export function formatMonthYear(iso: string): string {
  return parseLocalDate(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function timelineYears(start: string, end: string): number[] {
  const startYear = parseLocalDate(start).getFullYear();
  const endYear = parseLocalDate(end).getFullYear();
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y += 1) years.push(y);
  return years;
}
