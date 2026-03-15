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
  it('parses raw Pinpoint API response into PinpointJob', () => {
    const raw = makeRawJob();
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0], false);
    expect(job.id).toBe('447735');
    expect(job.title).toBe('Senior Software Engineer');
    expect(job.location.name).toBe('Germany');
    expect(job.location.city).toBe('Berlin');
    expect(job.location.province).toBe('Berlin');
    expect(job.department).toBe('Engineering');
    expect(job.workplaceType).toBe('remote');
    expect(job.employmentType).toBe('full_time');
    expect(job.url).toBe('https://testco.pinpointhq.com/en/postings/447735');
    expect(job.requisitionId).toBe('ENG-001');
  });

  it('excludes content when includeContent is false', () => {
    const raw = makeRawJob();
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0], false);
    expect(job.content).toBeUndefined();
  });

  it('includes content when includeContent is true', () => {
    const raw = makeRawJob();
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0], true);
    expect(job.content).toBeDefined();
    expect(job.content).toContain('We are looking for');
    expect(job.content).toContain('Build things');
    expect(job.content).toContain('TypeScript');
    expect(job.content).toContain('Healthcare');
  });

  it('handles missing department', () => {
    const raw = makeRawJob({ job: { id: '1', requisition_id: null, department: null, division: null, structure_custom_group_one: null } });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0], false);
    expect(job.department).toBe('');
  });

  it('handles missing location fields', () => {
    const raw = makeRawJob({ location: { id: '1', city: '', name: '', postal_code: '', province: '' } });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0], false);
    expect(job.location.city).toBe('');
    expect(job.location.name).toBe('');
  });

  it('parses compensation fields', () => {
    const raw = makeRawJob({
      compensation_visible: true,
      compensation_minimum: 80000,
      compensation_maximum: 120000,
      compensation_currency: 'USD',
      compensation_frequency: 'yearly',
    });
    const job = _parseJob(raw as Parameters<typeof _parseJob>[0], false);
    expect(job.compensationVisible).toBe(true);
    expect(job.compensationMin).toBe(80000);
    expect(job.compensationMax).toBe(120000);
    expect(job.compensationCurrency).toBe('USD');
    expect(job.compensationFrequency).toBe('yearly');
  });
});

describe('scrapeCompany', () => {
  it('returns CompanyJobs for a valid slug', async () => {
    const rawJobs = [makeRawJob({ id: '1001' }), makeRawJob({ id: '1002' })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: rawJobs }),
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

  it('returns null when no jobs exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });

    const result = await scrapeCompany('empty');
    expect(result).toBeNull();
  });

  it('excludes content by default', async () => {
    const rawJobs = [makeRawJob({ id: '1001' })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: rawJobs }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].content).toBeUndefined();
  });

  it('includes content when option set', async () => {
    const rawJobs = [makeRawJob({ id: '1001' })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: rawJobs }),
    });

    const result = await scrapeCompany('testco', { includeContent: true });
    expect(result).not.toBeNull();
    expect(result!.jobs[0].content).toBeDefined();
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
      json: async () => ({ data: [makeRawJob()] }),
    });

    await scrapeCompany('my-company');
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://my-company.pinpointhq.com/postings.json'
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
          data: [makeRawJob({ id: '1001' })],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            makeRawJob({ id: '1002' }),
            makeRawJob({ id: '1003' }),
            makeRawJob({ id: '1004' }),
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
          data: [makeRawJob({ id: '1001' })],
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
        data: [makeRawJob({ id: '1001' })],
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
          makeJob({ id: '1001', title: 'Frontend Engineer', department: 'Engineering' }),
          makeJob({ id: '1002', title: 'Product Manager', department: 'Product' }),
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
    const apiResponse = ['embed', 'api', 'favicon.ico', 'validcompany'].join('\n');

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test.example.com/slugs',
      knownSlugs: [],
    });

    expect(slugs).not.toContain('embed');
    expect(slugs).not.toContain('api');
    expect(slugs).not.toContain('favicon.ico');
    expect(slugs).toContain('validcompany');
  });
});
