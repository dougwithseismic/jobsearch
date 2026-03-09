/**
 * window.board — Console SDK for LLMs and power users.
 *
 * Instead of scraping the DOM, LLMs can call these methods directly
 * in the browser console to access all job board data programmatically.
 *
 * Usage:  board.help()
 */

// ── Types ────────────────────────────────────────────────────────
interface BoardJob {
  id: string;
  source: string;
  sourceId?: string;
  company: string;
  companySlug?: string;
  title: string;
  location: string;
  isRemote: boolean;
  department?: string;
  publishedAt: string;
  applyUrl: string;
  jobUrl: string;
  isStale?: boolean;
}

interface ListOptions {
  page?: number;
  limit?: number;
  region?: string;
  remote?: boolean;
  source?: string;
  company?: string;
  since?: string;
  sort?: "published_at" | "company" | "title" | "location" | "source";
  order?: "asc" | "desc";
  includeStale?: boolean;
}

interface SearchOptions extends ListOptions {
  q: string;
}

interface StatsResult {
  totalJobs: number;
  totalCompanies: number;
  sources: Record<string, number>;
  lastUpdated: string;
}

interface ListResult {
  jobs: BoardJob[];
  total: number;
  page: number;
  totalPages: number;
  nextCursor?: string;
  prevCursor?: string;
}

// ── Helpers ──────────────────────────────────────────────────────

const API_BASE = "";

function buildParams(opts: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(opts)) {
    if (v !== undefined && v !== null && v !== "") {
      params.set(k, String(v));
    }
  }
  return params.toString();
}

async function api<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const qs = params ? buildParams(params) : "";
  const url = `${API_BASE}${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

function logStyled(msg: string, data?: unknown) {
  console.log(`%c${msg}`, "color: #b39aff; font-weight: bold");
  if (data !== undefined) console.log(data);
}

function jobsToTable(jobs: BoardJob[]) {
  return jobs.map((j) => ({
    company: j.company,
    title: j.title,
    location: j.location,
    remote: j.isRemote ? "YES" : "",
    source: j.source,
    published: j.publishedAt?.split("T")[0] ?? "",
    url: j.applyUrl || j.jobUrl,
    id: j.id,
  }));
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => {
      const val = String(row[h] ?? "");
      return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(","));
  }
  return lines.join("\n");
}

// ── LocalStorage access ──────────────────────────────────────────

function getLocalSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function setLocalSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

// ── The SDK ──────────────────────────────────────────────────────

export function createBoardSDK() {
  const sdk = {
    // ── Help & Discovery ───────────────────────────────────────

    /** Print full API documentation */
    help() {
      console.log(
        `%c╔══════════════════════════════════════════════════════════════╗
║  board — Job Board Console SDK                               ║
║  414K+ jobs from 9 ATS sources. Use these methods instead    ║
║  of scraping the DOM.                                        ║
╚══════════════════════════════════════════════════════════════╝`,
        "color: #b39aff; font-weight: bold; font-family: monospace"
      );

      console.log(`
%c📡 DATA ACCESS (async — returns promises)%c

  await board.jobs()                    Fetch current page of jobs
  await board.jobs({                    Fetch with filters:
    page: 1,                              page number (default 1)
    limit: 50,                            results per page (max 100)
    region: "europe",                     filter by region
    remote: true,                         remote jobs only
    source: "greenhouse",                 filter by ATS source
    company: "stripe",                    filter by company slug
    since: "2026-03-01",                  jobs published after date
    sort: "published_at",                 sort column
    order: "desc",                        sort direction
    includeStale: false                   include likely-closed jobs
  })

  await board.search("react engineer")  Full-text search
  await board.search("react", {         Search with filters
    remote: true, region: "europe"
  })

  await board.stats()                   Source counts, totals, last update
  await board.regions()                 List all available regions
  await board.sources()                 List all ATS sources

%c📋 LOCAL STATE (sync — localStorage)%c

  board.shortlisted()                   Get shortlisted job IDs
  board.hidden()                        Get hidden job IDs
  board.seen()                          Get seen job IDs
  board.shortlist("job-id")             Add/remove from shortlist
  board.hide("job-id")                  Add/remove from hidden
  board.clearSeen()                     Clear all seen markers

%c📤 EXPORT%c

  await board.export("csv")             Export current search to CSV
  await board.export("json")            Export current search to JSON
  await board.exportAll("csv")          Export ALL jobs (paginated fetch)

%c🔧 UI CONTROL%c

  board.navigate({remote: true})        Set URL filters (triggers UI update)
  board.navigate({q: "python"})         Search via URL
  board.select(5)                       Highlight row by index
  board.open(0)                         Open job URL in new tab

%c💡 TIPS%c

  • All data methods return promises — use await
  • board.jobs() returns {jobs, total, page, totalPages}
  • Pipe to console.table for readable output:
      console.table((await board.jobs()).jobs)
  • Available regions: europe, north-america, asia, latam,
    middle-east, africa, oceania, other
  • Available sources: ashby, greenhouse, lever, workable,
    recruitee, smartrecruiters, breezyhr, personio, hn

