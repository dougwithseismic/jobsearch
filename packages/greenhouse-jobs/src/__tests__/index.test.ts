import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapeCompany, scrapeAll, searchJobs, discoverSlugs, _parseJob } from '../index.js';
import { makeJob, makeCompanyJobs, makeRawJob } from './fixtures.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('_parseJob', () => {
  it('parses raw Greenhouse API response into GreenhouseJob', () => {
    const raw = makeRawJob();
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0], false);
    expect(job.id).toBe(1001);
    expect(job.title).toBe('Senior Software Engineer');
    expect(job.location).toBe('Remote - Europe');
    expect(job.departments).toEqual(['Engineering']);
    expect(job.offices).toEqual(['Berlin']);
    expect(job.updatedAt).toBe('2026-03-01T00:00:00.000Z');
    expect(job.absoluteUrl).toBe('https://boards.greenhouse.io/testco/jobs/1001');
    expect(job.internalJobId).toBe(5001);
  });

  it('excludes content when includeContent is false', () => {
    const raw = makeRawJob({ content: '<p>Description</p>' });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0], false);
    expect(job.content).toBeUndefined();
  });

  it('includes content when includeContent is true', () => {
    const raw = makeRawJob({ content: '<p>Description</p>' });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0], true);
    expect(job.content).toBe('<p>Description</p>');
  });

  it('parses metadata correctly', () => {
    const raw = makeRawJob({
      metadata: [
        { id: 1, name: 'Employment Type', value: 'Full-time', value_type: 'single_select' },
        { id: 2, name: 'Seniority', value: null, value_type: 'single_select' },
      ],
    });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0], false);
    expect(job.metadata).toHaveLength(2);
    expect(job.metadata[0].name).toBe('Employment Type');
    expect(job.metadata[0].value).toBe('Full-time');
    expect(job.metadata[0].valueType).toBe('single_select');
    expect(job.metadata[1].value).toBeNull();
  });

  it('handles missing departments and offices', () => {
    const raw = makeRawJob({ departments: [], offices: [] });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0], false);
    expect(job.departments).toEqual([]);
    expect(job.offices).toEqual([]);
  });

  it('handles missing location name', () => {
    const raw = makeRawJob({ location: { name: '' } });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0], false);
    expect(job.location).toBe('');
  });
});

describe('scrapeCompany', () => {
  it('returns CompanyJobs for a valid slug', async () => {
    const rawJobs = [makeRawJob({ id: 1001 }), makeRawJob({ id: 1002 })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jobs: rawJobs }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.slug).toBe('testco');
    expect(result!.company).toBe('testco');
    expect(result!.jobs).toHaveLength(2);
    expect(result!.jobCount).toBe(2);
    expect(result!.scrapedAt).toBeDefined();
  });

  it('returns null for 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await scrapeCompany('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null for non-ok responses', async () => {
    // Must return 500 for all retry attempts
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await scrapeCompany('broken');
    expect(result).toBeNull();
    mockFetch.mockReset();
  }, 30000);

  it('returns null when no jobs exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jobs: [] }),
    });

    const result = await scrapeCompany('empty');
    expect(result).toBeNull();
  });

  it('excludes content by default', async () => {
    const rawJobs = [makeRawJob({ id: 1001, content: '<p>Description</p>' })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jobs: rawJobs }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].content).toBeUndefined();
  });

  it('includes content when option set', async () => {
    const rawJobs = [makeRawJob({ id: 1001, content: '<p>Description</p>' })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jobs: rawJobs }),
    });

    const result = await scrapeCompany('testco', { includeContent: true });
    expect(result).not.toBeNull();
    expect(result!.jobs[0].content).toBe('<p>Description</p>');
  });

  it('returns null on fetch error', async () => {
    // Must reject for all retry attempts
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await scrapeCompany('testco');
    expect(result).toBeNull();
    mockFetch.mockReset();
  }, 30000);

  it('calls the correct API URL without content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jobs: [makeRawJob()] }),
    });

    await scrapeCompany('my-company');
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://boards-api.greenhouse.io/v1/boards/my-company/jobs'
    );
  });

  it('calls the correct API URL with content', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jobs: [makeRawJob()] }),
    });

    await scrapeCompany('my-company', { includeContent: true });
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://boards-api.greenhouse.io/v1/boards/my-company/jobs?content=true'
    );
  });
});

