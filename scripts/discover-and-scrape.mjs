#!/usr/bin/env node
/**
 * Full discovery-mode scrape across all ATS platforms + HN
 * Discovers ALL companies via Common Crawl, scrapes jobs, filters for Doug's profile
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const OUTPUT_DIR = join(ROOT, 'scripts', 'discovery-results');
mkdirSync(OUTPUT_DIR, { recursive: true });

// Title pattern - what Doug is looking for
const TITLE_PATTERN = /founding|head.of.eng|lead.*eng|lead.*full|full.?stack|product.eng|growth.eng|staff.eng|principal.*eng|senior.*full|senior.*software|senior.*product.*eng|cto|vp.eng|eng.*lead|tech.*lead|product.*engineer/i;

// Location pattern - Europe + Remote
const LOCATION_PATTERN = /remote|europe|anywhere|global|germany|berlin|munich|uk|london|france|paris|netherlands|amsterdam|spain|barcelona|madrid|prague|czech|austria|vienna|portugal|lisbon|sweden|stockholm|denmark|copenhagen|ireland|dublin|switzerland|zurich|poland|warsaw|krakow|italy|milan|rome|norway|oslo|finland|helsinki|belgium|brussels|hungary|budapest|romania|bucharest|croatia|serbia|estonia|tallinn|latvia|lithuania|emea/i;

// Date cutoff - last 7 days
const CUTOFF = new Date();
CUTOFF.setDate(CUTOFF.getDate() - 7);
const CUTOFF_STR = CUTOFF.toISOString().split('T')[0];

const scrapers = [
  { name: 'ashby-jobs', dir: 'packages/ashby-jobs', output: join(OUTPUT_DIR, 'ashby') },
  { name: 'greenhouse-jobs', dir: 'packages/greenhouse-jobs', output: join(OUTPUT_DIR, 'greenhouse') },
  { name: 'lever-jobs', dir: 'packages/lever-jobs', output: join(OUTPUT_DIR, 'lever') },
  { name: 'workable-jobs', dir: 'packages/workable-jobs', output: join(OUTPUT_DIR, 'workable') },
  { name: 'recruitee-jobs', dir: 'packages/recruitee-jobs', output: join(OUTPUT_DIR, 'recruitee') },
  { name: 'smartrecruiters-jobs', dir: 'packages/smartrecruiters-jobs', output: join(OUTPUT_DIR, 'smartrecruiters') },
  { name: 'breezyhr-jobs', dir: 'packages/breezyhr-jobs', output: join(OUTPUT_DIR, 'breezy') },
  { name: 'personio-jobs', dir: 'packages/personio-jobs', output: join(OUTPUT_DIR, 'personio') },
  { name: 'hn-jobs', dir: 'packages/hn-jobs', output: join(OUTPUT_DIR, 'hn') },
];

function runScraper(scraper) {
  return new Promise((resolve) => {
    const cwd = join(ROOT, scraper.dir);
    mkdirSync(scraper.output, { recursive: true });

    const isHN = scraper.name === 'hn-jobs';
    const args = isHN
      ? ['bin/cli.ts', 'scrape', '--months', '1', '--output', scraper.output, '--format', 'json', '--quiet']
      : ['bin/cli.ts', 'scrape', '--output', scraper.output, '--format', 'json', '--concurrency', '15', '--quiet'];

    console.log(`[${scraper.name}] Starting ${isHN ? 'scrape' : 'discover + scrape'}...`);
    const start = Date.now();

    const proc = spawn('npx', ['tsx', ...args], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 600000, // 10 min max
    });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      if (code !== 0) {
        console.log(`[${scraper.name}] FAILED (${elapsed}s) - exit code ${code}`);
        if (stderr) console.log(`  stderr: ${stderr.slice(0, 200)}`);
        resolve({ name: scraper.name, jobs: [], error: stderr.slice(0, 500) });
        return;
      }
      console.log(`[${scraper.name}] Done (${elapsed}s)`);

      // Load results
      let allJobs = [];
      try {
        const jsonFile = isHN
          ? join(scraper.output, 'hn-jobs.json')
          : join(scraper.output, 'all-jobs.json');

        if (existsSync(jsonFile)) {
          const data = JSON.parse(readFileSync(jsonFile, 'utf8'));
          if (isHN) {
            // HN format is flat array of jobs
            allJobs = Array.isArray(data) ? data : (data.jobs || []);
          } else {
            // ATS format is array of { company, slug, jobs: [...] }
            if (Array.isArray(data)) {
              for (const company of data) {
                const jobs = company.jobs || [];
                for (const job of jobs) {
                  job._company = company.company || company.slug || 'unknown';
                  job._slug = company.slug || '';
                }
                allJobs.push(...jobs);
              }
            }
          }
        }
      } catch (e) {
        console.log(`[${scraper.name}] Error reading results: ${e.message}`);
      }

      resolve({ name: scraper.name, jobs: allJobs });
    });

    proc.on('error', (err) => {
      console.log(`[${scraper.name}] Spawn error: ${err.message}`);
      resolve({ name: scraper.name, jobs: [], error: err.message });
    });
  });
}

function filterJobs(jobs, atsName) {
  return jobs.filter(job => {
    const title = job.title || job.name || '';

    // Must match title pattern
    if (!TITLE_PATTERN.test(title)) return false;

    // Get location
    const location = typeof job.location === 'string'
      ? job.location
      : (job.location?.name || [job.city, job.state, job.country].filter(Boolean).join(', ') || '');

    const isRemote = job.isRemote || job.remote || job.is_remote || false;

    // Must be Europe or Remote
    if (!isRemote && !LOCATION_PATTERN.test(location) && !LOCATION_PATTERN.test(title)) return false;

    // Check date - last 7 days
    const dateStr = job.publishedAt || job.updatedAt || job.createdAt || job.published_date || job.releasedDate || job.postedAt || '';
    const dateVal = typeof dateStr === 'number' ? new Date(dateStr).toISOString() : dateStr;
    const dateOnly = dateVal ? dateVal.split('T')[0] : '';

    // If we have a date, filter by it. If no date, include it (might be recent)
    if (dateOnly && dateOnly < CUTOFF_STR) return false;

    return true;
  });
}

function formatJob(job, atsName) {
  const title = job.title || job.name || '';
  const company = job._company || job.company || job._slug || '';
  const location = typeof job.location === 'string'
    ? job.location
    : (job.location?.name || [job.city, job.state, job.country].filter(Boolean).join(', ') || '');
  const isRemote = job.isRemote || job.remote || job.is_remote || false;
  const url = job.jobUrl || job.absoluteUrl || job.hostedUrl || job.careersUrl || job.url || job.applyUrl || '';
  const dateStr = job.publishedAt || job.updatedAt || job.createdAt || job.published_date || job.releasedDate || job.postedAt || '';
  const dateVal = typeof dateStr === 'number' ? new Date(dateStr).toISOString() : dateStr;
  const dateOnly = dateVal ? dateVal.split('T')[0] : '?';
  const dept = job.department || (job.departments || []).join(', ') || job.team || '';

  return { ats: atsName, company, title, location, isRemote, url, date: dateOnly, department: dept };
}

async function main() {
  console.log('=== FULL DISCOVERY MODE SCRAPE ===');
  console.log(`Looking for: senior/lead/founding/staff/fullstack/product/growth engineer roles`);
  console.log(`Location: Europe or Remote`);
  console.log(`Date range: Last 7 days (since ${CUTOFF_STR})`);
  console.log(`Scrapers: ${scrapers.length} platforms`);
  console.log('');

  // Run ALL scrapers in parallel
  const results = await Promise.all(scrapers.map(s => runScraper(s)));

  console.log('\n=== FILTERING RESULTS ===\n');

  let allMatches = [];

  for (const result of results) {
    const totalJobs = result.jobs.length;
    const filtered = filterJobs(result.jobs, result.name);
    const formatted = filtered.map(j => formatJob(j, result.name));
    allMatches.push(...formatted);
    console.log(`[${result.name}] ${totalJobs} total jobs → ${filtered.length} matches`);
    if (result.error) console.log(`  Error: ${result.error.slice(0, 100)}`);
  }

  // Sort by date, newest first
  allMatches.sort((a, b) => {
    if (a.date === '?') return 1;
    if (b.date === '?') return -1;
    return b.date.localeCompare(a.date);
  });

  // Deduplicate by URL
  const seen = new Set();
  allMatches = allMatches.filter(m => {
    if (!m.url || seen.has(m.url)) return false;
    seen.add(m.url);
    return true;
  });

  console.log(`\n${'='.repeat(100)}`);
  console.log(`RESULTS: ${allMatches.length} matching roles across ${scrapers.length} platforms`);
  console.log(`${'='.repeat(100)}\n`);

  // Group by company
  const byCompany = new Map();
  for (const m of allMatches) {
    const key = m.company;
    if (!byCompany.has(key)) byCompany.set(key, []);
    byCompany.get(key).push(m);
  }

  for (const [company, jobs] of byCompany) {
    console.log(`\n${company} (${jobs[0].ats}) — ${jobs.length} role(s)`);
    for (const j of jobs) {
      const remote = j.isRemote ? ' [REMOTE]' : '';
      console.log(`  ${j.title}`);
      console.log(`    ${j.location}${remote} | ${j.department || '-'} | ${j.date}`);
      console.log(`    ${j.url}`);
    }
  }

  // Save results
  const outPath = join(OUTPUT_DIR, 'matched-jobs.json');
  writeFileSync(outPath, JSON.stringify(allMatches, null, 2));
  console.log(`\nResults saved to ${outPath}`);
}

main().catch(console.error);
