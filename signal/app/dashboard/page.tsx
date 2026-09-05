"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { PriorityBadge } from "@/components/PriorityBadge";
import { ProfileSummary } from "@/components/ProfileSummary";
import { SignalCard } from "@/components/SignalCard";
import { CONCEPTS_BY_ID } from "@/data/concepts";
import { SIGNALS } from "@/data/signals";
import { LESSONS } from "@/data/lessons";
import { nextBestConcept, statusForScore } from "@/lib/knowledge";
import { prioritise } from "@/lib/prioritize";
import { loadProfile, loadProgress } from "@/lib/storage";
import type { Profile, Progress } from "@/lib/types";

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);
    setProgress(loadProgress());
  }, [router]);

  const rows = useMemo(() => {
    if (!profile || !progress) return [];
    return prioritise(SIGNALS, profile, progress);
  }, [profile, progress]);

  const p1 = rows.filter((r) => r.computed.priority === "P1");
  const p2 = rows.filter((r) => r.computed.priority === "P2");
  const p3 = rows.filter((r) => r.computed.priority === "P3");

  const conceptPool = useMemo(
    () => LESSONS.flatMap((l) => l.conceptsTaught),
    [],
  );

  const nextConceptId = useMemo(() => {
    if (!profile || !progress) return null;
    return nextBestConcept(progress, profile, conceptPool);
  }, [profile, progress, conceptPool]);

  const nextLesson = useMemo(() => {
    if (!nextConceptId) return null;
    return (
      LESSONS.find((l) =>
        l.conceptsTaught.includes(nextConceptId),
      ) ?? null
    );
  }, [nextConceptId]);

  if (!profile || !progress) return null;

  const totalSignals = SIGNALS.length;
  const shown = p1.length + p2.length + p3.length;

  return (
    <div>
      <Nav />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <ProfileSummary profile={profile} />
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
            <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
              Streak
            </div>
            <div className="mt-1 text-lg font-semibold">
              {progress.streak} day{progress.streak === 1 ? "" : "s"}
            </div>
            <div className="text-sm text-ink-muted">
              {progress.completedLessons.length} lesson
              {progress.completedLessons.length === 1 ? "" : "s"} completed
            </div>
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Today's signals
            </h2>
            <p className="text-sm text-ink-muted">
              We scanned {totalSignals} developments. Filtered to {shown} for you.
            </p>
          </div>

          {p1.length > 0 && (
            <div className="mb-8 space-y-4">
              <div className="flex items-center gap-2">
                <PriorityBadge priority="P1" />
                <div className="text-xs text-ink-muted">Start here</div>
              </div>
              {p1.map((r, i) => (
                <SignalCard
                  key={r.signal.id}
                  signal={r.signal}
                  computed={r.computed}
                  hero={i === 0}
                />
              ))}
            </div>
          )}

          {p2.length > 0 && (
            <div className="mb-8 space-y-4">
              <div className="flex items-center gap-2">
                <PriorityBadge priority="P2" />
                <div className="text-xs text-ink-muted">Useful context</div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {p2.map((r) => (
                  <SignalCard
                    key={r.signal.id}
                    signal={r.signal}
                    computed={r.computed}
                  />
                ))}
              </div>
            </div>
          )}

          {p3.length > 0 && (
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <PriorityBadge priority="P3" />
                <div className="text-xs text-ink-muted">
                  Awareness — safe to skip
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {p3.map((r) => (
                  <Link
                    key={r.signal.id}
                    href={`/signals/${r.signal.id}`}
                    className="block rounded-xl border border-black/5 bg-white p-4 text-sm shadow-card hover:border-ink/20"
                  >
                    <div className="font-medium text-ink">{r.signal.title}</div>
                    <div className="mt-1 text-xs text-ink-muted">
                      {r.signal.minutesToRead} min · {r.signal.category}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {nextConceptId && nextLesson && (
          <section className="mt-6 rounded-3xl border border-black/5 bg-white p-8 shadow-hero">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
                  Next best thing to learn
                </div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  {CONCEPTS_BY_ID[nextConceptId]?.name}
                </h3>
                <p className="mt-2 text-ink-muted">
                  {CONCEPTS_BY_ID[nextConceptId]?.blurb}
                </p>
                <p className="mt-3 text-sm text-ink-muted">
                  We picked this because it{" "}
                  {(CONCEPTS_BY_ID[nextConceptId]?.prerequisites ?? []).length
                    ? "sits at a foundation of concepts you want to learn."
                    : "opens up several other topics you've flagged."}
                </p>
                <Link
                  href={`/lessons/${nextLesson.id}`}
                  className="mt-5 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
                >
                  Start the lesson
                </Link>
              </div>
              <div className="rounded-2xl bg-paper-soft p-5">
                <div className="text-xs font-medium uppercase tracking-widest text-ink-muted">
                  You'll learn
                </div>
                <ul className="mt-3 space-y-2 text-sm text-ink">
                  {nextLesson.conceptsTaught.map((cid) => {
                    const c = CONCEPTS_BY_ID[cid];
                    const k = progress.knowledge[cid];
                    return (
                      <li key={cid} className="flex items-baseline justify-between">
                        <span>{c?.name ?? cid}</span>
                        <span className="text-xs text-ink-muted">
                          {statusForScore(k?.score ?? 0)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
