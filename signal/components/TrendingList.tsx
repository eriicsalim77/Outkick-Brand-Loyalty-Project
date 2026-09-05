"use client";

import { useEffect, useState } from "react";
import { CONCEPTS_BY_ID } from "@/data/concepts";
import { formatDate } from "@/lib/format";
import type { Role, TrendingItem } from "@/lib/types";

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
        <ol className="mt-6 divide-y divide-black/5">
          {data.items.map((it, i) => (
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
      )}

      {data && data.note && (
        <div className="mt-4 rounded-xl bg-paper-soft p-3 text-xs text-ink-muted">
          {data.note}
        </div>
      )}
    </div>
  );
}
