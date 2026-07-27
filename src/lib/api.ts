import type { TimelinePayload } from "@/lib/timeline-events";
import type {
  ArticleBodyPayload,
  EventCoveragePayload,
} from "@/lib/event-coverage-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function fetchHealth() {
  const response = await fetch(`${API_URL}/health`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Backend health check failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchTimeline(): Promise<TimelinePayload> {
  const response = await fetch(`${API_URL}/api/timeline`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Timeline fetch failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchEventCoverage(
  eventId: string,
  options?: { subEventTitle?: string },
): Promise<EventCoveragePayload> {
  const params = new URLSearchParams();
  if (options?.subEventTitle) {
    params.set("subEvent", options.subEventTitle);
  }
  const query = params.toString();
  const response = await fetch(
    `${API_URL}/api/events/${encodeURIComponent(eventId)}/coverage${
      query ? `?${query}` : ""
    }`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail =
      body && typeof body.message === "string" ? body.message : null;
    throw new Error(
      detail || `Event coverage fetch failed: ${response.status}`,
    );
  }
  return response.json();
}

export async function fetchArticleBody(
  articleId: string,
): Promise<ArticleBodyPayload> {
  const response = await fetch(
    `${API_URL}/api/articles/${encodeURIComponent(articleId)}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail =
      body && typeof body.message === "string" ? body.message : null;
    throw new Error(detail || `Article fetch failed: ${response.status}`);
  }
  return response.json();
}
