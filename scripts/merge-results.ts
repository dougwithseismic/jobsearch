import { readFileSync, writeFileSync } from "fs";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { current += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ",") { cells.push(current); current = ""; }
        else { current += ch; }
      }
    }
    cells.push(current);
    rows.push(cells);
  }
  return rows;
}

function q(s: string): string {
  if (!s) return '""';
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

interface Row {
  source: string;
  company: string;
  title: string;
  department: string;
  location: string;
  isRemote: string;
  employmentType: string;
  publishedAt: string;
  jobUrl: string;
  applyUrl: string;
}

const allRows: Row[] = [];

// Ashby
{
  const [header, ...data] = parseCsv(readFileSync("scripts/results/ashby-jobs.csv", "utf8"));
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  for (const r of data) {
    allRows.push({
      source: "ashby",
      company: r[idx.company] || "",
      title: r[idx.title] || "",
      department: r[idx.department] || "",
      location: r[idx.location] || "",
      isRemote: r[idx.isRemote] || "",
      employmentType: "",
      publishedAt: r[idx.publishedAt] || "",
      jobUrl: r[idx.jobUrl] || "",
      applyUrl: r[idx.applyUrl] || "",
    });
  }
}

// Greenhouse
{
  const [header, ...data] = parseCsv(readFileSync("scripts/results/greenhouse-jobs.csv", "utf8"));
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  for (const r of data) {
    allRows.push({
      source: "greenhouse",
      company: r[idx.company] || "",
      title: r[idx.title] || "",
      department: r[idx.department] || "",
      location: r[idx.location] || "",
      isRemote: /remote/i.test(r[idx.location] || "") ? "true" : "false",
      employmentType: "",
      publishedAt: r[idx.updatedAt] || "",
      jobUrl: r[idx.absoluteUrl] || "",
      applyUrl: "",
    });
  }
}

// Lever
{
  const [header, ...data] = parseCsv(readFileSync("scripts/results/lever-jobs.csv", "utf8"));
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  for (const r of data) {
    allRows.push({
      source: "lever",
      company: r[idx.company] || "",
      title: r[idx.title] || "",
      department: r[idx.department] || r[idx.team] || "",
      location: r[idx.location] || "",
      isRemote: /remote/i.test(r[idx.workplaceType] || "") ? "true" : "false",
      employmentType: r[idx.commitment] || "",
      publishedAt: r[idx.createdAt] || "",
      jobUrl: r[idx.hostedUrl] || "",
      applyUrl: r[idx.applyUrl] || "",
    });
  }
}

// SmartRecruiters
{
  const [header, ...data] = parseCsv(readFileSync("scripts/results/smartrecruiters-jobs.csv", "utf8"));
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  for (const r of data) {
    const loc = [r[idx.city], r[idx.region], r[idx.country]].filter(Boolean).join(", ");
    allRows.push({
      source: "smartrecruiters",
      company: r[idx.company] || "",
      title: r[idx.title] || "",
      department: r[idx.department] || "",
      location: loc,
      isRemote: r[idx.isRemote] || "false",
      employmentType: r[idx.employmentType] || "",
      publishedAt: r[idx.releasedDate] || "",
      jobUrl: r[idx.jobUrl] || "",
      applyUrl: "",
    });
  }
}

// Workable
{
  const [header, ...data] = parseCsv(readFileSync("scripts/results/workable-jobs.csv", "utf8"));
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  for (const r of data) {
    const loc = [r[idx.city], r[idx.country]].filter(Boolean).join(", ");
    allRows.push({
      source: "workable",
      company: r[idx.company] || "",
      title: r[idx.title] || "",
      department: r[idx.department] || "",
      location: loc,
      isRemote: r[idx.isRemote] || "false",
      employmentType: r[idx.employmentType] || "",
      publishedAt: r[idx.publishedAt] || "",
      jobUrl: r[idx.jobUrl] || "",
      applyUrl: r[idx.applyUrl] || "",
    });
  }
}

// BreezyHR
{
  const [header, ...data] = parseCsv(readFileSync("scripts/results/breezyhr-jobs.csv", "utf8"));
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  for (const r of data) {
    allRows.push({
      source: "breezyhr",
      company: r[idx.company] || "",
      title: r[idx.title] || "",
      department: r[idx.department] || "",
      location: r[idx.location] || "",
      isRemote: r[idx.isRemote] || "false",
      employmentType: "",
      publishedAt: r[idx.publishedDate] || "",
      jobUrl: r[idx.url] || "",
      applyUrl: "",
    });
  }
}

// Recruitee
{
  const [header, ...data] = parseCsv(readFileSync("scripts/results/recruitee-jobs.csv", "utf8"));
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  for (const r of data) {
    allRows.push({
      source: "recruitee",
      company: r[idx.company] || "",
      title: r[idx.title] || "",
      department: r[idx.department] || "",
      location: r[idx.location] || "",
      isRemote: r[idx.remote] || "false",
      employmentType: r[idx.employmentType] || "",
      publishedAt: r[idx.publishedAt] || "",
      jobUrl: r[idx.careersUrl] || "",
      applyUrl: "",
    });
  }
}

// Personio
{
  const [header, ...data] = parseCsv(readFileSync("scripts/results/personio-jobs.csv", "utf8"));
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  for (const r of data) {
    allRows.push({
      source: "personio",
      company: r[idx.company] || "",
      title: r[idx.title] || "",
      department: r[idx.department] || "",
      location: r[idx.office] || "",
      isRemote: "false",
      employmentType: r[idx.employmentType] || "",
      publishedAt: r[idx.createdAt] || "",
      jobUrl: r[idx.jobUrl] || "",
      applyUrl: "",
    });
  }
}

// Sort by date (newest first)
allRows.sort((a, b) => {
  const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
  const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
  return db - da;
});

// Write unified CSV
const outHeader = "source,company,title,department,location,isRemote,employmentType,publishedAt,jobUrl,applyUrl";
const outRows = allRows.map(r =>
  [q(r.source), q(r.company), q(r.title), q(r.department), q(r.location), r.isRemote, q(r.employmentType), r.publishedAt, q(r.jobUrl), q(r.applyUrl)].join(",")
);

writeFileSync("scripts/results/all-jobs.csv", [outHeader, ...outRows].join("\n"));
console.log(`Merged ${allRows.length} jobs from 8 ATS platforms into scripts/results/all-jobs.csv`);
console.log(`\nBreakdown:`);
const counts = new Map<string, number>();
for (const r of allRows) counts.set(r.source, (counts.get(r.source) || 0) + 1);
for (const [src, count] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${src.padEnd(18)} ${count}`);
}
