// Turn a raw TrendingItem into an EnhancedTrendingItem — with per-role
// priority, "why this matters" copy, an "apply it" prompt, and a short
// learning card (what-is-it + 3 takeaways). Server-only.
//
// Uses Claude Haiku 4.5 when ANTHROPIC_API_KEY is set; otherwise falls back
// to a decent templated version keyed off the inferred technologies.

import { CONCEPTS_BY_ID } from "@/data/concepts";
import { callClaude, extractJson, hasAnthropicKey } from "./anthropic";
import type {
  EnhancedTrendingItem,
  PersonalRelevance,
  Priority,
  Role,
  TrendingItem,
} from "./types";

const ROLES: Role[] = ["gtm", "revops", "fde"];

// Baseline role affinity per concept category, used both as fallback and to
// clamp/anchor the LLM's own scoring so nothing goes truly off-piste.
const CATEGORY_ROLE_AFFINITY: Record<string, Record<Role, number>> = {
  AI: { gtm: 70, revops: 70, fde: 88 },
  Engineering: { gtm: 45, revops: 55, fde: 88 },
  GTM: { gtm: 88, revops: 90, fde: 55 },
  Data: { gtm: 55, revops: 78, fde: 82 },
};

function priorityForScore(score: number): Priority {
  if (score >= 78) return "P1";
  if (score >= 55) return "P2";
  return "P3";
}

function affinity(techs: string[], role: Role): number {
  const cats = new Set<string>();
  for (const t of techs) {
    const c = CONCEPTS_BY_ID[t];
    if (c) cats.add(c.category);
  }
  if (cats.size === 0) return 55;
  let sum = 0;
  let n = 0;
  for (const cat of cats) {
    const row = CATEGORY_ROLE_AFFINITY[cat];
    if (row) {
      sum += row[role];
      n++;
    }
  }
  return n ? sum / n : 55;
}

function templateReason(role: Role, techs: string[], title: string): string {
  const names = techs
    .slice(0, 2)
    .map((t) => CONCEPTS_BY_ID[t]?.name ?? t)
    .join(" and ");
  const topic = names || "this technology";
  const templates: Record<Role, string> = {
    gtm: `Buyers building on ${topic} will surface this in discovery. Being able to speak to it credibly keeps you in front of the deal.`,
    revops: `${topic} is likely to reshape how RevOps teams operate. Understanding it early shapes what you buy, what you build, and what you deprecate.`,
    fde: `New pattern to evaluate for customer implementations. Learn where ${topic} beats what you deploy today and where it doesn't.`,
  };
  return templates[role];
}

function templateApply(role: Role, techs: string[]): string {
  const first = techs[0] ? CONCEPTS_BY_ID[techs[0]]?.name ?? techs[0] : "this";
  const templates: Record<Role, string> = {
    gtm: `On your next discovery call, ask the prospect what they think about ${first}. Their answer tells you a lot about their maturity and what they're actually building.`,
    revops: `Sketch one internal workflow where ${first} would either replace an existing tool or unlock something you couldn't do before. Estimate the effort.`,
    fde: `Take one recent customer architecture and describe where ${first} would slot in. Note the failure modes and the boundaries where it stops helping.`,
  };
  return templates[role];
}

function templateWhatIsIt(techs: string[]): string {
  const first = techs.map((t) => CONCEPTS_BY_ID[t]).filter(Boolean)[0];
  if (!first) return "A recent technology development relevant to the concepts you track.";
  return `${first.name}: ${first.blurb}`;
}

function templateTakeaways(techs: string[]): string[] {
  const names = techs
    .map((t) => CONCEPTS_BY_ID[t]?.name)
    .filter((n): n is string => Boolean(n))
    .slice(0, 3);
  const out: string[] = [];
  if (names.length > 0) {
    out.push(`Sits at the intersection of ${names.join(", ")}.`);
  }
  out.push("Read the primary source before forming a strong opinion.");
  out.push("Compare it against what your team already ships or evaluates.");
  return out;
}

