// Turn raw Exa results into TrendingItems: classify against concept keywords,
// score momentum from recency + domain weight + Exa's own score, dedupe.

import { CONCEPT_KEYWORDS, weightForUrl } from "@/data/keywords";
import type { ExaResult } from "./exa";
import type { TrendingItem } from "./types";

function inferTechnologies(text: string): string[] {
  const t = (" " + text.toLowerCase() + " ").replace(/\s+/g, " ");
  const hits = new Set<string>();
  for (const [conceptId, keywords] of Object.entries(CONCEPT_KEYWORDS)) {
    for (const kw of keywords) {
      if (t.includes(kw.toLowerCase())) {
        hits.add(conceptId);
        break;
      }
    }
  }
  return [...hits];
}

function recencyScore(iso?: string): number {
  if (!iso) return 0.3;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 0.3;
  const ageDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays < 1) return 1.0;
  if (ageDays < 3) return 0.9;
  if (ageDays < 7) return 0.75;
  if (ageDays < 14) return 0.6;
  if (ageDays < 30) return 0.45;
  if (ageDays < 90) return 0.3;
  return 0.15;
}

function publisherFor(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return "unknown";
  }
}

function tierFor(weight: number): 1 | 2 | 3 {
  if (weight >= 0.8) return 1;
  if (weight >= 0.55) return 2;
  return 3;
}

function isoDate(d?: string): string {
  if (!d) {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? d.slice(0, 10) : parsed.toISOString().slice(0, 10);
}

export function toTrendingItem(r: ExaResult): TrendingItem | null {
  const bodyText = [r.title, r.snippet, r.text].filter(Boolean).join(" ");
  const techs = inferTechnologies(bodyText);
  // Skip results we can't classify against any tracked concept.
  if (techs.length === 0) return null;

  const domainWeight = weightForUrl(r.url);
  const rec = recencyScore(r.publishedDate);
  const exaScore = Math.max(0, Math.min(1, r.score ?? 0.5));
  const momentum = Math.round(
    100 * (0.45 * rec + 0.4 * domainWeight + 0.15 * exaScore),
  );

  const snippet = (r.snippet || r.text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);

  return {
    id: r.id || r.url,
    title: (r.title || publisherFor(r.url)).trim().slice(0, 180),
    snippet: snippet || "Read the source for details.",
    url: r.url,
    publisher: publisherFor(r.url),
    publishedAt: isoDate(r.publishedDate),
    technologies: techs,
    momentum,
    tier: tierFor(domainWeight),
  };
}

export function dedupe(items: TrendingItem[]): TrendingItem[] {
  const seen = new Set<string>();
  const out: TrendingItem[] = [];
  for (const it of items) {
    const key = it.url.split("#")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

// Rank + return the top N.
export function rank(items: TrendingItem[], n: number): TrendingItem[] {
  return [...items].sort((a, b) => b.momentum - a.momentum).slice(0, n);
}
