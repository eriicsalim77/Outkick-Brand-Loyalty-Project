// Simple layered DAG layout for the knowledge map.
// - Layer = 0 for concepts with no prereqs, else 1 + max(prereq layer).
// - Within a layer, order by average of source layer positions (dot-heuristic
//   for crossing reduction). Good enough for ~20-node graphs.

import { CONCEPTS, CONCEPTS_BY_ID } from "@/data/concepts";
import type { Concept } from "./types";

export interface LaidOutNode {
  concept: Concept;
  layer: number;
  index: number; // position within layer
  x: number;
  y: number;
}

export interface LaidOutEdge {
  fromId: string;
  toId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface Layout {
  nodes: LaidOutNode[];
  nodesById: Record<string, LaidOutNode>;
  edges: LaidOutEdge[];
  width: number;
  height: number;
}

function computeLayers(concepts: Concept[]): Record<string, number> {
  const layer: Record<string, number> = {};
  const remaining = new Set(concepts.map((c) => c.id));

  // Iteratively assign layers.
  let guard = 0;
  while (remaining.size > 0 && guard < 100) {
    guard++;
    for (const id of Array.from(remaining)) {
      const c = CONCEPTS_BY_ID[id];
      const prereqs = c.prerequisites ?? [];
      const missing = prereqs.filter((p) => !(p in layer));
      if (missing.length === 0) {
        const l = prereqs.length
          ? 1 + Math.max(...prereqs.map((p) => layer[p]))
          : 0;
        layer[id] = l;
        remaining.delete(id);
      }
    }
  }
  // Any leftovers (cycles or missing refs) go to a safe layer.
  for (const id of remaining) layer[id] = 0;
  return layer;
}

export function layoutGraph(opts?: { width?: number; height?: number }): Layout {
  const width = opts?.width ?? 1200;
  const height = opts?.height ?? 720;
  const marginX = 90;
  const marginY = 60;

  const layers = computeLayers(CONCEPTS);
  const maxLayer = Math.max(...Object.values(layers));

  // Group concepts by layer.
  const byLayer: Record<number, string[]> = {};
  for (const id of Object.keys(layers)) {
    (byLayer[layers[id]] ??= []).push(id);
  }

  // First pass — arbitrary order gives us initial y positions.
  const yByLayer: Record<number, number[]> = {};
  for (const l of Object.keys(byLayer)) {
    const ids = byLayer[+l];
    yByLayer[+l] = ids.map((_, i) =>
      ids.length === 1
        ? height / 2
        : marginY + ((height - 2 * marginY) * i) / (ids.length - 1),
    );
  }

  // Second pass — reorder each non-first layer by mean(prereq y) to cut crossings.
  const positions: Record<string, { x: number; y: number; layer: number; index: number }> = {};
  const xStep = maxLayer === 0 ? 0 : (width - 2 * marginX) / maxLayer;

  for (let l = 0; l <= maxLayer; l++) {
    const ids = byLayer[l] ?? [];
    let ordered = ids;
    if (l > 0) {
      const scored = ids.map((id) => {
        const prereqs = CONCEPTS_BY_ID[id].prerequisites ?? [];
        const ys = prereqs
          .map((p) => positions[p]?.y)
          .filter((y): y is number => typeof y === "number");
        const avg = ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : height / 2;
        return { id, avg };
      });
      scored.sort((a, b) => a.avg - b.avg);
      ordered = scored.map((s) => s.id);
    }
    ordered.forEach((id, i) => {
      const x = marginX + l * xStep;
      const y =
        ordered.length === 1
          ? height / 2
          : marginY + ((height - 2 * marginY) * i) / (ordered.length - 1);
      positions[id] = { x, y, layer: l, index: i };
    });
  }

  const nodes: LaidOutNode[] = CONCEPTS.map((c) => {
    const pos = positions[c.id];
    return { concept: c, layer: pos.layer, index: pos.index, x: pos.x, y: pos.y };
  });

  const nodesById: Record<string, LaidOutNode> = Object.fromEntries(
    nodes.map((n) => [n.concept.id, n]),
  );

  const edges: LaidOutEdge[] = [];
  for (const c of CONCEPTS) {
    for (const p of c.prerequisites ?? []) {
      const src = nodesById[p];
      const dst = nodesById[c.id];
      if (src && dst) {
        edges.push({
          fromId: p,
          toId: c.id,
          fromX: src.x,
          fromY: src.y,
          toX: dst.x,
          toY: dst.y,
        });
      }
    }
  }

  return { nodes, nodesById, edges, width, height };
}
