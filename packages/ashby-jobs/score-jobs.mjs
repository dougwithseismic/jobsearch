import { readFileSync, writeFileSync } from "node:fs";

// ─── Doug's profile for scoring ───────────────────────────────────────────

const STACK_PRIMARY = [
  "typescript", "react", "next.js", "nextjs", "next js", "node.js", "nodejs",
  "node js", "tailwind", "postgresql", "postgres",
];
const STACK_SECONDARY = [
  "python", "graphql", "redis", "aws", "gcp", "docker", "kubernetes",
  "terraform", "playwright", "vitest", "jest", "drizzle", "hono",
  "express", "nestjs", "fastapi", "svelte", "tanstack", "turborepo",
  "monorepo", "storybook", "supabase", "vercel", "prisma",
];
const STACK_BONUS = [
  "chrome extension", "browser extension", "llm", "ai agent", "rag",
  "mcp", "puppeteer", "scraping", "automation", "growth",
];

const SENIORITY_GOOD = [
  /\bsenior\b/i, /\bsr\.?\b/i, /\blead\b/i, /\bstaff\b/i,
  /\bprincipal\b/i, /\bhead of\b/i, /\bfounding\b/i,
];
const SENIORITY_BAD = [
  /\bjunior\b/i, /\bjr\.?\b/i, /\bintern\b/i, /\bgraduate\b/i,
  /\bentry.level\b/i, /\bassociate\b/i,
];

const ROLE_GOOD = [
  /full.?stack/i, /frontend/i, /front.?end/i, /product engineer/i,
  /software engineer/i, /web engineer/i, /platform engineer/i,
  /growth engineer/i,
];
const ROLE_BAD = [
  /\bios\b/i, /\bandroid\b/i, /\bmobile\b/i, /\bdata scientist\b/i,
  /\bdata analyst\b/i, /\bml engineer\b/i, /\bmachine learning\b/i,
  /\bdevops\b/i, /\bsre\b/i, /\bsite reliability\b/i,
  /\binfrastructure\b/i, /\bembedded\b/i, /\bfirmware\b/i,
  /\bhardware\b/i, /\bsecurity engineer\b/i, /\bqa\b/i,
  /\btest engineer\b/i, /\bsales\b/i, /\bmarketing\b/i,
  /\brecruiter\b/i, /\bdesigner\b/i, /\bsupport\b/i,
  /\baccount\b/i, /\bsolution engineer\b/i, /\bcustomer success\b/i,
];

const EUROPE_LOCATIONS = [
  /europe/i, /\beu\b/i, /\bemea\b/i,
  /czech/i, /prague/i, /germany/i, /berlin/i, /munich/i,
  /london/i, /\buk\b/i, /united kingdom/i, /ireland/i, /dublin/i,
  /amsterdam/i, /netherlands/i, /spain/i, /barcelona/i, /madrid/i,
  /portugal/i, /lisbon/i, /france/i, /paris/i, /austria/i, /vienna/i,
  /switzerland/i, /zurich/i, /poland/i, /warsaw/i, /sweden/i, /stockholm/i,
  /denmark/i, /copenhagen/i, /norway/i, /oslo/i, /finland/i, /helsinki/i,
  /italy/i, /milan/i, /rome/i, /belgium/i, /brussels/i, /hungary/i,
  /budapest/i, /romania/i, /bucharest/i, /croatia/i, /estonia/i, /tallinn/i,
  /latvia/i, /lithuania/i,
];

// Industries Doug likes vs dislikes
const INDUSTRY_GOOD = [
  /music/i, /audio/i, /game/i, /gaming/i, /creative/i, /travel/i,
  /entertainment/i, /media/i, /social/i, /consumer/i, /b2c/i,
  /developer tool/i, /devtool/i, /open.?source/i, /ai/i,
  /robotics/i, /education/i, /edtech/i, /martech/i,
];
const INDUSTRY_BAD = [
  /fintech/i, /banking/i, /insurance/i, /compliance/i,
  /accounting/i, /payroll/i, /\bhcm\b/i, /\bhrm\b/i, /\bhr tech\b/i,
  /legal tech/i, /\bcyber/i,
];

// ─── Load data ────────────────────────────────────────────────────────────

const jobs = JSON.parse(readFileSync("./ashby-data/recent-jobs-full.json", "utf-8"));

