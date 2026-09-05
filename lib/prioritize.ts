import type {
  ComputedPriority,
  Priority,
  Profile,
  Progress,
  Signal,
} from "./types";

// Personalise a signal for a given profile + progress:
// combines role-relevance score (authored per signal), industry match,
// wanted-tech match, and knowledge-gap into a final priority.
export function computePriority(
  signal: Signal,
  profile: Profile,
  progress: Progress,
): ComputedPriority {
  const roleRel = signal.relevance[profile.role];
  let score = roleRel.score;

  if (signal.industries.includes(profile.industry)) score += 8;

  const wants = new Set(profile.wantsToLearn);
  const wantsHit = signal.technologies.some((t) => wants.has(t));
  if (wantsHit) score += 6;

  // Concepts the user is weak on that this signal touches.
  const gapHit = signal.technologies.some((t) => {
    const k = progress.knowledge[t];
    return !k || k.score < 40;
  });
  if (gapHit) score += 4;

  // Concepts the user already knows well reduce urgency (but not novelty).
  const strongHit = signal.technologies.every((t) => {
    const k = progress.knowledge[t];
    return k && k.score >= 75;
  });
  if (strongHit) score -= 8;

  // Weight novelty and velocity gently.
  score = score * 0.85 + signal.base.novelty * 0.08 + signal.base.velocity * 0.07;

  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  const priority: Priority =
    clamped >= 78 ? "P1" : clamped >= 55 ? "P2" : "P3";

  const reason = roleRel.reason;
  return { priority, score: clamped, reason };
}

export function prioritise(
  signals: Signal[],
  profile: Profile,
  progress: Progress,
): Array<{ signal: Signal; computed: ComputedPriority }> {
  const rows = signals.map((s) => ({
    signal: s,
    computed: computePriority(s, profile, progress),
  }));
  // Sort P1 > P2 > P3, tie-break by score desc, then date desc.
  const rank: Record<Priority, number> = { P1: 0, P2: 1, P3: 2 };
  rows.sort((a, b) => {
    const r = rank[a.computed.priority] - rank[b.computed.priority];
    if (r !== 0) return r;
    if (b.computed.score !== a.computed.score) {
      return b.computed.score - a.computed.score;
    }
    return b.signal.source.publishedAt.localeCompare(a.signal.source.publishedAt);
  });
  return rows;
}
