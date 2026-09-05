"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import {
  grantPro,
  refreshEntitlement,
  revokePro,
  useIsPro,
} from "@/lib/entitlements";
import {
  ensureConfigured,
  getOfferings,
  hasRcKey,
  PACKAGE_IDS,
  purchasePackage,
  type PackageId,
} from "@/lib/rc";
import type { Offerings, Package } from "@revenuecat/purchases-js";

const PRO_FEATURES = [
  {
    title: "Full Trending feed",
    body: "See every ranked signal, every day — not just the top 3. When breaking news drops, you don't wait.",
  },
  {
    title: "Full roadmap depth",
    body: "See the next 10 concepts on your path, not just the next 3. Plan a quarter of learning, not a week.",
  },
  {
    title: "LLM-authored learning cards",
    body: "Every live signal gets a personalised 'why this matters' and short lesson, written for your role.",
  },
  {
    title: "Priority refresh",
    body: "Trending refreshes every 5 minutes for Pro instead of every 15. First to know is worth something.",
  },
];

const PACKAGE_LABEL: Record<PackageId, string> = {
  lifetime: "Lifetime",
  yearly: "Yearly",
  monthly: "Monthly",
};

const PACKAGE_SUB: Record<PackageId, string> = {
  lifetime: "One-time · never expires",
  yearly: "Save vs. monthly",
  monthly: "Cancel anytime",
};

// Extract a display-friendly price from an RC package.
function priceLabel(pkg: Package): string {
  try {
    const price = pkg.rcBillingProduct?.currentPrice ?? pkg.webBillingProduct?.currentPrice;
    if (!price) return "";
    return price.formattedPrice ?? "";
  } catch {
    return "";
  }
}

