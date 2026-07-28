import type { GraphEdge, GraphNode } from "@/lib/graph-types";

const MAX_PATH_HOPS = 5;

function confidenceRank(confidence: string): number {
  if (confidence === "strong") return 0;
  if (confidence === "contested") return 1;
  return 2;
}

function pickBestEdge(edges: GraphEdge[]): GraphEdge | null {
  if (!edges.length) return null;
  return [...edges].sort(
    (a, b) => confidenceRank(a.confidence) - confidenceRank(b.confidence),
  )[0];
}

function nodeTitle(nodeById: Map<string, GraphNode>, id: string): string {
  return nodeById.get(id)?.title ?? id;
}

function eventEventEdges(
  nodes: GraphNode[],
  edges: GraphEdge[],
): GraphEdge[] {
  const eventIds = new Set(
    nodes.filter((node) => node.kind === "event").map((node) => node.id),
  );
  return edges.filter(
    (edge) => eventIds.has(edge.from) && eventIds.has(edge.to),
  );
}

function walkUpstream(
  startId: string,
  incoming: Map<string, GraphEdge[]>,
  nodeById: Map<string, GraphNode>,
): string[] {
  const titles: string[] = [];
  let current = startId;
  const visited = new Set<string>([startId]);

  for (let hop = 0; hop < MAX_PATH_HOPS; hop += 1) {
    const candidates = (incoming.get(current) ?? []).filter(
      (edge) => !visited.has(edge.from),
    );
    const edge = pickBestEdge(candidates);
    if (!edge) break;
    visited.add(edge.from);
    titles.unshift(nodeTitle(nodeById, edge.from));
    current = edge.from;
  }

  return titles;
}

function walkDownstream(
  startId: string,
  outgoing: Map<string, GraphEdge[]>,
  nodeById: Map<string, GraphNode>,
): string[] {
  const titles: string[] = [];
  let current = startId;
  const visited = new Set<string>([startId]);

  for (let hop = 0; hop < MAX_PATH_HOPS; hop += 1) {
    const candidates = (outgoing.get(current) ?? []).filter(
      (edge) => !visited.has(edge.to),
    );
    const edge = pickBestEdge(candidates);
    if (!edge) break;
    visited.add(edge.to);
    titles.push(nodeTitle(nodeById, edge.to));
    current = edge.to;
  }

  return titles;
}

function buildAdjacency(edges: GraphEdge[]) {
  const incoming = new Map<string, GraphEdge[]>();
  const outgoing = new Map<string, GraphEdge[]>();

  for (const edge of edges) {
    if (!incoming.has(edge.to)) incoming.set(edge.to, []);
    if (!outgoing.has(edge.from)) outgoing.set(edge.from, []);
    incoming.get(edge.to)!.push(edge);
    outgoing.get(edge.from)!.push(edge);
  }

  return { incoming, outgoing };
}

/**
 * Build a breadcrumb path through the visible subgraph for a selected node or edge.
 */
export function buildGraphPath(
  nodes: GraphNode[],
  edges: GraphEdge[],
  selection: { type: "node" | "edge"; id: string },
): string[] {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const causal = eventEventEdges(nodes, edges);
  const { incoming, outgoing } = buildAdjacency(causal);

  if (selection.type === "node") {
    const node = nodeById.get(selection.id);
    if (!node) return [];

    if (node.kind === "entity") {
      const parentEdge = edges.find(
        (edge) => edge.from === node.id || edge.to === node.id,
      );
      if (!parentEdge) return [node.title];

      const eventId =
        nodeById.get(parentEdge.from)?.kind === "event"
          ? parentEdge.from
          : parentEdge.to;
      const eventTitle = nodeTitle(nodeById, eventId);
      return [eventTitle, node.title];
    }

    const upstream = walkUpstream(node.id, incoming, nodeById);
    const downstream = walkDownstream(node.id, outgoing, nodeById);
    const center = node.title;

    const merged = [...upstream];
    if (merged[merged.length - 1] !== center) merged.push(center);
    for (const title of downstream) {
      if (merged[merged.length - 1] !== title) merged.push(title);
    }
    return merged;
  }

  const edge = edges.find((item) => item.id === selection.id);
  if (!edge) return [];

  const fromTitle = nodeTitle(nodeById, edge.from);
  const toTitle = nodeTitle(nodeById, edge.to);
  const fromIsEvent = nodeById.get(edge.from)?.kind === "event";
  const toIsEvent = nodeById.get(edge.to)?.kind === "event";

  if (!fromIsEvent || !toIsEvent) {
    return [`${fromTitle} → ${edge.relation} → ${toTitle}`];
  }

  const upstream = walkUpstream(edge.from, incoming, nodeById);
  const downstream = walkDownstream(edge.to, outgoing, nodeById);
  const bridge = `${fromTitle} → ${edge.relation} → ${toTitle}`;

  const path = [...upstream];
  if (path[path.length - 1] !== bridge) path.push(bridge);
  for (const title of downstream) {
    if (path[path.length - 1] !== title) path.push(title);
  }
  return path;
}
