import { Actor, log } from 'apify';

import { scrapeAll, scrapeCompany, searchJobs } from 'jobvite-jobs';
import type { CompanyJobs, JobFilter } from 'jobvite-jobs';
import { normalize } from '@jobsearch/job-ingest/src/normalizers/jobvite.js';
import type { OutputFormat } from '@jobsearch/job-ingest/src/unified-schema.js';

interface Input {
  mode: 'companies';
  companies?: string[];
  locationFilter?: string;
  departmentFilter?: string;
  categoryFilter?: string;
  keywordFilter?: string;
  includeContent?: boolean;
  concurrency?: number;
  outputFormat?: OutputFormat;
}

await Actor.init();

const startTime = Date.now();

try {
  const input = await Actor.getInput<Input>();
  if (!input) throw new Error('No input provided');

  const {
    companies = [],
    locationFilter = '',
    departmentFilter = '',
    categoryFilter = '',
    keywordFilter = '',
    includeContent = true,
    concurrency = 5,
    outputFormat = 'unified',
  } = input;

  if (companies.length === 0) {
    throw new Error('companies array is required — Jobvite has no discovery API');
  }

  let results: CompanyJobs[];

  if (companies.length === 1) {
    log.info(`Scraping single company: ${companies[0]}...`);
    const result = await scrapeCompany(companies[0]!, { includeContent });
    results = result ? [result] : [];
  } else {
    log.info(`Scraping ${companies.length} companies (concurrency: ${concurrency})...`);
    results = await scrapeAll(companies, {
      concurrency,
      includeContent,
      onProgress: (done, total, found) => {
        log.info(`Progress: ${done}/${total} checked, ${found} with jobs`);
      },
    });
  }

  // Apply filters
  const filter: JobFilter = {};
  if (locationFilter) filter.location = new RegExp(locationFilter, 'i');
  if (departmentFilter) filter.department = new RegExp(departmentFilter, 'i');
  if (categoryFilter) filter.category = new RegExp(categoryFilter, 'i');
  if (keywordFilter) filter.keyword = new RegExp(keywordFilter, 'i');

  const hasFilters = Object.keys(filter).length > 0;
  if (hasFilters) {
    const beforeCount = results.reduce((s, c) => s + c.jobCount, 0);
    results = searchJobs(results, { filters: filter });
    const afterCount = results.reduce((s, c) => s + c.jobCount, 0);
    log.info(`Filters applied: ${beforeCount} -> ${afterCount} jobs (${results.length} companies)`);
  }

  // Push jobs to dataset
  const totalJobs = results.reduce((s, c) => s + c.jobCount, 0);
  log.info(`Pushing ${totalJobs} jobs from ${results.length} companies to dataset (format: ${outputFormat})...`);

  const batchSize = 500;
  let pushed = 0;

  for (const company of results) {
    if (outputFormat === 'raw') {
      const batch = company.jobs.map((job) => ({
        company: company.company,
        companySlug: company.slug,
        companyId: company.companyId,
        jobId: job.id,
        title: job.title,
        category: job.category,
        department: job.department,
        jobType: job.jobType,
        location: job.location,
        date: job.date,
        detailUrl: job.detailUrl,
        applyUrl: job.applyUrl,
        remoteType: job.remoteType,
        ...(includeContent ? { description: job.description ?? null } : {}),
        scrapedAt: company.scrapedAt,
      }));

      for (let i = 0; i < batch.length; i += batchSize) {
        await Actor.pushData(batch.slice(i, i + batchSize));
        pushed += Math.min(batchSize, batch.length - i);
      }
    } else {
      // Unified or both
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

  const summary = {
    scrapedAt: new Date().toISOString(),
    elapsedSeconds: parseFloat(elapsed),
    totalCompanies: results.length,
    totalJobs,
    filters: {
      locationFilter: locationFilter || null,
      departmentFilter: departmentFilter || null,
      categoryFilter: categoryFilter || null,
      keywordFilter: keywordFilter || null,
    },
    topCompanies: results.slice(0, 20).map((c) => ({
      company: c.company,
      slug: c.slug,
      companyId: c.companyId,
      jobCount: c.jobCount,
    })),
  };

  await Actor.setValue('SUMMARY', summary);

  log.info(`Done in ${elapsed}s - ${totalJobs} jobs from ${results.length} companies.`);

} catch (error) {
  log.error(`Actor failed: ${error}`);
  throw error;
}

await Actor.exit();
