// Build an ordered "next best things to learn" roadmap from the concept
// graph, the user's current mastery, and what they've said they want.
// Ordering:
// 1. Prereqs first — you can't be at MCP if you haven't been at Tool Calling.
// 2. Wanted concepts beat generic candidates.
// 3. Concepts touched by recent P1 signals bubble up.

import { CONCEPTS_BY_ID } from "@/data/concepts";
import { LESSONS } from "@/data/lessons";
import { SIGNALS } from "@/data/signals";
import { computePriority } from "./prioritize";
import type { Profile, Progress, RoadmapItem } from "./types";

const MASTERY_THRESHOLD = 65;

function isKnown(progress: Progress, id: string): boolean {
  return (progress.knowledge[id]?.score ?? 0) >= MASTERY_THRESHOLD;
}

// Return concepts that appear in any lesson (i.e. we can actually teach them).
function teachableConcepts(): string[] {
  const s = new Set<string>();
  for (const l of LESSONS) for (const c of l.conceptsTaught) s.add(c);
  return [...s];
}

function lessonForConcept(conceptId: string): string | null {
  const primary = LESSONS.find((l) => l.primaryConceptId === conceptId);
  if (primary) return primary.id;
  const any = LESSONS.find((l) => l.conceptsTaught.includes(conceptId));
  return any?.id ?? null;
}

// Compute a per-user P1-heat score for each concept: how many of the top
// signals for this profile touch it.
function heatByConcept(profile: Profile, progress: Progress): Record<string, number> {
  const heat: Record<string, number> = {};
  for (const s of SIGNALS) {
    const p = computePriority(s, profile, progress);
    const weight = p.priority === "P1" ? 3 : p.priority === "P2" ? 1 : 0;
    for (const t of s.technologies) heat[t] = (heat[t] ?? 0) + weight;
  }
  return heat;
}

export function buildRoadmap(
  profile: Profile,
  progress: Progress,
  n = 3,
): RoadmapItem[] {
  const teachable = teachableConcepts();
  const heat = heatByConcept(profile, progress);
  const wants = new Set(profile.wantsToLearn);

  const candidates: Array<{ id: string; score: number; missing: string[] }> = [];
  for (const id of teachable) {
    if (isKnown(progress, id)) continue;
    const concept = CONCEPTS_BY_ID[id];
    if (!concept) continue;

    const missing = (concept.prerequisites ?? []).filter(
      (p) => !isKnown(progress, p),
    );

    let score = 20;
    score += (heat[id] ?? 0) * 4;
    if (wants.has(id)) score += 25;
    for (const w of wants) {
      const wc = CONCEPTS_BY_ID[w];
      if (wc?.prerequisites?.includes(id)) score += 20;
    }
    if (missing.length === 0) score += 15;
    else score -= 10 * missing.length;

    // Adaptive: things marked "attention" (touched, low score) are urgent.
    const k = progress.knowledge[id];
    if (k && k.score > 0 && k.score < 40) score += 10;

    candidates.push({ id, score, missing });
  }

  candidates.sort((a, b) => b.score - a.score);

  const chosen: RoadmapItem[] = [];
  const chosenIds = new Set<string>();
  for (const cand of candidates) {
    if (chosen.length >= n) break;
    if (chosenIds.has(cand.id)) continue;
    const concept = CONCEPTS_BY_ID[cand.id];
    const reason = reasonFor(concept?.name ?? cand.id, cand.missing, wants, heat[cand.id] ?? 0);
    chosen.push({
      conceptId: cand.id,
      lessonId: lessonForConcept(cand.id),
      reason,
      dependsOn: cand.missing,
    });
    chosenIds.add(cand.id);
  }
  return chosen;
}

function reasonFor(
  name: string,
  missing: string[],
  wants: Set<string>,
  heat: number,
): string {
  if (missing.length > 0) {
    const first = CONCEPTS_BY_ID[missing[0]]?.name ?? missing[0];
    return `Foundational for concepts you've said you want. Builds on ${first}${missing.length > 1 ? ` and ${missing.length - 1} more` : ""}.`;
  }
  if (heat >= 6) {
    return `Multiple P1 signals in your feed touch ${name}. Learning it clears the ground for several of today's picks.`;
  }
  if (wants.size > 0) {
    return `${name} opens up other concepts you've flagged.`;
  }
  return `A solid next step given where your knowledge sits today.`;
}
