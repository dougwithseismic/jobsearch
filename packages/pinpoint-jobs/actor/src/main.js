"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var apify_1 = require("apify");
var pinpoint_jobs_1 = require("pinpoint-jobs");
var pinpoint_js_1 = require("@jobsearch/job-ingest/src/normalizers/pinpoint.js");
await apify_1.Actor.init();
var startTime = Date.now();
try {
    var input = await apify_1.Actor.getInput();
    if (!input)
        throw new Error('No input provided');
    var _a = input.mode, mode = _a === void 0 ? 'all' : _a, _b = input.companies, companies = _b === void 0 ? [] : _b, _c = input.locationFilter, locationFilter = _c === void 0 ? '' : _c, _d = input.departmentFilter, departmentFilter = _d === void 0 ? '' : _d, _e = input.keywordFilter, keywordFilter = _e === void 0 ? '' : _e, _f = input.includeContent, includeContent_1 = _f === void 0 ? false : _f, _g = input.concurrency, concurrency = _g === void 0 ? 10 : _g, _h = input.maxCompanies, maxCompanies = _h === void 0 ? 0 : _h, _j = input.outputFormat, outputFormat = _j === void 0 ? 'unified' : _j;
    var results = void 0;
    if (mode === 'search' && companies.length > 0) {
        // Search mode: scrape specific companies, always apply filters
        apify_1.log.info("Search mode: scraping ".concat(companies.length, " company job boards..."));
        var scraped = [];
        for (var _i = 0, companies_1 = companies; _i < companies_1.length; _i++) {
            var slug = companies_1[_i];
            var result = await (0, pinpoint_jobs_1.scrapeCompany)(slug, { includeContent: includeContent_1 });
            if (result) {
                scraped.push(result);
                apify_1.log.info("  ".concat(slug, ": ").concat(result.jobCount, " jobs"));
            }
            else {
                apify_1.log.warning("  ".concat(slug, ": not found or no jobs"));
            }
        }
        results = scraped;
    }
    else if (mode === 'companies' && companies.length > 0) {
        // Companies mode: scrape specified slugs concurrently
        apify_1.log.info("Scraping ".concat(companies.length, " specified companies (concurrency: ").concat(concurrency, ")..."));
        results = await (0, pinpoint_jobs_1.scrapeAll)(companies, {
            concurrency: concurrency,
            includeContent: includeContent_1,
            onProgress: function (done, total, found) {
                apify_1.log.info("Progress: ".concat(done, "/").concat(total, " checked, ").concat(found, " with jobs"));
            },
        });
    }
    else {
        // All mode: discover companies then scrape everything
        apify_1.log.info('Phase 1: Discovering companies...');
        var slugs = await (0, pinpoint_jobs_1.discoverSlugs)({
            onProgress: function (msg) { return apify_1.log.info("  ".concat(msg)); },
        });
        apify_1.log.info("Discovered ".concat(slugs.length, " company slugs."));
        if (maxCompanies > 0) {
            slugs = slugs.slice(0, maxCompanies);
            apify_1.log.info("Limited to first ".concat(maxCompanies, " companies."));
        }
        apify_1.log.info("Phase 2: Scraping ".concat(slugs.length, " job boards (concurrency: ").concat(concurrency, ")..."));
        results = await (0, pinpoint_jobs_1.scrapeAll)(slugs, {
            concurrency: concurrency,
            includeContent: includeContent_1,
            onProgress: function (done, total, found) {
                if (done % 100 === 0 || done === total) {
                    apify_1.log.info("  Progress: ".concat(done, "/").concat(total, " checked, ").concat(found, " companies with active jobs"));
                }
            },
        });
    }
    // Apply filters
    var filter = {};
    if (locationFilter)
        filter.location = new RegExp(locationFilter, 'i');
    if (departmentFilter)
        filter.department = new RegExp(departmentFilter, 'i');
    if (keywordFilter)
        filter.keyword = new RegExp(keywordFilter, 'i');
    var hasFilters = Object.keys(filter).length > 0;
    if (hasFilters) {
        var beforeCount = results.reduce(function (s, c) { return s + c.jobCount; }, 0);
        results = (0, pinpoint_jobs_1.searchJobs)(results, { filters: filter });
        var afterCount = results.reduce(function (s, c) { return s + c.jobCount; }, 0);
        apify_1.log.info("Filters applied: ".concat(beforeCount, " \u2192 ").concat(afterCount, " jobs (").concat(results.length, " companies)"));
    }
    // Push flattened jobs to dataset (one row per job)
    var totalJobs = results.reduce(function (s, c) { return s + c.jobCount; }, 0);
    apify_1.log.info("Pushing ".concat(totalJobs, " jobs from ").concat(results.length, " companies to dataset (format: ").concat(outputFormat, ")..."));
    var batchSize = 500;
    var pushed = 0;
    var _loop_1 = function (company) {
        if (outputFormat === 'raw') {
            // Legacy flat format — backward compatible
            var batch = company.jobs.map(function (job) {
                var _a;
                return (__assign(__assign({ company: company.company, companySlug: company.slug, jobId: job.id, title: job.title, department: job.department, location: job.location, workplaceType: job.workplaceType, employmentType: job.employmentType, url: job.url, compensationVisible: job.compensationVisible, compensationMin: job.compensationMin, compensationMax: job.compensationMax, compensationCurrency: job.compensationCurrency }, (includeContent_1 ? { content: (_a = job.content) !== null && _a !== void 0 ? _a : null } : {})), { scrapedAt: company.scrapedAt }));
            });
            for (var i = 0; i < batch.length; i += batchSize) {
                await apify_1.Actor.pushData(batch.slice(i, i + batchSize));
                pushed += Math.min(batchSize, batch.length - i);
            }
        }
        else {
            // Unified or both — normalize via job-ingest
            var rawJobs_1 = company.jobs.map(function (j) { return (__assign(__assign({}, j), { _company: company.company, _slug: company.slug, _scrapedAt: company.scrapedAt })); });
            var unified = (0, pinpoint_js_1.normalize)(rawJobs_1);
            if (outputFormat === 'both') {
                unified.forEach(function (u, i) {
                    u.raw = rawJobs_1[i];
                });
            }
            for (var i = 0; i < unified.length; i += batchSize) {
                await apify_1.Actor.pushData(unified.slice(i, i + batchSize));
                pushed += Math.min(batchSize, unified.length - i);
            }
        }
    };
    for (var _k = 0, results_1 = results; _k < results_1.length; _k++) {
        var company = results_1[_k];
        _loop_1(company);
    }
    var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    // Save summary to key-value store
    var summary = {
        scrapedAt: new Date().toISOString(),
        elapsedSeconds: parseFloat(elapsed),
        mode: mode,
        totalCompanies: results.length,
        totalJobs: totalJobs,
        filters: {
            locationFilter: locationFilter || null,
            departmentFilter: departmentFilter || null,
            keywordFilter: keywordFilter || null,
        },
        topCompanies: results.slice(0, 20).map(function (c) { return ({
            company: c.company,
            slug: c.slug,
            jobCount: c.jobCount,
        }); }),
    };
    await apify_1.Actor.setValue('SUMMARY', summary);
    apify_1.log.info("Done in ".concat(elapsed, "s \u2014 ").concat(totalJobs, " jobs from ").concat(results.length, " companies."));
}
catch (error) {
    apify_1.log.error("Actor failed: ".concat(error));
    throw error;
}
await apify_1.Actor.exit();
