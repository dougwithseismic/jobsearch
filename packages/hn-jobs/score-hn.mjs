import { readFileSync, writeFileSync } from "node:fs";

const STACK_PRIMARY = ["typescript","react","next.js","nextjs","node.js","nodejs","tailwind","postgresql","postgres"];
const STACK_SECONDARY = ["python","graphql","redis","aws","gcp","docker","kubernetes","terraform","playwright","vitest","jest","drizzle","hono","express","nestjs","fastapi","svelte","tanstack","turborepo","monorepo","storybook","supabase","vercel","prisma"];
const STACK_BONUS = ["chrome extension","browser extension","llm","ai agent","rag","mcp","puppeteer","scraping","automation","growth"];

const SENIORITY_GOOD = [/\bsenior\b/i,/\bsr\.?\b/i,/\blead\b/i,/\bstaff\b/i,/\bprincipal\b/i,/\bhead of\b/i,/\bfounding\b/i,/\bfirst engineer\b/i];
const SENIORITY_BAD = [/\bjunior\b/i,/\bjr\.?\b/i,/\bintern\b/i,/\bgraduate\b/i,/\bentry.level\b/i];

const ROLE_GOOD = [/full.?stack/i,/frontend/i,/front.?end/i,/product engineer/i,/software engineer/i,/web engineer/i,/growth engineer/i,/founding engineer/i,/first engineer/i];
const ROLE_BAD = [/\bios\b/i,/\bandroid\b/i,/\bmobile\b/i,/\bdata scientist\b/i,/\bml engineer\b/i,/\bdevops\b/i,/\bsre\b/i,/\bembedded\b/i,/\bfirmware\b/i,/\bhardware\b/i,/\bsecurity engineer\b/i,/\bqa\b/i];

const EUROPE_LOCATIONS = [/europe/i,/\beu\b/i,/\bemea\b/i,/czech/i,/prague/i,/germany/i,/berlin/i,/munich/i,/london/i,/\buk\b/i,/united kingdom/i,/ireland/i,/dublin/i,/amsterdam/i,/netherlands/i,/spain/i,/barcelona/i,/madrid/i,/portugal/i,/lisbon/i,/france/i,/paris/i,/austria/i,/vienna/i,/switzerland/i,/zurich/i,/poland/i,/warsaw/i,/sweden/i,/stockholm/i,/denmark/i,/copenhagen/i,/norway/i,/oslo/i,/finland/i,/helsinki/i,/italy/i,/milan/i,/belgium/i,/brussels/i,/hungary/i,/budapest/i,/romania/i,/estonia/i,/tallinn/i,/latvia/i,/lithuania/i];

const INDUSTRY_GOOD = [/music/i,/audio/i,/game/i,/gaming/i,/creative/i,/travel/i,/entertainment/i,/media/i,/social/i,/consumer/i,/developer tool/i,/devtool/i,/open.?source/i,/\bai\b/i,/robotics/i,/education/i,/martech/i];
const INDUSTRY_BAD = [/fintech/i,/banking/i,/insurance/i,/compliance/i,/accounting/i,/payroll/i,/legal tech/i,/\bcyber/i];

