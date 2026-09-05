import { NextResponse } from "next/server";
import { TRENDING_FALLBACK } from "@/data/trendingFallback";
import { exaSearch, hasExaKey } from "@/lib/exa";
import { dedupe, rank, toTrendingItem } from "@/lib/ingest";
import type { Role, TrendingItem } from "@/lib/types";

// Cache trending in-memory per query for TTL_MS to keep costs (and rate limits)
// under control. A server restart clears it, which is fine for the MVP.
const TTL_MS = 15 * 60 * 1000;
type CacheEntry = { at: number; items: TrendingItem[]; source: "exa" | "fallback" };
const CACHE = new Map<string, CacheEntry>();

// Role-tuned queries; each one gets sent to Exa and merged.
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
    return NextResponse.json(
      { items: cached.items, source: cached.source, cachedAt: cached.at },
      { headers: { "cache-control": "no-store" } },
    );
  }

  if (!hasExaKey()) {
    const items = rank(TRENDING_FALLBACK, 8);
    CACHE.set(key, { at: Date.now(), items, source: "fallback" });
    return NextResponse.json(
      { items, source: "fallback", cachedAt: Date.now() },
      { headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const items = await fetchFromExa(role);
    if (items.length === 0) {
      const fb = rank(TRENDING_FALLBACK, 8);
      CACHE.set(key, { at: Date.now(), items: fb, source: "fallback" });
      return NextResponse.json(
        { items: fb, source: "fallback", cachedAt: Date.now(), note: "Exa returned no classifiable results." },
        { headers: { "cache-control": "no-store" } },
      );
    }
    CACHE.set(key, { at: Date.now(), items, source: "exa" });
    return NextResponse.json(
      { items, source: "exa", cachedAt: Date.now() },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    const fb = rank(TRENDING_FALLBACK, 8);
    CACHE.set(key, { at: Date.now(), items: fb, source: "fallback" });
    return NextResponse.json(
      {
        items: fb,
        source: "fallback",
        cachedAt: Date.now(),
        note: `Exa error, using fallback: ${(err as Error).message}`,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }
}
