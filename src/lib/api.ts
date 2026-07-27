import type { TimelinePayload } from "@/lib/timeline-events";
import type {
  ArticleBodyPayload,
  EventCoveragePayload,
} from "@/lib/event-coverage-types";
import type { AnalysisPayload } from "@/lib/analysis-types";

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

export type FetchEventAnalysisOptions = {
  subEventId: string;
  subEventTitle: string;
  force?: boolean;
  signal?: AbortSignal;
};

export async function fetchEventAnalysis(
  eventId: string,
  options: FetchEventAnalysisOptions,
): Promise<AnalysisPayload> {
  const params = new URLSearchParams();
  if (options.force) {
    params.set("force", "true");
  }
  const query = params.toString();

  let response: Response;
  try {
    response = await fetch(
      `${API_URL}/api/events/${encodeURIComponent(eventId)}/analyze${
        query ? `?${query}` : ""
      }`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subEventId: options.subEventId,
          subEventTitle: options.subEventTitle,
          force: options.force ?? false,
        }),
        signal: options.signal,
        cache: "no-store",
      },
    );
  } catch (err) {
    if (
      (err instanceof DOMException && err.name === "AbortError") ||
      (err instanceof Error && err.name === "AbortError")
    ) {
      throw err;
    }
    throw new Error(
      "Could not reach the backend. Confirm the API server is running.",
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail =
      body && typeof body.message === "string" ? body.message : null;

    if (response.status === 503) {
      throw new Error(
        detail ||
          "Analysis service is unavailable. Check that the AI service is running.",
      );
    }
    if (response.status >= 500) {
      throw new Error(
        detail || "Server error while running analysis. Please try again.",
      );
    }

    throw new Error(detail || `Event analysis failed: ${response.status}`);
  }

  return response.json();
}
