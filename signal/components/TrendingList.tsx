"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONCEPTS_BY_ID } from "@/data/concepts";
import { useIsPro } from "@/lib/entitlements";
import { formatDate } from "@/lib/format";
import type { Role, TrendingItem } from "@/lib/types";

const FREE_LIMIT = 3;

interface Response {
  items: TrendingItem[];
  source: "exa" | "fallback";
  cachedAt: number;
  note?: string;
}

export function TrendingList({ role }: { role: Role }) {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const pro = useIsPro();

  async function load(bypass = false) {
    try {
      setError(null);
      if (bypass) setRefreshing(true);
      const res = await fetch(
        `/api/trending?role=${role}${bypass ? "&refresh=1" : ""}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as Response;
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load(false);
    // Refresh silently when role changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-hero">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
            Trending in your world
          </div>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">
            Top 5, ranked by momentum
          </h3>
          {data && (
            <div className="mt-1 text-xs text-ink-muted">
              {data.source === "exa"
                ? "Live from the web · via Exa"
                : "Curated fallback · add EXA_API_KEY for live results"}
              {" · updated "}
              {new Date(data.cachedAt).toLocaleTimeString()}
            </div>
          )}
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-ink-muted hover:text-ink disabled:opacity-40"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loading && (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-paper-soft"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-signal-p1/20 bg-signal-p1/5 p-4 text-sm text-signal-p1">
          Trending unavailable: {error}
        </div>
      )}

      {data && data.items.length > 0 && (
        <>
          <ol className="mt-6 divide-y divide-black/5">
            {(pro ? data.items : data.items.slice(0, FREE_LIMIT)).map((it, i) => (
              <li key={it.id} className="py-4 first:pt-0 last:pb-0">
                <a
                  href={it.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid grid-cols-[auto_1fr_auto] items-start gap-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-soft text-xs font-semibold text-ink-muted group-hover:bg-ink group-hover:text-paper">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-ink group-hover:underline">
                      {it.title}
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-ink-muted">
                      {it.snippet}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <span>{it.publisher}</span>
                      <span>·</span>
                      <span>{formatDate(it.publishedAt)}</span>
                      {it.technologies.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-paper-soft px-2 py-0.5 text-[11px] text-ink"
                        >
                          {CONCEPTS_BY_ID[t]?.name ?? t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-ink-muted">
                      Momentum
                    </div>
                    <div className="text-xl font-semibold text-ink">
                      {it.momentum}
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ol>

          {!pro && data.items.length > FREE_LIMIT && (
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-dashed border-black/15 bg-paper-soft p-6">
              {/* blurred preview of what's behind the paywall */}
              <div
                aria-hidden
                className="pointer-events-none select-none space-y-3 opacity-40 blur-[3px]"
              >
                {data.items.slice(FREE_LIMIT).map((it, i) => (
                  <div key={it.id} className="grid grid-cols-[auto_1fr_auto] items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-ink-muted">
                      {FREE_LIMIT + i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-ink">{it.title}</div>
                      <div className="mt-1 line-clamp-1 text-sm text-ink-muted">{it.snippet}</div>
                    </div>
                    <div className="text-xl font-semibold text-ink">{it.momentum}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {data.items.length - FREE_LIMIT} more trending item
                    {data.items.length - FREE_LIMIT === 1 ? "" : "s"} for Pro
                  </div>
                  <div className="text-xs text-ink-muted">
                    Free plan shows the top {FREE_LIMIT}. Pro unlocks the full ranked list every day.
                  </div>
                </div>
                <Link
                  href="/upgrade"
                  className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {data && data.note && (
        <div className="mt-4 rounded-xl bg-paper-soft p-3 text-xs text-ink-muted">
          {data.note}
        </div>
      )}
    </div>
  );
}