function templateEnhance(item: TrendingItem): EnhancedTrendingItem {
  const personal: Record<Role, PersonalRelevance> = {} as Record<
    Role,
    PersonalRelevance
  >;
  for (const role of ROLES) {
    const aff = affinity(item.technologies, role);
    // Nudge score by the item's momentum too (fresh / high-signal = higher).
    const score = Math.round(0.7 * aff + 0.3 * item.momentum);
    personal[role] = {
      priority: priorityForScore(score),
      score,
      reason: templateReason(role, item.technologies, item.title),
      apply: templateApply(role, item.technologies),
    };
  }
  return {
    ...item,
    whatIsIt: templateWhatIsIt(item.technologies),
    keyTakeaways: templateTakeaways(item.technologies),
    personal,
    enhancedBy: "template",
  };
}

interface LlmResponse {
  what_is_it?: string;
  key_takeaways?: string[];
  gtm?: LlmRole;
  revops?: LlmRole;
  fde?: LlmRole;
}
interface LlmRole {
  score?: number;
  reason?: string;
  apply?: string;
}

async function llmEnhance(item: TrendingItem): Promise<EnhancedTrendingItem | null> {
  const conceptNames = item.technologies
    .map((t) => CONCEPTS_BY_ID[t]?.name ?? t)
    .filter(Boolean);

  const system = `You are an editor for Signal, a personalised tech-learning product for three audiences:
- gtm: sales / customer-facing revenue roles. Cares about how to talk about tech with buyers.
- revops: revenue operations. Cares about tools, workflows, build-vs-buy.
- fde: forward-deployed / solutions engineers. Cares about implementation patterns, tradeoffs, failure modes.

You will receive one recent news/announcement item. Return a compact JSON object exactly like:

{
  "what_is_it": "One-paragraph plain-language explanation of the underlying technology or concept (2-4 sentences). No fluff, no hype.",
  "key_takeaways": ["short bullet", "short bullet", "short bullet"],
  "gtm":    { "score": 0-100, "reason": "why this matters for gtm (1-2 sentences)", "apply": "one concrete practice prompt for gtm" },
  "revops": { "score": 0-100, "reason": "why this matters for revops (1-2 sentences)", "apply": "one concrete practice prompt for revops" },
  "fde":    { "score": 0-100, "reason": "why this matters for fde (1-2 sentences)", "apply": "one concrete practice prompt for fde" }
}

Rules:
- Score is how important this specific item is FOR THAT ROLE, not how important the topic is in general.
- "reason" is written to the reader ("you") — never third-person about "sales professionals".
- "apply" is a doable step this week — not "read more about it".
- Be concrete. No em dashes at sentence start. No emojis. No preamble.
- Output ONLY the JSON object, nothing else.`;

  const userMsg = `Title: ${item.title}
Publisher: ${item.publisher} (${item.url})
Published: ${item.publishedAt}
Snippet: ${item.snippet}
Detected topics: ${conceptNames.join(", ") || "(none matched)"}
`;

  try {
    const raw = await callClaude({
      system,
      user: userMsg,
      maxTokens: 900,
      temperature: 0.35,
    });
    const parsed = extractJson<LlmResponse>(raw);
    if (!parsed) return null;

    const personal: Record<Role, PersonalRelevance> = {} as Record<
      Role,
      PersonalRelevance
    >;
    for (const role of ROLES) {
      const r = parsed[role] ?? {};
      const aff = affinity(item.technologies, role);
      const llmScore = typeof r.score === "number" ? r.score : aff;
      // Blend the LLM score with baseline affinity and item momentum, so
      // one confidently-wrong LLM number can't send a P3 all the way to P1.
      const blended = Math.round(
        0.55 * llmScore + 0.25 * aff + 0.2 * item.momentum,
      );
      personal[role] = {
        priority: priorityForScore(blended),
        score: Math.max(0, Math.min(100, blended)),
        reason: (r.reason ?? templateReason(role, item.technologies, item.title)).trim(),
        apply: (r.apply ?? templateApply(role, item.technologies)).trim(),
      };
    }

    return {
      ...item,
      whatIsIt:
        (parsed.what_is_it ?? templateWhatIsIt(item.technologies)).trim(),
      keyTakeaways:
        Array.isArray(parsed.key_takeaways) && parsed.key_takeaways.length
          ? parsed.key_takeaways.slice(0, 5).map((s) => String(s).trim())
          : templateTakeaways(item.technologies),
      personal,
      enhancedBy: "llm",
    };
  } catch {
    return null;
  }
}

export async function enhance(item: TrendingItem): Promise<EnhancedTrendingItem> {
  if (hasAnthropicKey()) {
    const llm = await llmEnhance(item);
    if (llm) return llm;
  }
  return templateEnhance(item);
}
