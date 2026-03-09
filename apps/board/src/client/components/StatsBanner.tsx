import { formatNumber } from "../lib/utils";

interface StatsBannerProps {
  totalJobs: number;
  totalCompanies: number;
  sources: Record<string, number>;
}

export function StatsBanner({ totalJobs, totalCompanies, sources }: StatsBannerProps) {
  return (
    <div className="flex items-center gap-4 px-4 sm:px-6 py-2 border-b border-border-subtle text-xs font-mono text-text-muted overflow-x-auto">
      <span>
        <span className="text-text">{formatNumber(totalJobs)}</span> jobs
      </span>
      <span className="text-border">·</span>
      <span>
        <span className="text-text">{formatNumber(totalCompanies)}</span> companies
      </span>
      <span className="text-border">·</span>
      <span>
        <span className="text-text">{Object.keys(sources).length}</span> sources
      </span>
    </div>
  );
}
