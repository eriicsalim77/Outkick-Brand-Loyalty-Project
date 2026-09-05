"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { loadProfile } from "@/lib/storage";

export default function Landing() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loadProfile()) router.replace("/dashboard");
    else setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="flex items-center justify-between">
        <Logo />
        <Link
          href="/onboarding"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft"
        >
          Get started
        </Link>
      </header>

      <section className="mt-20 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-ink-muted">
          Personalised tech learning
        </p>
        <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          You don't need to know everything happening in tech.
          <span className="text-ink-muted"> You need to know what matters to you.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-muted">
          Signal watches the technology developments that matter to your role,
          filters the noise, and turns the two or three you actually need to
          understand into short, structured lessons.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/onboarding"
            className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink-soft"
          >
            Set up in 60 seconds
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-ink hover:bg-white"
          >
            See a sample dashboard
          </Link>
        </div>
      </section>

      <section className="mt-24 grid gap-6 md:grid-cols-3">
        {[
          {
            n: "01",
            title: "Signals, not headlines",
            body: "We ingest primary sources — company announcements, docs, changelogs — and filter for what actually matters to your role.",
          },
          {
            n: "02",
            title: "Personal priority",
            body: "Each development gets a P1 / P2 / P3 tag tuned to your role, industry, and technical level.",
          },
          {
            n: "03",
            title: "Learn, don't skim",
            body: "Short lessons on the underlying concepts, ending in a quiz that updates your knowledge map.",
          },
        ].map((c) => (
          <div
            key={c.n}
            className="rounded-2xl border border-black/5 bg-white p-6 shadow-card"
          >
            <div className="text-xs font-medium tracking-widest text-ink-muted">
              {c.n}
            </div>
            <h3 className="mt-3 text-lg font-semibold">{c.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{c.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-24 rounded-3xl border border-black/5 bg-white p-10 shadow-hero">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-ink-muted">
              How it's different
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Not a news reader. Not another chatbot.
            </h2>
            <p className="mt-4 text-ink-muted">
              Signal maintains a persistent model of who you are, what you
              already know, and where you want to go. Every development in the
              world is scored against that model.
            </p>
            <p className="mt-3 text-ink-muted">
              You get a curriculum that updates itself as the technology
              landscape moves.
            </p>
          </div>
          <div className="rounded-2xl bg-paper-soft p-6 text-sm text-ink">
            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-muted">
              Example
            </div>
            <div className="text-base font-semibold">
              GTM · AI infrastructure startup · Beginner
            </div>
            <div className="mt-4 space-y-2 text-ink-muted">
              <div>14 developments today.</div>
              <div className="text-ink">Filtered to 3.</div>
              <div>Your P1: MCP — why it matters, and how to talk about it.</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-16 flex items-center justify-between text-xs text-ink-muted">
        <span>Signal — a personal technical curriculum.</span>
        <span>Built for GTM, RevOps, and FDE roles.</span>
      </footer>
    </div>
  );
}
