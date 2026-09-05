"use client";

import Link from "next/link";
import { CONCEPTS_BY_ID } from "@/data/concepts";
import { PriorityBadge } from "@/components/PriorityBadge";
import { formatDate } from "@/lib/format";
import type { EnhancedTrendingItem, Role } from "@/lib/types";

const ROLE_LABEL: Record<Role, string> = {
  gtm: "GTM",
  revops: "RevOps",
  fde: "FDE",
};

export function LiveSignalView({
  item,
  role,
}: {
  item: EnhancedTrendingItem;
  role: Role;
}) {
  const rel = item.personal[role];

  return (
    <article className="prose-signal">
      <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink">
        ← Back to today
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <PriorityBadge priority={rel.priority} />
          <div className="text-xs text-ink-muted">
            {item.publisher} · {formatDate(item.publishedAt)} · Momentum {item.momentum}
          </div>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {item.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {item.technologies.map((t) => (
            <span
              key={t}
              className="rounded-full bg-paper-soft px-2.5 py-1 text-ink"
            >
              {CONCEPTS_BY_ID[t]?.name ?? t}
            </span>
          ))}
          <span className="ml-1 text-ink-muted">
            {item.enhancedBy === "llm"
              ? "Learning card generated with Claude Haiku 4.5"
              : "Templated card · add ANTHROPIC_API_KEY for LLM-authored copy"}
          </span>
        </div>
      </header>

      <section className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-card">
        <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
          Why this matters to you · {ROLE_LABEL[role]}
        </div>
        <p className="mt-2 text-ink">{rel.reason}</p>
      </section>

      <section className="mt-6">
        <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
          What happened
        </div>
        <p className="mt-2 text-ink">{item.snippet}</p>
      </section>

      <section className="mt-8">
        <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
          What is it
        </div>
        <p className="mt-2 text-ink">{item.whatIsIt}</p>
      </section>

      <section className="mt-8">
        <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
          What to remember
        </div>
        <ul className="mt-3 space-y-2">
          {item.keyTakeaways.map((t, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-black/5 bg-white p-3 shadow-card"
            >
              <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-signal-accent" />
              <span className="text-ink">{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-signal-accent/20 bg-signal-accent/5 p-5">
        <div className="text-[11px] font-medium uppercase tracking-widest text-signal-accent">
          Apply it · {ROLE_LABEL[role]}
        </div>
        <p className="mt-2 text-ink">{rel.apply}</p>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink-soft"
        >
          Read the primary source
        </a>
        <Link
          href="/dashboard"
          className="rounded-full border border-black/10 px-5 py-3 text-sm text-ink hover:bg-white"
        >
          Back to today
        </Link>
      </div>
    </article>
  );
}
