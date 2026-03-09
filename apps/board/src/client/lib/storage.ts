// LocalStorage persistence for board state

const KEYS = {
  seen: "board-seen",
  shortlist: "board-shortlist",
  hidden: "board-hidden",
} as const;

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>): void {
  localStorage.setItem(key, JSON.stringify([...set]));
}

export function getSeen(): Set<string> {
  return loadSet(KEYS.seen);
}

export function addSeen(id: string): void {
  const set = loadSet(KEYS.seen);
  set.add(id);
  saveSet(KEYS.seen, set);
}

export function getShortlist(): Set<string> {
  return loadSet(KEYS.shortlist);
}

export function toggleShortlist(id: string): boolean {
  const set = loadSet(KEYS.shortlist);
  if (set.has(id)) {
    set.delete(id);
    saveSet(KEYS.shortlist, set);
    return false;
  } else {
    set.add(id);
    saveSet(KEYS.shortlist, set);
    return true;
  }
}

export function removeShortlist(id: string): void {
  const set = loadSet(KEYS.shortlist);
  set.delete(id);
  saveSet(KEYS.shortlist, set);
}

export function getHidden(): Set<string> {
  return loadSet(KEYS.hidden);
}

export function addHidden(id: string): void {
  const set = loadSet(KEYS.hidden);
  set.add(id);
  saveSet(KEYS.hidden, set);
}

export function removeHidden(id: string): void {
  const set = loadSet(KEYS.hidden);
  set.delete(id);
  saveSet(KEYS.hidden, set);
}
