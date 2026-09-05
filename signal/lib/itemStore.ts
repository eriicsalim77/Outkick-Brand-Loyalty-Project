// Simple in-memory store for EnhancedTrendingItems, keyed by item id.
// Used across /api/trending and /api/live/[id] so a live-signal detail
// page can find an item enhanced during a dashboard fetch.
//
// TTL is 60 minutes — long enough that a user reading a lesson doesn't
// lose access; short enough that stale items eventually leave the store.
// A server restart clears everything, which is fine.

import type { EnhancedTrendingItem } from "./types";

const TTL_MS = 60 * 60 * 1000;

interface Slot {
  at: number;
  item: EnhancedTrendingItem;
}

const STORE = new Map<string, Slot>();

function gc(now: number) {
  for (const [id, slot] of STORE) {
    if (now - slot.at > TTL_MS) STORE.delete(id);
  }
}

export const itemStore = {
  get(id: string): EnhancedTrendingItem | undefined {
    const slot = STORE.get(id);
    if (!slot) return undefined;
    if (Date.now() - slot.at > TTL_MS) {
      STORE.delete(id);
      return undefined;
    }
    return slot.item;
  },
  set(item: EnhancedTrendingItem): void {
    const now = Date.now();
    STORE.set(item.id, { at: now, item });
    if (STORE.size > 200) gc(now);
  },
  size(): number {
    return STORE.size;
  },
};
