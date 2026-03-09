import { useSearchParams } from "react-router";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  nextCursor?: string;
  prevCursor?: string;
}

export function Pagination({ page, totalPages, total, nextCursor, prevCursor }: PaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const hasCursors = !!(nextCursor || prevCursor);

  // Cursor-based navigation
  function goNextCursor() {
    if (!nextCursor) return;
    const params = new URLSearchParams(searchParams);
    params.set("cursor", nextCursor);
    params.set("direction", "next");
    params.delete("page");
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPrevCursor() {
    if (!prevCursor) return;
    const params = new URLSearchParams(searchParams);
    params.set("cursor", prevCursor);
    params.set("direction", "prev");
    params.delete("page");
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Page-based navigation (fallback)
  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams);
    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    params.delete("cursor");
    params.delete("direction");
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (totalPages <= 1 && !hasCursors) return null;

  // Cursor-based UI
  if (hasCursors) {
    return (
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-border">
        <button
          onClick={goPrevCursor}
          disabled={!prevCursor}
          className="text-xs font-mono px-3 py-1.5 rounded-md border border-border text-text-secondary hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          &larr; Previous
        </button>

        <span className="text-xs font-mono text-text-muted">
          {total.toLocaleString()} jobs
        </span>

        <button
          onClick={goNextCursor}
          disabled={!nextCursor}
          className="text-xs font-mono px-3 py-1.5 rounded-md border border-border text-text-secondary hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next &rarr;
        </button>
      </div>
    );
  }

  // Page-based UI (fallback)
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-border">
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="text-xs font-mono px-3 py-1.5 rounded-md border border-border text-text-secondary hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        &larr; Prev
      </button>

      <span className="text-xs font-mono text-text-muted">
        Page <span className="text-text">{page}</span> of{" "}
        <span className="text-text">{totalPages}</span>
        <span className="hidden sm:inline"> &middot; {total.toLocaleString()} jobs</span>
      </span>

      <button
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="text-xs font-mono px-3 py-1.5 rounded-md border border-border text-text-secondary hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next &rarr;
      </button>
    </div>
  );
}
