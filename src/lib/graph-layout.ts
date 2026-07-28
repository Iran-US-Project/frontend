import type { GraphEdge, GraphNode } from "@/lib/graph-types";

/** Event card footprint used for spacing (matches EvidenceBoard CSS). */
export const EVENT_NODE_WIDTH = 200;
export const EVENT_NODE_HEIGHT = 92;

const ENTITY_HEIGHT = 36;
const ENTITY_MAX_WIDTH = 148;
const PAD = 56;

export type GraphPosition = { x: number; y: number };

type SimNode = {
  id: string;
  kind: "event" | "entity";
  w: number;
  h: number;
  /** Center coordinates while simulating. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Soft chronological target (events only). */
  targetX?: number;
};

function estimateEntityWidth(title: string): number {
  return Math.min(
    ENTITY_MAX_WIDTH,
    Math.max(72, Math.ceil(title.length * 6.2) + 28),
  );
}

function sortEvents(events: GraphNode[]): GraphNode[] {
  return [...events].sort((a, b) => {
    const stepDiff = (a.step ?? 0) - (b.step ?? 0);
    if (stepDiff !== 0) return stepDiff;
    const dateDiff = (a.date ?? "").localeCompare(b.date ?? "");
    if (dateDiff !== 0) return dateDiff;
    return a.title.localeCompare(b.title);
  });
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

function typeLane(nodeType?: string): number {
  switch (nodeType) {
    case "military":
      return -1.15;
    case "diplomatic":
      return 1.05;
    case "economic":
      return -0.15;
    case "humanitarian":
      return 0.55;
    case "state":
      return -0.7;
    case "place":
      return 0.85;
    case "org":
      return 0.2;
    default:
      return 0;
  }
}

function hashUnit(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((h >>> 0) % 1000) / 1000;
}

/**
 * Organic knowledge-graph shape:
 * loose left→right chronology for events, force clustering for hubs/spokes,
 * so the mesh fills 2D space instead of reading as a single chain.
 */
export function layoutGraphPositions(
  nodes: GraphNode[],
  edges: GraphEdge[],
): Map<string, GraphPosition> {
  const events = sortEvents(nodes.filter((n) => n.kind === "event"));
  const entities = nodes.filter((n) => n.kind === "entity");

  const degree = new Map<string, number>();
  const neighbors = new Map<string, string[]>();
  for (const edge of edges) {
    degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1);
    degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1);
    const a = neighbors.get(edge.from) ?? [];
    const b = neighbors.get(edge.to) ?? [];
    if (!a.includes(edge.to)) a.push(edge.to);
    if (!b.includes(edge.from)) b.push(edge.from);
    neighbors.set(edge.from, a);
    neighbors.set(edge.to, b);
  }

  const sim: SimNode[] = [];
  const simById = new Map<string, SimNode>();

  // Spread events across X by time, but seed large Y scatter so the path snakes.
  const eventSpanX = Math.max(520, events.length * 145);
  events.forEach((event, i) => {
    const t = events.length <= 1 ? 0.5 : i / (events.length - 1);
    const lane = typeLane(event.nodeType);
    const zig = (i % 2 === 0 ? -1 : 1) * (120 + (i % 3) * 28);
    const jitter = (hashUnit(event.id) - 0.5) * 70;
    const node: SimNode = {
      id: event.id,
      kind: "event",
      w: EVENT_NODE_WIDTH,
      h: EVENT_NODE_HEIGHT,
      x: PAD + 120 + t * eventSpanX,
      y: 280 + lane * 130 + zig + jitter,
      vx: 0,
      vy: 0,
      targetX: PAD + 120 + t * eventSpanX,
    };
    sim.push(node);
    simById.set(node.id, node);
  });

  // Entities start near the centroid of linked nodes — natural hubs.
  for (const entity of entities) {
    const linked = neighbors.get(entity.id) ?? [];
    const linkedCenters = linked
      .map((id) => simById.get(id))
      .filter((n): n is SimNode => Boolean(n));

    const w = estimateEntityWidth(entity.title);
    let x: number;
    let y: number;
    if (linkedCenters.length) {
      x = avg(linkedCenters.map((n) => n.x));
      y = avg(linkedCenters.map((n) => n.y));
      // Orbit outward so hubs sit beside clusters, not on top of events.
      const angle = hashUnit(entity.id) * Math.PI * 2;
      const radius = 90 + linkedCenters.length * 14;
      x += Math.cos(angle) * radius;
      y += Math.sin(angle) * radius * 0.85;
    } else {
      x = PAD + hashUnit(entity.id) * 400;
      y = PAD + 80 + hashUnit(entity.id + "y") * 200;
    }

    // Nudge by entity type lane for thematic clustering.
    y += typeLane(entity.nodeType) * 40;

    const node: SimNode = {
      id: entity.id,
      kind: "entity",
      w,
      h: ENTITY_HEIGHT,
      x,
      y,
      vx: 0,
      vy: 0,
    };
    sim.push(node);
    simById.set(node.id, node);
  }

  // High-degree nodes pull slightly toward the local cluster center (hub emphasis).
  for (const node of sim) {
    const deg = degree.get(node.id) ?? 0;
    if (deg < 3) continue;
    const nbrs = (neighbors.get(node.id) ?? [])
      .map((id) => simById.get(id))
      .filter((n): n is SimNode => Boolean(n));
    if (!nbrs.length) continue;
    node.x = node.x * 0.55 + avg(nbrs.map((n) => n.x)) * 0.45;
    node.y = node.y * 0.55 + avg(nbrs.map((n) => n.y)) * 0.45;
  }

  const ITERATIONS = 220;
  for (let iter = 0; iter < ITERATIONS; iter += 1) {
    const cooling = 1 - iter / ITERATIONS;
    const temp = 0.85 * cooling + 0.15;

    // Pairwise repulsion — fills the plane and prevents chaining collapse.
    for (let i = 0; i < sim.length; i += 1) {
      for (let j = i + 1; j < sim.length; j += 1) {
        const a = sim[i];
        const b = sim[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy) || 0.01;
        const minDist =
          Math.hypot((a.w + b.w) / 2, (a.h + b.h) / 2) * 0.9 + 36;
        const force = ((minDist * minDist) / (dist * dist)) * 22 * temp;
        dx = (dx / dist) * force;
        dy = (dy / dist) * force;
        a.vx -= dx;
        a.vy -= dy;
        b.vx += dx;
        b.vy += dy;
      }
    }

    // Edge attraction — builds hub-and-spoke clusters.
    for (const edge of edges) {
      const a = simById.get(edge.from);
      const b = simById.get(edge.to);
      if (!a || !b) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.01;

      const aEvent = a.kind === "event";
      const bEvent = b.kind === "event";
      // Event↔event links stay longer (sequential breathing room);
      // entity spokes pull tighter into hubs.
      const ideal =
        aEvent && bEvent ? 195 : aEvent || bEvent ? 125 : 110;

      const force = ((dist - ideal) / dist) * 0.085 * temp;
      const fx = dx * force;
      const fy = dy * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Soft chronological rail: events drift left→right by step, not a rigid spine.
    for (const node of sim) {
      if (node.targetX === undefined) continue;
      node.vx += (node.targetX - node.x) * 0.028 * temp;
    }

    // Mild vertical centering so the mesh doesn't fly off-canvas.
    const cy = avg(sim.map((n) => n.y));
    for (const node of sim) {
      node.vy += (cy - node.y) * 0.008 * temp;
    }

    // Integrate with damping.
    for (const node of sim) {
      node.vx *= 0.72;
      node.vy *= 0.72;
      const speed = Math.hypot(node.vx, node.vy);
      const maxStep = 18 * temp + 2;
      if (speed > maxStep) {
        node.vx = (node.vx / speed) * maxStep;
        node.vy = (node.vy / speed) * maxStep;
      }
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  // Final hard collision pass so cards stay readable.
  for (let pass = 0; pass < 40; pass += 1) {
    for (let i = 0; i < sim.length; i += 1) {
      for (let j = i + 1; j < sim.length; j += 1) {
        const a = sim[i];
        const b = sim[j];
        const gapX = (a.w + b.w) / 2 + 22;
        const gapY = (a.h + b.h) / 2 + 20;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const overlapX = gapX - Math.abs(dx);
        const overlapY = gapY - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;

        if (overlapX < overlapY) {
          const push = (overlapX / 2) * (dx < 0 ? -1 : 1);
          a.x -= push;
          b.x += push;
        } else {
          const push = (overlapY / 2) * (dy < 0 ? -1 : 1);
          a.y -= push;
          b.y += push;
        }
      }
    }
  }

  // One more chronological sort nudge: keep event order on X without flattening Y.
  const orderedEvents = events
    .map((e) => simById.get(e.id)!)
    .filter(Boolean);
  for (let i = 1; i < orderedEvents.length; i += 1) {
    const prev = orderedEvents[i - 1];
    const cur = orderedEvents[i];
    const minGap = 70;
    if (cur.x < prev.x + minGap) {
      cur.x = prev.x + minGap;
    }
  }

  // Convert centers → top-left; normalize into positive space.
  let minX = Infinity;
  let minY = Infinity;
  for (const node of sim) {
    const left = node.x - node.w / 2;
    const top = node.y - node.h / 2;
    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
  }

  const positions = new Map<string, GraphPosition>();
  for (const node of sim) {
    positions.set(node.id, {
      x: node.x - node.w / 2 + (PAD - minX),
      y: node.y - node.h / 2 + (PAD - minY),
    });
  }

  return positions;
}

/** Apply layout positions onto graph nodes (immutable). */
export function withLaidOutPositions(
  nodes: GraphNode[],
  edges: GraphEdge[],
): GraphNode[] {
  const layout = layoutGraphPositions(nodes, edges);
  return nodes.map((node) => {
    const position = layout.get(node.id);
    if (!position) return node;
    return { ...node, position };
  });
}
