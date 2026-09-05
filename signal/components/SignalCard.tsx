import Link from "next/link";
import type { ComputedPriority, Signal } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";
import { formatDate } from "@/lib/format";

export function SignalCard({
  signal,
  computed,
  hero = false,
}: {
  signal: Signal;
  computed: ComputedPriority;
  hero?: boolean;
}) {
  return (
    <Link
      href={`/signals/${signal.id}`}
      className={
        "group block rounded-2xl border transition " +
        (hero
          ? "hero-grid border-signal-p1/30 bg-white p-8 shadow-hero hover:border-signal-p1"
          : "border-black/5 bg-white p-6 shadow-card hover:border-ink/20")
      }
    >
      <div className="flex items-center justify-between gap-4">
        <PriorityBadge priority={computed.priority} />
        <div className="text-xs text-ink-muted">
          {signal.minutesToRead} min · {signal.category}
        </div>
      </div>

      <h3
        className={
          "mt-4 font-semibold tracking-tight text-ink " +
          (hero ? "text-2xl" : "text-lg")
        }
      >
        {signal.title}
      </h3>

      <p className={"mt-2 text-ink-muted " + (hero ? "text-base" : "text-sm")}>
        {signal.summary}
      </p>

      <div className="mt-5 rounded-xl bg-paper-soft p-4">
        <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
          Why this matters to you
        </div>
        <p className={"mt-1 text-ink " + (hero ? "text-base" : "text-sm")}>
          {computed.reason}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
        <div>
          Source: {signal.source.publisher}
          {signal.source.label ? ` — ${signal.source.label}` : ""} ·{" "}
          {formatDate(signal.source.publishedAt)}
        </div>
        <div className="font-medium text-ink group-hover:underline">
          {computed.priority === "P3" ? "Skip or learn →" : "Learn →"}
        </div>
      </div>
    </Link>
  );
}
