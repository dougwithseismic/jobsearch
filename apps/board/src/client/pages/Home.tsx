import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { SearchBar } from "../components/SearchBar";
import { Filters } from "../components/Filters";
import { Pagination } from "../components/Pagination";
import { PreviewPanel } from "../components/PreviewPanel";
import { ShortcutsModal } from "../components/ShortcutsModal";
import { SavedSearches } from "../components/SavedSearches";
import { LLMBadge } from "../components/LLMBadge";
import { installBoardSDK } from "../lib/board-sdk";
import { timeAgo, getSourceColor } from "../lib/utils";
import {
  useSeenSet,
  useShortlistSet,
  useHiddenSet,
  useHighlightIndex,
  toggleShortlistItem,
  toggleHiddenJob,
  setHighlightIndex,
  markSeen,
  useSearchFocused,
} from "../lib/useBoardStore";

interface Job {
  id: string;
  source: string;
  company: string;
  companySlug: string;
  title: string;
  location: string;
  isRemote: boolean;
  department: string;
  publishedAt: string;
  applyUrl: string;
  jobUrl: string;
  isStale?: boolean;
}

interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
  nextCursor?: string;
  prevCursor?: string;
}

const ROW_HEIGHT = 48;

const columnHelper = createColumnHelper<Job>();

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showShortlistView, setShowShortlistView] = useState(false);
  const [pendingHighlight, setPendingHighlight] = useState<"first" | "last" | null>(null);
  const abortRef = useRef<AbortController>(undefined);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const seenSet = useSeenSet();
  const shortlistSet = useShortlistSet();
  const hiddenSet = useHiddenSet();
  const [highlightIdx, setHighlightIdx] = useHighlightIndex();
  const isSearchFocused = useSearchFocused();

  // Derive sorting state from URL params (server-side sorting)
  const sorting = useMemo<SortingState>(() => {
    const sort = searchParams.get("sort");
    const order = searchParams.get("order");
    if (sort) {
      // Map API column names to table column IDs
      const columnMap: Record<string, string> = {
        published_at: "publishedAt",
        company: "company",
        title: "title",
        location: "location",
        source: "source",
      };
      const columnId = columnMap[sort] || sort;
      return [{ id: columnId, desc: order !== "asc" }];
    }
    return [{ id: "publishedAt", desc: true }];
  }, [searchParams]);

  // Handle sorting change — update URL params for server-side sorting
  const handleSortingChange = useCallback(
    (updater: SortingState | ((prev: SortingState) => SortingState)) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      const params = new URLSearchParams(searchParams);

      if (newSorting.length > 0) {
        const { id, desc } = newSorting[0];
        // Map table column IDs to API column names
        const apiMap: Record<string, string> = {
          publishedAt: "published_at",
          company: "company",
          title: "title",
          location: "location",
          source: "source",
        };
        const apiColumn = apiMap[id] || id;
        params.set("sort", apiColumn);
        params.set("order", desc ? "desc" : "asc");
      } else {
        params.delete("sort");
        params.delete("order");
      }
      // Reset pagination on sort change
      params.delete("page");
      params.delete("cursor");
      params.delete("direction");
      setSearchParams(params);
    },
    [sorting, searchParams, setSearchParams]
  );

  // Fetch data
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    const q = searchParams.get("q");
    const endpoint = q ? "/api/search" : "/api/jobs";
    const url = `${endpoint}?${searchParams.toString()}`;

    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        setData(json as JobsResponse);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [searchParams]);

  // All jobs from data
  const allJobs = data ? data.jobs : [];

  // Shortlist-only view
  const displayJobs = useMemo(
    () =>
      showShortlistView
        ? allJobs.filter((j) => shortlistSet.has(j.id))
        : allJobs,
    [allJobs, showShortlistView, shortlistSet]
  );

  // Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor("company", {
        header: "Company",
        size: 180,
        cell: (info) => {
          const job = info.row.original;
          const isShortlisted = shortlistSet.has(job.id);
          return (
            <span className="font-mono text-sm text-accent truncate flex items-center gap-1.5 min-w-0">
              {isShortlisted && (
                <span className="text-accent text-xs shrink-0" title="Shortlisted">
                  &#9733;
                </span>
              )}
              <span className="truncate">{info.getValue()}</span>
            </span>
          );
        },
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor("title", {
        header: "Title",
        size: 9999, // flex
        cell: (info) => (
          <span className="text-sm font-medium text-text group-hover:text-accent transition-colors truncate min-w-0">
            {info.getValue()}
          </span>
        ),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor("location", {
        header: "Location",
        size: 180,
        cell: (info) => (
          <span className="font-mono text-xs text-text-secondary truncate hidden sm:block min-w-0">
            {info.getValue() || "\u2014"}
          </span>
        ),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor("isRemote", {
        header: "Remote",
        size: 70,
        enableSorting: false,
        cell: (info) => (
          <span className="hidden sm:flex items-center">
            {info.getValue() && (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-remote-bg text-remote">
                REMOTE
              </span>
            )}
          </span>
        ),
      }),
      columnHelper.accessor("publishedAt", {
        header: "Date",
        size: 120,
        cell: (info) => {
          const job = info.row.original;
          return (
            <span className="font-mono text-xs text-text-muted hidden sm:flex items-center gap-1.5 whitespace-nowrap truncate min-w-0">
              {timeAgo(info.getValue())}
              {job.isStale && (
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-yellow-900/30 text-yellow-500/80">
                  Likely closed
                </span>
              )}
            </span>
          );
        },
      }),
      columnHelper.accessor("source", {
        header: "Source",
        size: 90,
        cell: (info) => {
          const source = info.getValue();
          return (
            <span
              className="hidden sm:inline-block text-[10px] font-mono font-medium px-1.5 py-0.5 rounded truncate min-w-0"
              style={{
                color: getSourceColor(source),
                backgroundColor: `${getSourceColor(source)}15`,
              }}
            >
              {source}
            </span>
          );
        },
        sortingFn: "alphanumeric",
      }),
    ],
    [shortlistSet]
  );

  // TanStack Table instance — manualSorting: server handles sort order
  const table = useReactTable({
    data: displayJobs,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const sortedRows = table.getRowModel().rows;

  const page = Number(searchParams.get("page")) || 1;

  // The highlighted job (for preview) — use sorted rows
  const highlightedJob =
    highlightIdx !== null && sortedRows[highlightIdx]
      ? sortedRows[highlightIdx].original
      : null;

  // Virtualizer
  const virtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  // Apply pending highlight after page navigation
  useEffect(() => {
    if (pendingHighlight && data && !loading) {
      if (pendingHighlight === "first") {
        setHighlightIdx(0);
      } else if (pendingHighlight === "last") {
        setHighlightIdx(Math.max(0, sortedRows.length - 1));
      }
      setPendingHighlight(null);
    }
  }, [data, loading, pendingHighlight, sortedRows.length]);

  // Scroll highlighted row into view
  useEffect(() => {
    if (highlightIdx !== null && highlightIdx >= 0 && highlightIdx < sortedRows.length) {
      virtualizer.scrollToIndex(highlightIdx, { align: "auto", behavior: "smooth" });
    }
  }, [highlightIdx, sortedRows.length]);

  // Mark visible virtual items as seen
  const virtualItems = virtualizer.getVirtualItems();
  useEffect(() => {
    for (const vItem of virtualItems) {
      const row = sortedRows[vItem.index];
      if (row) {
        markSeen(row.original.id);
      }
    }
  }, [virtualItems, sortedRows]);

  // Cursor-based pagination helpers
  const hasCursors = !!(data?.nextCursor || data?.prevCursor);

  const goNextCursor = useCallback(() => {
    if (!data?.nextCursor) return;
    const params = new URLSearchParams(searchParams);
    params.set("cursor", data.nextCursor);
    params.set("direction", "next");
    params.delete("page");
    setSearchParams(params);
  }, [data, searchParams, setSearchParams]);

  const goPrevCursor = useCallback(() => {
    if (!data?.prevCursor) return;
    const params = new URLSearchParams(searchParams);
    params.set("cursor", data.prevCursor);
    params.set("direction", "prev");
    params.delete("page");
    setSearchParams(params);
  }, [data, searchParams, setSearchParams]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;

      // "/" focuses search from anywhere except inputs
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        searchInput?.focus();
        return;
      }

      // When search is focused, only handle Escape to blur
      if (isSearchFocused) {
        if (e.key === "Escape") {
          e.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
          searchInput?.blur();
        }
        return;
      }

      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const jobCount = sortedRows.length;
      if (!jobCount && !["?"].includes(e.key)) return;

      switch (e.key) {
        case "?":
          e.preventDefault();
          setShowShortcuts((v) => !v);
          break;

        case "w":
        case "ArrowUp":
          e.preventDefault();
          if (highlightIdx === null || highlightIdx <= 0) {
            if (hasCursors && data?.prevCursor) {
              setPendingHighlight("last");
              goPrevCursor();
            } else if (data && page > 1) {
              const params = new URLSearchParams(searchParams);
              const newPage = page - 1;
              if (newPage <= 1) params.delete("page");
              else params.set("page", String(newPage));
              setPendingHighlight("last");
              setSearchParams(params);
            } else {
              setHighlightIdx(jobCount - 1);
            }
          } else {
            setHighlightIdx(highlightIdx - 1);
          }
          break;

        case "s":
        case "ArrowDown":
          e.preventDefault();
          if (highlightIdx === null) {
            setHighlightIdx(0);
          } else if (highlightIdx >= jobCount - 1) {
            if (hasCursors && data?.nextCursor) {
              setPendingHighlight("first");
              goNextCursor();
            } else if (data && page < data.totalPages) {
              const params = new URLSearchParams(searchParams);
              params.set("page", String(page + 1));
              setPendingHighlight("first");
              setSearchParams(params);
            } else {
              setHighlightIdx(0);
            }
          } else {
            setHighlightIdx(highlightIdx + 1);
          }
          break;

        case "d":
          e.preventDefault();
          if (highlightedJob) {
            toggleShortlistItem(highlightedJob.id);
            if (highlightIdx !== null && highlightIdx < jobCount - 1) {
              setHighlightIdx(highlightIdx + 1);
            }
          }
          break;

        case "a":
          e.preventDefault();
          if (highlightedJob) {
            toggleHiddenJob(highlightedJob.id);
            if (highlightIdx !== null && highlightIdx < jobCount - 1) {
              setHighlightIdx(highlightIdx + 1);
            }
          }
          break;

        case "Enter":
          e.preventDefault();
          if (highlightedJob) {
            window.open(highlightedJob.applyUrl || highlightedJob.jobUrl, "_blank");
          }
          break;

        case "Escape":
          e.preventDefault();
          setHighlightIdx(null);
          setShowShortcuts(false);
          break;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [sortedRows, highlightIdx, highlightedJob, data, page, searchParams, setSearchParams, isSearchFocused, hasCursors, goNextCursor, goPrevCursor]);

  // Install console SDK (once)
  useEffect(() => {
    installBoardSDK();
    return () => { delete (window as any).board; };
  }, []);

  // Listen for board:select events from the SDK
  useEffect(() => {
    function handleSelect(e: Event) {
      const index = (e as CustomEvent).detail;
      if (typeof index === "number" && index >= 0 && index < sortedRows.length) {
        setHighlightIndex(index);
      }
    }
    window.addEventListener("board:select", handleSelect);
    return () => window.removeEventListener("board:select", handleSelect);
  }, [sortedRows.length]);

  // Sort indicator
  function SortIcon({ columnId }: { columnId: string }) {
    const col = table.getColumn(columnId);
    if (!col) return null;
    const sort = col.getIsSorted();
    if (!sort) return <span className="text-text-muted/40 ml-1">&#9650;</span>;
    return (
      <span className="text-accent ml-1">
        {sort === "asc" ? "\u25B2" : "\u25BC"}
      </span>
    );
  }

  return (
    <div className="flex">
      {/* Main job list column */}
      <div className="flex-1 min-w-0 flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Search + Filters bar */}
        <div className="shrink-0 z-10 bg-bg/80 backdrop-blur-sm border-b border-border">
          <div className="px-4 sm:px-6 py-3 space-y-3">
            <SearchBar />
            <SavedSearches />
            <div className="flex items-center justify-between gap-2">
              <Filters />
              <button
                onClick={() => setShowShortlistView((v) => !v)}
                className={`shrink-0 text-xs font-mono px-3 py-1.5 rounded-md border transition-colors flex items-center gap-1.5 ${
                  showShortlistView
                    ? "bg-accent-vivid/20 border-accent-vivid text-accent"
                    : "border-border text-text-secondary hover:border-accent/50"
                }`}
              >
                <span>&#9733;</span>
                <span>Shortlist</span>
                {shortlistSet.size > 0 && (
                  <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">
                    {shortlistSet.size}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Column header row - desktop only */}
        <div className="shrink-0 hidden sm:block border-b border-border bg-bg-elevated sticky top-0 z-[5]">
          <div className="job-row-grid px-6 py-2 text-[10px] font-mono uppercase tracking-wider text-text-muted">
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                return (
                  <span
                    key={header.id}
                    className={`flex items-center ${canSort ? "cursor-pointer select-none hover:text-accent transition-colors" : ""}`}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {canSort && <SortIcon columnId={header.column.id} />}
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Job list - scrollable area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-auto min-h-0">
          {loading && !data && (
            <div className="space-y-0">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="px-4 sm:px-6 py-3 border-b border-border-subtle animate-pulse">
                  <div className="flex gap-4">
                    <div className="h-4 bg-bg-elevated rounded w-24" />
                    <div className="h-4 bg-bg-elevated rounded w-48" />
                    <div className="h-4 bg-bg-elevated rounded w-32 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-text-secondary">Failed to load jobs: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs font-mono text-accent hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {data && sortedRows.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-text-secondary">
                {showShortlistView
                  ? "No shortlisted jobs yet. Press D to shortlist a highlighted job."
                  : "No jobs match your filters."}
              </p>
            </div>
          )}

          {data && sortedRows.length > 0 && (
            <>
              <div
                className={loading ? "opacity-60 transition-opacity" : ""}
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const row = sortedRows[virtualRow.index];
                  const job = row.original;
                  const isHighlighted = highlightIdx === virtualRow.index;
                  const isSeen = seenSet.has(job.id);
                  const isShortlisted = shortlistSet.has(job.id);
                  const isHidden = hiddenSet.has(job.id);
                  const isStale = !!job.isStale;

                  return (
                    <a
                      key={row.id}
                      href={job.applyUrl || job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-job-id={job.id}
                      onMouseEnter={() => setHighlightIdx(virtualRow.index)}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className={`group job-row-grid items-center gap-y-1 px-4 sm:px-6 py-3 border-b border-border-subtle transition-colors ${
                        isHighlighted
                          ? isShortlisted
                            ? "border-l-2 !border-l-green-400"
                            : "border-l-2 !border-l-accent"
                          : "hover:bg-bg-hover"
                      } ${
                        isHidden
                          ? "opacity-30"
                          : isStale
                            ? "opacity-50"
                            : isShortlisted
                              ? isHighlighted
                                ? "bg-green-950/40"
                                : "bg-green-950/20"
                              : isHighlighted
                                ? "bg-bg-hover"
                                : ""
                      } ${isSeen && !isHighlighted && !isHidden && !isStale ? "opacity-70" : ""}`}
                    >
                      {/* Desktop: render each cell via TanStack Table */}
                      {row.getVisibleCells().map((cell) => (
                        <span key={cell.id} className="hidden sm:block min-w-0">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                      ))}

                      {/* Mobile: stacked layout */}
                      <div className="sm:hidden flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-sm text-accent truncate flex items-center gap-1.5 min-w-0">
                            {isShortlisted && (
                              <span className="text-accent text-xs shrink-0" title="Shortlisted">
                                &#9733;
                              </span>
                            )}
                            <span className="truncate">{job.company}</span>
                          </span>
                          <span className="text-text-muted">&middot;</span>
                          <span className="text-sm font-medium text-text truncate min-w-0">
                            {job.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                          {job.location && <span>{job.location}</span>}
                          {job.isRemote && (
                            <span className="text-remote bg-remote-bg px-1 py-0.5 rounded text-[10px]">
                              REMOTE
                            </span>
                          )}
                          <span>{timeAgo(job.publishedAt)}</span>
                          {job.isStale && (
                            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-yellow-900/30 text-yellow-500/80">
                              Likely closed
                            </span>
                          )}
                          <span style={{ color: getSourceColor(job.source) }}>
                            {job.source}
                          </span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
              {!showShortlistView && (
                <Pagination
                  page={page}
                  totalPages={data.totalPages}
                  total={data.total}
                  nextCursor={data.nextCursor}
                  prevCursor={data.prevCursor}
                />
              )}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="shrink-0 px-4 sm:px-6 py-3 text-center border-t border-border-subtle">
          <span className="text-[10px] font-mono text-text-muted">
            Press{" "}
            <kbd className="px-1 py-0.5 rounded border border-border bg-bg-elevated text-accent">
              ?
            </kbd>{" "}
            for shortcuts{" · "}
            <kbd className="px-1 py-0.5 rounded border border-border bg-bg-elevated text-accent">
              /
            </kbd>{" "}
            to search
          </span>
        </div>
      </div>

      {/* Slide-in preview sidebar */}
      <PreviewPanel
        url={highlightedJob ? highlightedJob.applyUrl || highlightedJob.jobUrl : null}
        jobTitle={highlightedJob?.title ?? ""}
        company={highlightedJob?.company ?? ""}
      />

      {/* Shortcuts modal */}
      <ShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* LLM console SDK badge */}
      <LLMBadge />
    </div>
  );
}
