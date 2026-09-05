"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { grantPro, revokePro, useIsPro } from "@/lib/entitlements";

const PRO_FEATURES = [
  {
    title: "Full Trending feed",
    body: "See every signal we rank, every day — not just the top 3. When breaking news drops, you don't wait to hear about it.",
  },
  {
    title: "Full roadmap depth",
    body: "See the next 10 concepts on your path, not just the next 3. Plan a quarter of learning, not a week.",
  },
  {
    title: "Priority updates",
    body: "Trending refreshes every 5 minutes for Pro instead of every 15. First to know is worth something.",
  },
  {
    title: "Downloadable briefings",
    body: "Export any signal or lesson as a shareable PDF — great for internal notes and account plans.",
  },
];

export default function Upgrade() {
  const pro = useIsPro();
  const router = useRouter();

  function purchase() {
    // In production this becomes:
    //   await Purchases.getSharedInstance().purchase({ packageIdentifier: "pro_monthly" })
    // For now: flip the local flag.
    grantPro();
    router.push("/dashboard");
  }

  return (
    <div>
      <Nav />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink">
          ← Back to today
        </Link>

        <header className="mt-6">
          <div className="text-[11px] font-medium uppercase tracking-widest text-signal-accent">
            Signal Pro
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Stay ahead, not just informed.
          </h1>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Pro removes the free-tier limits on Trending and Roadmap, refreshes
            faster, and lets you export anything you learn. The free tier keeps
            the core loop — one Today's Pick and a starter roadmap.
          </p>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-card">
            <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
              Free
            </div>
            <div className="mt-2 text-3xl font-semibold">$0</div>
            <div className="text-sm text-ink-muted">forever</div>
            <ul className="mt-6 space-y-3 text-sm text-ink">
              <Bullet>Today's Pick, tuned to your role</Bullet>
              <Bullet>Top 3 Trending items</Bullet>
              <Bullet>Your Roadmap — next 3 concepts</Bullet>
              <Bullet>Full lesson library and quizzes</Bullet>
              <Bullet>Knowledge map, view-only</Bullet>
            </ul>
          </div>

          <div className="relative rounded-3xl border border-signal-accent/40 bg-white p-8 shadow-hero">
            <div className="absolute right-6 top-6 rounded-full bg-signal-accent px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest text-white">
              Recommended
            </div>
            <div className="text-[11px] font-medium uppercase tracking-widest text-signal-accent">
              Pro
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-semibold">$9</span>
              <span className="text-sm text-ink-muted">/month</span>
            </div>
            <div className="text-sm text-ink-muted">or $79/yr — save 27%</div>

            <ul className="mt-6 space-y-3 text-sm text-ink">
              {PRO_FEATURES.map((f) => (
                <li key={f.title} className="grid grid-cols-[auto_1fr] items-start gap-3">
                  <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-signal-accent" />
                  <div>
                    <div className="font-semibold text-ink">{f.title}</div>
                    <div className="mt-0.5 text-ink-muted">{f.body}</div>
                  </div>
                </li>
              ))}
            </ul>

            {pro ? (
              <div className="mt-8">
                <div className="rounded-2xl bg-signal-accent/10 p-4 text-sm text-signal-accent">
                  You're on Pro. Thanks for supporting Signal.
                </div>
                <button
                  onClick={revokePro}
                  className="mt-3 w-full rounded-full border border-black/10 px-5 py-3 text-sm text-ink hover:bg-paper-soft"
                >
                  Cancel (dev-only: reset entitlement)
                </button>
              </div>
            ) : (
              <button
                onClick={purchase}
                className="mt-8 w-full rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink-soft"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-black/15 bg-paper-soft p-5 text-xs text-ink-muted">
          <div className="font-semibold uppercase tracking-widest text-ink">
            Dev-only
          </div>
          <p className="mt-1">
            The Upgrade button flips a local <code>pro</code> flag in
            localStorage — no charge, no network call. When we wire the
            RevenueCat Web SDK, only <code>lib/entitlements.ts</code> changes;
            every gate in the app already reads through it.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={grantPro}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-ink hover:border-ink/40"
            >
              Force Pro on
            </button>
            <button
              onClick={revokePro}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-ink hover:border-ink/40"
            >
              Force Pro off
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[auto_1fr] items-start gap-3">
      <span className="mt-1.5 inline-block h-2 w-2 rounded-full bg-ink/40" />
      <span>{children}</span>
    </li>
  );
}
