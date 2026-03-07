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
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await scrapeCompany('broken');
    expect(result).toBeNull();
  });

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
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await scrapeCompany('testco');
    expect(result).toBeNull();
  });

  it('calls the correct API URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [makeRawPosting()],
    });

    await scrapeCompany('my-company');
    expect(mockFetch).toHaveBeenCalledWith(
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
  it('queries Common Crawl and parses slugs from URLs', async () => {
    const ccResponse = [
      'https://jobs.lever.co/acme-corp/some-job-id',
      'https://jobs.lever.co/acme-corp/another-job',
      'https://jobs.lever.co/widget-inc/job-123',
      'https://jobs.lever.co/widget-inc',
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

    expect(slugs).toContain('acme-corp');
    expect(slugs).toContain('widget-inc');
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
    const ccResponse = 'https://jobs.lever.co/acme-corp/job-1\n';

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => ccResponse,
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01', 'CC-TEST-2025-02'],
      knownSlugs: ['acme-corp'],
    });

    const acmeCount = slugs.filter((s) => s === 'acme-corp').length;
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
  });

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

  it('handles http URLs from older crawls', async () => {
    const ccResponse = 'http://jobs.lever.co/old-company/job-1\n';

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => ccResponse,
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01'],
      knownSlugs: [],
    });

    expect(slugs).toContain('old-company');
  });
});
