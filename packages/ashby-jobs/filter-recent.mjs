import { readFileSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync("./ashby-data/all-jobs.json", "utf-8"));
const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

const recentJobs = [];

for (const company of data) {
  for (const job of company.jobs) {
    const published = job.publishedAt ? new Date(job.publishedAt) : null;
    if (!published || published < oneMonthAgo) continue;
    recentJobs.push({
      company: company.company,
      slug: company.slug,
      id: job.id,
      title: job.title,
      department: job.department,
      team: job.team,
      employmentType: job.employmentType,
      location: job.location,
      isRemote: job.isRemote,
      workplaceType: job.workplaceType,
      publishedAt: job.publishedAt,
      jobUrl: job.jobUrl,
      applyUrl: job.applyUrl,
      compensationTierSummary: job.compensationTierSummary,
      descriptionPlain: job.descriptionPlain,
      descriptionHtml: job.descriptionHtml,
    });
  }
}

// Save full JSON with descriptions
writeFileSync(
  "./ashby-data/recent-jobs-full.json",
  JSON.stringify(recentJobs, null, 2)
);

// Save a lightweight CSV (no descriptions) for browsing
const headers = [
  "company","title","department","location","remote","workplace",
  "publishedAt","jobUrl","applyUrl","compensation"
];
const csvRows = [headers.join(",")];

for (const job of recentJobs) {
  csvRows.push([
    quote(job.company),
    quote(job.title),
    quote(job.department || ""),
    quote(job.location),
    String(job.isRemote || false),
    job.workplaceType || "",
    job.publishedAt?.split("T")[0] || "",
    job.jobUrl,
    job.applyUrl,
    quote(job.compensationTierSummary || ""),
  ].join(","));
}

function quote(s) {
  if (!s) return '""';
  return '"' + s.replace(/"/g, '""') + '"';
}

writeFileSync("../../ashby-europe-engineering-recent.csv", csvRows.join("\n"));

console.log(`${recentJobs.length} jobs from the last 30 days`);
console.log(`Full JSON (with descriptions): ./ashby-data/recent-jobs-full.json`);
console.log(`CSV (for browsing): ../../ashby-europe-engineering-recent.csv`);
