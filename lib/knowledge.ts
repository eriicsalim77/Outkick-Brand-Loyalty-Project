import { CONCEPTS_BY_ID } from "@/data/concepts";
import type {
  ConfidenceStatus,
  KnowledgeEntry,
  Profile,
  Progress,
} from "./types";

export function statusForScore(score: number): ConfidenceStatus {
  if (score >= 75) return "strong";
  if (score >= 40) return "developing";
  if (score > 0) return "attention";
  return "unknown";
}

function upsert(
  progress: Progress,
  conceptId: string,
  score: number,
): Progress {
  const now = Date.now();
  const next = { ...progress.knowledge };
  const current = next[conceptId];
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  next[conceptId] = {
    conceptId,
    score: clamped,
    status: statusForScore(clamped),
    updatedAt: now,
  } as KnowledgeEntry;
  // If a concept was implicitly boosted, don't overwrite a higher explicit score.
  if (current && current.score > clamped) {
    next[conceptId] = { ...current, updatedAt: now };
  }
  return { ...progress, knowledge: next };
}

// Bump a concept's score, respecting max/min.
export function bumpConcept(
  progress: Progress,
  conceptId: string,
  delta: number,
): Progress {
  const current = progress.knowledge[conceptId]?.score ?? 0;
  return upsert(progress, conceptId, current + delta);
}

// Seed knowledge from the onboarding "already knows" list.
export function seedKnown(progress: Progress, known: string[]): Progress {
  let out = progress;
  for (const id of known) {
    out = upsert(out, id, 78);
  }
  return out;
}

// After a lesson quiz: score is 0..1; write results per-concept.
export function applyQuizResults(
  progress: Progress,
  perConcept: Record<string, { correct: number; total: number }>,
  primaryConceptId: string,
): Progress {
  let out = progress;
  const primary = perConcept[primaryConceptId] ?? { correct: 0, total: 0 };
  const primaryScore =
    primary.total === 0 ? 60 : Math.round(30 + (primary.correct / primary.total) * 65);
  out = upsert(out, primaryConceptId, primaryScore);

  for (const [conceptId, r] of Object.entries(perConcept)) {
    if (conceptId === primaryConceptId) continue;
    const s = r.total === 0 ? 55 : Math.round(30 + (r.correct / r.total) * 60);
    out = upsert(out, conceptId, s);
  }
  return out;
}

// Given a Profile + Progress, decide the "next best thing to learn":
// pick a concept the user hasn't got yet, weighted by (a) whether it's a
// prereq of something they want to learn, (b) whether it's a prereq of an
// upcoming P1 concept they've seen but not learned.
export function nextBestConcept(
  progress: Progress,
  profile: Profile,
  candidatePool: string[],
): string | null {
  const known = new Set(
    Object.entries(progress.knowledge)
      .filter(([, v]) => v.score >= 65)
      .map(([k]) => k),
  );

  const wants = new Set(profile.wantsToLearn);

  // Score each candidate concept.
  let best: { id: string; score: number } | null = null;
  for (const id of candidatePool) {
    if (known.has(id)) continue;
    const concept = CONCEPTS_BY_ID[id];
    if (!concept) continue;

    let score = 10;
    if (wants.has(id)) score += 30;
    // Being a prerequisite of something the user wants boosts value.
    for (const wantId of wants) {
      const want = CONCEPTS_BY_ID[wantId];
      if (want?.prerequisites?.includes(id)) score += 25;
    }
    // Prereqs missing lowers priority (learn foundations first).
    const missingPrereqs = (concept.prerequisites ?? []).filter(
      (p) => !known.has(p),
    );
    if (missingPrereqs.length > 0) {
      score -= 15 * missingPrereqs.length;
    } else {
      score += 10;
    }

    if (!best || score > best.score) best = { id, score };
  }

  return best?.id ?? null;
}
