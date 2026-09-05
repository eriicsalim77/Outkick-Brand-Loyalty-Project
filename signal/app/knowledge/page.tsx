"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { ProfileSummary } from "@/components/ProfileSummary";
import { CONCEPTS, CONCEPTS_BY_ID } from "@/data/concepts";
import { LESSONS } from "@/data/lessons";
import { nextBestConcept, statusForScore } from "@/lib/knowledge";
import { loadProfile, loadProgress } from "@/lib/storage";
import type { ConfidenceStatus, Profile, Progress } from "@/lib/types";

const STATUS_STYLES: Record<
  ConfidenceStatus,
  { dot: string; label: string; text: string }
> = {
  strong: { dot: "bg-emerald-500", label: "Strong", text: "text-emerald-700" },
  developing: { dot: "bg-amber-500", label: "Developing", text: "text-amber-700" },
  attention: { dot: "bg-signal-p1", label: "Needs attention", text: "text-signal-p1" },
  unknown: { dot: "bg-black/20", label: "Not started", text: "text-ink-muted" },
};

export default function Knowledge() {
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

  const conceptPool = useMemo(
    () => LESSONS.flatMap((l) => l.conceptsTaught),
    [],
  );

  const nextConceptId = useMemo(() => {
    if (!profile || !progress) return null;
    return nextBestConcept(progress, profile, conceptPool);
  }, [profile, progress, conceptPool]);

  if (!profile || !progress) return null;

  const byCategory: Record<string, typeof CONCEPTS> = {};
  for (const c of CONCEPTS) {
    (byCategory[c.category] ??= []).push(c);
  }

  const total = CONCEPTS.length;
  const known = Object.values(progress.knowledge).filter((k) => k.score >= 65).length;
  const developing = Object.values(progress.knowledge).filter(
    (k) => k.score >= 40 && k.score < 65,
  ).length;

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
              Progress
            </div>
            <div className="mt-1 text-lg font-semibold">
              {known} strong · {developing} developing
            </div>
            <div className="text-sm text-ink-muted">
              of {total} tracked concepts
            </div>
          </div>
        </div>

        {nextConceptId && (
          <section className="mt-8 rounded-2xl border border-signal-accent/20 bg-signal-accent/5 p-5">
            <div className="text-[11px] font-medium uppercase tracking-widest text-signal-accent">
              Next best thing to learn
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-ink">
                  {CONCEPTS_BY_ID[nextConceptId]?.name}
                </div>
                <div className="text-sm text-ink-muted">
                  {CONCEPTS_BY_ID[nextConceptId]?.blurb}
                </div>
              </div>
              <Link
                href="/dashboard"
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
              >
                Learn it
              </Link>
            </div>
          </section>
        )}

        <section className="mt-10 space-y-10">
          {Object.entries(byCategory).map(([category, concepts]) => (
            <div key={category}>
              <h2 className="mb-4 text-lg font-semibold tracking-tight">
                {category}
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {concepts.map((c) => {
                  const k = progress.knowledge[c.id];
                  const score = k?.score ?? 0;
                  const status = statusForScore(score);
                  const style = STATUS_STYLES[status];
                  const prereqs = (c.prerequisites ?? []).map(
                    (pid) => CONCEPTS_BY_ID[pid]?.name ?? pid,
                  );
                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-black/5 bg-white p-5 shadow-card"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="font-semibold text-ink">{c.name}</div>
                        <div className={`flex items-center gap-2 text-xs ${style.text}`}>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {style.label}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-ink-muted">
                        {c.blurb}
                      </div>
                      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-black/5">
                        <div
                          className="h-full rounded-full bg-signal-accent"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      {prereqs.length > 0 && (
                        <div className="mt-3 text-xs text-ink-muted">
                          Builds on: {prereqs.join(", ")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
