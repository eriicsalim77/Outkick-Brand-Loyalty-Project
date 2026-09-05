"use client";

// Pro-state gate.
//
// - When NEXT_PUBLIC_RC_WEB_KEY is set, this reads the "signal_pro"
//   entitlement from RevenueCat's Web Billing SDK (via lib/rc.ts).
// - When it's not set, it reads a local flag in localStorage as a
//   dev-only fallback. grantPro() / revokePro() only affect that
//   fallback — RC entitlements are the source of truth in production.

import { useEffect, useState } from "react";
import {
  ensureConfigured,
  hasRcKey,
  rcEntitlementActive,
  subscribeRc,
  refreshCustomerInfo,
} from "./rc";
export { getOrCreateAppUserId } from "./appUserId";

const KEY = "signal.entitlement.pro.v1";
const EVENT = "signal.entitlement.changed";

// -- dev fallback (only used when RC is not configured) ----------------

export function isPro(): boolean {
  if (typeof window === "undefined") return false;
  if (hasRcKey()) return rcEntitlementActive();
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function grantPro(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "1");
  window.dispatchEvent(new Event(EVENT));
}

export function revokePro(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

// -- change subscription -----------------------------------------------

// Fire cb whenever the Pro state might have changed. Combines RC
// customer-info updates with localStorage changes from other tabs and
// same-tab grant/revoke events, so a single subscriber covers both worlds.
export function onEntitlementChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", storageHandler);
  const rcUnsub = subscribeRc(handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", storageHandler);
    rcUnsub();
  };
}

export function useIsPro(): boolean {
  const [pro, setPro] = useState(false);
  useEffect(() => {
    // Fire-and-forget RC configure. When it lands, subscribeRc → notify → setPro.
    if (hasRcKey()) {
      ensureConfigured().then(() => setPro(isPro()));
    } else {
      setPro(isPro());
    }
    return onEntitlementChange(() => setPro(isPro()));
  }, []);
  return pro;
}

// Handy for the /upgrade page after a purchase completes.
export async function refreshEntitlement(): Promise<void> {
  if (hasRcKey()) await refreshCustomerInfo();
}
