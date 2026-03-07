import { readFileSync } from "fs";
const jobs = JSON.parse(readFileSync("scripts/job-hunt-results.json", "utf8"));

const EXCLUDE_COMPANIES = new Set([
  "airbnb", "epicgames", "riotgames", "supercell", "mojang",
  "ramp", "brex", "cursor",
]);

const EXCLUDE_TITLE = /director.*sales|director.*market|regional.director|channel.partner|account.exec|solutions.consult|sales.develop|sdr|customer.activ|security.program|people.operations|field.market|communications.dir|audience.research|conversation.design|product.account|associate.director.*finance|tax.operations|corporate.develop/i;

const INCLUDE_TITLE = /engineer|product.eng|growth.eng|cto|head.of.eng|tech.lead|founding|full.?stack/i;

const EUROPE_OR_GLOBAL_REMOTE = /europe|emea|remote|anywhere|global|uk|london|england|ireland|dublin|france|paris|germany|berlin|netherlands|amsterdam|spain|barcelona|portugal|lisbon|prague|czech|sweden|stockholm|denmark|copenhagen|austria|vienna|poland|warsaw|italy|milan|switzerland|zurich|finland|helsinki|norway|oslo|belgium|brussels/i;

const filtered = jobs.filter((j: any) => {
  if (EXCLUDE_COMPANIES.has(j.company.toLowerCase())) return false;
  if (EXCLUDE_TITLE.test(j.title)) return false;
  if (INCLUDE_TITLE.test(j.title) === false) return false;
  const loc = j.location || "";
  if (EUROPE_OR_GLOBAL_REMOTE.test(loc) === false && j.isRemote === false) return false;
  // Exclude US-only remote
  if (/remote.*us\b|us.*remote|usa|united states|new york|san francisco|foster city/i.test(loc) && /europe|emea|anywhere|global/i.test(loc) === false) return false;
  return true;
});

console.log("FILTERED: " + filtered.length + " roles that fit Doug\n");

const STARTUP_NAMES = new Set([
  "linear", "langfuse", "posthog", "infisical", "cal-com", "resend", "inngest",
  "trigger-dev", "novu", "formbricks", "unkey", "plane", "twenty", "documenso",
  "openbb", "papermark", "tinybird", "turso", "convex", "liveblocks", "neon",
  "axiom", "highlight", "knock", "dub", "raycast", "pitch", "hoppscotch",
  "latitude",
]);

const startups: any[] = [];
const growth: any[] = [];

for (const j of filtered) {
  if (STARTUP_NAMES.has(j.company.toLowerCase()) || STARTUP_NAMES.has(j.slug.toLowerCase())) {
    startups.push(j);
  } else {
    growth.push(j);
  }
}

console.log("=== STARTUPS (Best fit for Doug) ===\n");
for (const j of startups) {
  const remote = j.isRemote ? " [REMOTE]" : "";
  const date = j.publishedAt ? j.publishedAt.split("T")[0] : "?";
  console.log(`${j.company} (${j.ats})`);
  console.log(`  ${j.title}`);
  console.log(`  ${j.location || "?"}${remote} | ${j.department || "-"} | ${date}`);
  console.log(`  ${j.url}`);
  console.log("");
}

console.log("\n=== GROWTH STAGE ===\n");
for (const j of growth) {
  const remote = j.isRemote ? " [REMOTE]" : "";
  const date = j.publishedAt ? j.publishedAt.split("T")[0] : "?";
  console.log(`${j.company} (${j.ats})`);
  console.log(`  ${j.title}`);
  console.log(`  ${j.location || "?"}${remote} | ${j.department || "-"} | ${date}`);
  console.log(`  ${j.url}`);
  console.log("");
}
