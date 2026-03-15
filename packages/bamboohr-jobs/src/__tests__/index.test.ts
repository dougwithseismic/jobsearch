import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapeCompany, scrapeAll, searchJobs, discoverSlugs, _parseListJob, _parseDetailJob } from '../index.js';
import { makeJob, makeCompanyJobs, makeRawListResponse, makeRawDetailResponse } from './fixtures.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('_parseListJob', () => {
  it('parses raw BambooHR list API response', () => {
    const raw = makeRawListResponse().result[0];
    const job = _parseListJob(raw as Parameters<typeof _parseListJob>[0]);
    expect(job.id).toBe('15');
    expect(job.jobOpeningName).toBe('Senior Software Engineer');
    expect(job.departmentLabel).toBe('Engineering');
    expect(job.employmentStatusLabel).toBe('Full-Time');
    expect(job.location.city).toBe('Berlin');
    expect(job.location.state).toBe('Berlin');
    expect(job.isRemote).toBeNull();
  });

  it('does not include description from list endpoint', () => {
    const raw = makeRawListResponse().result[0];
    const job = _parseListJob(raw as Parameters<typeof _parseListJob>[0]);
    expect(job.description).toBeUndefined();
  });
});

describe('_parseDetailJob', () => {
  it('parses raw BambooHR detail API response', () => {
    const raw = makeRawDetailResponse().result.jobOpening;
    const job = _parseDetailJob(raw as Parameters<typeof _parseDetailJob>[0]);
    expect(job.id).toBe('15');
    expect(job.jobOpeningName).toBe('Senior Software Engineer');
    expect(job.description).toBe('<p>Job description here</p>');
    expect(job.jobOpeningShareUrl).toBe('https://testco.bamboohr.com/careers/15');
    expect(job.location.postalCode).toBe('10115');
    expect(job.location.addressCountry).toBe('Germany');
    expect(job.datePosted).toBe('2026-03-01');
    expect(job.minimumExperience).toBe('5 years');
  });
});

describe('scrapeCompany', () => {
  it('returns CompanyJobs for a valid slug', async () => {
    const listData = makeRawListResponse({
      result: [
        makeRawListResponse().result[0],
        { ...makeRawListResponse().result[0], id: '16', jobOpeningName: 'Product Manager' },
      ],
      totalCount: 2,
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => listData,
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.slug).toBe('testco');
    expect(result!.company).toBe('testco');
    expect(result!.jobs).toHaveLength(2);
    expect(result!.jobCount).toBe(2);
    expect(result!.scrapedAt).toBeDefined();
  });

  it('returns null for 302 redirect (no careers page)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 302,
    });

    const result = await scrapeCompany('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null for non-ok responses', async () => {
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
      json: async () => ({ meta: { totalCount: 0 }, result: [] }),
    });

    const result = await scrapeCompany('empty');
    expect(result).toBeNull();
  });

  it('excludes content by default', async () => {
    const listData = makeRawListResponse();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => listData,
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].description).toBeUndefined();
  });

  it('includes content when option set (fetches detail)', async () => {
    const listData = makeRawListResponse();
    const detailData = makeRawDetailResponse();

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => listData,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => detailData,
      });

    const result = await scrapeCompany('testco', { includeContent: true });
    expect(result).not.toBeNull();
    expect(result!.jobs[0].description).toBe('<p>Job description here</p>');
    expect(result!.jobs[0].jobOpeningShareUrl).toBe('https://testco.bamboohr.com/careers/15');
  });

  it('returns null on fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await scrapeCompany('testco');
    expect(result).toBeNull();
    mockFetch.mockReset();
  }, 30000);

  it('calls the correct API URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawListResponse(),
    });

    await scrapeCompany('my-company');
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://my-company.bamboohr.com/careers/list'
    );
  });
});

describe('scrapeAll', () => {
  it('returns sorted results by job count descending', async () => {
    const oneJob = makeRawListResponse({ totalCount: 1 });
    const threeJobs = makeRawListResponse({
      result: [
        makeRawListResponse().result[0],
        { ...makeRawListResponse().result[0], id: '16' },
        { ...makeRawListResponse().result[0], id: '17' },
      ],
      totalCount: 3,
    });

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => oneJob,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => threeJobs,
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
        json: async () => makeRawListResponse(),
      })
      .mockResolvedValueOnce({ ok: false, status: 302 });

    const result = await scrapeAll(['exists', 'missing'], { concurrency: 1 });
    expect(result).toHaveLength(1);
  });

  it('calls onProgress callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawListResponse(),
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
          makeJob({ id: '15', jobOpeningName: 'Frontend Engineer', departmentLabel: 'Engineering' }),
          makeJob({ id: '16', jobOpeningName: 'Product Manager', departmentLabel: 'Product' }),
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
    expect(result[0].jobs[0].jobOpeningName).toBe('Frontend Engineer');
  });
});

describe('discoverSlugs', () => {
  it('fetches slugs from the API and parses newline-delimited response', async () => {
    const apiResponse = ['acmecorp', 'widgetinc', ''].join('\n');

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test.example.com/slugs',
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
      slugApiUrl: 'https://test.example.com/slugs',
      knownSlugs: ['my-known-company'],
    });

    expect(slugs).toContain('my-known-company');
  });

  it('deduplicates slugs from API and knownSlugs', async () => {
    const apiResponse = 'acmecorp\n';

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test.example.com/slugs',
      knownSlugs: ['acmecorp'],
    });

    const acmeCount = slugs.filter((s) => s === 'acmecorp').length;
    expect(acmeCount).toBe(1);
  });

  it('falls back to knownSlugs on HTTP errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test.example.com/slugs',
      knownSlugs: ['fallback'],
    });

    expect(slugs).toContain('fallback');
    mockFetch.mockReset();
  }, 30000);

  it('falls back to knownSlugs on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test.example.com/slugs',
      knownSlugs: ['fallback'],
    });

    expect(slugs).toContain('fallback');
    mockFetch.mockReset();
  }, 30000);

  it('calls onProgress callback', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => 'testco\n',
    });

    const onProgress = vi.fn();
    await discoverSlugs({
      slugApiUrl: 'https://test.example.com/slugs',
      knownSlugs: [],
      onProgress,
    });

    expect(onProgress).toHaveBeenCalled();
  });

  it('filters out invalid slugs from API response', async () => {
    const apiResponse = ['www', 'api', 'favicon.ico', 'validcompany'].join('\n');

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test.example.com/slugs',
      knownSlugs: [],
    });

    expect(slugs).not.toContain('www');
    expect(slugs).not.toContain('api');
    expect(slugs).not.toContain('favicon.ico');
    expect(slugs).toContain('validcompany');
  });
});
