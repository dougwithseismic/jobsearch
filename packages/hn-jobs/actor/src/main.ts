import { Actor, log } from 'apify';

import { scrapeJobs } from 'hn-jobs';
import type { HNJob } from 'hn-jobs';
import { normalize } from '@jobsearch/job-ingest/src/normalizers/hn.js';
import type { OutputFormat } from '@jobsearch/job-ingest/src/unified-schema.js';

interface Input {
  months?: number;
  concurrency?: number;
  remoteOnly?: boolean;
  locationFilter?: string;
  keywordFilter?: string;
  technologyFilter?: string;
  includeRawHtml?: boolean;
  outputFormat?: OutputFormat;
}

await Actor.init();

const startTime = Date.now();

try {
  const input = await Actor.getInput<Input>();
  if (!input) throw new Error('No input provided');

  const {
    months = 2,
    concurrency = 10,
    remoteOnly = false,
    locationFilter = '',
    keywordFilter = '',
    technologyFilter = '',
    includeRawHtml = false,
    outputFormat = 'unified',
  } = input;

  log.info(`Scraping ${months} month(s) of HN Who is Hiring threads (concurrency: ${concurrency})...`);

  let jobs = await scrapeJobs({
    months,
    concurrency,
    onProgress: (done, total) => {
      if (done % 50 === 0 || done === total) {
        log.info(`  Progress: ${done}/${total} comments fetched`);
      }
    },
  });

  const totalBefore = jobs.length;

  // Apply filters
  if (remoteOnly) {
    jobs = jobs.filter((j) => j.isRemote);
  }
  if (locationFilter) {
    const re = new RegExp(locationFilter, 'i');
    jobs = jobs.filter((j) => re.test(j.location));
  }
  if (keywordFilter) {
    const re = new RegExp(keywordFilter, 'i');
    jobs = jobs.filter((j) => re.test(j.title) || re.test(j.description));
  }
  if (technologyFilter) {
    const re = new RegExp(technologyFilter, 'i');
    jobs = jobs.filter((j) => j.technologies.some((t) => re.test(t)));
  }

  const hasFilters = remoteOnly || locationFilter || keywordFilter || technologyFilter;
  if (hasFilters) {
    log.info(`Filters applied: ${totalBefore} → ${jobs.length} jobs`);
  }

  // Push jobs to dataset (one row per job)
  log.info(`Pushing ${jobs.length} jobs to dataset (format: ${outputFormat})...`);

  const batchSize = 500;
  let pushed = 0;

  if (outputFormat === 'raw') {
    // Legacy flat format — backward compatible
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize).map((job: HNJob) => ({
        hnId: job.hnId,
        company: job.company,
        title: job.title,
        location: job.location,
        isRemote: job.isRemote,
        isOnsite: job.isOnsite,
        isHybrid: job.isHybrid,
        salary: job.salary,
        technologies: job.technologies,
        url: job.url,
        applyUrl: job.applyUrl,
        description: job.description,
        postedAt: job.postedAt,
        threadMonth: job.threadMonth,
        commentUrl: job.commentUrl,
        ...(includeRawHtml ? { rawHtml: job.rawHtml } : {}),
      }));

      await Actor.pushData(batch);
      pushed += batch.length;
    }
  } else {
    // Unified or both — normalize via job-ingest
    // HN normalizer expects flat jobs with fields matching RawHNJob
    const rawJobs = jobs.map((job: HNJob) => ({
      hnId: job.hnId,
      rawHtml: job.rawHtml,
      company: job.company,
      title: job.title,
      location: job.location,
      isRemote: job.isRemote,
      isOnsite: job.isOnsite,
      isHybrid: job.isHybrid,
      salary: job.salary,
      url: job.url,
      applyUrl: job.applyUrl,
      technologies: job.technologies,
      description: job.description,
      postedAt: job.postedAt,
      threadMonth: job.threadMonth,
      threadUrl: '',
      commentUrl: job.commentUrl,
    }));

    const unified = normalize(rawJobs);

    if (outputFormat === 'both') {
      // For 'both' mode, attach the raw HN data to each unified job.
      // Since HN normalizer deduplicates, we index by sourceId (hnId).
      const rawBySourceId = new Map(rawJobs.map((r) => [String(r.hnId), r]));
      for (const u of unified) {
        const rawJob = rawBySourceId.get(u.sourceId);
        if (rawJob) {
          u.raw = rawJob as unknown as Record<string, unknown>;
        }
      }
    }

    for (let i = 0; i < unified.length; i += batchSize) {
      await Actor.pushData(unified.slice(i, i + batchSize));
      pushed += Math.min(batchSize, unified.length - i);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Aggregate top companies by job count
  const companyCounts = new Map<string, number>();
  for (const job of jobs) {
    companyCounts.set(job.company, (companyCounts.get(job.company) ?? 0) + 1);
  }
  const topCompanies = [...companyCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([company, count]) => ({ company, jobCount: count }));

  // Save summary to key-value store
  const summary = {
    scrapedAt: new Date().toISOString(),
    elapsedSeconds: parseFloat(elapsed),
    months,
    totalJobs: jobs.length,
    filters: {
      remoteOnly,
      locationFilter: locationFilter || null,
      keywordFilter: keywordFilter || null,
      technologyFilter: technologyFilter || null,
    },
    topCompanies,
  };

  await Actor.setValue('SUMMARY', summary);

  log.info(`Done in ${elapsed}s — ${jobs.length} jobs scraped.`);

} catch (error) {
  log.error(`Actor failed: ${error}`);
  throw error;
}

await Actor.exit();
