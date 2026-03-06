import { readFileSync } from "node:fs";

const STACK_PRIMARY = ["typescript","react","next.js","nextjs","next js","node.js","nodejs","node js","tailwind","postgresql","postgres"];
const STACK_SECONDARY = ["python","graphql","redis","aws","gcp","docker","kubernetes","terraform","playwright","vitest","jest","drizzle","hono","express","nestjs","fastapi","svelte","tanstack","turborepo","monorepo","storybook","supabase","vercel","prisma"];
const STACK_BONUS = ["chrome extension","browser extension","llm","ai agent","rag","mcp","puppeteer","scraping","automation","growth"];
const SENIORITY_GOOD = [/\bsenior\b/i,/\bsr\.?\b/i,/\blead\b/i,/\bstaff\b/i,/\bprincipal\b/i,/\bhead of\b/i,/\bfounding\b/i];
const SENIORITY_BAD = [/\bjunior\b/i,/\bjr\.?\b/i,/\bintern\b/i,/\bgraduate\b/i,/\bentry.level\b/i,/\bassociate\b/i];
const ROLE_GOOD = [/full.?stack/i,/frontend/i,/front.?end/i,/product engineer/i,/software engineer/i,/web engineer/i,/platform engineer/i,/growth engineer/i];
const ROLE_BAD = [/\bios\b/i,/\bandroid\b/i,/\bmobile\b/i,/\bdata scientist\b/i,/\bdata analyst\b/i,/\bml engineer\b/i,/\bmachine learning\b/i,/\bdevops\b/i,/\bsre\b/i,/\bsite reliability\b/i,/\binfrastructure\b/i,/\bembedded\b/i,/\bfirmware\b/i,/\bhardware\b/i,/\bsecurity engineer\b/i,/\bqa\b/i,/\btest engineer\b/i,/\bsales\b/i,/\bmarketing\b/i,/\brecruiter\b/i,/\bdesigner\b/i,/\bsupport\b/i,/\baccount\b/i,/\bsolution engineer\b/i,/\bcustomer success\b/i];
const EUROPE_LOCATIONS = [/europe/i,/\beu\b/i,/\bemea\b/i,/czech/i,/prague/i,/germany/i,/berlin/i,/munich/i,/london/i,/\buk\b/i,/united kingdom/i,/ireland/i,/dublin/i,/amsterdam/i,/netherlands/i,/spain/i,/barcelona/i,/madrid/i,/portugal/i,/lisbon/i,/france/i,/paris/i,/austria/i,/vienna/i,/switzerland/i,/zurich/i,/poland/i,/warsaw/i,/sweden/i,/stockholm/i,/denmark/i,/copenhagen/i,/norway/i,/oslo/i,/finland/i,/helsinki/i,/italy/i,/milan/i,/rome/i,/belgium/i,/brussels/i,/hungary/i,/budapest/i,/romania/i,/bucharest/i,/croatia/i,/estonia/i,/tallinn/i,/latvia/i,/lithuania/i];
const INDUSTRY_GOOD = [/music/i,/audio/i,/game/i,/gaming/i,/creative/i,/travel/i,/entertainment/i,/media/i,/social/i,/consumer/i,/b2c/i,/developer tool/i,/devtool/i,/open.?source/i,/\bai\b/i,/robotics/i,/education/i,/edtech/i,/martech/i];
const INDUSTRY_BAD = [/fintech/i,/banking/i,/insurance/i,/compliance/i,/accounting/i,/payroll/i,/\bhcm\b/i,/\bhrm\b/i,/\bhr tech\b/i,/legal tech/i,/\bcyber/i];

const jobs = JSON.parse(readFileSync("./ashby-data/recent-jobs-full.json", "utf-8"));
const companiesSrc = readFileSync("../../apps/web/app/data/companies.ts", "utf-8");
const decisions = JSON.parse(readFileSync("../../decisions.json", "utf-8"));
const companiesById = {};
for (const match of companiesSrc.matchAll(/id:\s*(\d+),\s*\n\s*name:\s*"([^"]+)"/g)) companiesById[match[1]] = match[2].toLowerCase();
const decisionsByName = {};
for (const [id, dec] of Object.entries(decisions)) { const n = companiesById[id]; if (n) decisionsByName[n] = dec; }

