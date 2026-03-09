import { readFileSync, writeFileSync } from 'fs';

const results = JSON.parse(readFileSync('./scripts/discovery-results/matched-jobs.json', 'utf8'));

// Exclude non-engineering roles
const NON_ENG = /\b(director|vice president|vp|account exec|account director|sales rep|sales dev|sales ops|marketing|communications|people ops|field marketing|RevOps|Solution Consulting|Commercial Sales|art director|payroll|accounting|counsel|country director|operational risk|people analytics|people business|public sector.*exec|strategic account|channel partner|data analytics|digital marketing|content strategy|publishing licensing|support automation|TPM|program manager|chief of staff)\b/i;

// US-only exclusion (must not be Europe-accessible)
const US_ONLY = /\b(remote.*us$|remote - us$|remote, us$|us-remote|remote \(us\)|remote \(us only\)|remote \(us time|us only|usa only)\b/i;

// Must be accessible from Europe
const EUROPE_OK = /europe|emea|eu\b|anywhere|global|germany|berlin|munich|uk|london|england|france|paris|netherlands|amsterdam|spain|barcelona|madrid|prague|czech|austria|vienna|portugal|lisbon|sweden|stockholm|denmark|copenhagen|ireland|dublin|switzerland|zurich|poland|warsaw|krakow|italy|milan|rome|norway|oslo|finland|helsinki|belgium|brussels|hungary|budapest|romania|croatia|serbia|estonia|tallinn|latvia|lithuania|remote(?!.*(?:us$|usa|canada$|india$|singapore$|brazil$|australia$))/i;

const filtered = results.filter(job => {
  // Kill non-engineering titles
  if (NON_ENG.test(job.title)) return false;

  const loc = job.location || '';

  // Must be Europe-accessible
  const europeOk = EUROPE_OK.test(loc) || EUROPE_OK.test(job.title) || job.isRemote;

  // Reject US-only remote
  if (US_ONLY.test(loc)) return false;

  // Check if location mentions US/Americas exclusively
  const usExclusive = /\b(san francisco|new york|nyc|seattle|austin|denver|atlanta|chicago|los angeles|menlo park|foster city|mountain view|washington)\b/i.test(loc) && !EUROPE_OK.test(loc);
  if (usExclusive) return false;

  // Remote with US-only context
  if (/remote.*(?:us|usa|canada|north america)$/i.test(loc.trim()) && !/europe|emea|eu\b|uk|global|anywhere/i.test(loc)) return false;

  return europeOk;
});

// Sort by relevance: prioritize titles with fullstack/product/founding/growth
const BEST_TITLE = /founding|full.?stack|product.eng|growth.eng|lead.*eng/i;
filtered.sort((a, b) => {
  const aGood = BEST_TITLE.test(a.title) ? 1 : 0;
  const bGood = BEST_TITLE.test(b.title) ? 1 : 0;
  if (bGood !== aGood) return bGood - aGood;
  return (b.date || '').localeCompare(a.date || '');
});

console.log(`Filtered: ${results.length} → ${filtered.length} Europe-accessible engineering roles\n`);

for (const j of filtered) {
  const remote = j.isRemote ? ' [REMOTE]' : '';
  console.log(`${j.company} | ${j.title}`);
  console.log(`  ${j.location}${remote} | ${j.ats} | ${j.date}`);
  console.log(`  ${j.url}\n`);
}

writeFileSync('./scripts/discovery-results/doug-matches.json', JSON.stringify(filtered, null, 2));
console.log(`\nSaved ${filtered.length} matches to scripts/discovery-results/doug-matches.json`);
