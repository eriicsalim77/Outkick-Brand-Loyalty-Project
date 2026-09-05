"use client";

import type { Profile, Progress } from "./types";

const PROFILE_KEY = "signal.profile.v1";
const PROGRESS_KEY = "signal.progress.v1";

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
  window.localStorage.removeItem(PROGRESS_KEY);
}

export function loadProgress(): Progress {
  const empty: Progress = {
    streak: 0,
    lastActiveDate: "",
    completedLessons: [],
    skippedSignals: [],
    knowledge: {},
  };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return empty;
    return { ...empty, ...(JSON.parse(raw) as Progress) };
  } catch {
    return empty;
  }
}

export function saveProgress(p: Progress): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}
