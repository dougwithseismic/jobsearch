/**
 * Shared normalizer helpers — salary parsing, seniority inference,
 * employment type normalization, location building.
 */

import type {
  EmploymentType,
  SeniorityLevel,
  WorkplaceType,
  JobLocation,
  JobSalary,
  Region,
} from "../unified-schema.js";
import { classifyRegion, inferCountry } from "../region.js";

// ── Salary parsing ─────────────────────────────────────────

const CURRENCY_MAP: Record<string, string> = {
  "$": "USD", "£": "GBP", "€": "EUR", "¥": "JPY",
  "CHF": "CHF", "SEK": "SEK", "NOK": "NOK", "DKK": "DKK",
  "PLN": "PLN", "CZK": "CZK", "HUF": "HUF", "RON": "RON",
  "AUD": "AUD", "CAD": "CAD", "NZD": "NZD", "SGD": "SGD",
  "HKD": "HKD", "INR": "INR", "BRL": "BRL", "MXN": "MXN",
  "ZAR": "ZAR", "ILS": "ILS", "AED": "AED", "KRW": "KRW",
  "TWD": "TWD", "THB": "THB",
};

function parseNumber(s: string): number | null {
  const clean = s.replace(/[,\s]/g, "").replace(/k$/i, "000");
  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

export function parseSalary(text: string): JobSalary {
  const result: JobSalary = { text, min: null, max: null, currency: null, period: null };
  if (!text || /competitive|negotiable|doe|dob|open/i.test(text)) return result;

  // Detect currency
  const currencyMatch = text.match(/(\$|£|€|¥)/);
  if (currencyMatch) {
    result.currency = CURRENCY_MAP[currencyMatch[1]!] ?? null;
  }
  if (!result.currency) {
    const codeMatch = text.match(/\b([A-Z]{3})\b/);
    if (codeMatch && CURRENCY_MAP[codeMatch[1]!]) {
      result.currency = CURRENCY_MAP[codeMatch[1]!]!;
    }
  }
  if (!result.currency && /usd/i.test(text)) result.currency = "USD";
  if (!result.currency && /eur/i.test(text)) result.currency = "EUR";
  if (!result.currency && /gbp/i.test(text)) result.currency = "GBP";

  // Detect period
  if (/\b(per\s+)?hour|hourly|\/\s*hr?\b/i.test(text)) result.period = "hourly";
  else if (/\b(per\s+)?day|daily|\/\s*day\b/i.test(text)) result.period = "daily";
  else if (/\b(per\s+)?week|weekly|\/\s*w(ee)?k\b/i.test(text)) result.period = "weekly";
  else if (/\b(per\s+)?month|monthly|\/\s*mo(nth)?\b/i.test(text)) result.period = "monthly";
  else if (/\b(per\s+)?year|annual|yearly|\/\s*yr?\b|p\.?a\.?\b/i.test(text)) result.period = "yearly";

  // Extract numbers — look for range pattern like "120,000 - 180,000" or "120K-180K"
  const rangeMatch = text.match(
    /[\$£€¥]?\s*([\d,]+\.?\d*)\s*[kK]?\s*[-–—to]+\s*[\$£€¥]?\s*([\d,]+\.?\d*)\s*[kK]?/
  );
  if (rangeMatch) {
    const rawMin = rangeMatch[1]! + (text.slice(text.indexOf(rangeMatch[1]!) + rangeMatch[1]!.length).match(/^[kK]/)?.[0] ?? "");
    const rawMax = rangeMatch[2]! + (text.slice(text.indexOf(rangeMatch[2]!, text.indexOf(rangeMatch[1]!) + rangeMatch[1]!.length) + rangeMatch[2]!.length).match(/^[kK]/)?.[0] ?? "");
    result.min = parseNumber(rawMin);
    result.max = parseNumber(rawMax);
  } else {
    // Single number
    const singleMatch = text.match(/[\$£€¥]?\s*([\d,]+\.?\d*)\s*[kK]?/);
    if (singleMatch) {
      const rawNum = singleMatch[1]! + (text.slice(text.indexOf(singleMatch[1]!) + singleMatch[1]!.length).match(/^[kK]/)?.[0] ?? "");
      const num = parseNumber(rawNum);
      if (num !== null && num > 0) {
        result.min = num;
        result.max = num;
      }
    }
  }

  // Infer period from magnitude if not explicitly stated
  if (result.min !== null && !result.period) {
    if (result.min >= 10000) result.period = "yearly";
    else if (result.min >= 1000) result.period = "monthly";
    else if (result.min >= 100) result.period = "daily";
    else result.period = "hourly";
  }

  return result;
}

// ── Seniority inference ────────────────────────────────────

const SENIORITY_TITLE_PATTERNS: [RegExp, SeniorityLevel][] = [
  [/\b(c-suite|chief|cto|cfo|ceo|coo|cmo|cpo|cro)\b/i, "c-level"],
  [/\bvp\b|\bvice\s+president\b/i, "vp"],
  [/\bdirector\b/i, "director"],
  [/\b(head\s+of|engineering\s+manager|eng\s+manager)\b/i, "manager"],
  [/\bmanager\b/i, "manager"],
  [/\bprincipal\b/i, "principal"],
  [/\bstaff\b/i, "staff"],
  [/\b(tech\s+lead|team\s+lead|lead)\b/i, "lead"],
  [/\bsenior\b|\bsr\.?\b/i, "senior"],
  [/\b(mid[\s-]?level|intermediate)\b/i, "mid"],
  [/\bjunior\b|\bjr\.?\b/i, "junior"],
  [/\bintern\b|\binternship\b/i, "intern"],
];

const RAW_SENIORITY_MAP: Record<string, SeniorityLevel> = {
  "entry": "junior",
  "entry-level": "junior",
  "entry level": "junior",
  "junior": "junior",
  "associate": "junior",
  "mid": "mid",
  "mid-level": "mid",
  "mid level": "mid",
  "intermediate": "mid",
  "mid-senior": "senior",
  "mid-senior level": "senior",
  "mid_senior_level": "senior",
  "senior": "senior",
  "experienced": "senior",
  "staff": "staff",
  "principal": "principal",
  "lead": "lead",
  "manager": "manager",
  "director": "director",
  "executive": "vp",
  "vp": "vp",
  "c-level": "c-level",
};

export function inferSeniority(title: string, rawLevel?: string): SeniorityLevel {
  // Check raw level first (from ATS fields)
  if (rawLevel) {
    const normalized = rawLevel.trim().toLowerCase();
    if (RAW_SENIORITY_MAP[normalized]) return RAW_SENIORITY_MAP[normalized]!;
  }

  // Infer from title
  for (const [pattern, level] of SENIORITY_TITLE_PATTERNS) {
    if (pattern.test(title)) return level;
  }

  // Default: most jobs without explicit seniority markers are mid-level
  return "mid";
}

// ── Employment type normalization ──────────────────────────

const EMPLOYMENT_TYPE_MAP: Record<string, EmploymentType> = {
  "full-time": "full-time",
  "full_time": "full-time",
  "fulltime": "full-time",
  "full time": "full-time",
  "permanent": "full-time",
  "ft": "full-time",
  "regular": "full-time",
  "full": "full-time",
  "part-time": "part-time",
  "part_time": "part-time",
  "parttime": "part-time",
  "part time": "part-time",
  "pt": "part-time",
  "contract": "contract",
  "contractor": "contract",
  "temp": "temporary",
  "temporary": "temporary",
  "freelance": "freelance",
  "freelancer": "freelance",
  "intern": "internship",
  "internship": "internship",
  "co-op": "internship",
  "coop": "internship",
  "volunteer": "volunteer",
};

export function normalizeEmploymentType(raw: string): EmploymentType {
  if (!raw) return "full-time"; // vast majority of postings without explicit type are full-time
  const key = raw.trim().toLowerCase();
  return EMPLOYMENT_TYPE_MAP[key] ?? "full-time";
}

// ── Workplace type normalization ───────────────────────────

export function normalizeWorkplaceType(raw?: string, isRemote?: boolean, locationText?: string): WorkplaceType {
  // Explicit ATS field (Lever, Ashby, Workable have this)
  if (raw) {
    const lower = raw.toLowerCase();
    if (lower.includes("remote")) return "remote";
    if (lower.includes("hybrid")) return "hybrid";
    if (lower.includes("on-site") || lower.includes("onsite") || lower.includes("in-office") || lower.includes("in office")) return "onsite";
  }

  // Boolean flag from ATS
  if (isRemote) return "remote";

  // Infer from location text
  if (locationText) {
    const loc = locationText.toLowerCase();
    if (/\bremote\b/.test(loc)) return "remote";
    if (/\bhybrid\b/.test(loc)) return "hybrid";
  }

  // If we have a physical location, it's likely onsite
  if (locationText && locationText.length > 2 && !/\bremote\b/i.test(locationText ?? "")) {
    return "onsite";
  }

  return "onsite"; // default: most jobs are onsite unless stated otherwise
}

// ── Location building ──────────────────────────────────────

export function buildLocation(opts: {
  text?: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  countryCode?: string | null;
  lat?: number | null;
  lng?: number | null;
}): JobLocation {
  const text = opts.text ?? [opts.city, opts.state, opts.country].filter(Boolean).join(", ");
  const countryCode = opts.countryCode ?? (opts.country?.length === 2 ? opts.country : null) ?? inferCountry(text);
  const isRemote = /remote/i.test(text);

  let region: Region;
  if (countryCode) {
    region = countryCodeToRegion(countryCode) ?? (isRemote ? "remote-global" : "other");
  } else {
    // Use the existing classifyRegion but map to new Region type
    const oldRegion = classifyRegion(text, countryCode ?? "", isRemote);
    region = mapOldRegion(oldRegion);
  }

  return {
    text,
    city: opts.city ?? null,
    state: opts.state ?? null,
    country: countryCode || null,
    region,
    lat: opts.lat ?? null,
    lng: opts.lng ?? null,
  };
}

function mapOldRegion(old: string): Region {
  switch (old) {
    case "europe": return "europe";
    case "north-america": return "north-america";
    case "asia": return "asia-pacific";
    case "remote": return "remote-global";
    default: return "other";
  }
}

const REGION_MAP: Record<string, Region> = {
  // Europe
  AT: "europe", BE: "europe", BG: "europe", HR: "europe", CY: "europe",
  CZ: "europe", DK: "europe", EE: "europe", FI: "europe", FR: "europe",
  DE: "europe", GR: "europe", HU: "europe", IE: "europe", IT: "europe",
  LV: "europe", LT: "europe", LU: "europe", MT: "europe", NL: "europe",
  NO: "europe", PL: "europe", PT: "europe", RO: "europe", SK: "europe",
  SI: "europe", ES: "europe", SE: "europe", CH: "europe", GB: "europe",
  UK: "europe", RS: "europe", UA: "europe", IS: "europe", AL: "europe",
  // North America
  US: "north-america", CA: "north-america", MX: "north-america",
  // South America
  BR: "south-america", AR: "south-america", CL: "south-america",
  CO: "south-america", PE: "south-america", UY: "south-america",
  // Asia-Pacific
  JP: "asia-pacific", KR: "asia-pacific", CN: "asia-pacific", IN: "asia-pacific",
  SG: "asia-pacific", HK: "asia-pacific", TW: "asia-pacific", TH: "asia-pacific",
  VN: "asia-pacific", PH: "asia-pacific", ID: "asia-pacific", MY: "asia-pacific",
  AU: "asia-pacific", NZ: "asia-pacific",
  // Middle East
  IL: "middle-east", AE: "middle-east", SA: "middle-east", QA: "middle-east",
  BH: "middle-east", KW: "middle-east",
  // Africa
  ZA: "africa", NG: "africa", KE: "africa", EG: "africa", GH: "africa",
};

function countryCodeToRegion(code: string): Region | undefined {
  return REGION_MAP[code.toUpperCase()];
}