// Load existing companies for cross-reference
const companiesSrc = readFileSync("../../apps/web/app/data/companies.ts", "utf-8");
const existingNames = [...companiesSrc.matchAll(/name:\s*"([^"]+)"/g)].map(m => m[1].toLowerCase());

// Load decisions
const decisions = JSON.parse(readFileSync("../../decisions.json", "utf-8"));
const decisionsByName = {};
const companiesById = {};
for (const match of companiesSrc.matchAll(/id:\s*(\d+),\s*\n\s*name:\s*"([^"]+)"/g)) {
  companiesById[match[1]] = match[2].toLowerCase();
}
for (const [id, decision] of Object.entries(decisions)) {
  const name = companiesById[id];
  if (name) decisionsByName[name] = decision;
}

// ─── Scoring ──────────────────────────────────────────────────────────────

function scoreJob(job) {
  const title = (job.title || "").toLowerCase();
  const desc = (job.descriptionPlain || "").toLowerCase();
  const loc = (job.location || "").toLowerCase();
  const dept = (job.department || "").toLowerCase();
  const company = (job.company || "").toLowerCase();
  const text = `${title} ${desc}`;

  let score = 0;
  const reasons = [];

  // 1. Stack match (0-30 points)
  let stackScore = 0;
  const stackMatches = [];
  for (const tech of STACK_PRIMARY) {
    if (text.includes(tech)) { stackScore += 4; stackMatches.push(tech); }
  }
  for (const tech of STACK_SECONDARY) {
    if (text.includes(tech)) { stackScore += 2; stackMatches.push(tech); }
  }
  for (const tech of STACK_BONUS) {
    if (text.includes(tech)) { stackScore += 3; stackMatches.push(tech); }
  }
  stackScore = Math.min(stackScore, 30);
  score += stackScore;
  if (stackMatches.length > 0) reasons.push(`stack:${stackMatches.slice(0, 6).join("+")}`);

  // 2. Seniority (−20 to +15)
  let seniorityScore = 0;
  if (SENIORITY_GOOD.some(r => r.test(title))) { seniorityScore += 15; reasons.push("seniority:match"); }
  if (SENIORITY_BAD.some(r => r.test(title))) { seniorityScore -= 20; reasons.push("seniority:too-junior"); }
  score += seniorityScore;

  // 3. Role fit (−25 to +15)
  let roleScore = 0;
  if (ROLE_GOOD.some(r => r.test(title))) { roleScore += 15; reasons.push("role:match"); }
  if (ROLE_BAD.some(r => r.test(title))) { roleScore -= 25; reasons.push("role:mismatch"); }
  score += roleScore;

  // 4. Location (0-20)
  let locationScore = 0;
  const isEurope = EUROPE_LOCATIONS.some(r => r.test(loc));
  const isRemote = job.isRemote || /remote/i.test(loc) || /remote/i.test(job.workplaceType || "");
  if (loc.includes("prague") || loc.includes("czech")) { locationScore += 20; reasons.push("loc:prague"); }
  else if (isEurope && isRemote) { locationScore += 18; reasons.push("loc:eu+remote"); }
  else if (isEurope) { locationScore += 12; reasons.push("loc:europe"); }
  else if (isRemote) { locationScore += 8; reasons.push("loc:remote"); }
  else { locationScore -= 5; reasons.push("loc:not-eu"); }
  score += locationScore;

  // 5. Industry/company signals (−10 to +10)
  let industryScore = 0;
  if (INDUSTRY_GOOD.some(r => r.test(text) || r.test(company))) { industryScore += 10; reasons.push("industry:good"); }
  if (INDUSTRY_BAD.some(r => r.test(text) || r.test(company))) { industryScore -= 10; reasons.push("industry:bad"); }
  score += industryScore;

  // 6. Recency bonus (0-10)
  const published = job.publishedAt ? new Date(job.publishedAt) : null;
  const daysAgo = published ? (Date.now() - published.getTime()) / (1000 * 60 * 60 * 24) : 30;
  const recencyScore = Math.max(0, Math.round(10 - daysAgo / 3));
  score += recencyScore;
  if (recencyScore >= 7) reasons.push("fresh");

  // 7. Company size signals (bonus for smaller)
  if (/early.stage|seed|series.a|startup|small team/i.test(desc)) {
    score += 5; reasons.push("small-co");
  }

  // 8. Cross-reference with existing companies
  let existingDecision = null;
  const companyLower = company.toLowerCase();
  if (decisionsByName[companyLower]) {
    existingDecision = decisionsByName[companyLower];
    if (existingDecision === "yes") { score += 10; reasons.push("decided:YES"); }
    else if (existingDecision === "maybe") { score += 5; reasons.push("decided:maybe"); }
    else if (existingDecision === "no") { score -= 15; reasons.push("decided:NO"); }
  } else if (existingNames.some(n => companyLower.includes(n) || n.includes(companyLower))) {
    reasons.push("known-company");
  }

  // 9. Blacklist
  if (companyLower.includes("apify")) { score = -100; reasons.push("BLACKLISTED"); }

  return {
    score,
    reasons: reasons.join(", "),
    existingDecision,
    company: job.company,
    title: job.title,
    department: job.department || "",
    location: job.location,
    isRemote,
    publishedAt: job.publishedAt?.split("T")[0] || "",
    jobUrl: job.jobUrl,
    applyUrl: job.applyUrl,
    compensation: job.compensationTierSummary || "",
    daysAgo: Math.round(daysAgo),
  };
}

