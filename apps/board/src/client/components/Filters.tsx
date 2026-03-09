import { useSearchParams } from "react-router";

const REGIONS = [
  { value: "", label: "All Regions" },
  { value: "europe", label: "Europe" },
  { value: "north-america", label: "North America" },
  { value: "asia", label: "Asia" },
  { value: "remote", label: "Remote Only" },
];

const SOURCES = [
  "ashby", "greenhouse", "lever", "workable",
  "recruitee", "smartrecruiters", "breezyhr", "personio", "hn",
];

const DATE_RANGES = [
  { value: "", label: "All Time" },
  { value: "1", label: "24h" },
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
];

export function Filters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentRegion = searchParams.get("region") || "";
  const currentRemote = searchParams.get("remote") === "true";
  const currentSource = searchParams.get("source") || "";
  const currentSince = searchParams.get("since") || "";
  const includeStale = searchParams.get("includeStale") === "true";

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    params.delete("cursor");
    params.delete("direction");
    setSearchParams(params);
  }

  function toggleRemote() {
    const params = new URLSearchParams(searchParams);
    if (currentRemote) {
      params.delete("remote");
    } else {
      params.set("remote", "true");
    }
    params.delete("page");
    params.delete("cursor");
    params.delete("direction");
    setSearchParams(params);
  }

  function toggleStale() {
    const params = new URLSearchParams(searchParams);
    if (includeStale) {
      params.delete("includeStale");
    } else {
      params.set("includeStale", "true");
    }
    params.delete("page");
    params.delete("cursor");
    params.delete("direction");
    setSearchParams(params);
  }

  function setSince(days: string) {
    const params = new URLSearchParams(searchParams);
    if (days) {
      const since = new Date();
      since.setDate(since.getDate() - parseInt(days));
      params.set("since", since.toISOString().split("T")[0]);
    } else {
      params.delete("since");
    }
    params.delete("page");
    params.delete("cursor");
    params.delete("direction");
    setSearchParams(params);
  }

  // Determine which date range button is active
  function isDateActive(days: string): boolean {
    if (!days) return !currentSince;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));
    return currentSince === since.toISOString().split("T")[0];
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Remote toggle */}
      <button
        onClick={toggleRemote}
        className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-colors ${
          currentRemote
            ? "bg-accent-vivid/20 border-accent-vivid text-accent"
            : "border-border text-text-secondary hover:border-accent/50"
        }`}
      >
        Remote
      </button>

      {/* Region */}
      <select
        value={currentRegion}
        onChange={(e) => setFilter("region", e.target.value)}
        className="text-xs font-mono px-3 py-1.5 rounded-md border border-border bg-bg text-text-secondary focus:border-accent focus:outline-none cursor-pointer"
      >
        {REGIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      {/* Date range pills */}
      <div className="flex items-center gap-1">
        {DATE_RANGES.map((d) => (
          <button
            key={d.value}
            onClick={() => setSince(d.value)}
            className={`text-xs font-mono px-2.5 py-1.5 rounded-md border transition-colors ${
              isDateActive(d.value)
                ? "bg-accent-vivid/20 border-accent-vivid text-accent"
                : "border-border text-text-secondary hover:border-accent/50"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Source filter */}
      <select
        value={currentSource}
        onChange={(e) => setFilter("source", e.target.value)}
        className="text-xs font-mono px-3 py-1.5 rounded-md border border-border bg-bg text-text-secondary focus:border-accent focus:outline-none cursor-pointer"
      >
        <option value="">All Sources</option>
        {SOURCES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Show closed jobs toggle */}
      <button
        onClick={toggleStale}
        className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-colors ${
          includeStale
            ? "bg-yellow-900/30 border-yellow-600/50 text-yellow-500"
            : "border-border text-text-secondary hover:border-accent/50"
        }`}
      >
        Show closed
      </button>
    </div>
  );
}
