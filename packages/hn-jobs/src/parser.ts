import type { HNJob } from "./types.js";

/**
 * Strip HTML tags and decode entities from HN comment text.
 */
export function htmlToText(html: string): string {
  return html
    .replace(/<p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<a\s+href="([^"]*)"[^>]*>[^<]*<\/a>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .trim();
}

/**
 * Extract URLs from HTML text.
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}

function extractUrls(html: string): string[] {
  const urls: string[] = [];
  const matches = html.matchAll(/href="([^"]+)"/gi);
  for (const m of matches) {
    if (m[1] && !m[1].startsWith("https://news.ycombinator.com")) {
      urls.push(decodeEntities(m[1]));
    }
  }
  return urls;
}

/**
 * Known tech keywords to match against.
 */
const TECH_KEYWORDS = [
  "typescript", "javascript", "python", "go", "golang", "rust", "java", "kotlin",
  "c++", "c#", "ruby", "php", "swift", "scala", "elixir", "clojure", "haskell",
  "react", "next.js", "nextjs", "vue", "angular", "svelte", "solid",
  "node.js", "nodejs", "deno", "bun", "express", "fastify", "hono", "nestjs",
  "django", "flask", "fastapi", "rails", "spring",
  "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch",
  "aws", "gcp", "azure", "docker", "kubernetes", "k8s", "terraform",
  "graphql", "grpc", "rest api",
  "react native", "flutter", "electron",
  "tailwind", "css", "html",
  "playwright", "cypress", "jest", "vitest",
  "llm", "openai", "langchain", "rag", "ai agent", "machine learning", "ml",
  "blockchain", "web3", "solidity",
];

/**
 * Extract technologies mentioned in text.
 */
function extractTechnologies(text: string): string[] {
  const lower = text.toLowerCase();
  return TECH_KEYWORDS.filter((tech) => {
    // Word boundary check for short terms
    if (tech.length <= 3) {
      return new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(lower);
    }
    return lower.includes(tech);
  });
}

/**
 * Parse the first line of an HN Who's Hiring comment.
 * Format is typically: "Company | Role | Location | Remote/Onsite | Salary"
 * Separated by | or pipes, sometimes commas.
 */
function parseFirstLine(text: string): {
  company: string;
  title: string;
  location: string;
  isRemote: boolean;
  isOnsite: boolean;
  isHybrid: boolean;
  salary: string;
} {
  const firstLine = text.split("\n")[0]?.trim() ?? "";

  // Split by pipe
  const parts = firstLine.split("|").map((p) => p.trim());

  let company = parts[0] ?? "";
  let title = "";
  let location = "";
  let isRemote = false;
  let isOnsite = false;
  let isHybrid = false;
  let salary = "";

  const firstLineLower = firstLine.toLowerCase();
  isRemote = /\bremote\b/i.test(firstLineLower);
  isOnsite = /\bonsite\b|\bon-site\b|\bin-office\b/i.test(firstLineLower);
  isHybrid = /\bhybrid\b/i.test(firstLineLower);

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]!;
    const partLower = part.toLowerCase();

    // Salary detection
    if (/\$[\d,]+|\€[\d,]+|£[\d,]+|\d+k\s*[-–]\s*\d+k/i.test(part)) {
      salary = part;
      continue;
    }

    // Remote/onsite/hybrid are already captured
    if (/^(remote|onsite|on-site|hybrid|in-office|full[- ]?time|part[- ]?time|contract|intern)$/i.test(partLower)) {
      continue;
    }

    // Title vs location heuristic
    if (!title && /engineer|developer|lead|manager|designer|architect|scientist|analyst|founder|head of|vp|director|cto|ceo/i.test(partLower)) {
      title = part;
    } else if (!location && /[A-Z][a-z]+,?\s+[A-Z]|remote|worldwide|global|europe|usa|uk/i.test(part)) {
      location = part;
    } else if (!title) {
      title = part;
    } else if (!location) {
      location = part;
    }
  }

  return { company, title, location, isRemote, isOnsite, isHybrid, salary };
}

/**
 * Parse a single HN comment into a structured job posting.
 */
export function parseComment(
  hnId: number,
  html: string,
  postedAt: string,
  threadMonth: string,
  threadId: number
): HNJob | null {
  if (!html) return null;

  const text = htmlToText(html);

  // Skip replies (they typically don't start with Company | format)
  // and very short comments
  if (text.length < 50) return null;

  const { company, title, location, isRemote, isOnsite, isHybrid, salary } = parseFirstLine(text);

  // If we can't even get a company name, skip
  if (!company || company.length < 2) return null;

  const urls = extractUrls(html);
  const technologies = extractTechnologies(text);

  // First URL is usually the company/job URL
  const url = urls[0] ?? "";
  // If there's an explicit apply URL
  const applyUrl = urls.find((u) => /apply|jobs|careers|lever|greenhouse|ashby|workable/i.test(u)) ?? url;

  // Description is everything after the first line
  const lines = text.split("\n");
  const description = lines.slice(1).join("\n").trim();

  return {
    hnId,
    rawHtml: html,
    rawText: text,
    company,
    title,
    location,
    isRemote,
    isOnsite,
    isHybrid,
    salary,
    url,
    applyUrl,
    technologies,
    description,
    postedAt,
    threadMonth,
    threadUrl: `https://news.ycombinator.com/item?id=${threadId}`,
    commentUrl: `https://news.ycombinator.com/item?id=${hnId}`,
  };
}
