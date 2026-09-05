"use client";

// Thin, side-effect-safe wrapper around the RevenueCat Web Billing SDK.
// The SDK is loaded lazily (dynamic import) the first time we actually
// need it — configuring, purchasing, or reading customer info — so pages
// that only check the entitlement don't pay the ~230kB SDK cost until the
// user actually clicks Upgrade.
//
// Everything here is a no-op when NEXT_PUBLIC_RC_WEB_KEY is missing.
//
// Only lib/entitlements.ts and app/upgrade/page.tsx import this — no
// other file needs to know RevenueCat exists.

import type {
  CustomerInfo,
  Offerings,
  Package,
} from "@revenuecat/purchases-js";
import { getOrCreateAppUserId } from "./appUserId";

export const ENTITLEMENT_ID = "signal_pro";
export const PACKAGE_IDS = ["lifetime", "yearly", "monthly"] as const;
export type PackageId = (typeof PACKAGE_IDS)[number];

let latestCustomerInfo: CustomerInfo | null = null;
let configurePromise: Promise<boolean> | null = null;
const listeners = new Set<() => void>();

export function rcKey(): string | undefined {
  return process.env.NEXT_PUBLIC_RC_WEB_KEY;
}

export function hasRcKey(): boolean {
  return Boolean(rcKey());
}

function notify() {
  for (const cb of Array.from(listeners)) {
    try {
      cb();
    } catch {}
  }
}

export function subscribeRc(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// Dynamic import — the RC SDK only enters the JS bundle at the first call.
async function loadSdk() {
  const mod = await import("@revenuecat/purchases-js");
  return mod.Purchases;
}

export async function ensureConfigured(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const key = rcKey();
  if (!key) return false;
  if (configurePromise) return configurePromise;

  configurePromise = (async () => {
    try {
      const Purchases = await loadSdk();
      if (!Purchases.isConfigured()) {
        Purchases.configure({ apiKey: key, appUserId: getOrCreateAppUserId() });
      }
      latestCustomerInfo = await Purchases.getSharedInstance().getCustomerInfo();
      notify();
      return true;
    } catch (err) {
      console.warn("[rc] configure failed:", (err as Error).message);
      return false;
    }
  })();

  return configurePromise;
}

export function currentCustomerInfo(): CustomerInfo | null {
  return latestCustomerInfo;
}

export function rcEntitlementActive(id: string = ENTITLEMENT_ID): boolean {
  const info = latestCustomerInfo;
  if (!info) return false;
  return Boolean(info.entitlements.active[id]);
}

export async function getOfferings(): Promise<Offerings | null> {
  const ready = await ensureConfigured();
  if (!ready) return null;
  try {
    const Purchases = await loadSdk();
    return await Purchases.getSharedInstance().getOfferings();
  } catch (err) {
    console.warn("[rc] getOfferings failed:", (err as Error).message);
    return null;
  }
}

export interface PurchaseAttempt {
  success: boolean;
  entitlementActive: boolean;
  error?: string;
}

export async function purchasePackage(pkg: Package): Promise<PurchaseAttempt> {
  const ready = await ensureConfigured();
  if (!ready) {
    return {
      success: false,
      entitlementActive: false,
      error: "RevenueCat is not configured. Set NEXT_PUBLIC_RC_WEB_KEY.",
    };
  }
  try {
    const Purchases = await loadSdk();
    const result = await Purchases.getSharedInstance().purchase({ rcPackage: pkg });
    latestCustomerInfo = result.customerInfo;
    notify();
    return {
      success: true,
      entitlementActive: rcEntitlementActive(),
    };
  } catch (err) {
    // RC throws for user-cancellation too — surface a clean message.
    return {
      success: false,
      entitlementActive: rcEntitlementActive(),
      error: (err as Error).message,
    };
  }
}

export async function refreshCustomerInfo(): Promise<CustomerInfo | null> {
  const ready = await ensureConfigured();
  if (!ready) return null;
  try {
    const Purchases = await loadSdk();
    latestCustomerInfo = await Purchases.getSharedInstance().getCustomerInfo();
    notify();
    return latestCustomerInfo;
  } catch {
    return null;
  }
}
