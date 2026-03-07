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
    const content = [
      makeJob({ id: '1' }),
      makeJob({ id: '2' }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ totalFound: 2, limit: 100, offset: 0, content }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.slug).toBe('testco');
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

  it('returns null when no jobs returned', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ totalFound: 0, limit: 100, offset: 0, content: [] }),
    });

    const result = await scrapeCompany('empty');
    expect(result).toBeNull();
  });

  it('uses company name from first job', async () => {
    const content = [
      makeJob({ id: '1', company: { name: 'Acme Corp', identifier: 'acme' } }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ totalFound: 1, limit: 100, offset: 0, content }),
    });

    const result = await scrapeCompany('acme');
    expect(result).not.toBeNull();
    expect(result!.company).toBe('Acme Corp');
  });

  it('handles pagination across multiple pages', async () => {
    // First page: 100 results (triggers next page)
    const page1 = Array.from({ length: 100 }, (_, i) =>
      makeJob({ id: `p1-${i}` })
    );
    // Second page: 50 results (less than limit, stops)
    const page2 = Array.from({ length: 50 }, (_, i) =>
      makeJob({ id: `p2-${i}` })
    );

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ totalFound: 150, limit: 100, offset: 0, content: page1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ totalFound: 150, limit: 100, offset: 100, content: page2 }),
      });

    const result = await scrapeCompany('bigco');
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(150);
    expect(result!.jobCount).toBe(150);
  });

  it('stops pagination when empty page returned', async () => {
    const page1 = [makeJob({ id: '1' })];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ totalFound: 1, limit: 100, offset: 0, content: page1 }),
      });
    // No second call expected since page1.length < PAGE_LIMIT

    const result = await scrapeCompany('smallco');
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('excludes descriptions by default', async () => {
    const content = [makeJob({ id: '1' })];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ totalFound: 1, limit: 100, offset: 0, content }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].descriptionHtml).toBeUndefined();
  });

  it('includes descriptions when option set', async () => {
    const content = [makeJob({ id: '1' })];
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ totalFound: 1, limit: 100, offset: 0, content }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jobAd: {
            sections: {
              jobDescription: { text: '<p>Description</p>' },
              qualifications: { text: '<p>Quals</p>' },
              additionalInformation: { text: '<p>Info</p>' },
            },
          },
        }),
      });

    const result = await scrapeCompany('testco', { includeDescriptions: true });
    expect(result).not.toBeNull();
    expect(result!.jobs[0].descriptionHtml).toBe('<p>Description</p>');
    expect(result!.jobs[0].qualificationsHtml).toBe('<p>Quals</p>');
    expect(result!.jobs[0].additionalInfoHtml).toBe('<p>Info</p>');
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
      json: async () => ({ totalFound: 1, limit: 100, offset: 0, content: [makeJob()] }),
    });

    await scrapeCompany('my-company');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.smartrecruiters.com/v1/companies/my-company/postings?limit=100&offset=0'
    );
  });

  it('handles missing optional fields gracefully', async () => {
    const sparseJob = {
      id: 'sparse-1',
      name: 'Sparse Job',
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ totalFound: 1, limit: 100, offset: 0, content: [sparseJob] }),
    });

    const result = await scrapeCompany('sparse');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].department.label).toBe('');
    expect(result!.jobs[0].location.remote).toBe(false);
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
          totalFound: 1, limit: 100, offset: 0,
          content: [makeJob({ id: '1' })],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          totalFound: 3, limit: 100, offset: 0,
          content: [
            makeJob({ id: '2' }),
            makeJob({ id: '3' }),
            makeJob({ id: '4' }),
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
          totalFound: 1, limit: 100, offset: 0,
          content: [makeJob({ id: '1' })],
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
        totalFound: 1, limit: 100, offset: 0,
        content: [makeJob({ id: '1' })],
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
          makeJob({ id: '1', name: 'Frontend Engineer', location: { city: 'Berlin', region: 'Berlin', country: 'Germany', remote: true } }),
          makeJob({ id: '2', name: 'Product Manager', location: { city: 'SF', region: 'CA', country: 'US', remote: false } }),
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
    expect(result[0].jobs[0].name).toBe('Frontend Engineer');
  });
});

describe('discoverSlugs', () => {
  it('queries Common Crawl and parses slugs from URLs', async () => {
    const ccResponse = [
      'https://careers.smartrecruiters.com/AcmeCorp/some-job-id',
      'https://careers.smartrecruiters.com/AcmeCorp/another-job',
      'https://jobs.smartrecruiters.com/WidgetInc/job-123',
      'https://careers.smartrecruiters.com/WidgetInc',
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

    expect(slugs).toContain('AcmeCorp');
    expect(slugs).toContain('WidgetInc');
    // Should be sorted
    expect(slugs).toEqual([...slugs].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
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
    const ccResponse = 'https://careers.smartrecruiters.com/AcmeCorp/job-1\n';

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => ccResponse,
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01', 'CC-TEST-2025-02'],
      knownSlugs: ['AcmeCorp'],
    });

    const acmeCount = slugs.filter((s) => s === 'AcmeCorp').length;
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

    // Should still return known slugs
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

  it('discovers slugs from both careers and jobs URL patterns', async () => {
    // The index function fires 2 fetches per crawl (careers + jobs)
    let callCount = 0;
    mockFetch.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: true,
          text: async () => 'https://careers.smartrecruiters.com/CareersOnly/job-1\n',
        };
      }
      return {
        ok: true,
        text: async () => 'https://jobs.smartrecruiters.com/JobsOnly/job-2\n',
      };
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01'],
      knownSlugs: [],
    });

    expect(slugs).toContain('CareersOnly');
    expect(slugs).toContain('JobsOnly');
  });
});
