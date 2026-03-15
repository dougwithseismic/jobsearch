#!/usr/bin/env node
/**
 * Upload discovered slugs to the Cloudflare Worker KV API.
 *
 * Usage:
 *   npx tsx packages/job-ingest/upload-slugs.ts [--url https://job-slugs.your-domain.workers.dev] [--token SECRET]
 *
 * Reads all .txt files from packages/job-ingest/discovered/ and PUTs them to the Worker.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DISCOVERED_DIR = join(import.meta.dirname ?? ".", "discovered");

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const urlIdx = args.indexOf("--url");
  const tokenIdx = args.indexOf("--token");

  const baseUrl = urlIdx >= 0 ? args[urlIdx + 1]! : (process.env.SLUGS_API_URL || "http://localhost:8787");
  const token = tokenIdx >= 0 ? args[tokenIdx + 1]! : (process.env.SLUGS_AUTH_TOKEN || "");

  const files = readdirSync(DISCOVERED_DIR).filter((f) => f.endsWith("-slugs.txt"));

  if (files.length === 0) {
    console.error("No slug files found. Run discover.ts first.");
    process.exit(1);
  }

  console.log(`Uploading to ${baseUrl}`);
  console.log(`Found ${files.length} slug files\n`);

  for (const file of files) {
    const platform = file.replace("-slugs.txt", "");
    const content = readFileSync(join(DISCOVERED_DIR, file), "utf-8");
    const slugCount = content.split("\n").filter(Boolean).length;

    const headers: Record<string, string> = { "Content-Type": "text/plain" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const res = await fetch(`${baseUrl}/slugs/${platform}`, {
        method: "PUT",
        headers,
        body: content,
      });

      if (res.ok) {
        console.log(`  ${platform}: ${slugCount} slugs uploaded`);
      } else {
        console.error(`  ${platform}: HTTP ${res.status} — ${await res.text()}`);
      }
    } catch (e) {
      console.error(`  ${platform}: ${e}`);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
