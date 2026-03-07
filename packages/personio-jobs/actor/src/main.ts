import { Actor, log } from 'apify';

import { discoverSlugs, scrapeAll, scrapeCompany, searchJobs } from 'personio-jobs';
import type { CompanyJobs, JobFilter } from 'personio-jobs';

interface Input {
  mode: 'all' | 'companies' | 'search';
  companies?: string[];
  locationFilter?: string;
  departmentFilter?: string;
  officeFilter?: string;
  keywordFilter?: string;
  seniorityFilter?: string;
  employmentTypeFilter?: string;
  includeContent?: boolean;
  concurrency?: number;
  maxCompanies?: number;
  language?: string;
}

await Actor.init();

const startTime = Date.now();

try {
  const input = await Actor.getInput<Input>();
  if (!input) throw new Error('No input provided');

  const {
    mode = 'all',
    companies = [],
    locationFilter = '',
    departmentFilter = '',
    officeFilter = '',
    keywordFilter = '',
    seniorityFilter = '',
    employmentTypeFilter = '',
    includeContent = false,
    concurrency = 5,
    maxCompanies = 0,
    language = 'en',
  } = input;

  let results: CompanyJobs[];

  if (mode === 'search' && companies.length > 0) {
    // Search mode: scrape specific companies, always apply filters
    log.info(`Search mode: scraping ${companies.length} company job boards...`);
    const scraped: CompanyJobs[] = [];
    for (const slug of companies) {
      const result = await scrapeCompany(slug, { includeContent, language });
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
      includeContent,
      language,
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
      includeContent,
      language,
      onProgress: (done, total, found) => {
        if (done % 100 === 0 || done === total) {
          log.info(`  Progress: ${done}/${total} checked, ${found} companies with active jobs`);
        }
      },
    });
  }

  // Apply filters
  const filter: JobFilter = {};
  if (locationFilter) filter.location = new RegExp(locationFilter, 'i');
  if (departmentFilter) filter.department = new RegExp(departmentFilter, 'i');
  if (officeFilter) filter.office = new RegExp(officeFilter, 'i');
  if (keywordFilter) filter.keyword = new RegExp(keywordFilter, 'i');
  if (seniorityFilter) filter.seniority = new RegExp(seniorityFilter, 'i');
  if (employmentTypeFilter) filter.employmentType = new RegExp(employmentTypeFilter, 'i');

  const hasFilters = Object.keys(filter).length > 0;
  if (hasFilters) {
    const beforeCount = results.reduce((s, c) => s + c.jobCount, 0);
    results = searchJobs(results, { filters: filter });
    const afterCount = results.reduce((s, c) => s + c.jobCount, 0);
    log.info(`Filters applied: ${beforeCount} -> ${afterCount} jobs (${results.length} companies)`);
  }

  // Push flattened jobs to dataset (one row per job)
  const totalJobs = results.reduce((s, c) => s + c.jobCount, 0);
  log.info(`Pushing ${totalJobs} jobs from ${results.length} companies to dataset...`);

  const batchSize = 500;
  let pushed = 0;

  for (const company of results) {
    const batch = company.jobs.map((job) => ({
      company: company.company,
      companySlug: company.slug,
      jobId: job.id,
      name: job.name,
      department: job.department,
      office: job.office,
      recruitingCategory: job.recruitingCategory,
      employmentType: job.employmentType,
      seniority: job.seniority,
      schedule: job.schedule,
      yearsOfExperience: job.yearsOfExperience,
      keywords: job.keywords,
      occupation: job.occupation,
      occupationCategory: job.occupationCategory,
      createdAt: job.createdAt,
      jobUrl: `https://${company.slug}.jobs.personio.de/job/${job.id}`,
      ...(includeContent ? { jobDescriptions: job.jobDescriptions } : {}),
      scrapedAt: company.scrapedAt,
    }));

    // Push in batches for efficiency
    for (let i = 0; i < batch.length; i += batchSize) {
      await Actor.pushData(batch.slice(i, i + batchSize));
      pushed += Math.min(batchSize, batch.length - i);
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
      locationFilter: locationFilter || null,
      departmentFilter: departmentFilter || null,
      officeFilter: officeFilter || null,
      keywordFilter: keywordFilter || null,
      seniorityFilter: seniorityFilter || null,
      employmentTypeFilter: employmentTypeFilter || null,
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
