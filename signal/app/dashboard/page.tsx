"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveHeroCard } from "@/components/LiveHeroCard";
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
import type { EnhancedTrendingItem, Profile, Progress } from "@/lib/types";

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [liveItems, setLiveItems] = useState<EnhancedTrendingItem[]>([]);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);
    setProgress(loadProgress());
  }, [router]);

  const curatedRows = useMemo(() => {
    if (!profile || !progress) return [];
    return prioritise(SIGNALS, profile, progress);
  }, [profile, progress]);

  // Today's Pick: whichever ranks higher between the top live item and the
  // top curated signal for this user. Both go through role-aware scoring
  // so we're comparing apples to apples.
  const heroLive = liveItems[0] ?? null;
  const heroCurated = curatedRows[0] ?? null;

  const useLiveHero = (() => {
    if (!heroLive) return false;
    if (!heroCurated) return true;
    const liveScore = profile ? heroLive.personal[profile.role].score : 0;
    const curatedScore = heroCurated.computed.score;
    // Prefer live when it's within 8 pts of the curated score — freshness wins.
    return liveScore + 8 >= curatedScore;
  })();

  const otherPicks = curatedRows
    .filter((r) => r !== heroCurated || useLiveHero)
    .filter((r) => r.computed.priority !== "P3")
    .slice(0, 4);

  const roadmap = useMemo(() => {
    if (!profile || !progress) return [];
    return buildRoadmap(profile, progress, 3);
  }, [profile, progress]);

  if (!profile || !progress) return null;

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
              Ranked across {liveItems.length} live + {SIGNALS.length} curated signals.
            </p>
          </div>

          {useLiveHero && heroLive ? (
            <LiveHeroCard item={heroLive} role={profile.role} />
          ) : heroCurated ? (
            <SignalCard
              signal={heroCurated.signal}
              computed={heroCurated.computed}
              hero
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-ink-muted">
              Loading today's pick…
            </div>
          )}

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

        {/* Section 2: Trending — live via Exa, learning-card-per-item */}
        <section className="mt-12">
          <TrendingList role={profile.role} onItems={setLiveItems} />
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
