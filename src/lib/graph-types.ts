/** Wire types for the GraphRAG instrument (aligned with backend seed + API). */

export type GraphNodeKind = "event" | "entity";

export type GraphEventType =
  | "military"
  | "diplomatic"
  | "economic"
  | "humanitarian";

export type GraphEntityType = "state" | "org" | "place";

export type GraphNodeType = GraphEventType | GraphEntityType;

export type GraphConfidence = "strong" | "contested" | "inferred";

export type GraphEvidence = {
  articleId: string;
  snippet: string;
  outlet?: string;
  date?: string;
};

export type GraphNode = {
  id: string;
  kind: GraphNodeKind;
  title: string;
  date?: string;
  step?: number;
  summary: string;
  nodeType?: GraphNodeType;
  articleIds: string[];
  position: { x: number; y: number };
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  relation: string;
  confidence: GraphConfidence;
  rationale: string;
  evidence: GraphEvidence[];
};

export type GraphTimelineStep = {
  step: number;
  nodeId: string;
  date: string;
  title: string;
};

export type GraphViewMode = "cumulative" | "focus";

export type GraphHopDepth = 1 | 2;

export type GraphConfidenceLevel = GraphConfidence;

export type GraphFilters = {
  confidence: GraphConfidence[];
  relations: string[];
  viewMode: GraphViewMode;
};

export type GraphSubgraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  from: number;
  to: number;
  depth?: number;
  filters?: GraphFilters;
};

export type GraphNarrative = {
  rangeStart: number;
  rangeEnd: number;
  filterHash: string;
  summary: string;
  analysis: string;
  generatedAt: string;
  cached: boolean;
};

export type GraphEvidenceDetail = {
  type: "node" | "edge";
  id: string;
  claim: string;
  relation?: string;
  confidence?: GraphConfidence;
  rationale?: string;
  evidence: GraphEvidence[];
  path?: string[];
};

export type GraphMetadata = {
  version: string;
  modelVersion: string;
  builtAt: string;
  nodeCount: number;
  edgeCount: number;
};

export type GraphTimelinePayload = {
  steps: GraphTimelineStep[];
  metadata: GraphMetadata;
};

export const ALL_GRAPH_CONFIDENCE: GraphConfidence[] = [
  "strong",
  "contested",
  "inferred",
];

export const DEFAULT_GRAPH_FILTERS: GraphFilters = {
  confidence: [...ALL_GRAPH_CONFIDENCE],
  relations: [],
  viewMode: "cumulative",
};

export function computeFilterHash(
  filters: GraphFilters,
  hopDepth: GraphHopDepth = 1,
): string {
  const payload = JSON.stringify({
    confidence: [...filters.confidence].sort(),
    relations: [...filters.relations].sort(),
    viewMode: filters.viewMode,
    hopDepth: filters.viewMode === "focus" ? hopDepth : null,
  });

  let hash = 0;
  for (let i = 0; i < payload.length; i += 1) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }

  return `f${Math.abs(hash).toString(36)}`;
}
