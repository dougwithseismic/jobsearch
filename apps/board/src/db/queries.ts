import { eq, and, gte, desc, asc, sql, lt, gt, or } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { jobs } from "./schema";

type SortColumn = "published_at" | "company" | "title" | "location" | "source";
type SortOrder = "asc" | "desc";

export interface JobFilters {
  page?: number;
  limit?: number;
  region?: string;
  remote?: boolean;
  source?: string;
  company?: string;
  since?: string;
  sort?: SortColumn;
  order?: SortOrder;
  cursor?: string;
  direction?: "next" | "prev";
  includeStale?: boolean;
}

/** Map sort column names to Drizzle column references */
const sortColumnMap = {
  published_at: jobs.publishedAt,
  company: jobs.company,
  title: jobs.title,
  location: jobs.location,
  source: jobs.source,
} as const;

/** Decode a cursor string into its components */
function decodeCursor(cursor: string): { publishedAt: string; id: string } | null {
  try {
    const decoded = atob(cursor);
    const sepIdx = decoded.indexOf("|");
    if (sepIdx === -1) return null;
    return { publishedAt: decoded.slice(0, sepIdx), id: decoded.slice(sepIdx + 1) };
  } catch {
    return null;
  }
}

/** Encode cursor components into an opaque string */
function encodeCursor(publishedAt: string, id: string): string {
  return btoa(`${publishedAt}|${id}`);
}

/** Build the standard filter conditions (shared between list and search) */
function buildFilterConditions(filters: JobFilters) {
  const conditions = [];

  // Default: exclude stale and duplicate jobs
  if (!filters.includeStale) {
    conditions.push(eq(jobs.isStale, false));
    conditions.push(eq(jobs.isDuplicateOf, ""));
  }

  if (filters.region) conditions.push(eq(jobs.region, filters.region));
  if (filters.remote) conditions.push(eq(jobs.isRemote, true));
  if (filters.source) conditions.push(eq(jobs.source, filters.source));
  if (filters.company) conditions.push(eq(jobs.companySlug, filters.company));
  if (filters.since) conditions.push(gte(jobs.publishedAt, filters.since));

  return conditions;
}

export async function listJobs(db: DrizzleD1Database, filters: JobFilters = {}) {
  const limit = Math.min(filters.limit ?? 50, 100);
  const sortCol = sortColumnMap[filters.sort ?? "published_at"];
  const sortDir = filters.order ?? "desc";
  const orderFn = sortDir === "asc" ? asc : desc;

  const conditions = buildFilterConditions(filters);

  // Cursor-based pagination
  if (filters.cursor) {
    const parsed = decodeCursor(filters.cursor);
    if (!parsed) {
      return { jobs: [], total: 0, nextCursor: null, prevCursor: null, hasMore: false };
    }

    const direction = filters.direction ?? "next";
    const isNext = direction === "next";

    // For cursor pagination we always sort by (published_at, id) for deterministic ordering
    const cursorConditions = [...conditions];
    if (isNext) {
      // Next page: go in the sort direction
      if (sortDir === "desc") {
        // (published_at, id) < (cursor_published_at, cursor_id)
        cursorConditions.push(
          or(
            lt(jobs.publishedAt, parsed.publishedAt),
            and(eq(jobs.publishedAt, parsed.publishedAt), lt(jobs.id, parsed.id)),
          )!,
        );
      } else {
        // (published_at, id) > (cursor_published_at, cursor_id)
        cursorConditions.push(
          or(
            gt(jobs.publishedAt, parsed.publishedAt),
            and(eq(jobs.publishedAt, parsed.publishedAt), gt(jobs.id, parsed.id)),
          )!,
        );
      }
    } else {
      // Previous page: go in reverse direction
      if (sortDir === "desc") {
        cursorConditions.push(
          or(
            gt(jobs.publishedAt, parsed.publishedAt),
            and(eq(jobs.publishedAt, parsed.publishedAt), gt(jobs.id, parsed.id)),
          )!,
        );
      } else {
        cursorConditions.push(
          or(
            lt(jobs.publishedAt, parsed.publishedAt),
            and(eq(jobs.publishedAt, parsed.publishedAt), lt(jobs.id, parsed.id)),
          )!,
        );
      }
    }

    const cursorWhere = cursorConditions.length > 0 ? and(...cursorConditions) : undefined;
    const baseWhere = conditions.length > 0 ? and(...conditions) : undefined;

    // For prev direction, we reverse the sort to get the right rows, then reverse the result
    const cursorOrderFn = isNext ? orderFn : (sortDir === "desc" ? asc : desc);

    const [jobRows, countResult] = await Promise.all([
      db.select().from(jobs).where(cursorWhere)
        .orderBy(cursorOrderFn(jobs.publishedAt), cursorOrderFn(jobs.id))
        .limit(limit + 1), // fetch one extra to check hasMore
      db.select({ count: sql<number>`count(*)` }).from(jobs).where(baseWhere),
    ]);

    // Check if there are more results
    const hasMore = jobRows.length > limit;
    const trimmed = hasMore ? jobRows.slice(0, limit) : jobRows;

    // Reverse results if we fetched in reverse direction
    const finalRows = isNext ? trimmed : trimmed.reverse();

    const total = countResult[0]?.count ?? 0;
    const nextCursor = finalRows.length > 0
      ? encodeCursor(finalRows[finalRows.length - 1].publishedAt ?? "", finalRows[finalRows.length - 1].id)
      : null;
    const prevCursor = finalRows.length > 0
      ? encodeCursor(finalRows[0].publishedAt ?? "", finalRows[0].id)
      : null;

    return { jobs: finalRows, total, nextCursor, prevCursor, hasMore };
  }

  // Offset-based pagination (backwards compatible)
  const page = filters.page ?? 1;
  const offset = (page - 1) * limit;
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [jobRows, countResult] = await Promise.all([
    db.select().from(jobs).where(where)
      .orderBy(orderFn(sortCol), orderFn(jobs.id))
      .limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(jobs).where(where),
  ]);

  const total = countResult[0]?.count ?? 0;
  return { jobs: jobRows, total, page, totalPages: Math.ceil(total / limit) };
}

