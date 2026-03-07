import { discoverSlugs, scrapeAll } from "../packages/greenhouse-jobs/src/index.js";
import { writeFileSync, mkdirSync } from "fs";

async function main() {
  mkdirSync("scripts/results", { recursive: true });

  console.log("Discovering Greenhouse companies via Common Crawl...");
  const slugs = await discoverSlugs({ onProgress: (m) => console.log("  " + m) });
  console.log("Found " + slugs.length + " slugs\n");

  console.log("Scraping all...");
  const results = await scrapeAll(slugs, {
    concurrency: 10,
    onProgress: (done, total, found) => {
      if (done % 200 === 0 || done === total) console.log("  " + done + "/" + total + " checked, " + found + " with jobs");
    },
  });

  const totalJobs = results.reduce((s, c) => s + c.jobCount, 0);
  console.log("\nTotal: " + results.length + " companies, " + totalJobs + " jobs");

  const TITLE = /founding|head.of.eng|lead.*eng|lead.*full|full.?stack|product.eng|growth.eng|staff.eng|principal|senior.*software|senior.*full|cto|vp.eng|eng.*lead|tech.lead|senior.*product/i;
  const LOC = /\bremote\b|europe|emea|anywhere|global|\buk\b|united.kingdom|ireland|dublin|france|paris|germany|berlin|netherlands|amsterdam|spain|barcelona|portugal|lisbon|\bczech\b|prague|sweden|stockholm|denmark|copenhagen|austria|vienna|poland|warsaw|italy|milan|switzerland|zurich|finland|helsinki|norway|oslo|belgium|brussels/i;
  const cutoff = new Date("2026-02-05");

  const rows = ["company,slug,title,department,location,updatedAt,absoluteUrl"];
  for (const c of results) {
    for (const j of c.jobs) {
      if (!TITLE.test(j.title)) continue;
      if (!LOC.test(j.location || "")) continue;
      if (j.updatedAt && new Date(j.updatedAt) < cutoff) continue;
      const q = (s: string) => '"' + (s || "").replace(/"/g, '""') + '"';
      rows.push([q(c.company), q(c.slug), q(j.title), q(j.departments.join(", ")), q(j.location), j.updatedAt, q(j.absoluteUrl)].join(","));
    }
  }

  writeFileSync("scripts/results/greenhouse-jobs.csv", rows.join("\n"));
  console.log("Matches: " + (rows.length - 1) + " roles saved to scripts/results/greenhouse-jobs.csv");
}

main().catch(console.error);
