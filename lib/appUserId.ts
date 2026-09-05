"use client";

// A stable per-browser id used as RevenueCat's app_user_id. Anonymous today
// so we don't need auth; when you add real auth later, call
//   Purchases.getSharedInstance().changeUser(realUserId)
// and RC will migrate this anonymous user's entitlements to the real one.

const USER_ID_KEY = "signal.app_user_id.v1";

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
