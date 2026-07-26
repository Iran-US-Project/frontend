export type EventTier = "major" | "minor";

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
};

/** Curated from corpus date range (2025-05-21 → 2026-06-14) and keyword clusters. */
export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "iran-israel-war-2025",
    title: "Iran–Israel 12-day war",
    shortLabel: "12-day war",
    date: "2025-06-13",
    endDate: "2025-06-24",
    tier: "major",
    description:
      "Operation Rising Lion — intensive US-Israeli strikes on Iranian military and nuclear targets. Senior IRGC commanders killed; Tehran marks anniversary as diplomatic talks resume.",
    keywords: ["Iran Israel war 2025", "Iran US war 2025"],
    articleCount: 45,
  },
  {
    id: "post-war-diplomacy",
    title: "Post-war diplomatic lull",
    shortLabel: "Diplomatic lull",
    date: "2025-07-08",
    tier: "minor",
    description:
      "Sparse coverage window after the June escalation — outlets track residual sanctions rhetoric and enrichment negotiations.",
    keywords: ["Iran US war 2025"],
    articleCount: 4,
  },
  {
    id: "fordow-coverage",
    title: "Fordow nuclear facility scrutiny",
    shortLabel: "Fordow",
    date: "2025-09-12",
    tier: "minor",
    description:
      "Renewed reporting on underground enrichment at Fordow — Western outlets emphasize verification; regional press frames sovereignty and retaliation risk.",
    keywords: ["Iran nuclear facility Fordow"],
    articleCount: 2,
  },
  {
    id: "hormuz-crisis",
    title: "Strait of Hormuz tensions",
    shortLabel: "Hormuz crisis",
    date: "2026-02-28",
    tier: "major",
    description:
      "Iran asserts control over the Strait of Hormuz; global energy markets react. Financial press leads on oil volatility and shipping insurance.",
    keywords: ["Strait of Hormuz crisis", "Iran US conflict 2026"],
    articleCount: 59,
  },
  {
    id: "supreme-leader",
    title: "Supreme Leader succession",
    shortLabel: "Leadership",
    date: "2026-03-01",
    tier: "major",
    description:
      "Coverage of Ayatollah Khamenei's death and six-day burial proceedings — divergent frames on legitimacy, instability, and regional power vacuum.",
    keywords: ["Iran supreme leader", "Iran US conflict 2026"],
    articleCount: 48,
  },
  {
    id: "trump-iran-2026",
    title: "Trump–Iran policy shift",
    shortLabel: "Trump track",
    date: "2026-03-15",
    tier: "minor",
    description:
      "US executive signals on maximum pressure vs. deal-making — Western editorials split on credibility of outreach.",
    keywords: ["Iran Trump 2026"],
    articleCount: 53,
  },
  {
    id: "sanctions-cycle",
    title: "Sanctions escalation cycle",
    shortLabel: "Sanctions",
    date: "2026-04-10",
    tier: "minor",
    description:
      "Treasury designations and SWIFT-adjacent measures — financial wires emphasize compliance; MENA outlets highlight humanitarian spillover.",
    keywords: ["US Iran sanctions 2026"],
    articleCount: 52,
  },
  {
    id: "coverage-surge",
    title: "May coverage surge",
    shortLabel: "Coverage peak",
    date: "2026-05-01",
    endDate: "2026-05-31",
    tier: "major",
    description:
      "Largest single-month article volume in the corpus — overlapping frames on ceasefire prospects, Hormuz, and nuclear red lines.",
    keywords: ["Iran US conflict 2026", "Iran ceasefire 2026"],
    articleCount: 250,
  },
  {
    id: "ceasefire-talks",
    title: "Ceasefire negotiations",
    shortLabel: "Ceasefire talks",
    date: "2026-06-01",
    endDate: "2026-06-14",
    tier: "major",
    description:
      "Araghchi–US back-channel reporting intensifies; outlets disagree on whether talks are prelude to peace or tactical pause before renewed strikes.",
    keywords: ["Iran ceasefire 2026", "Iran US conflict 2026"],
    articleCount: 377,
  },
];

export const TIMELINE_START = "2025-05-21";
export const TIMELINE_END = "2026-06-14";

export function eventPosition(date: string): number {
  const d = parseLocalDate(date).getTime();
  const total =
    parseLocalDate(TIMELINE_END).getTime() -
    parseLocalDate(TIMELINE_START).getTime();
  const offset = d - parseLocalDate(TIMELINE_START).getTime();
  return Math.min(100, Math.max(0, (offset / total) * 100));
}

/** Parse YYYY-MM-DD as local calendar date (avoids UTC off-by-one). */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
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
