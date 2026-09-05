"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { LiveSignalView } from "@/components/LiveSignalView";
import { loadProfile } from "@/lib/storage";
import type { EnhancedTrendingItem, Profile } from "@/lib/types";

export default function LiveSignalPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [item, setItem] = useState<EnhancedTrendingItem | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing" | "error">("loading");
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);
  }, [router]);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const res = await fetch(`/api/live/${encodeURIComponent(params.id as string)}`, {
          cache: "no-store",
        });
        if (res.status === 404) {
          setState("missing");
          return;
        }
        if (!res.ok) {
          setErrorText(`HTTP ${res.status}`);
          setState("error");
          return;
        }
        const json = (await res.json()) as { item: EnhancedTrendingItem };
        setItem(json.item);
        setState("ok");
      } catch (e) {
        setErrorText((e as Error).message);
        setState("error");
      }
    })();
  }, [params.id]);

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        {state === "loading" && (
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-20 rounded bg-black/10" />
            <div className="h-10 w-full rounded bg-black/10" />
            <div className="h-4 w-2/3 rounded bg-black/10" />
            <div className="mt-8 h-32 w-full rounded-2xl bg-black/5" />
          </div>
        )}

        {state === "missing" && (
          <div className="rounded-2xl border border-dashed border-black/15 bg-paper-soft p-6">
            <div className="text-lg font-semibold">This live signal expired</div>
            <p className="mt-2 text-sm text-ink-muted">
              Live signals live in memory on the server for an hour. Head back to
              the dashboard — the next Trending fetch will re-index it (or a
              fresher one will take its place).
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
            >
              Back to today
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl border border-signal-p1/20 bg-signal-p1/5 p-6 text-sm text-signal-p1">
            Couldn't load this signal: {errorText}
          </div>
        )}

        {state === "ok" && item && profile && (
          <LiveSignalView item={item} role={profile.role} />
        )}
      </main>
    </div>
  );
}