describe('scrapeAll', () => {
  it('returns sorted results by job count descending', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          jobs: [makeRawJob({ id: 1001 })],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          jobs: [
            makeRawJob({ id: 1002 }),
            makeRawJob({ id: 1003 }),
            makeRawJob({ id: 1004 }),
          ],
        }),
      });

    const result = await scrapeAll(['small', 'large'], { concurrency: 1 });
    expect(result).toHaveLength(2);
    expect(result[0].jobCount).toBe(3);
    expect(result[1].jobCount).toBe(1);
  });

  it('skips companies that return null', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          jobs: [makeRawJob({ id: 1001 })],
        }),
      })
      .mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await scrapeAll(['exists', 'missing'], { concurrency: 1 });
    expect(result).toHaveLength(1);
  });

  it('calls onProgress callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        jobs: [makeRawJob({ id: 1001 })],
      }),
    });

    const onProgress = vi.fn();
    await scrapeAll(['test'], { concurrency: 1, onProgress });
    expect(onProgress).toHaveBeenCalledWith(1, 1, 1);
  });

  it('handles empty slugs array', async () => {
    const result = await scrapeAll([]);
    expect(result).toEqual([]);
  });
});

describe('searchJobs', () => {
  it('delegates to searchResults correctly', () => {
    const data = [
      makeCompanyJobs({
        company: 'Acme',
        jobs: [
          makeJob({ id: 1001, title: 'Frontend Engineer', departments: ['Engineering'] }),
          makeJob({ id: 1002, title: 'Product Manager', departments: ['Product'] }),
        ],
        jobCount: 2,
      }),
    ];

    const result = searchJobs(data, {
      text: 'Engineer',
      filters: { department: /Engineering/i },
      limit: 5,
    });

    expect(result).toHaveLength(1);
    expect(result[0].jobs).toHaveLength(1);
    expect(result[0].jobs[0].title).toBe('Frontend Engineer');
  });
});

describe('discoverSlugs', () => {
  it('queries Common Crawl and parses slugs from URLs', async () => {
    const ccResponse = [
      'https://boards.greenhouse.io/acmecorp/jobs/12345',
      'https://boards.greenhouse.io/acmecorp/jobs/67890',
      'https://boards.greenhouse.io/widgetinc/jobs/11111',
      'https://boards.greenhouse.io/widgetinc',
      'not-a-url',
      '',
    ].join('\n');

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => ccResponse,
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01'],
      knownSlugs: [],
    });

    expect(slugs).toContain('acmecorp');
    expect(slugs).toContain('widgetinc');
    expect(slugs).toEqual([...slugs].sort((a, b) => a.localeCompare(b)));
  });

  it('includes known slugs in results', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => '',
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01'],
      knownSlugs: ['my-known-company'],
    });

    expect(slugs).toContain('my-known-company');
  });

  it('deduplicates slugs across crawls', async () => {
    const ccResponse = 'https://boards.greenhouse.io/acmecorp/jobs/1\n';

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => ccResponse,
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01', 'CC-TEST-2025-02'],
      knownSlugs: ['acmecorp'],
    });

    const acmeCount = slugs.filter((s) => s === 'acmecorp').length;
    expect(acmeCount).toBe(1);
  });

  it('handles HTTP errors gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01'],
      knownSlugs: ['fallback'],
    });

    expect(slugs).toContain('fallback');
    mockFetch.mockReset();
  }, 30000);

  it('calls onProgress callback', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => '',
    });

    const onProgress = vi.fn();
    await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01'],
      knownSlugs: [],
      onProgress,
    });

    expect(onProgress).toHaveBeenCalled();
  });

  it('filters out invalid slugs', async () => {
    const ccResponse = [
      'https://boards.greenhouse.io/embed/job/12345',
      'https://boards.greenhouse.io/api/something',
      'https://boards.greenhouse.io/favicon.ico',
      'https://boards.greenhouse.io/validcompany/jobs/1',
    ].join('\n');

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => ccResponse,
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01'],
      knownSlugs: [],
    });

    expect(slugs).not.toContain('embed');
    expect(slugs).not.toContain('api');
    expect(slugs).not.toContain('favicon.ico');
    expect(slugs).toContain('validcompany');
  });
});
