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
  it('parses raw BreezyHR API response into BreezyJob', () => {
    const raw = makeRawJob();
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0]);
    expect(job.id).toBe('abc123def456');
    expect(job.friendlyId).toBe('abc123def456-senior-software-engineer');
    expect(job.name).toBe('Senior Software Engineer');
    expect(job.url).toBe('https://testco.breezy.hr/p/abc123def456-senior-software-engineer');
    expect(job.publishedDate).toBe('2026-03-01T00:00:00.000Z');
    expect(job.department).toBe('Engineering');
  });

  it('parses location correctly', () => {
    const raw = makeRawJob();
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0]);
    expect(job.location.city).toBe('Berlin');
    expect(job.location.name).toBe('Berlin, Germany');
    expect(job.location.isRemote).toBe(false);
    expect(job.location.country?.id).toBe('DE');
  });

  it('parses remote jobs correctly', () => {
    const raw = makeRawJob({
      location: {
        country: null,
        state: null,
        city: '',
        primary: true,
        is_remote: true,
        name: 'Remote',
      },
    });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0]);
    expect(job.location.isRemote).toBe(true);
    expect(job.location.name).toBe('Remote');
  });

  it('parses company info correctly', () => {
    const raw = makeRawJob();
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0]);
    expect(job.company.name).toBe('TestCo');
    expect(job.company.friendlyId).toBe('testco');
    expect(job.company.logoUrl).toBeNull();
  });

  it('parses type correctly', () => {
    const raw = makeRawJob();
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0]);
    expect(job.type.id).toBe('full-time');
    expect(job.type.name).toBe('Full Time');
  });

  it('parses salary correctly', () => {
    const raw = makeRawJob({ salary: '$80,000 - $120,000 / yr' });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0]);
    expect(job.salary).toBe('$80,000 - $120,000 / yr');
  });

  it('handles empty salary', () => {
    const raw = makeRawJob({ salary: '' });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0]);
    expect(job.salary).toBe('');
  });

  it('parses locations array', () => {
    const raw = makeRawJob({
      locations: [
        { country: { name: 'Germany', id: 'DE' }, countryCode: 'DE', city: 'Berlin', region: 'Berlin', hidden: false },
        { country: { name: 'United States', id: 'US' }, countryCode: 'US', city: 'New York', region: 'New York', hidden: false },
      ],
    });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0]);
    expect(job.locations).toHaveLength(2);
    expect(job.locations[0].city).toBe('Berlin');
    expect(job.locations[1].city).toBe('New York');
  });

  it('handles empty locations array', () => {
    const raw = makeRawJob({ locations: [] });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0]);
    expect(job.locations).toEqual([]);
  });

  it('handles missing location fields gracefully', () => {
    const raw = makeRawJob({ location: {} });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0]);
    expect(job.location.city).toBe('');
    expect(job.location.name).toBe('');
    expect(job.location.isRemote).toBe(false);
    expect(job.location.country).toBeNull();
  });

  it('handles missing department', () => {
    const raw = makeRawJob({ department: '' });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0]);
    expect(job.department).toBe('');
  });

  it('parses friendlyId correctly', () => {
    const raw = makeRawJob({ friendly_id: 'abc-custom-slug-123' });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0]);
    expect(job.friendlyId).toBe('abc-custom-slug-123');
  });
});

describe('scrapeCompany', () => {
  it('returns CompanyJobs for a valid slug', async () => {
    const rawJobs = [makeRawJob({ id: 'job1' }), makeRawJob({ id: 'job2' })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => rawJobs,
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.slug).toBe('testco');
    expect(result!.company).toBe('TestCo');
    expect(result!.jobs).toHaveLength(2);
    expect(result!.jobCount).toBe(2);
    expect(result!.scrapedAt).toBeDefined();
  });

  it('returns null for 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Map(),
    });

    const result = await scrapeCompany('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null for non-ok responses', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Map(),
    });

    const result = await scrapeCompany('broken');
    expect(result).toBeNull();
    mockFetch.mockReset();
  }, 30000);

  it('returns null when no jobs exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => [],
    });

    const result = await scrapeCompany('empty');
    expect(result).toBeNull();
  });

  it('returns null when response is HTML (non-JSON content type)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'text/html; charset=utf-8']]),
    });

    const result = await scrapeCompany('redirected');
    expect(result).toBeNull();
  });

  it('returns null when response body is not valid JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => { throw new SyntaxError('Unexpected token'); },
    });

    const result = await scrapeCompany('malformed');
    expect(result).toBeNull();
  });

  it('returns null when response is not an array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => ({ error: 'not found' }),
    });

    const result = await scrapeCompany('notarray');
    expect(result).toBeNull();
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
      headers: new Map([['content-type', 'application/json']]),
      json: async () => [makeRawJob()],
    });

    await scrapeCompany('my-company');
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://my-company.breezy.hr/json'
    );
  });

  it('uses company name from first job', async () => {
    const rawJobs = [makeRawJob({ company: { name: 'My Cool Company', logo_url: null, friendly_id: 'coolco', isMultipleLocationsEnabled: false } })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => rawJobs,
    });

    const result = await scrapeCompany('coolco');
    expect(result!.company).toBe('My Cool Company');
  });

  it('falls back to slug when company name is empty', async () => {
    const rawJobs = [makeRawJob({ company: { name: '', logo_url: null, friendly_id: 'testco', isMultipleLocationsEnabled: false } })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => rawJobs,
    });

    const result = await scrapeCompany('testco');
    expect(result!.company).toBe('testco');
  });

  it('handles content-type with no json when headers.get returns null', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => [makeRawJob()],
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
  });
});

