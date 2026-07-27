/** Types aligned with ai-service `app/models/schemas.py` (snake_case on wire). */

export type SourceFramingAnalysis = {
  source_name: string;
  headline_tone: string;
  primary_frame: string;
  loaded_words: string[];
  key_facts_emphasized: string[];
  omitted_context: string[];
};

export type AspectStance = {
  aspect_name: string;
  source_name?: string;
  stance: string;
  reasoning: string;
};

export type MediaDiscrepancyMatrix = {
  event_title: string;
  date_range: string;
  sources_analyzed: SourceFramingAnalysis[];
  aspect_stances: AspectStance[];
  narrative_synthesis: string;
  development_summary?: string;
  key_takeaways?: string[];
  key_discrepancies?: string[];
};

export type NarrativeDifference = {
  outlet: string;
  tone: string;
  frame: string;
  loadedWords: string[];
  omittedContext: string[];
};

export type AspectStanceRow = {
  aspect: string;
  stances: Record<string, string>;
};

/** UI-facing comparison report (camelCase). */
export type ComparisonReportData = {
  developmentSummary: string;
  discrepancies: string[];
  keyPoints: string[];
  narrativeDifferences: NarrativeDifference[];
  aspectStances?: AspectStanceRow[];
};

export type AnalysisStatus = "idle" | "running" | "complete" | "error";

export type AnalysisPayload = {
  cached: boolean;
  generatedAt: string;
  articleCount: number;
  result: MediaDiscrepancyMatrix;
};

export type OutletFraming = NarrativeDifference;

export const REPORT_OUTLET_COLUMNS = [
  "Fox News",
  "BBC",
  "Al Jazeera",
] as const;

const OUTLET_ID_BY_LABEL: Record<string, "fox" | "bbc" | "aljazeera"> = {
  fox: "fox",
  "fox news": "fox",
  bbc: "bbc",
  "al jazeera": "aljazeera",
  aljazeera: "aljazeera",
};

function normalizeOutletLabel(name: string): string {
  const key = name.trim().toLowerCase();
  if (key.includes("fox")) return "Fox News";
  if (key.includes("bbc")) return "BBC";
  if (key.includes("jazeera")) return "Al Jazeera";
  return name.trim();
}

function outletIdFromLabel(name: string): "fox" | "bbc" | "aljazeera" | null {
  const key = name.trim().toLowerCase();
  if (OUTLET_ID_BY_LABEL[key]) return OUTLET_ID_BY_LABEL[key];
  if (key.includes("fox")) return "fox";
  if (key.includes("bbc")) return "bbc";
  if (key.includes("jazeera")) return "aljazeera";
  return null;
}

function stanceForOutlet(
  stances: Record<string, string>,
  outletLabel: string,
): string {
  const direct = stances[outletLabel];
  if (direct) return direct;

  const normalized = normalizeOutletLabel(outletLabel);
  if (stances[normalized]) return stances[normalized];

  for (const [key, value] of Object.entries(stances)) {
    if (normalizeOutletLabel(key) === normalized) return value;
  }

  return "—";
}

/** Per-outlet framing keyed by matrix column outlet id. */
export function mapMatrixToOutletFraming(
  matrix: MediaDiscrepancyMatrix,
): Partial<Record<"fox" | "bbc" | "aljazeera", OutletFraming>> {
  const framing: Partial<Record<"fox" | "bbc" | "aljazeera", OutletFraming>> =
    {};

  for (const source of matrix.sources_analyzed) {
    const outletId = outletIdFromLabel(source.source_name);
    if (!outletId) continue;

    framing[outletId] = {
      outlet: normalizeOutletLabel(source.source_name),
      tone: source.headline_tone,
      frame: source.primary_frame,
      loadedWords: source.loaded_words,
      omittedContext: source.omitted_context,
    };
  }

  return framing;
}

/** Map ai-service matrix JSON to frontend report shape. */
export function mapMatrixToReport(
  matrix: MediaDiscrepancyMatrix,
): ComparisonReportData {
  const discrepancies =
    matrix.key_discrepancies?.filter(Boolean) ?? [];

  const fallbackDiscrepancies = matrix.aspect_stances
    .filter((row) => row.stance.toLowerCase() !== "neutral")
    .map((row) => `${row.aspect_name}: ${row.stance} — ${row.reasoning}`);

  const keyPoints =
    matrix.key_takeaways?.filter(Boolean) ??
    matrix.sources_analyzed.flatMap((source) => source.key_facts_emphasized);

  const aspectMap = new Map<string, Record<string, string>>();
  for (const row of matrix.aspect_stances) {
    const existing = aspectMap.get(row.aspect_name) ?? {};
    const outletKey = row.source_name
      ? normalizeOutletLabel(row.source_name)
      : "Summary";
    existing[outletKey] = row.stance;
    aspectMap.set(row.aspect_name, existing);
  }

  const aspectStances: AspectStanceRow[] = Array.from(
    aspectMap.entries(),
  ).map(([aspect, stances]) => ({ aspect, stances }));

  return {
    developmentSummary:
      matrix.development_summary?.trim() || matrix.narrative_synthesis,
    discrepancies:
      discrepancies.length > 0 ? discrepancies : fallbackDiscrepancies,
    keyPoints,
    narrativeDifferences: matrix.sources_analyzed.map((source) => ({
      outlet: normalizeOutletLabel(source.source_name),
      tone: source.headline_tone,
      frame: source.primary_frame,
      loadedWords: source.loaded_words ?? [],
      omittedContext: source.omitted_context ?? [],
    })),
    aspectStances: aspectStances.length > 0 ? aspectStances : undefined,
  };
}

export { stanceForOutlet };
