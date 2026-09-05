"use client";

// Pro-state gate.
//
// Right now this reads a local flag stored in localStorage. When we swap in
// RevenueCat's Web SDK later, the ONLY thing that changes is the body of
// isPro() / grantPro() / revokePro() — every caller in the app is already
// going through this module, so no UI code needs to change.
//
// Migration sketch (later):
//   import { Purchases } from "@revenuecat/purchases-js";
//   const rc = await Purchases.configure({
//     apiKey: process.env.NEXT_PUBLIC_RC_WEB_KEY!,
//     appUserId: getOrCreateAppUserId(),
//   });
//   isPro() -> (await rc.getCustomerInfo()).entitlements.active["pro"] !== undefined

const KEY = "signal.entitlement.pro.v1";
const USER_ID_KEY = "signal.app_user_id.v1";
const EVENT = "signal.entitlement.changed";

export function isPro(): boolean {
  if (typeof window === "undefined") return false;
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

// A stable per-browser id we'll hand to RevenueCat as app_user_id when we
// wire the SDK. Anonymous today; the same id gets logIn()'d to the real user
// id when we add auth later, so entitlements carry over.
export function getOrCreateAppUserId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = window.localStorage.getItem(USER_ID_KEY);
    if (existing) return existing;
    const fresh =
      "anon_" +
      Math.random().toString(36).slice(2, 10) +
      Math.random().toString(36).slice(2, 10);
    window.localStorage.setItem(USER_ID_KEY, fresh);
    return fresh;
  } catch {
    return "anon_fallback";
  }
}

// Subscribe to entitlement changes (from other tabs or same-tab grant/revoke).
export function onEntitlementChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) cb();
  });
  return () => {
    window.removeEventListener(EVENT, handler);
  };
}

// Handy hook-style reader.
import { useEffect, useState } from "react";
export function useIsPro(): boolean {
  const [pro, setPro] = useState(false);
  useEffect(() => {
    setPro(isPro());
    return onEntitlementChange(() => setPro(isPro()));
  }, []);
  return pro;
}
