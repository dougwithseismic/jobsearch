import { Actor, log } from 'apify';

import { discoverSlugs, scrapeAll, scrapeCompany, searchJobs } from 'recruitee-jobs';
import type { CompanyJobs, JobFilter } from 'recruitee-jobs';
import { normalize } from '@jobsearch/job-ingest/src/normalizers/recruitee.js';
import type { OutputFormat } from '@jobsearch/job-ingest/src/unified-schema.js';

interface Input {
  mode: 'all' | 'companies' | 'search';
  companies?: string[];
  remoteOnly?: boolean;
  locationFilter?: string;
  departmentFilter?: string;
  keywordFilter?: string;
  includeDescriptions?: boolean;
  concurrency?: number;
  maxCompanies?: number;
  outputFormat?: OutputFormat;
}

await Actor.init();

const startTime = Date.now();

try {
  const input = await Actor.getInput<Input>();
  if (!input) throw new Error('No input provided');

  const {
    mode = 'all',
    companies = [],
    remoteOnly = false,
    locationFilter = '',
    departmentFilter = '',
    keywordFilter = '',
    includeDescriptions = false,
    concurrency = 10,
    maxCompanies = 0,
    outputFormat = 'unified',
  } = input;

  let results: CompanyJobs[];

  if (mode === 'search' && companies.length > 0) {
    // Search mode: scrape specific companies, always apply filters
    log.info(`Search mode: scraping ${companies.length} company job boards...`);
    const scraped: CompanyJobs[] = [];
    for (const slug of companies) {
      const result = await scrapeCompany(slug, { includeDescriptions });
      if (result) {
        scraped.push(result);
        log.info(`  ${slug}: ${result.jobCount} jobs`);
      } else {
        log.warning(`  ${slug}: not found or no jobs`);
      }
    }
    results = scraped;

  } else if (mode === 'companies' && companies.length > 0) {
    // Companies mode: scrape specified slugs concurrently
    log.info(`Scraping ${companies.length} specified companies (concurrency: ${concurrency})...`);
    results = await scrapeAll(companies, {
      concurrency,
      includeDescriptions,
      onProgress: (done, total, found) => {
        log.info(`Progress: ${done}/${total} checked, ${found} with jobs`);
      },
    });

  } else {
    // All mode: discover companies then scrape everything
    log.info('Phase 1: Discovering companies...');
    let slugs = await discoverSlugs({
      onProgress: (msg) => log.info(`  ${msg}`),
    });
    log.info(`Discovered ${slugs.length} company slugs.`);

    if (maxCompanies > 0) {
      slugs = slugs.slice(0, maxCompanies);
      log.info(`Limited to first ${maxCompanies} companies.`);
    }

    log.info(`Phase 2: Scraping ${slugs.length} job boards (concurrency: ${concurrency})...`);
    results = await scrapeAll(slugs, {
      concurrency,
      includeDescriptions,
      onProgress: (done, total, found) => {
        if (done % 100 === 0 || done === total) {
          log.info(`  Progress: ${done}/${total} checked, ${found} companies with active jobs`);
        }
      },
    });
  }

  // Apply filters
  const filter: JobFilter = {};
  if (remoteOnly) filter.remote = true;
  if (locationFilter) filter.location = new RegExp(locationFilter, 'i');
  if (departmentFilter) filter.department = new RegExp(departmentFilter, 'i');
  if (keywordFilter) filter.keyword = new RegExp(keywordFilter, 'i');

  const hasFilters = Object.keys(filter).length > 0;
  if (hasFilters) {
    const beforeCount = results.reduce((s, c) => s + c.jobCount, 0);
    results = searchJobs(results, { filters: filter });
    const afterCount = results.reduce((s, c) => s + c.jobCount, 0);
    log.info(`Filters applied: ${beforeCount} -> ${afterCount} jobs (${results.length} companies)`);
  }

  // Push flattened jobs to dataset (one row per job)
  const totalJobs = results.reduce((s, c) => s + c.jobCount, 0);
  log.info(`Pushing ${totalJobs} jobs from ${results.length} companies to dataset (format: ${outputFormat})...`);

  const batchSize = 500;
  let pushed = 0;

  for (const company of results) {
    if (outputFormat === 'raw') {
      // Legacy flat format — backward compatible
      const batch = company.jobs.map((job) => ({
        company: company.company,
        companySlug: company.slug,
        jobId: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        country: job.country,
        city: job.city,
        state: job.state,
        remote: job.remote,
        employmentType: job.employmentType,
        tags: job.tags,
        publishedAt: job.publishedAt,
        careersUrl: job.careersUrl,
        ...(includeDescriptions ? { description: job.descriptionPlain ?? null } : {}),
        scrapedAt: company.scrapedAt,
      }));

      for (let i = 0; i < batch.length; i += batchSize) {
        await Actor.pushData(batch.slice(i, i + batchSize));
        pushed += Math.min(batchSize, batch.length - i);
      }
    } else {
      // Unified or both — normalize via job-ingest
      const rawJobs = company.jobs.map((j) => ({
        ...j,
        _company: company.company,
        _slug: company.slug,
        _scrapedAt: company.scrapedAt,
      }));
      const unified = normalize(rawJobs);

      if (outputFormat === 'both') {
        unified.forEach((u, i) => {
          u.raw = rawJobs[i] as Record<string, unknown>;
        });
      }

      for (let i = 0; i < unified.length; i += batchSize) {
        await Actor.pushData(unified.slice(i, i + batchSize));
        pushed += Math.min(batchSize, unified.length - i);
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Save summary to key-value store
  const summary = {
    scrapedAt: new Date().toISOString(),
    elapsedSeconds: parseFloat(elapsed),
    mode,
    totalCompanies: results.length,
    totalJobs,
    filters: {
      remoteOnly,
      locationFilter: locationFilter || null,
      departmentFilter: departmentFilter || null,
      keywordFilter: keywordFilter || null,
    },
    topCompanies: results.slice(0, 20).map((c) => ({
      company: c.company,
      slug: c.slug,
      jobCount: c.jobCount,
    })),
  };

  await Actor.setValue('SUMMARY', summary);

  log.info(`Done in ${elapsed}s -- ${totalJobs} jobs from ${results.length} companies.`);

} catch (error) {
  log.error(`Actor failed: ${error}`);
  throw error;
}

await Actor.exit();
