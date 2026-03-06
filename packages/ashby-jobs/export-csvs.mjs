import { readFileSync, writeFileSync } from "node:fs";

function quote(s) {
  if (!s) return '""';
  return '"' + s.replace(/"/g, '""') + '"';
}

function toCSV(jobs) {
  const headers = [
    "company","title","department","team","location","remote","workplace",
    "employmentType","publishedAt","jobUrl","applyUrl","compensation",
    "descriptionPlain"
  ];
  const rows = [headers.join(",")];
  for (const job of jobs) {
    rows.push([
      quote(job.company || job.slug),
      quote(job.title),
      quote(job.department || ""),
      quote(job.team || ""),
      quote(job.location),
      String(job.isRemote || false),
      job.workplaceType || "",
      job.employmentType || "",
      job.publishedAt?.split("T")[0] || "",
      job.jobUrl,
      job.applyUrl,
      quote(job.compensationTierSummary || ""),
      quote((job.descriptionPlain || "").replace(/\n/g, " ").slice(0, 5000)),
    ].join(","));
  }
  return rows.join("\n");
}

// Full dataset
const allData = JSON.parse(readFileSync("./ashby-data/all-jobs.json", "utf-8"));
const allJobs = [];
for (const company of allData) {
  for (const job of company.jobs) {
    allJobs.push({ company: company.company, slug: company.slug, ...job });
  }
}
writeFileSync("../../ashby-all-engineering.csv", toCSV(allJobs));
console.log(`All jobs CSV: ${allJobs.length} jobs → ashby-all-engineering.csv`);

// Recent (last 30 days)
const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const recentJobs = allJobs.filter(j => {
  const d = j.publishedAt ? new Date(j.publishedAt) : null;
  return d && d >= oneMonthAgo;
});
writeFileSync("../../ashby-recent-engineering.csv", toCSV(recentJobs));
console.log(`Recent jobs CSV: ${recentJobs.length} jobs → ashby-recent-engineering.csv`);