export async function searchJobs(db: DrizzleD1Database, rawDb: D1Database, query: string, filters: JobFilters = {}) {
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 50, 100);
  const offset = (page - 1) * limit;
  const sortCol = filters.sort ?? "published_at";
  const sortDir = filters.order ?? "desc";

  // Build additional WHERE clauses for filters
  const filterClauses: string[] = [];
  const params: any[] = [query];

  // Default: exclude stale and duplicate jobs
  if (!filters.includeStale) {
    filterClauses.push("jobs.is_stale = 0");
    filterClauses.push("jobs.is_duplicate_of = ''");
  }

  if (filters.region) {
    filterClauses.push("jobs.region = ?");
    params.push(filters.region);
  }
  if (filters.remote) {
    filterClauses.push("jobs.is_remote = 1");
  }
  if (filters.source) {
    filterClauses.push("jobs.source = ?");
    params.push(filters.source);
  }
  if (filters.since) {
    filterClauses.push("jobs.published_at >= ?");
    params.push(filters.since);
  }

  const filterSQL = filterClauses.length > 0 ? " AND " + filterClauses.join(" AND ") : "";

  // Determine ORDER BY — default to rank (relevance) for FTS, but allow override
  const sortColumnSQL: Record<SortColumn, string> = {
    published_at: "jobs.published_at",
    company: "jobs.company",
    title: "jobs.title",
    location: "jobs.location",
    source: "jobs.source",
  };

  // If user explicitly specified a sort column, use it; otherwise use FTS rank
  const orderBySQL = filters.sort
    ? `${sortColumnSQL[sortCol as SortColumn]} ${sortDir === "asc" ? "ASC" : "DESC"}, jobs.id ${sortDir === "asc" ? "ASC" : "DESC"}`
    : "rank";

  const searchSQL = `
    SELECT jobs.* FROM jobs_fts
    JOIN jobs ON jobs.rowid = jobs_fts.rowid
    WHERE jobs_fts MATCH ?1 ${filterSQL}
    ORDER BY ${orderBySQL}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countSQL = `
    SELECT count(*) as count FROM jobs_fts
    JOIN jobs ON jobs.rowid = jobs_fts.rowid
    WHERE jobs_fts MATCH ?1 ${filterSQL}
  `;

  const [results, countResult] = await Promise.all([
    rawDb.prepare(searchSQL).bind(...params).all(),
    rawDb.prepare(countSQL).bind(...params).first<{ count: number }>(),
  ]);

  const total = countResult?.count ?? 0;

  // Raw D1 returns snake_case columns — map to camelCase to match Drizzle output
  const mappedJobs = (results.results ?? []).map((row: Record<string, unknown>) => ({
    id: row.id,
    source: row.source,
    sourceId: row.source_id,
    company: row.company,
    companySlug: row.company_slug,
    title: row.title,
    department: row.department,
    location: row.location,
    country: row.country,
    region: row.region,
    isRemote: row.is_remote === 1,
    employmentType: row.employment_type,
    salary: row.salary,
    applyUrl: row.apply_url,
    jobUrl: row.job_url,
    publishedAt: row.published_at,
    scrapedAt: row.scraped_at,
    tags: row.tags,
    descriptionSnippet: row.description_snippet,
    lastSeenAt: row.last_seen_at,
    isStale: row.is_stale === 1,
    isDuplicateOf: row.is_duplicate_of,
  }));

  return { jobs: mappedJobs, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getStats(db: DrizzleD1Database) {
  // Exclude stale and duplicate jobs from all stats
  const activeFilter = and(eq(jobs.isStale, false), eq(jobs.isDuplicateOf, ""));

  const [totalResult, companiesResult, sourcesResult, lastUpdatedResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(jobs).where(activeFilter),
    db.select({ count: sql<number>`count(distinct ${jobs.companySlug})` }).from(jobs).where(activeFilter),
    db.select({ source: jobs.source, count: sql<number>`count(*)` }).from(jobs).where(activeFilter).groupBy(jobs.source),
    db.select({ latest: sql<string>`max(${jobs.scrapedAt})` }).from(jobs).where(activeFilter),
  ]);

  return {
    totalJobs: totalResult[0]?.count ?? 0,
    totalCompanies: companiesResult[0]?.count ?? 0,
    sources: Object.fromEntries(sourcesResult.map((s) => [s.source, s.count])),
    lastUpdated: lastUpdatedResult[0]?.latest ?? "",
  };
}
