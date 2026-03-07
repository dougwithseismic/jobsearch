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
      text: async () => JSON.stringify({ name: 'TestCo', jobs: rawJobs }),
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

  it('returns null for "Not Found" text response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => 'Not Found',
    });

    const result = await scrapeCompany('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null when jobs array is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ name: 'EmptyCo', jobs: [] }),
    });

    const result = await scrapeCompany('emptyco');
    expect(result).toBeNull();
  });

  it('maps raw job fields correctly', async () => {
    const rawJobs = [
      makeRawJob({
        shortcode: 'XYZ',
        title: 'Lead Engineer',
        telecommuting: true,
        employment_type: 'Contract',
        department: 'Tech',
        country: 'Czech Republic',
        city: 'Prague',
        state: 'Prague',
        experience: 'Senior',
        industry: 'Software',
        published_on: '2026-02-15',
        created_at: '2026-02-10',
        url: 'https://apply.workable.com/j/XYZ',
        application_url: 'https://apply.workable.com/j/XYZ/apply',
      }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ name: 'TestCo', jobs: rawJobs }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    const job = result!.jobs[0];
    expect(job.shortcode).toBe('XYZ');
    expect(job.title).toBe('Lead Engineer');
    expect(job.isRemote).toBe(true);
    expect(job.employmentType).toBe('Contract');
    expect(job.department).toBe('Tech');
    expect(job.country).toBe('Czech Republic');
    expect(job.city).toBe('Prague');
    expect(job.publishedAt).toBe('2026-02-15');
    expect(job.jobUrl).toBe('https://apply.workable.com/j/XYZ');
    expect(job.applyUrl).toBe('https://apply.workable.com/j/XYZ/apply');
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
      text: async () => JSON.stringify({ name: 'TestCo', jobs: rawJobs }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].locations).toHaveLength(1);
    expect(result!.jobs[0].locations[0].country).toBe('Germany');
  });

  it('uses company name from API response', async () => {
    const rawJobs = [makeRawJob({ shortcode: 'A1' })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ name: 'My Awesome Company', jobs: rawJobs }),
    });

    const result = await scrapeCompany('my-slug');
    expect(result).not.toBeNull();
    expect(result!.company).toBe('My Awesome Company');
    expect(result!.slug).toBe('my-slug');
  });

  it('falls back to slug for company name when name is missing', async () => {
    const rawJobs = [makeRawJob({ shortcode: 'A1' })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ jobs: rawJobs }),
    });

    const result = await scrapeCompany('my-slug');
    expect(result).not.toBeNull();
    expect(result!.company).toBe('my-slug');
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
      text: async () => JSON.stringify({ name: 'Test', jobs: [makeRawJob()] }),
    });

    await scrapeCompany('my-company');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://apply.workable.com/api/v1/widget/accounts/my-company'
    );
  });
});

describe('scrapeAll', () => {
  it('returns sorted results by job count descending', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          name: 'Small',
          jobs: [makeRawJob({ shortcode: '1' })],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          name: 'Large',
          jobs: [
            makeRawJob({ shortcode: '2' }),
            makeRawJob({ shortcode: '3' }),
            makeRawJob({ shortcode: '4' }),
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
        text: async () => JSON.stringify({
          name: 'Exists',
          jobs: [makeRawJob({ shortcode: '1' })],
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
        name: 'Test',
        jobs: [makeRawJob({ shortcode: '1' })],
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
  it('queries Common Crawl and parses slugs from JSON records', async () => {
    const ccResponse = [
      '{"url":"https://apply.workable.com/acme-corp/j/ABC123"}',
      '{"url":"https://apply.workable.com/acme-corp/j/DEF456"}',
      '{"url":"https://apply.workable.com/widget-inc/j/GHI789"}',
      '{"url":"https://apply.workable.com/widget-inc"}',
      '{"url":"https://apply.workable.com/j/SHORTCODE"}',
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
    // 'j' should be filtered out
    expect(slugs).not.toContain('j');
    // Should be sorted
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
    const ccResponse = '{"url":"https://apply.workable.com/acme-corp/j/ABC"}\n';

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

  it('filters out blocklisted slugs', async () => {
    const ccResponse = [
      '{"url":"https://apply.workable.com/api/v1/something"}',
      '{"url":"https://apply.workable.com/static/css/main.css"}',
      '{"url":"https://apply.workable.com/j/SHORTCODE123"}',
      '{"url":"https://apply.workable.com/real-company/j/ABC"}',
    ].join('\n');

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => ccResponse,
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01'],
      knownSlugs: [],
    });

    expect(slugs).not.toContain('api');
    expect(slugs).not.toContain('static');
    expect(slugs).not.toContain('j');
    expect(slugs).toContain('real-company');
  });
});