function scoreJob(job) {
  const title = (job.title || "").toLowerCase();
  const desc = (job.descriptionPlain || "").toLowerCase();
  const loc = (job.location || "").toLowerCase();
  const company = (job.company || "").toLowerCase();
  const text = title + " " + desc;
  let score = 0;
  const reasons = [];

  let ss = 0;
  const sm = [];
  for (const t of STACK_PRIMARY) if (text.includes(t)) { ss += 4; sm.push(t); }
  for (const t of STACK_SECONDARY) if (text.includes(t)) { ss += 2; sm.push(t); }
  for (const t of STACK_BONUS) if (text.includes(t)) { ss += 3; sm.push(t); }
  ss = Math.min(ss, 30);
  score += ss;
  if (sm.length > 0) reasons.push("stack:" + sm.join("+"));

  if (SENIORITY_GOOD.some(r => r.test(title))) { score += 15; reasons.push("seniority:match"); }
  if (SENIORITY_BAD.some(r => r.test(title))) { score -= 20; reasons.push("seniority:junior"); }
  if (ROLE_GOOD.some(r => r.test(title))) { score += 15; reasons.push("role:match"); }
  if (ROLE_BAD.some(r => r.test(title))) { score -= 25; reasons.push("role:mismatch"); }

  const isEu = EUROPE_LOCATIONS.some(r => r.test(loc));
  const isRem = job.isRemote || /remote/i.test(loc) || /remote/i.test(job.workplaceType || "");
  if (loc.includes("prague") || loc.includes("czech")) { score += 20; reasons.push("loc:prague"); }
  else if (isEu && isRem) { score += 18; reasons.push("loc:eu+remote"); }
  else if (isEu) { score += 12; reasons.push("loc:europe"); }
  else if (isRem) { score += 8; reasons.push("loc:remote"); }
  else { score -= 5; reasons.push("loc:not-eu"); }

  if (INDUSTRY_GOOD.some(r => r.test(text) || r.test(company))) { score += 10; reasons.push("industry:good"); }
  if (INDUSTRY_BAD.some(r => r.test(text) || r.test(company))) { score -= 10; reasons.push("industry:bad"); }

  const pub = job.publishedAt ? new Date(job.publishedAt) : null;
  const days = pub ? (Date.now() - pub.getTime()) / (1000 * 60 * 60 * 24) : 30;
  const rec = Math.max(0, Math.round(10 - days / 3));
  score += rec;
  if (rec >= 7) reasons.push("fresh");

  if (/early.stage|seed|series.a|startup|small team/i.test(desc)) { score += 5; reasons.push("small-co"); }

  let dec = null;
  if (decisionsByName[company]) {
    dec = decisionsByName[company];
    if (dec === "yes") { score += 10; reasons.push("decided:YES"); }
    else if (dec === "maybe") { score += 5; reasons.push("decided:maybe"); }
    else if (dec === "no") { score -= 15; reasons.push("decided:NO"); }
  }
  if (company.includes("apify")) { score = -100; reasons.push("BLACKLISTED"); }

  return {
    score, reasons: reasons.join(", "), existingDecision: dec,
    company: job.company, title: job.title, department: job.department || "",
    location: job.location, isRemote: isRem,
    publishedAt: job.publishedAt?.split("T")[0] || "",
    jobUrl: job.jobUrl, applyUrl: job.applyUrl,
    compensation: job.compensationTierSummary || "",
    daysAgo: Math.round(days),
    descSnippet: (job.descriptionPlain || "").replace(/\n/g, " ").slice(0, 400),
  };
}

const scored = jobs.map(scoreJob).sort((a, b) => b.score - a.score);
const aTier = scored.filter(j => j.score >= 60);

// Group by company
const byCompany = {};
for (const j of aTier) {
  const key = j.company.toLowerCase();
  if (!byCompany[key]) byCompany[key] = { company: j.company, jobs: [], topScore: 0 };
  byCompany[key].jobs.push(j);
  if (j.score > byCompany[key].topScore) byCompany[key].topScore = j.score;
}
const grouped = Object.values(byCompany).sort((a, b) => b.topScore - a.topScore);

// Print report
console.log("═══════════════════════════════════════════════════════════════");
console.log(`  A-TIER REPORT: ${aTier.length} jobs across ${grouped.length} companies`);
console.log("  Score 60+ | Last 30 days | Engineering roles");
console.log("═══════════════════════════════════════════════════════════════\n");

for (const group of grouped) {
  const tag = group.jobs[0].existingDecision ? ` [${group.jobs[0].existingDecision.toUpperCase()}]` : "";
  console.log(`── ${group.company}${tag} (${group.jobs.length} role${group.jobs.length > 1 ? "s" : ""}) ──`);
  for (const j of group.jobs.sort((a, b) => b.score - a.score)) {
    console.log(`   [${j.score}] ${j.title}`);
    console.log(`        ${j.location} | ${j.isRemote ? "Remote" : "On-site"} | Posted ${j.publishedAt} (${j.daysAgo}d ago)`);
    if (j.compensation) console.log(`        Comp: ${j.compensation}`);
    console.log(`        Why: ${j.reasons}`);
    console.log(`        ${j.jobUrl}`);
    console.log("");
  }
}

// Summary stats
const locations = {};
for (const j of aTier) {
  const l = j.location.split(",")[0].trim();
  locations[l] = (locations[l] || 0) + 1;
}
const topLocations = Object.entries(locations).sort((a, b) => b[1] - a[1]).slice(0, 15);

console.log("═══════════════════════════════════════════════════════════════");
console.log("  SUMMARY");
console.log("═══════════════════════════════════════════════════════════════");
console.log(`  Total A-tier jobs: ${aTier.length}`);
console.log(`  Companies: ${grouped.length}`);
console.log(`  At "yes" companies: ${aTier.filter(j => j.existingDecision === "yes").length}`);
console.log(`  At "maybe" companies: ${aTier.filter(j => j.existingDecision === "maybe").length}`);
console.log(`  Remote-friendly: ${aTier.filter(j => j.isRemote).length}`);
console.log(`  Europe-based: ${aTier.filter(j => EUROPE_LOCATIONS.some(r => r.test(j.location))).length}`);
console.log(`\n  Top locations:`);
for (const [loc, count] of topLocations) console.log(`    ${loc}: ${count}`);
