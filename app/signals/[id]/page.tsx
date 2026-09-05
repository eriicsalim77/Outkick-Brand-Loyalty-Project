"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { PriorityBadge } from "@/components/PriorityBadge";
import { CONCEPTS_BY_ID } from "@/data/concepts";
import { LESSONS_BY_ID } from "@/data/lessons";
import { SIGNALS_BY_ID } from "@/data/signals";
import { formatDate } from "@/lib/format";
import { computePriority } from "@/lib/prioritize";
import { loadProfile, loadProgress, saveProgress } from "@/lib/storage";
import type { Profile, Progress } from "@/lib/types";

export default function SignalDetail() {
  const params = useParams<{ id: string }>();
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

  const signal = SIGNALS_BY_ID[params.id as string];
  const lesson = LESSONS_BY_ID[params.id as string];

  const computed = useMemo(() => {
    if (!profile || !progress || !signal) return null;
    return computePriority(signal, profile, progress);
  }, [profile, progress, signal]);

  if (!signal) {
    return (
      <div>
        <Nav />
        <main className="mx-auto max-w-3xl px-6 py-16">
          <p>Signal not found.</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm text-signal-accent"
          >
            Back to today
          </Link>
        </main>
      </div>
    );
  }

  if (!profile || !progress || !computed) return null;

  function skip() {
    if (!signal || !progress) return;
    const next: Progress = {
      ...progress,
      skippedSignals: Array.from(new Set([...progress.skippedSignals, signal.id])),
    };
    saveProgress(next);
    router.push("/dashboard");
  }

  return (
    <div>
      <Nav />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/dashboard"
          className="text-sm text-ink-muted hover:text-ink"
        >
          ← Back to today
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <PriorityBadge priority={computed.priority} />
          <div className="text-xs text-ink-muted">
            {signal.category} · {signal.minutesToRead} min
          </div>
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          {signal.title}
        </h1>
        <p className="mt-4 text-lg text-ink-muted">{signal.summary}</p>

        <section className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-card">
          <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
            Why this matters to you
          </div>
          <p className="mt-2 text-ink">{computed.reason}</p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
            <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
              Source
            </div>
            <a
              href={signal.source.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-base font-medium text-ink hover:underline"
            >
              {signal.source.publisher}
              {signal.source.label ? ` — ${signal.source.label}` : ""}
            </a>
            <div className="mt-1 text-xs text-ink-muted">
              Tier {signal.source.tier} · {formatDate(signal.source.publishedAt)}
            </div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
            <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
              Technologies
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {signal.technologies.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-paper-soft px-2.5 py-1 text-xs text-ink"
                >
                  {CONCEPTS_BY_ID[t]?.name ?? t}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          {lesson ? (
            <Link
              href={`/lessons/${lesson.id}`}
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper"
            >
              Learn — {signal.minutesToRead} min lesson
            </Link>
          ) : (
            <a
              href={signal.source.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper"
            >
              Read the primary source
            </a>
          )}
          <button
            onClick={skip}
            className="rounded-full border border-black/10 px-5 py-3 text-sm text-ink hover:bg-white"
          >
            Skip
          </button>
        </div>
      </main>
    </div>
  );
}
