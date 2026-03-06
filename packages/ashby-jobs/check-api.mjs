const res = await fetch("https://api.ashbyhq.com/posting-api/job-board/posthog?includeCompensation=true");
const data = await res.json();
const job = data.jobs[0];

console.log("Available fields:", Object.keys(job).join(", "));
console.log("\n--- Sample job ---");
console.log("title:", job.title);
console.log("department:", job.department);
console.log("location:", job.location);
console.log("employmentType:", job.employmentType);
console.log("publishedAt:", job.publishedAt);
console.log("descriptionPlain length:", job.descriptionPlain?.length);
console.log("descriptionHtml length:", job.descriptionHtml?.length);
console.log("compensationTierSummary:", job.compensationTierSummary);
console.log("address:", JSON.stringify(job.address));
console.log("\n--- descriptionPlain (first 800 chars) ---");
console.log(job.descriptionPlain?.slice(0, 800));
