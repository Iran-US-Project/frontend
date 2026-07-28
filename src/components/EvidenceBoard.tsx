"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { EVENT_NODE_HEIGHT, EVENT_NODE_WIDTH, withLaidOutPositions } from "@/lib/graph-layout";
import type { GraphConfidence, GraphEdge, GraphNode } from "@/lib/graph-types";

export type GraphFlowNodeData = {
  label: string;
  subtitle?: string;
  kind: "event" | "entity";
  nodeType?: string;
  selected?: boolean;
  dimmed?: boolean;
};

type EvidenceBoardProps = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  loading?: boolean;
  analyzing?: boolean;
  error?: string | null;
  emptyMessage?: string | null;
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  onSelectEdge?: (edgeId: string | null) => void;
};

function formatDate(date?: string): string {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function confidenceStroke(confidence: GraphConfidence): string {
  if (confidence === "strong") return "var(--mena)";
  if (confidence === "contested") return "var(--west)";
  return "var(--muted)";
}

function confidenceDash(confidence: GraphConfidence): string | undefined {
  if (confidence === "contested") return "6 4";
  if (confidence === "inferred") return "3 4";
  return undefined;
}

const HANDLE_CLASS =
  "!h-2 !w-2 !border-transparent !bg-transparent !opacity-0";
const ENTITY_HANDLE_CLASS =
  "!h-1.5 !w-1.5 !border-transparent !bg-transparent !opacity-0";

function eventAccent(nodeType?: string): string {
  switch (nodeType) {
    case "military":
      return "var(--mena)";
    case "diplomatic":
      return "var(--west)";
    case "economic":
      return "var(--finance)";
    case "humanitarian":
      return "var(--accent-soft)";
    default:
      return "var(--border)";
  }
}

const EventNodeCard = memo(function EventNodeCard({
  data,
  selected,
}: NodeProps<Node<GraphFlowNodeData>>) {
  const selectedState = selected || data.selected;
  const label = [
    "Event",
    data.nodeType,
    data.label,
    data.subtitle,
    selectedState ? "selected" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      role="button"
      aria-label={label}
      aria-pressed={selectedState}
      tabIndex={0}
      className={`group relative w-[200px] border bg-paper transition-[opacity,box-shadow,border-color] ${
        selectedState
          ? "border-accent shadow-[0_12px_28px_-14px_rgba(143,29,44,0.55)] ring-2 ring-accent/20"
          : "border-border/90 shadow-[0_8px_20px_-16px_rgba(18,21,26,0.4)] hover:border-foreground/25"
      } ${data.dimmed ? "opacity-35" : "opacity-100"}`}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: eventAccent(data.nodeType) }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="out-top"
        className={`!-top-[5px] !left-[62%] ${HANDLE_CLASS}`}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="in-top"
        className={`!-top-[5px] ${HANDLE_CLASS}`}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="in-left"
        className={`!-left-[5px] ${HANDLE_CLASS}`}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="out-left"
        className={`!-left-[5px] !top-[62%] ${HANDLE_CLASS}`}
      />
      <div className="px-3.5 py-3 pl-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
          {data.nodeType || "event"}
          {data.subtitle ? (
            <span className="text-muted/70"> · {data.subtitle}</span>
          ) : null}
        </p>
        <p className="mt-1.5 line-clamp-3 font-display text-[13px] leading-[1.35] text-foreground">
          {data.label}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="out-bottom"
        className={`!-bottom-[5px] ${HANDLE_CLASS}`}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="in-bottom"
        className={`!-bottom-[5px] !left-[62%] ${HANDLE_CLASS}`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out-right"
        className={`!-right-[5px] ${HANDLE_CLASS}`}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="in-right"
        className={`!-right-[5px] !top-[62%] ${HANDLE_CLASS}`}
      />
    </div>
  );
});

const EntityNodeCard = memo(function EntityNodeCard({
  data,
  selected,
}: NodeProps<Node<GraphFlowNodeData>>) {
  const selectedState = selected || data.selected;
  const label = [
    "Entity",
    data.nodeType,
    data.label,
    selectedState ? "selected" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      role="button"
      aria-label={label}
      aria-pressed={selectedState}
      tabIndex={0}
      title={data.label}
      className={`max-w-[148px] rounded-full border bg-paper px-3 py-1.5 transition-[opacity,box-shadow,border-color] ${
        selectedState
          ? "border-west shadow-[0_8px_18px_-12px_rgba(26,58,82,0.5)] ring-2 ring-west/20"
          : "border-border/90 hover:border-west/40"
      } ${data.dimmed ? "opacity-35" : "opacity-100"}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="in-top"
        className={`!-top-[4px] ${ENTITY_HANDLE_CLASS}`}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="out-top"
        className={`!-top-[4px] !left-[60%] ${ENTITY_HANDLE_CLASS}`}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="in-right"
        className={`!-right-[4px] ${ENTITY_HANDLE_CLASS}`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out-right"
        className={`!-right-[4px] !top-[60%] ${ENTITY_HANDLE_CLASS}`}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="in-bottom"
        className={`!-bottom-[4px] ${ENTITY_HANDLE_CLASS}`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="out-bottom"
        className={`!-bottom-[4px] !left-[60%] ${ENTITY_HANDLE_CLASS}`}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="in-left"
        className={`!-left-[4px] ${ENTITY_HANDLE_CLASS}`}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="out-left"
        className={`!-left-[4px] !top-[60%] ${ENTITY_HANDLE_CLASS}`}
      />
      <p className="line-clamp-2 text-center font-mono text-[10px] uppercase leading-tight tracking-[0.08em] text-foreground">
        {data.label}
      </p>
    </div>
  );
});

const nodeTypes = {
  event: EventNodeCard,
  entity: EntityNodeCard,
};

function CausalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.28,
  });

  const confidence = (data?.confidence as GraphConfidence) || "inferred";
  const relation = (data?.relation as string) || "";
  const showLabel = Boolean(selected || data?.hovered);
  const dimmed = Boolean(data?.dimmed);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: confidenceStroke(confidence),
          strokeWidth: selected || data?.hovered ? 2.4 : 1.45,
          strokeDasharray: confidenceDash(confidence),
          opacity: dimmed ? 0.18 : selected || data?.hovered ? 1 : 0.78,
        }}
      />
      {showLabel && relation && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute z-10 rounded border border-border bg-paper px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-mena shadow-sm"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {relation}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const edgeTypes = {
  causal: CausalEdge,
};

function connectedIds(
  nodeId: string | null | undefined,
  edges: GraphEdge[],
): Set<string> | null {
  if (!nodeId) return null;
  const ids = new Set<string>([nodeId]);
  for (const edge of edges) {
    if (edge.from === nodeId || edge.to === nodeId) {
      ids.add(edge.from);
      ids.add(edge.to);
    }
  }
  return ids;
}

function toFlowNodes(
  nodes: GraphNode[],
  selectedNodeId?: string | null,
  focusIds?: Set<string> | null,
): Node<GraphFlowNodeData>[] {
  return nodes.map((node) => {
    const isSelected = node.id === selectedNodeId;
    return {
      id: node.id,
      type: node.kind,
      position: {
        x: node.position?.x ?? 0,
        y: node.position?.y ?? 0,
      },
      zIndex: isSelected ? 20 : node.kind === "event" ? 5 : 4,
      data: {
        label: node.title,
        subtitle: node.kind === "event" ? formatDate(node.date) : node.nodeType,
        kind: node.kind,
        nodeType: node.nodeType,
        selected: isSelected,
        dimmed: Boolean(focusIds && !focusIds.has(node.id)),
      },
      draggable: false,
      selectable: true,
    };
  });
}

function nodeCenter(node: GraphNode): { x: number; y: number } {
  const isEvent = node.kind === "event";
  return {
    x: (node.position?.x ?? 0) + (isEvent ? EVENT_NODE_WIDTH / 2 : 70),
    y: (node.position?.y ?? 0) + (isEvent ? EVENT_NODE_HEIGHT / 2 : 18),
  };
}

function sideHandle(
  from: GraphNode,
  to: GraphNode,
): { sourceHandle?: string; targetHandle?: string } {
  const a = nodeCenter(from);
  const b = nodeCenter(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (Math.abs(dx) >= Math.abs(dy) * 0.85) {
    return dx >= 0
      ? { sourceHandle: "out-right", targetHandle: "in-left" }
      : { sourceHandle: "out-left", targetHandle: "in-right" };
  }

  return dy >= 0
    ? { sourceHandle: "out-bottom", targetHandle: "in-top" }
    : { sourceHandle: "out-top", targetHandle: "in-bottom" };
}

function toFlowEdges(
  edges: GraphEdge[],
  nodesById: Map<string, GraphNode>,
  selectedEdgeId?: string | null,
  hoveredEdgeId?: string | null,
  selectedNodeId?: string | null,
  focusIds?: Set<string> | null,
): Edge[] {
  return edges.map((edge) => {
    const from = nodesById.get(edge.from);
    const to = nodesById.get(edge.to);
    const handles =
      from && to ? sideHandle(from, to) : ({} as ReturnType<typeof sideHandle>);
    const touchesSelection =
      edge.id === selectedEdgeId ||
      edge.from === selectedNodeId ||
      edge.to === selectedNodeId;
    const dimmed = Boolean(
      focusIds && !(focusIds.has(edge.from) && focusIds.has(edge.to)),
    );

    return {
      id: edge.id,
      source: edge.from,
      target: edge.to,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      type: "causal",
      selected: edge.id === selectedEdgeId,
      zIndex: touchesSelection || edge.id === hoveredEdgeId ? 8 : 1,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: confidenceStroke(edge.confidence),
      },
      data: {
        relation: edge.relation,
        confidence: edge.confidence,
        hovered: edge.id === hoveredEdgeId,
        dimmed,
      },
    };
  });
}

export function EvidenceBoard(props: EvidenceBoardProps) {
  return (
    <ReactFlowProvider>
      <EvidenceBoardCanvas {...props} />
    </ReactFlowProvider>
  );
}

function EvidenceBoardCanvas({
  nodes,
  edges,
  loading = false,
  analyzing = false,
  error = null,
  emptyMessage = null,
  selectedNodeId = null,
  selectedEdgeId = null,
  onSelectNode,
  onSelectEdge,
}: EvidenceBoardProps) {
  const { fitView } = useReactFlow();
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const laidOutNodes = useMemo(
    () => withLaidOutPositions(nodes, edges),
    [nodes, edges],
  );

  const nodesById = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const node of laidOutNodes) map.set(node.id, node);
    return map;
  }, [laidOutNodes]);

  const focusIds = useMemo(
    () => connectedIds(selectedNodeId, edges),
    [edges, selectedNodeId],
  );

  const flowNodes = useMemo(
    () => toFlowNodes(laidOutNodes, selectedNodeId, focusIds),
    [focusIds, laidOutNodes, selectedNodeId],
  );
  const flowEdges = useMemo(
    () =>
      toFlowEdges(
        edges,
        nodesById,
        selectedEdgeId,
        hoveredEdgeId,
        selectedNodeId,
        focusIds,
      ),
    [
      edges,
      focusIds,
      hoveredEdgeId,
      nodesById,
      selectedEdgeId,
      selectedNodeId,
    ],
  );

  useEffect(() => {
    if (!laidOutNodes.length || loading) return;

    const timer = window.setTimeout(() => {
      // Show enough of the organic mesh that hubs/spokes are visible at once.
      fitView({
        padding: 0.16,
        minZoom: 0.62,
        maxZoom: 0.9,
        duration: 280,
      });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [fitView, laidOutNodes, loading]);

  const statusLabel = loading
    ? "Loading graph…"
    : analyzing
      ? "Analyzing range…"
      : error
        ? "Error"
        : nodes.length
          ? `Loaded · ${nodes.length} nodes · ${edges.length} edges`
          : "Empty";

  const resolvedEmptyMessage =
    emptyMessage ||
    "No nodes in this range. Try expanding the timeline selection.";

  return (
    <section className="relative min-h-[480px] border border-border bg-[linear-gradient(180deg,rgba(244,245,247,0.96)_0%,rgba(228,231,236,0.9)_100%)] lg:min-h-[620px]">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-border bg-paper/95 px-5 py-3 backdrop-blur-[2px]">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          Evidence board
        </p>
        <p
          className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
            error ? "text-accent" : "text-mena"
          }`}
        >
          {statusLabel}
        </p>
      </div>

      <div className="absolute inset-0 top-[45px]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              Loading subgraph…
            </p>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center px-6">
            <p className="text-center text-sm text-muted">{error}</p>
          </div>
        ) : !nodes.length ? (
          <div className="flex h-full items-center justify-center px-6">
            <p className="text-center text-sm text-muted">
              {resolvedEmptyMessage}
            </p>
          </div>
        ) : (
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView={false}
            minZoom={0.35}
            maxZoom={1.75}
            defaultViewport={{ x: 40, y: 20, zoom: 0.9 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              type: "causal",
            }}
            onNodeClick={(_, node) => onSelectNode?.(node.id)}
            onEdgeClick={(_, edge) => onSelectEdge?.(edge.id)}
            onEdgeMouseEnter={(_, edge) => setHoveredEdgeId(edge.id)}
            onEdgeMouseLeave={() => setHoveredEdgeId(null)}
            onPaneClick={() => {
              onSelectNode?.(null);
              onSelectEdge?.(null);
            }}
          >
            <Background gap={24} size={1} color="rgba(200,204,212,0.7)" />
            <Controls
              showInteractive={false}
              className="!border-border !bg-paper/95 !shadow-none"
            />
          </ReactFlow>
        )}
      </div>
    </section>
  );
}
