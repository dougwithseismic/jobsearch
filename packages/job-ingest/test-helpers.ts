#!/usr/bin/env node
import { parseSalary, inferSeniority, normalizeEmploymentType, normalizeWorkplaceType } from "./src/normalizers/helpers.js";

console.log("=== SALARY PARSING ===");
const salaryTests = [
  "$120,000 - $180,000 per year",
  "$120K-180K",
  "EUR 60,000 - 80,000",
  "£45k - £65k",
  "$50 - $75 / hr",
  "Competitive",
  "$150,000 - $200,000 USD",
  "$0.05 - $0.06 / hr",
  "$182k - $272k USD - Including equity",
];
for (const t of salaryTests) {
  const s = parseSalary(t);
  console.log(`  "${t}" → min:${s.min} max:${s.max} ${s.currency ?? "?"} ${s.period ?? "?"}`);
}

console.log("\n=== SENIORITY INFERENCE ===");
const titles = [
  "Senior Software Engineer",
  "Staff Backend Engineer",
  "VP of Engineering",
  "Junior Product Designer",
  "Lead Full-Stack Engineer",
  "Principal Architect",
  "Account Executive",
  "Head of Engineering",
  "Director of Product",
  "CTO",
  "Intern, Data Science",
];
for (const t of titles) {
  console.log(`  "${t}" → ${inferSeniority(t)}`);
}

console.log("\n=== EMPLOYMENT TYPE ===");
for (const t of ["Full-time", "FullTime", "Permanent", "Contract", "Internship", "Part Time", "Freelance", "Co-op"]) {
  console.log(`  "${t}" → ${normalizeEmploymentType(t)}`);
}

console.log("\n=== WORKPLACE TYPE ===");
for (const t of ["Remote", "Hybrid", "On-site", "In Office"]) {
  console.log(`  "${t}" → ${normalizeWorkplaceType(t, false)}`);
}
console.log(`  undefined + isRemote=true → ${normalizeWorkplaceType(undefined, true)}`);
