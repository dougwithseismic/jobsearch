import { readFileSync } from "fs";

interface HNJob {
  company: string;
  title: string;
  location: string;
  isRemote: boolean;
  salary: string;
  technologies: string[];
  url: string;
  commentUrl: string;
  threadMonth: string;
  description: string;
}

const jobs: HNJob[] = JSON.parse(readFileSync("scripts/results/hn-data/hn-jobs.json", "utf8"));

const US_ONLY = /\b(us only|united states only|us[- ]based only|must be in the us)\b/i;

const founding = jobs.filter((j) => {
  const text = j.title + " " + j.description;
  if (US_ONLY.test(j.description)) return false;
  return /founding|first.eng|early.stage|head.of.eng|\bcto\b|co-?founder|employee.#?[0-9]|build.*from.scratch|0.to.1|zero.to.one|greenfield/i.test(text);
});

const generalist = jobs.filter((j) => {
  if (founding.includes(j)) return false;
  if (US_ONLY.test(j.description)) return false;
  const text = j.title + " " + j.description;
  return /full.?stack|product.eng|generalist|growth.eng|lead.*eng/i.test(text);
});

function printJob(j: HNJob) {
  const remote = j.isRemote ? " [REMOTE]" : "";
  console.log(j.company + " — " + j.title);
  console.log("  " + (j.location || "?") + remote);
  if (j.salary) console.log("  Salary: " + j.salary);
  if (j.technologies?.length) console.log("  Tech: " + j.technologies.join(", "));
  console.log("  " + j.commentUrl);
  if (j.url) console.log("  " + j.url);
  console.log("  Thread: " + j.threadMonth);
  console.log("");
}

console.log("=== FOUNDING / EARLY-STAGE / CTO (" + founding.length + ") ===\n");
for (const j of founding) printJob(j);

console.log("\n=== GENERALIST / FULL-STACK / PRODUCT ENG (" + generalist.length + ") ===\n");
for (const j of generalist) printJob(j);
