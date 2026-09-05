"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { Nav } from "@/components/Nav";
import { ProfileSummary } from "@/components/ProfileSummary";
import { RoadmapCard } from "@/components/RoadmapCard";
import { CONCEPTS } from "@/data/concepts";
import { buildRoadmap } from "@/lib/roadmap";
import { loadProfile, loadProgress } from "@/lib/storage";
import type { Profile, Progress } from "@/lib/types";

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

  const roadmap = useMemo(() => {
    if (!profile || !progress) return [];
    return buildRoadmap(profile, progress, 5);
  }, [profile, progress]);

  if (!profile || !progress) return null;

  const total = CONCEPTS.length;
  const strong = Object.values(progress.knowledge).filter((k) => k.score >= 65).length;
  const developing = Object.values(progress.knowledge).filter(
    (k) => k.score >= 40 && k.score < 65,
  ).length;
  const attention = Object.values(progress.knowledge).filter(
    (k) => k.score > 0 && k.score < 40,
  ).length;
  const untouched = total - strong - developing - attention;

  return (
    <div>
      <Nav />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <ProfileSummary profile={profile} />
          </div>
          <StatTile label="Strong" value={strong} accent="text-emerald-600" />
          <StatTile label="Developing" value={developing} accent="text-amber-600" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <StatTile label="Needs attention" value={attention} accent="text-signal-p1" />
          <StatTile label="Not started" value={untouched} accent="text-ink-muted" />
          <div className="md:col-span-2 rounded-2xl border border-black/5 bg-white p-5 shadow-card">
            <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
              Progress
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/5">
              <div
                className="h-full rounded-full bg-signal-accent transition-all"
                style={{ width: `${Math.round((strong / total) * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-ink-muted">
              {strong}/{total} concepts at strong ·{" "}
              {Math.round((strong / total) * 100)}% of the tracked graph
            </div>
          </div>
        </div>

        <section className="mt-8">
          <KnowledgeGraph progress={progress} />
        </section>

        <section className="mt-10">
          <RoadmapCard items={roadmap} progress={progress} />
        </section>

        <div className="mt-10 flex items-center justify-center text-xs text-ink-muted">
          <Link href="/dashboard" className="hover:text-ink">
            ← Back to today
          </Link>
        </div>
      </main>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</div>
    </div>
  );
}
