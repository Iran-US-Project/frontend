export type CoverageArticle = {
  id: string;
  title: string;
  description: string;
  date: string;
  url: string;
  author: string;
  hasFullText: boolean;
};

export type CoverageColumn = {
  region: "western" | "mena" | "financial";
  regionLabel: string;
  outlet: string;
  outletId: "fox" | "bbc" | "aljazeera";
  accent: string;
  wash: string;
  articleCount: number;
  articles: CoverageArticle[];
};

export type EventCoveragePayload = {
  eventId: string;
  eventTitle: string;
  subEventTitle: string | null;
  articleCount: number;
  columns: CoverageColumn[];
};

export type ArticleBodyPayload = {
  id: string;
  title: string;
  url: string;
  author: string;
  date: string;
  body: string;
};

/** Parse YYYY-MM-DD as local calendar date (avoids UTC off-by-one). */
export function parseCoverageDate(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function formatCoverageDate(iso: string): string {
  const date = parseCoverageDate(iso);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