describe('scrapeAll', () => {
  it('returns sorted results by job count descending', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => [makeRawJob({ id: 'j1' })],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => [
          makeRawJob({ id: 'j2' }),
          makeRawJob({ id: 'j3' }),
          makeRawJob({ id: 'j4' }),
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
        headers: new Map([['content-type', 'application/json']]),
        json: async () => [makeRawJob({ id: 'j1' })],
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Map(),
      });

    const result = await scrapeAll(['exists', 'missing'], { concurrency: 1 });
    expect(result).toHaveLength(1);
  });

  it('calls onProgress callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => [makeRawJob({ id: 'j1' })],
    });

    const onProgress = vi.fn();
    await scrapeAll(['test'], { concurrency: 1, onProgress });
    expect(onProgress).toHaveBeenCalledWith(1, 1, 1);
  });

  it('handles empty slugs array', async () => {
    const result = await scrapeAll([]);
    expect(result).toEqual([]);
  });

  it('respects concurrency setting', async () => {
    let activeCalls = 0;
    let maxActiveCalls = 0;

    mockFetch.mockImplementation(async () => {
      activeCalls++;
      maxActiveCalls = Math.max(maxActiveCalls, activeCalls);
      await new Promise((r) => setTimeout(r, 10));
      activeCalls--;
      return {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => [makeRawJob()],
      };
    });

    await scrapeAll(['a', 'b', 'c', 'd'], { concurrency: 2 });
    expect(maxActiveCalls).toBeLessThanOrEqual(2);
  });
});

describe('searchJobs', () => {
  it('delegates to searchResults correctly', () => {
    const data = [
      makeCompanyJobs({
        company: 'Acme',
        jobs: [
          makeJob({ id: 'j1', name: 'Frontend Engineer', department: 'Engineering' }),
          makeJob({ id: 'j2', name: 'Product Manager', department: 'Product' }),
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
    expect(result[0].jobs[0].name).toBe('Frontend Engineer');
  });

  it('filters by text only', () => {
    const data = [
      makeCompanyJobs({
        jobs: [
          makeJob({ id: 'j1', name: 'Designer' }),
          makeJob({ id: 'j2', name: 'Engineer' }),
        ],
        jobCount: 2,
      }),
    ];

    const result = searchJobs(data, { text: 'Designer' });
    expect(result).toHaveLength(1);
    expect(result[0].jobs).toHaveLength(1);
    expect(result[0].jobs[0].name).toBe('Designer');
  });

  it('applies limit', () => {
    const data = [
      makeCompanyJobs({
        jobs: [
          makeJob({ id: 'j1', name: 'Job 1' }),
          makeJob({ id: 'j2', name: 'Job 2' }),
          makeJob({ id: 'j3', name: 'Job 3' }),
        ],
        jobCount: 3,
      }),
    ];

    const result = searchJobs(data, { limit: 1 });
    const totalJobs = result.reduce((s, r) => s + r.jobs.length, 0);
    expect(totalJobs).toBe(1);
  });
});

describe('discoverSlugs', () => {
  it('fetches slugs from the API and parses them', async () => {
    const apiResponse = ['acmecorp', 'widgetinc', '', '  '].join('\n');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/breezyhr',
      knownSlugs: [],
    });

    expect(slugs).toContain('acmecorp');
    expect(slugs).toContain('widgetinc');
    expect(slugs).toEqual([...slugs].sort((a, b) => a.localeCompare(b)));
  });

  it('includes known slugs in results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => '',
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/breezyhr',
      knownSlugs: ['my-known-company'],
    });

    expect(slugs).toContain('my-known-company');
  });

  it('deduplicates slugs from API and knownSlugs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'acmecorp\n',
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/breezyhr',
      knownSlugs: ['acmecorp'],
    });

    const acmeCount = slugs.filter((s) => s === 'acmecorp').length;
    expect(acmeCount).toBe(1);
  });

  it('handles HTTP errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/breezyhr',
      knownSlugs: ['fallback'],
    });

    expect(slugs).toContain('fallback');
  });

  it('calls onProgress callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'slug1\nslug2\n',
    });

    const onProgress = vi.fn();
    await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/breezyhr',
      knownSlugs: [],
      onProgress,
    });

    expect(onProgress).toHaveBeenCalled();
  });

  it('filters out invalid slugs', async () => {
    const apiResponse = ['www', 'app', 'api', 'help', 'validcompany'].join('\n');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/breezyhr',
      knownSlugs: [],
    });

    expect(slugs).not.toContain('www');
    expect(slugs).not.toContain('app');
    expect(slugs).not.toContain('api');
    expect(slugs).not.toContain('help');
    expect(slugs).toContain('validcompany');
  });

  it('filters out slugs with dots', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'some.thing\nvalidslug\n',
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/breezyhr',
      knownSlugs: [],
    });

    for (const s of slugs) {
      expect(s.includes('.')).toBe(false);
    }
    expect(slugs).toContain('validslug');
  });

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/breezyhr',
      knownSlugs: ['safe-slug'],
    });

    expect(slugs).toContain('safe-slug');
  });

  it('calls the API only once', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'slug1\nslug2\n',
    });

    await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/breezyhr',
      knownSlugs: [],
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('defaults to empty knownSlugs when not specified', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => 'fromapi\n',
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test-api.example.com/slugs/breezyhr',
    });

    expect(slugs).toEqual(['fromapi']);
  });
});
