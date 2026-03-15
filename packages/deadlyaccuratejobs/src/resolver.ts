/**
 * Company → ATS resolver.
 * Given a company name like "Stripe", finds which ATS platform(s) they use
 * by searching across all slug lists from the Cloudflare KV API.
 */

import type { CompanyMatch, SlugSource, PlatformStats, Stats } from "./types.js";
import { SLUG_SOURCES } from "./types.js";

const DEFAULT_SLUG_API = "https://job-slugs.wd40.workers.dev";

interface SlugIndex {
  /** platform → Set of slugs */
  platforms: Map<SlugSource, Set<string>>;
  /** slug → platforms it appears on */
  reverse: Map<string, SlugSource[]>;
  fetchedAt: number;
}

let cachedIndex: SlugIndex | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Fetch all slug lists from the KV API in parallel.
 * Caches the result in memory for 5 minutes.
 */
export async function buildIndex(options?: {
  apiUrl?: string;
  force?: boolean;
}): Promise<SlugIndex> {
  const apiUrl = options?.apiUrl || process.env.SLUGS_API_URL || DEFAULT_SLUG_API;

  if (cachedIndex && !options?.force && Date.now() - cachedIndex.fetchedAt < CACHE_TTL_MS) {
    return cachedIndex;
  }

  const platforms = new Map<SlugSource, Set<string>>();
  const reverse = new Map<string, SlugSource[]>();

  const results = await Promise.allSettled(
    SLUG_SOURCES.map(async (source) => {
      try {
        const res = await fetch(`${apiUrl}/slugs/${source}`);
        if (!res.ok) {
          console.error(`  [resolver] ${source}: HTTP ${res.status}`);
          return { source, slugs: [] as string[] };
        }
        const text = await res.text();
        const slugs = text.split("\n").map((s) => s.trim()).filter(Boolean);
        return { source, slugs };
      } catch (err) {
        console.error(`  [resolver] ${source}: fetch failed — ${err instanceof Error ? err.message : String(err)}`);
        return { source, slugs: [] as string[] };
      }
    }),
  );

  let totalSlugs = 0;
  for (const result of results) {
    if (result.status !== "fulfilled") {
      console.error(`  [resolver] Promise rejected: ${result.reason}`);
      continue;
    }
    const { source, slugs } = result.value;
    platforms.set(source, new Set(slugs));
    for (const slug of slugs) {
      const existing = reverse.get(slug) ?? [];
      existing.push(source);
      reverse.set(slug, existing);
    }
  }

  console.log(`  [resolver] Index built: ${reverse.size} slugs across ${platforms.size} platforms from ${apiUrl}`);
  cachedIndex = { platforms, reverse, fetchedAt: Date.now() };
  return cachedIndex;
}

/**
 * Resolve a company name to ATS platform(s) + slug(s).
 *
 * Strategy:
 * 1. Exact slug match across all platforms
 * 2. Fuzzy: slugified variants (with/without common suffixes)
 * 3. Substring match (slug contains query or query contains slug)
 */
export async function resolveCompany(
  companyName: string,
  options?: { apiUrl?: string },
): Promise<CompanyMatch[]> {
  const index = await buildIndex({ apiUrl: options?.apiUrl });
  const query = slugify(companyName);
  const matches: CompanyMatch[] = [];
  const seen = new Set<string>();

  // 1. Exact match
  const exactPlatforms = index.reverse.get(query);
  if (exactPlatforms) {
    for (const ats of exactPlatforms) {
      const key = `${ats}:${query}`;
      if (!seen.has(key)) {
        seen.add(key);
        matches.push({ company: companyName, slug: query, ats, confidence: "exact" });
      }
    }
  }

  // 2. Try common slug variants
  const variants = generateVariants(query);
  for (const variant of variants) {
    const platforms = index.reverse.get(variant);
    if (platforms) {
      for (const ats of platforms) {
        const key = `${ats}:${variant}`;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push({ company: companyName, slug: variant, ats, confidence: "fuzzy" });
        }
      }
    }
  }

  // 3. Substring / contains search (limited to avoid noise)
  if (matches.length === 0 && query.length >= 3) {
    for (const [slug, platforms] of index.reverse) {
      // slug starts with query or query starts with slug
      if (slug.startsWith(query) || query.startsWith(slug)) {
        for (const ats of platforms) {
          const key = `${ats}:${slug}`;
          if (!seen.has(key)) {
            seen.add(key);
            matches.push({ company: companyName, slug, ats, confidence: "fuzzy" });
          }
        }
      }
      if (matches.length >= 20) break; // cap fuzzy results
    }
  }

  return matches;
}

/**
 * Generate common slug variations for a company name.
 * e.g. "stripe-inc" → ["stripe", "stripe-inc", "stripeinc", "stripe-hq", ...]
 */
function generateVariants(slug: string): string[] {
  const variants = new Set<string>();

  // Strip common suffixes
  const suffixes = ["-inc", "-io", "-co", "-hq", "-com", "-ltd", "-gmbh", "-ag", "-labs", "-ai", "-app", "-tech", "-jobs", "-careers"];
  for (const suffix of suffixes) {
    if (slug.endsWith(suffix)) {
      variants.add(slug.slice(0, -suffix.length));
    }
    // Also try adding suffixes
    variants.add(slug + suffix);
  }

  // Strip hyphens
  variants.add(slug.replace(/-/g, ""));

  // Add hyphens between words if there are none
  if (!slug.includes("-") && slug.length > 4) {
    // Try splitting at common boundary (camelCase-like)
    variants.add(slug);
  }

  // Remove the original slug from variants (it's handled as exact match)
  variants.delete(slug);

  return [...variants];
}

/**
 * Get stats about slug coverage per platform.
 */
export async function getStats(options?: { apiUrl?: string }): Promise<Stats> {
  const index = await buildIndex({ apiUrl: options?.apiUrl });
  const platforms: PlatformStats[] = [];
  let totalSlugs = 0;

  for (const source of SLUG_SOURCES) {
    const slugs = index.platforms.get(source);
    const count = slugs?.size ?? 0;
    totalSlugs += count;
    platforms.push({
      source,
      slugCount: count,
      updatedAt: null, // could fetch metadata endpoint if needed
    });
  }

  return { platforms, totalSlugs };
}

/**
 * Clear the cached index (useful for testing).
 */
export function clearCache(): void {
  cachedIndex = null;
}
