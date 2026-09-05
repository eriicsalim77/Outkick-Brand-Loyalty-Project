"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { LessonView } from "@/components/LessonView";
import { LESSONS_BY_ID } from "@/data/lessons";
import { SIGNALS_BY_ID } from "@/data/signals";
import { loadProfile, loadProgress } from "@/lib/storage";
import type { Profile, Progress } from "@/lib/types";

export default function LessonPage() {
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

  const lesson = LESSONS_BY_ID[params.id as string];
  const signal = SIGNALS_BY_ID[params.id as string];

  if (!lesson) {
    return (
      <div>
        <Nav />
        <main className="mx-auto max-w-3xl px-6 py-16">
          <p>Lesson not found.</p>
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

  if (!profile || !progress) return null;

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/signals/${lesson.signalId}`}
          className="text-sm text-ink-muted hover:text-ink"
        >
          ← Back to signal
        </Link>
        {signal && (
          <div className="mt-4 text-xs uppercase tracking-widest text-ink-muted">
            Lesson · {signal.category}
          </div>
        )}
        <h1 className="mt-2 mb-8 text-3xl font-semibold tracking-tight">
          {signal?.title}
        </h1>

        <LessonView lesson={lesson} profile={profile} progress={progress} />
      </main>
    </div>
  );
}
