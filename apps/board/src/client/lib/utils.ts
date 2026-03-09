export function timeAgo(dateStr: string): string {
  if (!dateStr) return "?";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toISOString().split("T")[0];
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const SOURCE_COLORS: Record<string, string> = {
  ashby: "#b39aff",
  greenhouse: "#22c55e",
  lever: "#3b82f6",
  workable: "#f59e0b",
  recruitee: "#ef4444",
  smartrecruiters: "#06b6d4",
  breezyhr: "#8b5cf6",
  personio: "#ec4899",
  hn: "#f97316",
};

export function getSourceColor(source: string): string {
  return SOURCE_COLORS[source] ?? "#867e8e";
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
