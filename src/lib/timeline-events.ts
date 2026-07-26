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
    subEvents: [
      {
        id: "rising-lion-opens",
        title: "Operation Rising Lion opens — strikes on military and nuclear sites",
        date: "2025-06-13",
      },
      {
        id: "irgc-chief-killed",
        title: "IRGC chief of staff Mohammad Bagheri killed",
        date: "2025-06-13",
      },
      {
        id: "salami-killed",
        title: "IRGC commander-in-chief Hossein Salami killed",
        date: "2025-06-13",
      },
      {
        id: "natanz-struck",
        title: "Natanz uranium enrichment facility struck",
        date: "2025-06-13",
      },
      {
        id: "gcc-refineries",
        title: "GCC refineries and energy infrastructure hit",
        date: "2025-06-14",
      },
      {
        id: "true-promise-iii",
        title: "Iran launches Operation True Promise III retaliation",
        date: "2025-06-15",
      },
      {
        id: "midnight-hammer",
        title: "US joins with Operation Midnight Hammer on nuclear sites",
        date: "2025-06-22",
      },
      {
        id: "ceasefire-window",
        title: "Twelve-day window closes; fragile pause in direct strikes",
        date: "2025-06-24",
      },
    ],
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
    subEvents: [
      {
        id: "hormuz-closure-claim",
        title: "Iran asserts control over Strait of Hormuz transit",
        date: "2026-02-28",
      },
      {
        id: "tanker-rerouting",
        title: "Major shippers reroute; insurance premiums spike",
        date: "2026-03-01",
      },
      {
        id: "oil-volatility",
        title: "Brent crude jumps on supply-disruption fears",
        date: "2026-03-02",
      },
      {
        id: "us-naval-response",
        title: "US Fifth Fleet posture shifts; escort talk intensifies",
        date: "2026-03-04",
      },
    ],
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
    subEvents: [
      {
        id: "khamenei-death",
        title: "Ayatollah Khamenei dies; state media confirms",
        date: "2026-03-01",
      },
      {
        id: "mourning-period",
        title: "Six-day national mourning declared in Iran",
        date: "2026-03-01",
      },
      {
        id: "succession-speculation",
        title: "Assembly of Experts succession debate dominates coverage",
        date: "2026-03-03",
      },
      {
        id: "burial-ceremonies",
        title: "Burial ceremonies draw rival domestic and foreign frames",
        date: "2026-03-07",
      },
    ],
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
    subEvents: [
      {
        id: "may-volume-peak",
        title: "Corpus article volume hits single-month peak",
        date: "2026-05-15",
      },
      {
        id: "ceasefire-rumor-cycle",
        title: "Ceasefire rumor cycle drives wire-service churn",
        date: "2026-05-08",
      },
      {
        id: "hormuz-red-lines",
        title: "Hormuz and nuclear red-line framing converges in editorials",
        date: "2026-05-20",
      },
      {
        id: "regional-summit",
        title: "Regional summit statements parsed for de-escalation signals",
        date: "2026-05-28",
      },
    ],
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
    subEvents: [
      {
        id: "aragchi-channel",
        title: "Araghchi–US back-channel reporting intensifies",
        date: "2026-06-03",
      },
      {
        id: "oman-talks",
        title: "Oman-mediated talks referenced in regional press",
        date: "2026-06-06",
      },
      {
        id: "prelude-vs-pause",
        title: "Outlets split: prelude to peace vs. tactical pause",
        date: "2026-06-09",
      },
      {
        id: "draft-terms-leak",
        title: "Leaked draft terms circulate; verification disputes follow",
        date: "2026-06-12",
      },
    ],
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