export default function Upgrade() {
  const pro = useIsPro();
  const router = useRouter();

  const rcOn = hasRcKey();
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [loading, setLoading] = useState(rcOn);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<PackageId | null>(null);

  useEffect(() => {
    if (!rcOn) return;
    (async () => {
      await ensureConfigured();
      const o = await getOfferings();
      if (!o) setError("Couldn't load offerings from RevenueCat.");
      setOfferings(o);
      setLoading(false);
    })();
  }, [rcOn]);

  // Map RC packages to our three known ids so we can render them consistently.
  const packagesByKey = useMemo(() => {
    const out: Partial<Record<PackageId, Package>> = {};
    const list = offerings?.current?.availablePackages ?? [];
    for (const pkg of list) {
      const id = pkg.identifier as PackageId;
      if (PACKAGE_IDS.includes(id)) out[id] = pkg;
    }
    return out;
  }, [offerings]);

  async function onBuy(id: PackageId) {
    const pkg = packagesByKey[id];
    if (!pkg) {
      setError(`Package "${id}" is not in the current RevenueCat offering.`);
      return;
    }
    setPurchasing(id);
    setError(null);
    const result = await purchasePackage(pkg);
    setPurchasing(null);
    if (result.success && result.entitlementActive) {
      await refreshEntitlement();
      router.push("/dashboard");
      return;
    }
    if (result.error) setError(result.error);
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
            Pro removes the free-tier limits on Trending and the roadmap,
            refreshes faster, and generates LLM-authored learning cards for
            every live signal. The free tier keeps the core loop — one Today's
            Pick and a starter roadmap.
          </p>
        </header>

        {/* Feature list — value prop above the fold */}
        <section className="mt-10 rounded-3xl border border-black/5 bg-white p-8 shadow-hero">
          <ul className="grid gap-5 sm:grid-cols-2">
            {PRO_FEATURES.map((f) => (
              <li key={f.title} className="grid grid-cols-[auto_1fr] items-start gap-3">
                <span className="mt-1.5 inline-block h-2 w-2 flex-none rounded-full bg-signal-accent" />
                <div>
                  <div className="font-semibold text-ink">{f.title}</div>
                  <div className="mt-0.5 text-sm text-ink-muted">{f.body}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Pricing */}
        <section className="mt-8">
          {pro ? (
            <div className="rounded-2xl border border-signal-accent/30 bg-signal-accent/5 p-6">
              <div className="text-lg font-semibold text-signal-accent">
                You're on Signal Pro. Thanks for supporting the product.
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                Manage your subscription from your RevenueCat customer portal (link
                emailed at purchase). Or reset here for testing:
              </p>
              {!rcOn && (
                <button
                  onClick={revokePro}
                  className="mt-3 rounded-full border border-black/10 px-4 py-2 text-sm text-ink hover:bg-white"
                >
                  Cancel (dev-only: reset local flag)
                </button>
              )}
            </div>
          ) : (
            <>
              {loading && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-52 animate-pulse rounded-2xl bg-paper-soft" />
                  ))}
                </div>
              )}

              {!loading && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {PACKAGE_IDS.map((id) => {
                    const pkg = packagesByKey[id];
                    const isRecommended = id === "yearly";
                    return (
                      <div
                        key={id}
                        className={
                          "relative rounded-2xl border bg-white p-6 shadow-card " +
                          (isRecommended
                            ? "border-signal-accent/40 shadow-hero"
                            : "border-black/5")
                        }
                      >
                        {isRecommended && (
                          <div className="absolute right-4 top-4 rounded-full bg-signal-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-white">
                            Recommended
                          </div>
                        )}
                        <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
                          {PACKAGE_LABEL[id]}
                        </div>
                        <div className="mt-2 text-2xl font-semibold">
                          {rcOn && pkg ? priceLabel(pkg) || "—" : "—"}
                        </div>
                        <div className="text-xs text-ink-muted">{PACKAGE_SUB[id]}</div>

                        {rcOn ? (
                          <button
                            onClick={() => onBuy(id)}
                            disabled={!pkg || purchasing !== null}
                            className={
                              "mt-6 w-full rounded-full px-4 py-2.5 text-sm font-medium disabled:opacity-40 " +
                              (isRecommended
                                ? "bg-ink text-paper hover:bg-ink-soft"
                                : "border border-black/10 text-ink hover:bg-paper-soft")
                            }
                          >
                            {purchasing === id
                              ? "Opening checkout…"
                              : pkg
                                ? `Get ${PACKAGE_LABEL[id]}`
                                : "Package not in offering"}
                          </button>
                        ) : (
                          <button
                            onClick={grantPro}
                            className={
                              "mt-6 w-full rounded-full px-4 py-2.5 text-sm font-medium " +
                              (isRecommended
                                ? "bg-ink text-paper hover:bg-ink-soft"
                                : "border border-black/10 text-ink hover:bg-paper-soft")
                            }
                          >
                            Simulate purchase (dev)
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-signal-p1/20 bg-signal-p1/5 p-4 text-sm text-signal-p1">
                  {error}
                </div>
              )}
            </>
          )}
        </section>

        {/* Config panel — tells you which mode you're in */}
        <section className="mt-10 rounded-2xl border border-dashed border-black/15 bg-paper-soft p-5 text-xs text-ink-muted">
          <div className="font-semibold uppercase tracking-widest text-ink">
            {rcOn ? "RevenueCat mode" : "Dev-fallback mode"}
          </div>
          {rcOn ? (
            <p className="mt-1">
              Live RevenueCat integration. Purchases open the checkout,
              entitlements flow from CustomerInfo.entitlements.active
              [signal_pro], and everything in the app that reads useIsPro()
              picks up the change automatically.
            </p>
          ) : (
            <p className="mt-1">
              NEXT_PUBLIC_RC_WEB_KEY is not set. The Upgrade buttons flip a
              local flag — no network call, nothing charges. Set the env var to
              switch to real RevenueCat purchases.
            </p>
          )}
          {!rcOn && (
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
          )}
        </section>
      </main>
    </div>
  );
}
