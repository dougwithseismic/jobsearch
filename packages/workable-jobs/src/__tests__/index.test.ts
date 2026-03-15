import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapeCompany, scrapeAll, searchJobs, discoverSlugs } from '../index.js';
import { makeJob, makeRawJob, makeCompanyJobs } from './fixtures.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('scrapeCompany', () => {
  it('returns CompanyJobs for a valid slug', async () => {
    const rawJobs = [
      makeRawJob({ shortcode: 'A1', title: 'Engineer' }),
      makeRawJob({ shortcode: 'B2', title: 'Designer' }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ total: 2, results: rawJobs, nextPage: null }),
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
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await scrapeCompany('broken');
    expect(result).toBeNull();
    mockFetch.mockReset();
  }, 30000);

  it('returns null for "Not Found" text response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => 'Not Found',
    });

    const result = await scrapeCompany('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null when results array is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ total: 0, results: [], nextPage: null }),
    });

    const result = await scrapeCompany('emptyco');
    expect(result).toBeNull();
  });

  it('maps raw job fields correctly', async () => {
    const rawJobs = [
      makeRawJob({
        shortcode: 'XYZ',
        title: 'Lead Engineer',
        remote: true,
        type: 'contract',
        department: ['Tech'],
        location: {
          country: 'Czech Republic',
          countryCode: 'CZ',
          city: 'Prague',
          region: 'Prague',
        },
        published: '2026-02-15',
      }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ total: 1, results: rawJobs, nextPage: null }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    const job = result!.jobs[0];
    expect(job.shortcode).toBe('XYZ');
    expect(job.title).toBe('Lead Engineer');
    expect(job.isRemote).toBe(true);
    expect(job.employmentType).toBe('contract');
    expect(job.department).toBe('Tech');
    expect(job.country).toBe('Czech Republic');
    expect(job.city).toBe('Prague');
    expect(job.publishedAt).toBe('2026-02-15');
    expect(job.jobUrl).toBe('https://apply.workable.com/testco/j/XYZ/');
    expect(job.applyUrl).toBe('https://apply.workable.com/testco/j/XYZ/apply/');
  });

  it('filters out hidden locations', async () => {
    const rawJobs = [
      makeRawJob({
        shortcode: 'A1',
        locations: [
          { country: 'Germany', countryCode: 'DE', city: 'Berlin', region: 'Berlin', hidden: false },
          { country: 'Internal', countryCode: 'XX', city: 'Hidden', region: 'Hidden', hidden: true },
        ],
      }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ total: 1, results: rawJobs, nextPage: null }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].locations).toHaveLength(1);
    expect(result!.jobs[0].locations[0].country).toBe('Germany');
  });

  it('uses slug as company name', async () => {
    const rawJobs = [makeRawJob({ shortcode: 'A1' })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ total: 1, results: rawJobs, nextPage: null }),
    });

    const result = await scrapeCompany('my-slug');
    expect(result).not.toBeNull();
    expect(result!.company).toBe('my-slug');
    expect(result!.slug).toBe('my-slug');
  });

  it('returns null on fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await scrapeCompany('testco');
    expect(result).toBeNull();
    mockFetch.mockReset();
  }, 30000);

  it('calls the correct API URL with POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ total: 1, results: [makeRawJob()], nextPage: null }),
    });

    await scrapeCompany('my-company');
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://apply.workable.com/api/v3/accounts/my-company/jobs'
    );
    const fetchOpts = mockFetch.mock.calls[0][1];
    expect(fetchOpts.method).toBe('POST');
  });

  it('paginates using nextPage token', async () => {
    const page1 = [makeRawJob({ shortcode: 'A1' })];
    const page2 = [makeRawJob({ shortcode: 'B2' })];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ total: 2, results: page1, nextPage: 'token123' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ total: 2, results: page2, nextPage: null }),
      });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(2);
    expect(result!.jobs[0].shortcode).toBe('A1');
    expect(result!.jobs[1].shortcode).toBe('B2');
  });
});

describe('scrapeAll', () => {
  it('returns sorted results by job count descending', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          total: 1,
          results: [makeRawJob({ shortcode: '1' })],
          nextPage: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          total: 3,
          results: [
            makeRawJob({ shortcode: '2' }),
            makeRawJob({ shortcode: '3' }),
            makeRawJob({ shortcode: '4' }),
          ],
          nextPage: null,
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
        text: async () => JSON.stringify({
          total: 1,
          results: [makeRawJob({ shortcode: '1' })],
          nextPage: null,
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
      text: async () => JSON.stringify({
        total: 1,
        results: [makeRawJob({ shortcode: '1' })],
        nextPage: null,
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
          makeJob({ shortcode: '1', title: 'Frontend Engineer', isRemote: true }),
          makeJob({ shortcode: '2', title: 'Product Manager', isRemote: false }),
        ],
        jobCount: 2,
      }),
    ];

    const result = searchJobs(data, {
      text: 'Engineer',
      filters: { remote: true },
      limit: 5,
    });

    expect(result).toHaveLength(1);
    expect(result[0].jobs).toHaveLength(1);
    expect(result[0].jobs[0].title).toBe('Frontend Engineer');
  });
});

describe('discoverSlugs', () => {
  it('fetches slugs from the API and parses newline-delimited response', async () => {
    const apiResponse = ['acme-corp', 'widget-inc', 'real-company', ''].join('\n');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/workable',
      knownSlugs: [],
    });

    expect(slugs).toContain('acme-corp');
    expect(slugs).toContain('widget-inc');
    expect(slugs).toContain('real-company');
    // Should be sorted
    expect(slugs).toEqual([...slugs].sort((a, b) => a.localeCompare(b)));
  });

  it('includes known slugs in results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => '',
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/workable',
      knownSlugs: ['my-known-company'],
    });

    expect(slugs).toContain('my-known-company');
  });

  it('deduplicates slugs from API and knownSlugs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'acme-corp\n',
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/workable',
      knownSlugs: ['acme-corp'],
    });

    const acmeCount = slugs.filter((s) => s === 'acme-corp').length;
    expect(acmeCount).toBe(1);
  });

  it('handles HTTP errors gracefully and falls back to knownSlugs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/workable',
      knownSlugs: ['fallback'],
    });

    expect(slugs).toContain('fallback');
  });

  it('calls onProgress callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => '',
    });

    const onProgress = vi.fn();
    await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/workable',
      knownSlugs: [],
      onProgress,
    });

    expect(onProgress).toHaveBeenCalled();
  });

  it('filters out invalid slugs', async () => {
    const apiResponse = ['api', 'static', 'j', 'real-company', 'favicon.ico', 'x'].join('\n');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/workable',
      knownSlugs: [],
    });

    expect(slugs).not.toContain('api');
    expect(slugs).not.toContain('static');
    expect(slugs).not.toContain('j');
    expect(slugs).not.toContain('favicon.ico');
    expect(slugs).not.toContain('x');
    expect(slugs).toContain('real-company');
  });

  it('falls back to knownSlugs when API is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/workable',
      knownSlugs: ['fallback-company'],
    });

    expect(slugs).toContain('fallback-company');
  });
});
