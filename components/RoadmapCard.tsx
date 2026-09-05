import Link from "next/link";
import { CONCEPTS_BY_ID } from "@/data/concepts";
import type { Progress, RoadmapItem } from "@/lib/types";
import { statusForScore } from "@/lib/knowledge";

export function RoadmapCard({
  items,
  progress,
}: {
  items: RoadmapItem[];
  progress: Progress;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-hero">
        <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
          Your roadmap
        </div>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">
          You're up to date on what we're tracking.
        </h3>
        <p className="mt-2 text-ink-muted">
          As new signals come in and you flag more concepts to learn, we'll queue
          fresh next steps here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-hero">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
            Your roadmap
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">
            Next {items.length} concept{items.length === 1 ? "" : "s"} to learn
          </h3>
        </div>
        <Link
          href="/knowledge"
          className="text-sm text-ink-muted hover:text-ink"
        >
          See the full map →
        </Link>
      </div>

      <ol className="mt-6 space-y-3">
        {items.map((r, i) => {
          const concept = CONCEPTS_BY_ID[r.conceptId];
          const k = progress.knowledge[r.conceptId];
          const status = statusForScore(k?.score ?? 0);
          return (
            <li
              key={r.conceptId}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-black/5 bg-paper-soft p-4"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">
                {i + 1}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <div className="font-semibold text-ink">
                    {concept?.name ?? r.conceptId}
                  </div>
                  <div className="text-[11px] uppercase tracking-widest text-ink-muted">
                    {status}
                  </div>
                </div>
                <div className="mt-0.5 text-sm text-ink-muted">{r.reason}</div>
              </div>
              {r.lessonId ? (
                <Link
                  href={`/lessons/${r.lessonId}`}
                  className="whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-ink-soft"
                >
                  Start lesson
                </Link>
              ) : (
                <span className="whitespace-nowrap text-xs text-ink-muted">
                  No lesson yet
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