// Signals that this is a founder/small-company posting (HN-specific)
const FOUNDER_SIGNALS = [/\bfounder\b/i,/\bfounding\b/i,/\bfirst engineer\b/i,/\bsmall team\b/i,/\bearl[y|ier] stage\b/i,/\byc\b/i,/\by combinator\b/i,/\bseed\b/i,/\bseries a\b/i,/\bwe're \d+ people\b/i,/\bteam of \d+\b/i,/\b[1-9] employees?\b/i,/\b1[0-5] employees?\b/i];

const jobs = JSON.parse(readFileSync("./hn-data/hn-jobs.json", "utf-8"));

function scoreJob(job) {
  const title = (job.title || "").toLowerCase();
  const company = (job.company || "").toLowerCase();
  const desc = (job.description || "").toLowerCase();
  const loc = (job.location || "").toLowerCase();
  const text = `${title} ${desc} ${company}`;
  const firstLine = `${job.company} | ${job.title} | ${job.location}`;

  let score = 0;
  const reasons = [];

  // Stack match (0-30)
  let ss = 0;
  const sm = [];
  for (const t of STACK_PRIMARY) if (text.includes(t)) { ss += 4; sm.push(t); }
  for (const t of STACK_SECONDARY) if (text.includes(t)) { ss += 2; sm.push(t); }
  for (const t of STACK_BONUS) if (text.includes(t)) { ss += 3; sm.push(t); }
  // Also check the technologies array
  for (const t of (job.technologies || [])) {
    const tl = t.toLowerCase();
    if (STACK_PRIMARY.includes(tl) && !sm.includes(tl)) { ss += 4; sm.push(tl); }
    if (STACK_SECONDARY.includes(tl) && !sm.includes(tl)) { ss += 2; sm.push(tl); }
  }
  ss = Math.min(ss, 30);
  score += ss;
  if (sm.length > 0) reasons.push("stack:" + sm.slice(0, 6).join("+"));

  // Seniority
  const titleAndFirst = title + " " + firstLine.toLowerCase();
  if (SENIORITY_GOOD.some(r => r.test(titleAndFirst))) { score += 15; reasons.push("seniority:match"); }
  if (SENIORITY_BAD.some(r => r.test(titleAndFirst))) { score -= 20; reasons.push("seniority:junior"); }

  // Role fit
  if (ROLE_GOOD.some(r => r.test(titleAndFirst))) { score += 15; reasons.push("role:match"); }
  if (ROLE_BAD.some(r => r.test(titleAndFirst))) { score -= 25; reasons.push("role:mismatch"); }

  // Location
  const isEu = EUROPE_LOCATIONS.some(r => r.test(loc));
  const isRemote = job.isRemote;
  if (loc.includes("prague") || loc.includes("czech")) { score += 20; reasons.push("loc:prague"); }
  else if (isEu && isRemote) { score += 18; reasons.push("loc:eu+remote"); }
  else if (isEu) { score += 12; reasons.push("loc:europe"); }
  else if (isRemote) { score += 8; reasons.push("loc:remote"); }
  else if (/worldwide|global|anywhere/i.test(loc)) { score += 8; reasons.push("loc:worldwide"); }
  else { score -= 5; reasons.push("loc:not-eu"); }

  // Industry
  if (INDUSTRY_GOOD.some(r => r.test(text))) { score += 10; reasons.push("industry:good"); }
  if (INDUSTRY_BAD.some(r => r.test(text))) { score -= 10; reasons.push("industry:bad"); }

  // HN-specific: founder/small-company bonus (BIG deal for Doug)
  let founderScore = 0;
  if (FOUNDER_SIGNALS.some(r => r.test(text))) { founderScore += 15; reasons.push("founder-energy"); }
  score += founderScore;

  // Salary mentioned is a transparency signal
  if (job.salary) { score += 3; reasons.push("salary-listed"); }

  // Blacklist
  if (company.includes("apify")) { score = -100; reasons.push("BLACKLISTED"); }

  return {
    score,
    reasons: reasons.join(", "),
    company: job.company,
    title: job.title,
    location: job.location,
    isRemote: job.isRemote,
    salary: job.salary,
    technologies: (job.technologies || []).join(", "),
    url: job.url,
    commentUrl: job.commentUrl,
    threadMonth: job.threadMonth,
    description: (job.description || "").slice(0, 300),
  };
}

const scored = jobs.map(scoreJob).sort((a, b) => b.score - a.score);
const aTier = scored.filter(j => j.score >= 50); // Lower threshold for HN since posts are less structured

function quote(s) { if (!s) return '""'; return '"' + String(s).replace(/"/g, '""') + '"'; }

const headers = ["score","reasons","company","title","location","remote","salary","technologies","url","commentUrl","threadMonth","description"];
const csvRows = [headers.join(",")];
for (const j of scored) {
  csvRows.push([
    j.score, quote(j.reasons), quote(j.company), quote(j.title), quote(j.location),
    String(j.isRemote), quote(j.salary), quote(j.technologies), j.url, j.commentUrl,
    quote(j.threadMonth), quote(j.description),
  ].join(","));
}
writeFileSync("../../hn-scored.csv", csvRows.join("\n"));

console.log("═══════════════════════════════════════════════════════════════");
console.log(`  HN WHO'S HIRING: ${jobs.length} postings scored`);
console.log("═══════════════════════════════════════════════════════════════\n");

const tiers = {
  "A (50+)": scored.filter(j => j.score >= 50),
  "B (30-49)": scored.filter(j => j.score >= 30 && j.score < 50),
  "C (10-29)": scored.filter(j => j.score >= 10 && j.score < 30),
  "Skip (<10)": scored.filter(j => j.score < 10),
};
for (const [tier, jobs] of Object.entries(tiers)) {
  console.log(`  ${tier}: ${jobs.length}`);
}

console.log("\n── TOP 30 ──\n");
for (const j of scored.slice(0, 30)) {
  const remote = j.isRemote ? " [REMOTE]" : "";
  const salary = j.salary ? ` | ${j.salary}` : "";
  console.log(`  [${j.score}] ${j.company} — ${j.title}${remote}${salary}`);
  console.log(`        ${j.location} | ${j.reasons}`);
  console.log(`        ${j.commentUrl}`);
  console.log("");
}

console.log(`Scored CSV: hn-scored.csv (${scored.length} jobs)`);
