import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapeCompany, scrapeAll, searchJobs, discoverSlugs } from '../index.js';
import { makeJob, makeCompanyJobs } from './fixtures.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('scrapeCompany', () => {
  it('returns CompanyJobs for a valid slug', async () => {
    const jobs = [
      makeJob({ id: '1', isListed: true }),
      makeJob({ id: '2', isListed: true }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jobs }),
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

  it('filters out unlisted jobs', async () => {
    const jobs = [
      makeJob({ id: '1', isListed: true }),
      makeJob({ id: '2', isListed: false }),
      makeJob({ id: '3', isListed: true }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jobs }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(2);
    expect(result!.jobs.every((j) => j.isListed)).toBe(true);
  });

  it('returns null when all jobs are unlisted', async () => {
    const jobs = [
      makeJob({ id: '1', isListed: false }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jobs }),
    });

    const result = await scrapeCompany('testco');
    expect(result).toBeNull();
  });

  it('excludes descriptions by default', async () => {
    const jobs = [
      makeJob({
        id: '1',
        isListed: true,
        descriptionPlain: 'Some description',
        descriptionHtml: '<p>Some description</p>',
      }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jobs }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].descriptionPlain).toBeUndefined();
    expect(result!.jobs[0].descriptionHtml).toBeUndefined();
  });

  it('includes descriptions when option set', async () => {
    const jobs = [
      makeJob({
        id: '1',
        isListed: true,
        descriptionPlain: 'Some description',
        descriptionHtml: '<p>Some description</p>',
      }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ jobs }),
    });

    const result = await scrapeCompany('testco', { includeDescriptions: true });
    expect(result).not.toBeNull();
    expect(result!.jobs[0].descriptionPlain).toBe('Some description');
    expect(result!.jobs[0].descriptionHtml).toBe('<p>Some description</p>');
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
      json: async () => ({ jobs: [makeJob({ isListed: true })] }),
    });

    await scrapeCompany('my-company');
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://api.ashbyhq.com/posting-api/job-board/my-company?includeCompensation=true'
    );
  });
});

describe('scrapeAll', () => {
  it('returns sorted results by job count descending', async () => {
    // First slug: 1 job, second slug: 3 jobs
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          jobs: [makeJob({ id: '1', isListed: true })],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          jobs: [
            makeJob({ id: '2', isListed: true }),
            makeJob({ id: '3', isListed: true }),
            makeJob({ id: '4', isListed: true }),
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
          jobs: [makeJob({ id: '1', isListed: true })],
        }),
      })
      .mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await scrapeAll(['exists', 'missing'], { concurrency: 1 });
    expect(result).toHaveLength(1);
  });

  it('calls onProgress callback', async () => {
    // With 1 slug, done===1 === slugs.length triggers callback
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        jobs: [makeJob({ id: '1', isListed: true })],
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
          makeJob({ id: '1', title: 'Frontend Engineer', isRemote: true }),
          makeJob({ id: '2', title: 'Product Manager', isRemote: false }),
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
    const apiResponse = [
      'acme-corp',
      'widget-inc',
      'another-co',
      '',
    ].join('\n');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/ashby',
      knownSlugs: [],
    });

    expect(slugs).toContain('acme-corp');
    expect(slugs).toContain('widget-inc');
    expect(slugs).toContain('another-co');
    // Should be sorted
    expect(slugs).toEqual([...slugs].sort((a, b) => a.localeCompare(b)));
  });

  it('includes known slugs in results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => '',
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/ashby',
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
      slugApiUrl: 'https://test-api.example.com/slugs/ashby',
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
      slugApiUrl: 'https://test-api.example.com/slugs/ashby',
      knownSlugs: ['fallback'],
    });

    expect(slugs).toContain('fallback');
  });

  it('filters out invalid slugs', async () => {
    const apiResponse = [
      'valid-company',
      'embed',
      'a',
      'robots.txt',
      'good-slug',
    ].join('\n');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/ashby',
      knownSlugs: [],
    });

    expect(slugs).toContain('valid-company');
    expect(slugs).toContain('good-slug');
    expect(slugs).not.toContain('embed');
    expect(slugs).not.toContain('a');
    expect(slugs).not.toContain('robots.txt');
  });

  it('calls onProgress callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => '',
    });

    const onProgress = vi.fn();
    await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/ashby',
      knownSlugs: [],
      onProgress,
    });

    expect(onProgress).toHaveBeenCalled();
  });
});
