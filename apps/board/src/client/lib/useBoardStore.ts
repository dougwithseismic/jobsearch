import { useSyncExternalStore } from "react";
import {
  getSeen,
  addSeen,
  getShortlist,
  toggleShortlist as toggleShortlistStorage,
  getHidden,
  addHidden,
  removeHidden,
} from "./storage";

// Simple external store for localStorage-backed sets so multiple components stay in sync
let seenSnapshot = getSeen();
let shortlistSnapshot = getShortlist();
let hiddenSnapshot = getHidden();
const seenListeners = new Set<() => void>();
const shortlistListeners = new Set<() => void>();
const hiddenListeners = new Set<() => void>();

function notifyAll(listeners: Set<() => void>) {
  listeners.forEach((l) => l());
}

export function markSeen(id: string) {
  addSeen(id);
  seenSnapshot = getSeen();
  notifyAll(seenListeners);
}

export function toggleShortlistItem(id: string): boolean {
  // Remove from hidden if shortlisting
  if (!getShortlist().has(id)) {
    removeHidden(id);
    hiddenSnapshot = getHidden();
    notifyAll(hiddenListeners);
  }
  const added = toggleShortlistStorage(id);
  shortlistSnapshot = getShortlist();
  notifyAll(shortlistListeners);
  return added;
}

export function toggleHiddenJob(id: string) {
  const current = getHidden();
  if (current.has(id)) {
    removeHidden(id);
  } else {
    addHidden(id);
    // Remove from shortlist if hiding
    if (getShortlist().has(id)) {
      toggleShortlistStorage(id);
      shortlistSnapshot = getShortlist();
      notifyAll(shortlistListeners);
    }
  }
  hiddenSnapshot = getHidden();
  notifyAll(hiddenListeners);
}

export function useSeenSet(): Set<string> {
  return useSyncExternalStore(
    (cb) => {
      seenListeners.add(cb);
      return () => seenListeners.delete(cb);
    },
    () => seenSnapshot
  );
}

export function useShortlistSet(): Set<string> {
  return useSyncExternalStore(
    (cb) => {
      shortlistListeners.add(cb);
      return () => shortlistListeners.delete(cb);
    },
    () => shortlistSnapshot
  );
}

export function useHiddenSet(): Set<string> {
  return useSyncExternalStore(
    (cb) => {
      hiddenListeners.add(cb);
      return () => hiddenListeners.delete(cb);
    },
    () => hiddenSnapshot
  );
}

// Highlight index state (shared via a simple hook)
let highlightIndex: number | null = null;
const highlightListeners = new Set<() => void>();

export function setHighlightIndex(idx: number | null) {
  highlightIndex = idx;
  notifyAll(highlightListeners);
}

export function getHighlightIndex(): number | null {
  return highlightIndex;
}

export function useHighlightIndex(): [number | null, (idx: number | null) => void] {
  const idx = useSyncExternalStore(
    (cb) => {
      highlightListeners.add(cb);
      return () => highlightListeners.delete(cb);
    },
    () => highlightIndex
  );
  return [idx, setHighlightIndex];
}

// Search focus state — when true, WASD navigation is disabled
let searchFocused = false;
const searchFocusListeners = new Set<() => void>();

export function setSearchFocused(focused: boolean) {
  searchFocused = focused;
  notifyAll(searchFocusListeners);
}

export function useSearchFocused(): boolean {
  return useSyncExternalStore(
    (cb) => {
      searchFocusListeners.add(cb);
      return () => searchFocusListeners.delete(cb);
    },
    () => searchFocused
  );
}
