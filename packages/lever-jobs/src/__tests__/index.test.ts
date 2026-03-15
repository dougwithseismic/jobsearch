import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapeCompany, scrapeAll, searchJobs, discoverSlugs, mapPosting } from '../index.js';
import { makeJob, makeCompanyJobs, makeRawPosting } from './fixtures.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('mapPosting', () => {
  it('maps raw Lever API response to LeverJob', () => {
    const raw = makeRawPosting();
    const job = mapPosting(raw, true);
    expect(job.id).toBe('raw-id-1');
    expect(job.title).toBe('Frontend Engineer');
    expect(job.team).toBe('Frontend');
    expect(job.department).toBe('Engineering');
    expect(job.location).toBe('Berlin, Germany');
    expect(job.commitment).toBe('Full-time');
    expect(job.allLocations).toEqual(['Berlin, Germany', 'Remote']);
    expect(job.workplaceType).toBe('hybrid');
    expect(job.hostedUrl).toBe('https://jobs.lever.co/testco/raw-id-1');
    expect(job.applyUrl).toBe('https://jobs.lever.co/testco/raw-id-1/apply');
    expect(job.createdAt).toBe(1709251200000);
  });

  it('includes descriptions when flag is true', () => {
    const raw = makeRawPosting();
    const job = mapPosting(raw, true);
    expect(job.description).toBe('<p>Build cool stuff</p>');
    expect(job.descriptionPlain).toBe('Build cool stuff');
    expect(job.lists).toHaveLength(1);
    expect(job.additional).toBe('<p>Benefits</p>');
  });

  it('excludes descriptions when flag is false', () => {
    const raw = makeRawPosting();
    const job = mapPosting(raw, false);
    expect(job.description).toBe('');
    expect(job.descriptionPlain).toBe('');
    expect(job.lists).toEqual([]);
    expect(job.additional).toBe('');
  });

  it('handles missing optional fields', () => {
    const raw = makeRawPosting({
      categories: {},
      description: undefined,
      descriptionPlain: undefined,
      lists: undefined,
      additional: undefined,
      hostedUrl: undefined,
      applyUrl: undefined,
      workplaceType: undefined,
    });
    const job = mapPosting(raw, true);
    expect(job.team).toBe('');
    expect(job.department).toBe('');
    expect(job.location).toBe('');
    expect(job.commitment).toBe('');
    expect(job.allLocations).toEqual([]);
    expect(job.workplaceType).toBe('unspecified');
    expect(job.hostedUrl).toBe('');
    expect(job.applyUrl).toBe('');
    expect(job.description).toBe('');
    expect(job.descriptionPlain).toBe('');
    expect(job.lists).toEqual([]);
    expect(job.additional).toBe('');
  });
});

describe('scrapeCompany', () => {
  it('returns CompanyJobs for a valid slug', async () => {
    const postings = [makeRawPosting({ id: '1' }), makeRawPosting({ id: '2' })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => postings,
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

  it('returns null for empty postings array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    const result = await scrapeCompany('empty');
    expect(result).toBeNull();
  });

  it('returns null for non-array response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ error: 'not found' }),
    });

    const result = await scrapeCompany('bad-response');
    expect(result).toBeNull();
  });

  it('excludes descriptions by default', async () => {
    const postings = [
      makeRawPosting({
        id: '1',
        description: '<p>Some description</p>',
        descriptionPlain: 'Some description',
      }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => postings,
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].description).toBe('');
    expect(result!.jobs[0].descriptionPlain).toBe('');
  });

  it('includes descriptions when option set', async () => {
    const postings = [
      makeRawPosting({
        id: '1',
        description: '<p>Some description</p>',
        descriptionPlain: 'Some description',
      }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => postings,
    });

    const result = await scrapeCompany('testco', { includeDescriptions: true });
    expect(result).not.toBeNull();
    expect(result!.jobs[0].description).toBe('<p>Some description</p>');
    expect(result!.jobs[0].descriptionPlain).toBe('Some description');
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
      json: async () => [makeRawPosting()],
    });

    await scrapeCompany('my-company');
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://api.lever.co/v0/postings/my-company?mode=json'
    );
  });
});

describe('scrapeAll', () => {
  it('returns sorted results by job count descending', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [makeRawPosting({ id: '1' })],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          makeRawPosting({ id: '2' }),
          makeRawPosting({ id: '3' }),
          makeRawPosting({ id: '4' }),
        ],
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
        json: async () => [makeRawPosting({ id: '1' })],
      })
      .mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await scrapeAll(['exists', 'missing'], { concurrency: 1 });
    expect(result).toHaveLength(1);
  });

  it('calls onProgress callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [makeRawPosting({ id: '1' })],
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
          makeJob({ id: '1', title: 'Frontend Engineer', workplaceType: 'remote', location: 'Remote' }),
          makeJob({ id: '2', title: 'Product Manager', workplaceType: 'on-site', location: 'NYC' }),
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
  it('fetches slugs from API and returns sorted unique list', async () => {
    const apiResponse = ['acme-corp', 'widget-inc', 'acme-corp', ''].join('\n');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/lever',
      knownSlugs: [],
    });

    expect(slugs).toContain('acme-corp');
    expect(slugs).toContain('widget-inc');
    expect(slugs).toEqual([...slugs].sort((a, b) => a.localeCompare(b)));
    // Should deduplicate
    const acmeCount = slugs.filter((s) => s === 'acme-corp').length;
    expect(acmeCount).toBe(1);
  });

  it('includes known slugs in results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'api-company\n',
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/lever',
      knownSlugs: ['my-known-company'],
    });

    expect(slugs).toContain('my-known-company');
    expect(slugs).toContain('api-company');
  });

  it('deduplicates API slugs and known slugs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'acme-corp\n',
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/lever',
      knownSlugs: ['acme-corp'],
    });

    const acmeCount = slugs.filter((s) => s === 'acme-corp').length;
    expect(acmeCount).toBe(1);
  });

  it('falls back to knownSlugs on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/lever',
      knownSlugs: ['fallback'],
    });

    expect(slugs).toContain('fallback');
  });

  it('falls back to knownSlugs on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/lever',
      knownSlugs: ['fallback'],
    });

    expect(slugs).toContain('fallback');
  });

  it('calls onProgress callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'some-company\n',
    });

    const onProgress = vi.fn();
    await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/lever',
      knownSlugs: [],
      onProgress,
    });

    expect(onProgress).toHaveBeenCalled();
  });

  it('filters out invalid slugs', async () => {
    const apiResponse = ['good-company', 'embed', 'api', 'x', 'favicon.ico', 'also-good'].join('\n');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/lever',
      knownSlugs: [],
    });

    expect(slugs).toContain('good-company');
    expect(slugs).toContain('also-good');
    expect(slugs).not.toContain('embed');
    expect(slugs).not.toContain('api');
    expect(slugs).not.toContain('x');
    expect(slugs).not.toContain('favicon.ico');
  });
});
