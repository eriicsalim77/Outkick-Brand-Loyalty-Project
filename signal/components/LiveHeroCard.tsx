import Link from "next/link";
import { CONCEPTS_BY_ID } from "@/data/concepts";
import { formatDate } from "@/lib/format";
import { PriorityBadge } from "./PriorityBadge";
import type { EnhancedTrendingItem, Role } from "@/lib/types";

// Hero card for a live trending item — same visual weight as the curated
// SignalCard's `hero` variant, but tailored to what a live item has
// (personal reason, momentum, primary source publisher, learning card CTA).
export function LiveHeroCard({
  item,
  role,
}: {
  item: EnhancedTrendingItem;
  role: Role;
}) {
  const rel = item.personal[role];
  return (
    <Link
      href={`/live/${encodeURIComponent(item.id)}`}
      className="hero-grid group block rounded-2xl border border-signal-p1/30 bg-white p-8 shadow-hero transition hover:border-signal-p1"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PriorityBadge priority={rel.priority} />
          <span className="text-xs text-ink-muted">
            Live · {item.publisher} · {formatDate(item.publishedAt)}
          </span>
        </div>
        <div className="text-xs text-ink-muted">Momentum {item.momentum}</div>
      </div>

      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        {item.title}
      </h3>
      <p className="mt-2 text-base text-ink-muted">{item.snippet}</p>

      <div className="mt-5 rounded-xl bg-paper-soft p-4">
        <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
          Why this matters to you
        </div>
        <p className="mt-1 text-base text-ink">{rel.reason}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
        <div className="flex flex-wrap items-center gap-2">
          {item.technologies.slice(0, 4).map((t) => (
            <span key={t} className="rounded-full bg-paper-soft px-2 py-0.5 text-ink">
              {CONCEPTS_BY_ID[t]?.name ?? t}
            </span>
          ))}
        </div>
        <div className="font-medium text-ink group-hover:underline">
          Open learning card →
        </div>
      </div>
    </Link>
  );
}