%c🤖 LLM QUICK START%c

  If you're an AI agent, here's the fastest path:

  1. const stats = await board.stats()     // understand the dataset
  2. const r = await board.search("your query", {remote: true})
  3. r.jobs.forEach(j => console.log(j.company, j.title, j.applyUrl))
  4. board.shortlist(r.jobs[0].id)         // save interesting ones
  5. const csv = await board.export("csv") // export results
`,
        "color: #22c55e; font-weight: bold", "color: inherit",
        "color: #f59e0b; font-weight: bold", "color: inherit",
        "color: #3b82f6; font-weight: bold", "color: inherit",
        "color: #8b5cf6; font-weight: bold", "color: inherit",
        "color: #06b6d4; font-weight: bold", "color: inherit",
        "color: #ec4899; font-weight: bold", "color: inherit",
      );

      return "Type board.<method>() to get started. All data methods are async.";
    },

    /** Machine-readable API schema for LLMs */
    schema() {
      const schema = {
        name: "board",
        description: "Job board console SDK — 414K+ jobs from 9 ATS sources",
        baseUrl: window.location.origin,
        apiEndpoints: {
          "GET /api/jobs": {
            params: ["page", "limit", "region", "remote", "source", "company", "since", "sort", "order", "cursor", "direction", "includeStale"],
            returns: "{ jobs: Job[], total: number, page: number, totalPages: number, nextCursor?: string, prevCursor?: string }",
          },
          "GET /api/search?q=": {
            params: ["q", "page", "limit", "region", "remote", "source", "since", "sort", "order", "includeStale"],
            returns: "{ jobs: Job[], total: number, page: number, totalPages: number }",
          },
          "GET /api/stats": {
            returns: "{ totalJobs: number, totalCompanies: number, sources: Record<string,number>, lastUpdated: string }",
          },
        },
        regions: ["europe", "north-america", "asia", "latam", "middle-east", "africa", "oceania", "other"],
        sources: ["ashby", "greenhouse", "lever", "workable", "recruitee", "smartrecruiters", "breezyhr", "personio", "hn"],
        sortColumns: ["published_at", "company", "title", "location", "source"],
        jobShape: {
          id: "string — unique job ID",
          source: "string — ATS source name",
          company: "string — company name",
          title: "string — job title",
          location: "string — job location",
          isRemote: "boolean",
          publishedAt: "string — ISO date",
          applyUrl: "string — application URL",
          jobUrl: "string — job listing URL",
          isStale: "boolean — likely closed if true",
        },
        methods: Object.keys(sdk).sort(),
      };
      logStyled("board.schema — machine-readable API definition");
      console.log(JSON.stringify(schema, null, 2));
      return schema;
    },

    // ── Data Access (async) ────────────────────────────────────

    /** Fetch jobs with optional filters */
    async jobs(opts: ListOptions = {}): Promise<ListResult> {
      const result = await api<ListResult>("/api/jobs", opts as Record<string, unknown>);
      logStyled(`board.jobs — ${result.jobs.length} jobs (page ${result.page}/${result.totalPages}, ${result.total} total)`);
      console.table(jobsToTable(result.jobs));
      return result;
    },

    /** Full-text search */
    async search(query: string, opts: Omit<SearchOptions, "q"> = {}): Promise<ListResult> {
      const result = await api<ListResult>("/api/search", { q: query, ...opts } as Record<string, unknown>);
      logStyled(`board.search("${query}") — ${result.jobs.length} results (${result.total} total)`);
      console.table(jobsToTable(result.jobs));
      return result;
    },

    /** Get board statistics */
    async stats(): Promise<StatsResult> {
      const result = await api<StatsResult>("/api/stats");
      logStyled("board.stats");
      console.table(result.sources);
      console.log(`Total: ${result.totalJobs.toLocaleString()} jobs across ${result.totalCompanies.toLocaleString()} companies`);
      console.log(`Last updated: ${result.lastUpdated}`);
      return result;
    },

    /** List available regions */
    regions() {
      const regions = ["europe", "north-america", "asia", "latam", "middle-east", "africa", "oceania", "other"];
      logStyled("board.regions");
      console.log(regions);
      return regions;
    },

    /** List available ATS sources */
    sources() {
      const sources = ["ashby", "greenhouse", "lever", "workable", "recruitee", "smartrecruiters", "breezyhr", "personio", "hn"];
      logStyled("board.sources");
      console.log(sources);
      return sources;
    },

    // ── Local State ────────────────────────────────────────────

    /** Get or toggle shortlisted job IDs */
    shortlisted(toggleId?: string): string[] {
      const set = getLocalSet("board-shortlist");
      if (toggleId) {
        if (set.has(toggleId)) {
          set.delete(toggleId);
          logStyled(`Removed ${toggleId} from shortlist`);
        } else {
          set.add(toggleId);
          logStyled(`Added ${toggleId} to shortlist`);
        }
        setLocalSet("board-shortlist", set);
        // Also remove from hidden if shortlisting
        const hidden = getLocalSet("board-hidden");
        if (hidden.has(toggleId)) {
          hidden.delete(toggleId);
          setLocalSet("board-hidden", hidden);
        }
      }
      const ids = [...set];
      logStyled(`board.shortlisted — ${ids.length} jobs`);
      return ids;
    },

    /** Alias for shortlisted(id) */
    shortlist(id: string) {
      return sdk.shortlisted(id);
    },

    /** Get or toggle hidden job IDs */
    hidden(toggleId?: string): string[] {
      const set = getLocalSet("board-hidden");
      if (toggleId) {
        if (set.has(toggleId)) {
          set.delete(toggleId);
          logStyled(`Removed ${toggleId} from hidden`);
        } else {
          set.add(toggleId);
          logStyled(`Added ${toggleId} to hidden`);
        }
        setLocalSet("board-hidden", set);
        // Also remove from shortlist if hiding
        const shortlist = getLocalSet("board-shortlist");
        if (shortlist.has(toggleId)) {
          shortlist.delete(toggleId);
          setLocalSet("board-shortlist", shortlist);
        }
      }
      const ids = [...set];
      logStyled(`board.hidden — ${ids.length} jobs`);
      return ids;
    },

    /** Alias for hidden(id) */
    hide(id: string) {
      return sdk.hidden(id);
    },

    /** Get seen job IDs */
    seen(): string[] {
      const ids = [...getLocalSet("board-seen")];
      logStyled(`board.seen — ${ids.length} jobs`);
      return ids;
    },

    /** Clear all seen markers */
    clearSeen() {
      localStorage.removeItem("board-seen");
      logStyled("Cleared all seen markers");
    },

    // ── Export ─────────────────────────────────────────────────

    /** Export current search results as CSV or JSON */
    async export(format: "csv" | "json" = "json", opts: ListOptions = {}): Promise<string> {
      const result = await api<ListResult>("/api/jobs", { limit: 100, ...opts } as Record<string, unknown>);
      const data = format === "csv"
        ? toCsv(jobsToTable(result.jobs))
        : JSON.stringify(result.jobs, null, 2);

      logStyled(`board.export("${format}") — ${result.jobs.length} jobs exported`);
      console.log(data);
      return data;
    },

    /** Export ALL jobs across all pages (paginated fetch). Returns array of all jobs. */
    async exportAll(format: "csv" | "json" = "json", opts: Omit<ListOptions, "page" | "limit"> = {}): Promise<string> {
      logStyled("board.exportAll — fetching all pages...");
      const allJobs: BoardJob[] = [];
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const result = await api<ListResult>("/api/jobs", {
          page,
          limit: 100,
          ...opts,
        } as Record<string, unknown>);
        allJobs.push(...result.jobs);
        totalPages = result.totalPages;
        if (page % 10 === 0 || page === totalPages) {
          console.log(`  page ${page}/${totalPages} — ${allJobs.length} jobs so far`);
        }
        page++;
      }

      const data = format === "csv"
        ? toCsv(jobsToTable(allJobs))
        : JSON.stringify(allJobs, null, 2);

      logStyled(`board.exportAll("${format}") — ${allJobs.length} total jobs exported`);
      return data;
    },

    // ── UI Control ─────────────────────────────────────────────

    /** Navigate by setting URL search params (triggers React state update) */
    navigate(params: Record<string, string | number | boolean | undefined>) {
      const url = new URL(window.location.href);
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === "" || v === false) {
          url.searchParams.delete(k);
        } else {
          url.searchParams.set(k, String(v));
        }
      }
      // Remove pagination when filters change
      if (!params.page && !params.cursor) {
        url.searchParams.delete("page");
        url.searchParams.delete("cursor");
        url.searchParams.delete("direction");
      }
      window.history.pushState({}, "", url.toString());
      window.dispatchEvent(new PopStateEvent("popstate"));
      logStyled("board.navigate", params);
    },

    /** Highlight a job row by index */
    select(index: number) {
      window.dispatchEvent(new CustomEvent("board:select", { detail: index }));
      logStyled(`board.select(${index})`);
    },

    /** Open a job's URL by row index */
    async open(index: number) {
      const result = await api<ListResult>("/api/jobs", {
        page: 1,
        limit: index + 1,
      });
      const job = result.jobs[index];
      if (job) {
        const url = job.applyUrl || job.jobUrl;
        window.open(url, "_blank");
        logStyled(`board.open(${index}) — ${job.company}: ${job.title}`);
      } else {
        console.log(`No job at index ${index}`);
      }
    },
  };

  return sdk;
}

/** Install the SDK on window and print the welcome banner */
export function installBoardSDK() {
  const sdk = createBoardSDK();
  (window as any).board = sdk;

  // Compact welcome banner
  console.log(
    `%c 🤖 board SDK loaded %c — Type %cboard.help()%c for docs, %cboard.schema()%c for machine-readable API`,
    "background: #b39aff; color: #000; padding: 2px 6px; border-radius: 3px; font-weight: bold",
    "color: #888",
    "color: #b39aff; font-weight: bold",
    "color: #888",
    "color: #b39aff; font-weight: bold",
    "color: #888",
  );
}
