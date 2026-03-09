import { useState, useMemo, useSyncExternalStore, useCallback } from "react";
import { useSearchParams } from "react-router";

interface SavedSearch {
  name: string;
  params: string; // URLSearchParams string
}

const STORAGE_KEY = "board-saved-searches";
const MAX_SAVED = 10;

// Params that constitute an "active filter" (not just pagination/sorting metadata)
const FILTER_KEYS = ["q", "remote", "region", "source", "since", "includeStale"];

function loadSaved(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_SAVED) : [];
  } catch {
    return [];
  }
}

function persistSaved(searches: SavedSearch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches.slice(0, MAX_SAVED)));
}

// External store for reactivity
let savedSnapshot = loadSaved();
const savedListeners = new Set<() => void>();

function notifySaved() {
  savedListeners.forEach((l) => l());
}

function addSavedSearch(search: SavedSearch) {
  const current = loadSaved();
  if (current.length >= MAX_SAVED) return false;
  // Don't add duplicates by params
  if (current.some((s) => s.params === search.params)) return false;
  current.push(search);
  persistSaved(current);
  savedSnapshot = current;
  notifySaved();
  return true;
}

function removeSavedSearch(index: number) {
  const current = loadSaved();
  current.splice(index, 1);
  persistSaved(current);
  savedSnapshot = current;
  notifySaved();
}

function useSavedSearches(): SavedSearch[] {
  return useSyncExternalStore(
    (cb) => {
      savedListeners.add(cb);
      return () => savedListeners.delete(cb);
    },
    () => savedSnapshot
  );
}

function generateName(params: URLSearchParams): string {
  const parts: string[] = [];
  const q = params.get("q");
  if (q) parts.push(`"${q}"`);
  if (params.get("remote") === "true") parts.push("Remote");
  const region = params.get("region");
  if (region) parts.push(region.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
  const source = params.get("source");
  if (source) parts.push(source);
  const since = params.get("since");
  if (since) parts.push(`since ${since}`);
  if (params.get("includeStale") === "true") parts.push("+closed");
  return parts.join(" + ") || "All jobs";
}

export function SavedSearches() {
  const [searchParams, setSearchParams] = useSearchParams();
  const saved = useSavedSearches();
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameValue, setNameValue] = useState("");

  // Check if there are active filters
  const hasActiveFilters = useMemo(() => {
    return FILTER_KEYS.some((k) => searchParams.has(k));
  }, [searchParams]);

  // Get only filter params (strip pagination/sorting)
  const filterParamsString = useMemo(() => {
    const p = new URLSearchParams();
    for (const key of FILTER_KEYS) {
      const val = searchParams.get(key);
      if (val) p.set(key, val);
    }
    return p.toString();
  }, [searchParams]);

  const isAlreadySaved = useMemo(() => {
    return saved.some((s) => s.params === filterParamsString);
  }, [saved, filterParamsString]);

  const handleSave = useCallback(() => {
    if (!hasActiveFilters) return;
    const autoName = generateName(searchParams);
    setNameValue(autoName);
    setShowNameInput(true);
  }, [hasActiveFilters, searchParams]);

  const confirmSave = useCallback(() => {
    const name = nameValue.trim() || generateName(searchParams);
    addSavedSearch({ name, params: filterParamsString });
    setShowNameInput(false);
    setNameValue("");
  }, [nameValue, searchParams, filterParamsString]);

  const applySearch = useCallback(
    (paramsStr: string) => {
      const params = new URLSearchParams(paramsStr);
      setSearchParams(params);
    },
    [setSearchParams]
  );

  return (
    <div>
      {/* Save button + name input */}
      <div className="flex items-center gap-2">
        {hasActiveFilters && !isAlreadySaved && saved.length < MAX_SAVED && (
          <>
            {showNameInput ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmSave();
                    if (e.key === "Escape") setShowNameInput(false);
                  }}
                  placeholder="Search name..."
                  className="text-xs font-mono px-2 py-1 rounded border border-border bg-bg text-text focus:border-accent focus:outline-none w-48"
                  autoFocus
                />
                <button
                  onClick={confirmSave}
                  className="text-xs font-mono px-2 py-1 rounded border border-accent text-accent hover:bg-accent/10 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowNameInput(false)}
                  className="text-xs font-mono px-1.5 py-1 text-text-muted hover:text-text transition-colors"
                >
                  &times;
                </button>
              </div>
            ) : (
              <button
                onClick={handleSave}
                className="text-[10px] font-mono px-2 py-1 rounded border border-border text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
              >
                Save search
              </button>
            )}
          </>
        )}
      </div>

      {/* Saved search pills */}
      {saved.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {saved.map((s, i) => {
            const isActive = filterParamsString === s.params;
            return (
              <span
                key={`${s.name}-${i}`}
                className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-full border transition-colors ${
                  isActive
                    ? "bg-accent-vivid/20 border-accent-vivid text-accent"
                    : "border-border text-text-secondary hover:border-accent/50 hover:text-accent cursor-pointer"
                }`}
              >
                <span onClick={() => applySearch(s.params)}>{s.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSavedSearch(i);
                  }}
                  className="text-text-muted hover:text-text transition-colors ml-0.5"
                  title="Remove saved search"
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
