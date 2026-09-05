"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LESSONS } from "@/data/lessons";
import { layoutGraph } from "@/lib/graphLayout";
import { statusForScore } from "@/lib/knowledge";
import type { ConfidenceStatus, Progress } from "@/lib/types";

const STATUS_FILL: Record<ConfidenceStatus, string> = {
  strong: "#059669",
  developing: "#D97706",
  attention: "#E14B4B",
  unknown: "#E4E1D7",
};

const STATUS_STROKE: Record<ConfidenceStatus, string> = {
  strong: "#065F46",
  developing: "#B45309",
  attention: "#B23A3A",
  unknown: "#8A90A0",
};

function radiusForScore(score: number): number {
  return 10 + (score / 100) * 12;
}

function lessonIdFor(conceptId: string): string | null {
  const primary = LESSONS.find((l) => l.primaryConceptId === conceptId);
  if (primary) return primary.id;
  const any = LESSONS.find((l) => l.conceptsTaught.includes(conceptId));
  return any?.id ?? null;
}

export function KnowledgeGraph({ progress }: { progress: Progress }) {
  const layout = useMemo(() => layoutGraph(), []);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const hoverNode = hoverId ? layout.nodesById[hoverId] : null;
  const hoverConcept = hoverNode?.concept;
  const hoverScore = hoverConcept ? progress.knowledge[hoverConcept.id]?.score ?? 0 : 0;
  const hoverLessonId = hoverConcept ? lessonIdFor(hoverConcept.id) : null;

  return (
    <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-hero">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-black/5 px-6 py-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
            Knowledge map
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            The concepts we're teaching, and where you are
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <LegendDot color={STATUS_FILL.strong} label="Strong" />
          <LegendDot color={STATUS_FILL.developing} label="Developing" />
          <LegendDot color={STATUS_FILL.attention} label="Needs attention" />
          <LegendDot color={STATUS_FILL.unknown} label="Not started" />
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="block w-full"
          style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
        >
          {/* Edges first so nodes sit on top */}
          <g>
            {layout.edges.map((e) => {
              const dx = e.toX - e.fromX;
              const cx1 = e.fromX + dx * 0.5;
              const cx2 = e.toX - dx * 0.5;
              const highlight = hoverId === e.fromId || hoverId === e.toId;
              return (
                <path
                  key={`${e.fromId}->${e.toId}`}
                  d={`M ${e.fromX} ${e.fromY} C ${cx1} ${e.fromY} ${cx2} ${e.toY} ${e.toX} ${e.toY}`}
                  fill="none"
                  stroke={highlight ? "#3B5BFF" : "#0B0D1220"}
                  strokeWidth={highlight ? 2 : 1.25}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {layout.nodes.map((n) => {
              const score = progress.knowledge[n.concept.id]?.score ?? 0;
              const status = statusForScore(score);
              const r = radiusForScore(score);
              const active = hoverId === n.concept.id;
              const lessonId = lessonIdFor(n.concept.id);
              const content = (
                <g
                  onMouseEnter={() => setHoverId(n.concept.id)}
                  onMouseLeave={() => setHoverId(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={r + (active ? 3 : 0)}
                    fill={STATUS_FILL[status]}
                    stroke={STATUS_STROKE[status]}
                    strokeWidth={active ? 2 : 1}
                  />
                  <text
                    x={n.x}
                    y={n.y + r + 16}
                    textAnchor="middle"
                    className="fill-ink"
                    style={{ fontSize: 12, fontWeight: 500 }}
                  >
                    {n.concept.name}
                  </text>
                  <text
                    x={n.x}
                    y={n.y + r + 30}
                    textAnchor="middle"
                    className="fill-ink-muted"
                    style={{ fontSize: 10 }}
                  >
                    {n.concept.category}
                  </text>
                </g>
              );
              return lessonId ? (
                <Link key={n.concept.id} href={`/lessons/${lessonId}`}>
                  {content}
                </Link>
              ) : (
                <g key={n.concept.id}>{content}</g>
              );
            })}
          </g>
        </svg>

        {/* Hover panel — floats over the graph */}
        {hoverConcept && (
          <div className="pointer-events-none absolute left-4 bottom-4 max-w-md rounded-2xl border border-black/5 bg-white/95 p-4 shadow-card backdrop-blur">
            <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
              {hoverConcept.category}
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <div className="text-base font-semibold text-ink">
                {hoverConcept.name}
              </div>
              <div className="text-xs text-ink-muted">
                {hoverScore}% · {statusForScore(hoverScore)}
              </div>
            </div>
            <p className="mt-1 text-sm text-ink-muted">{hoverConcept.blurb}</p>
            {hoverLessonId && (
              <div className="mt-2 text-xs text-signal-accent">Click to open lesson</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-ink-muted">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </div>
  );
}
