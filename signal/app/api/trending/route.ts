import { NextResponse } from "next/server";
import { TRENDING_FALLBACK } from "@/data/trendingFallback";
import { enhance } from "@/lib/enhance";
import { exaSearch, hasExaKey } from "@/lib/exa";
import { dedupe, rank, toTrendingItem } from "@/lib/ingest";
import { itemStore } from "@/lib/itemStore";
import type { EnhancedTrendingItem, Role, TrendingItem } from "@/lib/types";

// Cache role -> id list for 15 min. Enhanced items live in itemStore
// (keyed by item id) so /api/live/[id] can look one up after this call.
const TTL_MS = 15 * 60 * 1000;
type CacheEntry = { at: number; ids: string[]; source: "exa" | "fallback"; note?: string };
const CACHE = new Map<string, CacheEntry>();

const ROLE_QUERIES: Record<Role, string[]> = {
  gtm: [
    "latest AI product launches this week",
    "AI SDR outbound tool launches",
    "MCP integrations for CRM",
    "AI agent go to market news",
  ],
  revops: [
    "AI RevOps workflow launches this week",
    "Salesforce Agentforce updates",
    "Clay enrichment update",
    "GTM tooling release notes AI",
  ],
  fde: [
    "AI infrastructure release notes this week",
    "LLM API release notes",
    "MCP server release announcement",
    "agent framework update release",
  ],
};

function cacheKey(role: Role): string {
  return `trending:${role}`;
}

async function fetchFromExa(role: Role): Promise<TrendingItem[]> {
  const queries = ROLE_QUERIES[role];
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const startISO = start.toISOString();

  const batches = await Promise.all(
    queries.map((q) =>
      exaSearch({
        query: q,
        numResults: 10,
        startPublishedDate: startISO,
        type: "auto",
      }).catch(() => []),
    ),
  );

  const items: TrendingItem[] = [];
  for (const batch of batches) {
    for (const r of batch) {
      const it = toTrendingItem(r);
      if (it) items.push(it);
    }
  }
  return rank(dedupe(items), 8);
}

async function enhanceAll(items: TrendingItem[]): Promise<EnhancedTrendingItem[]> {
  // Skip work for items already enhanced in the last hour.
  const enhanced = await Promise.all(
    items.map(async (it) => {
      const cached = itemStore.get(it.id);
      if (cached) return cached;
      const e = await enhance(it);
      itemStore.set(e);
      return e;
    }),
  );
  return enhanced;
}

// Re-rank after enhancement: sort by the requested role's personal score,
// then by momentum, so P1-for-this-role bubbles to the top.
function rankForRole(items: EnhancedTrendingItem[], role: Role): EnhancedTrendingItem[] {
  return [...items].sort((a, b) => {
    const sa = a.personal[role].score;
    const sb = b.personal[role].score;
    if (sb !== sa) return sb - sa;
    return b.momentum - a.momentum;
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const roleParam = (url.searchParams.get("role") || "gtm") as Role;
  const role: Role = (["gtm", "revops", "fde"] as Role[]).includes(roleParam)
    ? roleParam
    : "gtm";
  const bypassCache = url.searchParams.get("refresh") === "1";

  const key = cacheKey(role);
  const cached = CACHE.get(key);
  if (!bypassCache && cached && Date.now() - cached.at < TTL_MS) {
    const items = cached.ids
      .map((id) => itemStore.get(id))
      .filter((x): x is EnhancedTrendingItem => Boolean(x));
    if (items.length > 0) {
      return NextResponse.json(
        {
          items: rankForRole(items, role),
          source: cached.source,
          cachedAt: cached.at,
          note: cached.note,
        },
        { headers: { "cache-control": "no-store" } },
      );
    }
    // fall through and re-fetch if the itemStore has evicted these.
  }

  const useFallback = !hasExaKey();
  let raw: TrendingItem[] = [];
  let source: "exa" | "fallback" = "fallback";
  let note: string | undefined;

  if (useFallback) {
    raw = rank(TRENDING_FALLBACK, 8);
    source = "fallback";
  } else {
    try {
      raw = await fetchFromExa(role);
      if (raw.length === 0) {
        raw = rank(TRENDING_FALLBACK, 8);
        source = "fallback";
        note = "Exa returned no classifiable results.";
      } else {
        source = "exa";
      }
    } catch (err) {
      raw = rank(TRENDING_FALLBACK, 8);
      source = "fallback";
      note = `Exa error: ${(err as Error).message}`;
    }
  }

  const enhanced = await enhanceAll(raw);
  const ranked = rankForRole(enhanced, role);

  CACHE.set(key, {
    at: Date.now(),
    ids: ranked.map((i) => i.id),
    source,
    note,
  });

  return NextResponse.json(
    { items: ranked, source, cachedAt: Date.now(), note },
    { headers: { "cache-control": "no-store" } },
  );
}