// ─── Run scoring ──────────────────────────────────────────────────────────

console.log(`Scoring ${jobs.length} jobs...`);

const scored = jobs.map(scoreJob).sort((a, b) => b.score - a.score);

// ─── Output ───────────────────────────────────────────────────────────────

function quote(s) {
  if (!s) return '""';
  return '"' + String(s).replace(/"/g, '""') + '"';
}

// Full ranked CSV
const headers = [
  "score","reasons","existing_decision","company","title","department",
  "location","remote","publishedAt","daysAgo","jobUrl","applyUrl","compensation"
];
const csvRows = [headers.join(",")];
for (const job of scored) {
  csvRows.push([
    job.score,
    quote(job.reasons),
    job.existingDecision || "",
    quote(job.company),
    quote(job.title),
    quote(job.department),
    quote(job.location),
    String(job.isRemote),
    job.publishedAt,
    job.daysAgo,
    job.jobUrl,
    job.applyUrl,
    quote(job.compensation),
  ].join(","));
}
writeFileSync("../../ashby-scored.csv", csvRows.join("\n"));

// Top 200 shortlist
const shortlist = scored.filter(j => j.score > 0).slice(0, 200);
const shortlistRows = [headers.join(",")];
for (const job of shortlist) {
  shortlistRows.push([
    job.score,
    quote(job.reasons),
    job.existingDecision || "",
    quote(job.company),
    quote(job.title),
    quote(job.department),
    quote(job.location),
    String(job.isRemote),
    job.publishedAt,
    job.daysAgo,
    job.jobUrl,
    job.applyUrl,
    quote(job.compensation),
  ].join(","));
}
writeFileSync("../../ashby-shortlist.csv", shortlistRows.join("\n"));

// Stats
const tiers = {
  "A (60+)": scored.filter(j => j.score >= 60),
  "B (40-59)": scored.filter(j => j.score >= 40 && j.score < 60),
  "C (20-39)": scored.filter(j => j.score >= 20 && j.score < 40),
  "D (0-19)": scored.filter(j => j.score >= 0 && j.score < 20),
  "Skip (<0)": scored.filter(j => j.score < 0),
};

console.log("\n─── SCORING RESULTS ───");
for (const [tier, jobs] of Object.entries(tiers)) {
  console.log(`  ${tier}: ${jobs.length} jobs`);
}
console.log(`\nTop 15:`);
for (const job of scored.slice(0, 15)) {
  console.log(`  [${job.score}] ${job.company} — ${job.title} (${job.location}) ${job.existingDecision ? `[${job.existingDecision.toUpperCase()}]` : ""}`);
  console.log(`         ${job.reasons}`);
}

const yesCompanyJobs = scored.filter(j => j.existingDecision === "yes");
console.log(`\nJobs at "yes" companies: ${yesCompanyJobs.length}`);
for (const job of yesCompanyJobs.slice(0, 10)) {
  console.log(`  [${job.score}] ${job.company} — ${job.title}`);
}

console.log(`\nFull ranked: ashby-scored.csv (${scored.length} jobs)`);
console.log(`Shortlist: ashby-shortlist.csv (${shortlist.length} jobs, score > 0)`);
