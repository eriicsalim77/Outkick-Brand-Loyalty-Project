"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { PriorityBadge } from "@/components/PriorityBadge";
import { ProfileSummary } from "@/components/ProfileSummary";
import { RoadmapCard } from "@/components/RoadmapCard";
import { SignalCard } from "@/components/SignalCard";
import { TrendingList } from "@/components/TrendingList";
import { SIGNALS } from "@/data/signals";
import { prioritise } from "@/lib/prioritize";
import { buildRoadmap } from "@/lib/roadmap";
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

  const hero = rows.find((r) => r.computed.priority === "P1") ?? rows[0];
  const otherPicks = rows
    .filter((r) => r !== hero && r.computed.priority !== "P3")
    .slice(0, 4);

  const roadmap = useMemo(() => {
    if (!profile || !progress) return [];
    return buildRoadmap(profile, progress, 3);
  }, [profile, progress]);

  if (!profile || !progress || !hero) return null;

  return (
    <div>
      <Nav />

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* header row: profile + streak */}
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

        {/* Section 1: Today's Pick */}
        <section className="mt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
                Today's pick
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Start here
              </h2>
            </div>
            <p className="text-sm text-ink-muted">
              We scanned {SIGNALS.length} developments. This is the one for you.
            </p>
          </div>

          <SignalCard signal={hero.signal} computed={hero.computed} hero />

          {otherPicks.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <PriorityBadge priority="P2" />
                <div className="text-xs text-ink-muted">Also worth your time</div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {otherPicks.map((r) => (
                  <SignalCard
                    key={r.signal.id}
                    signal={r.signal}
                    computed={r.computed}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Trending — live via Exa */}
        <section className="mt-12">
          <TrendingList role={profile.role} />
        </section>

        {/* Section 3: Roadmap */}
        <section className="mt-12">
          <RoadmapCard items={roadmap} progress={progress} />
        </section>

        <div className="mt-10 flex items-center justify-center text-xs text-ink-muted">
          <Link href="/knowledge" className="hover:text-ink">
            Open your knowledge map →
          </Link>
        </div>
      </main>
    </div>
  );
}
