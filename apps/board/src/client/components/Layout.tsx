import { ReactNode, useEffect, useState } from "react";
import { useShortlistSet } from "../lib/useBoardStore";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [stats, setStats] = useState<{
    totalJobs: number;
    totalCompanies: number;
    lastUpdated: string;
  } | null>(null);

  const shortlistSet = useShortlistSet();

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json() as Promise<{ totalJobs: number; totalCompanies: number; lastUpdated: string }>)
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight">
              <span className="text-accent">&#9679;</span> jobboard
            </h1>
            <span className="text-xs font-mono text-text-muted hidden sm:inline">
              9 ATS platforms &middot; updated daily
            </span>
          </div>
          <div className="flex items-center gap-4">
            {shortlistSet.size > 0 && (
              <span className="text-xs font-mono text-accent flex items-center gap-1">
                <span>&#9733;</span> {shortlistSet.size}
              </span>
            )}
            {stats && (
              <div className="text-xs font-mono text-text-secondary">
                <span className="text-text">{stats.totalJobs.toLocaleString()}</span> jobs
                {" \u00B7 "}
                <span className="text-text">{stats.totalCompanies.toLocaleString()}</span> companies
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-[90rem] mx-auto border-l border-r border-border min-h-[calc(100vh-8rem)]">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs font-mono text-text-muted">
          <div>
            Sources: Ashby &middot; Greenhouse &middot; Lever &middot; Workable &middot; Recruitee &middot; SmartRecruiters &middot; BreezyHR &middot; Personio &middot; HN
          </div>
          {stats?.lastUpdated && (
            <div>Last scraped: {new Date(stats.lastUpdated).toLocaleDateString()}</div>
          )}
        </div>
      </footer>
    </div>
  );
}
