import { discoverSlugs, scrapeAll } from "../packages/workable-jobs/src/index.js";
import { writeFileSync, mkdirSync } from "fs";

async function main() {
  mkdirSync("scripts/results", { recursive: true });

  console.log("Discovering Workable companies via Common Crawl...");
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
  const LOC = /remote|europe|emea|anywhere|global|uk|united.kingdom|ireland|france|germany|netherlands|spain|portugal|czech|sweden|denmark|austria|poland|italy|switzerland|finland|norway|belgium/i;
  const cutoff = new Date("2026-02-05");

  const rows = ["company,slug,title,department,country,city,isRemote,employmentType,publishedAt,jobUrl,applyUrl"];
  for (const c of results) {
    for (const j of c.jobs) {
      if (!TITLE.test(j.title)) continue;
      const locStr = [j.country, j.city, j.state].filter(Boolean).join(" ");
      if (!j.isRemote && !LOC.test(locStr)) continue;
      if (j.publishedAt && new Date(j.publishedAt) < cutoff) continue;
      const q = (s: string) => '"' + (s || "").replace(/"/g, '""') + '"';
      rows.push([q(c.company), q(c.slug), q(j.title), q(j.department), q(j.country), q(j.city), j.isRemote, q(j.employmentType), j.publishedAt, q(j.jobUrl), q(j.applyUrl)].join(","));
    }
  }

  writeFileSync("scripts/results/workable-jobs.csv", rows.join("\n"));
  console.log("Matches: " + (rows.length - 1) + " roles saved to scripts/results/workable-jobs.csv");
}

main().catch(console.error);
