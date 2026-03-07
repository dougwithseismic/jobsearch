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
    const offers = [
      { id: 1001, title: 'Engineer', slug: 'engineer', department: 'Engineering', location: 'Berlin', country: 'Germany', city: 'Berlin', state: 'Berlin', remote: true, description: '<p>Desc</p>', requirements: '<p>Req</p>', careers_url: 'https://testco.recruitee.com/o/engineer', created_at: '2026-03-01T00:00:00Z', published_at: '2026-03-01T00:00:00Z', tags: ['eng'], employment_type_code: 'full_time', min_hours: null, max_hours: null },
      { id: 1002, title: 'Designer', slug: 'designer', department: 'Design', location: 'Remote', country: '', city: '', state: '', remote: true, description: '<p>Desc</p>', requirements: '<p>Req</p>', careers_url: 'https://testco.recruitee.com/o/designer', created_at: '2026-03-01T00:00:00Z', published_at: '2026-03-01T00:00:00Z', tags: [], employment_type_code: 'full_time', min_hours: null, max_hours: null },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ offers }),
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

  it('returns null when offers array is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ offers: [] }),
    });

    const result = await scrapeCompany('testco');
    expect(result).toBeNull();
  });

  it('excludes descriptions by default', async () => {
    const offers = [
      { id: 1001, title: 'Engineer', slug: 'eng', department: 'Eng', location: 'Berlin', country: 'Germany', city: 'Berlin', state: '', remote: true, description: '<p>Some description</p>', requirements: '<p>Req</p>', careers_url: 'https://testco.recruitee.com/o/eng', created_at: '2026-03-01T00:00:00Z', published_at: '2026-03-01T00:00:00Z', tags: [], employment_type_code: 'full_time', min_hours: null, max_hours: null },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ offers }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].description).toBe('');
    expect(result!.jobs[0].descriptionPlain).toBeUndefined();
  });

  it('includes descriptions when option set', async () => {
    const offers = [
      { id: 1001, title: 'Engineer', slug: 'eng', department: 'Eng', location: 'Berlin', country: 'Germany', city: 'Berlin', state: '', remote: true, description: '<p>Some description</p>', requirements: '<p>Req</p>', careers_url: 'https://testco.recruitee.com/o/eng', created_at: '2026-03-01T00:00:00Z', published_at: '2026-03-01T00:00:00Z', tags: [], employment_type_code: 'full_time', min_hours: null, max_hours: null },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ offers }),
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
      json: async () => ({ offers: [{ id: 1001, title: 'Test', slug: 'test', department: '', location: '', country: '', city: '', state: '', remote: false, description: '', requirements: '', careers_url: '', created_at: '', published_at: '', tags: [], employment_type_code: null, min_hours: null, max_hours: null }] }),
    });

    await scrapeCompany('my-company');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://my-company.recruitee.com/api/offers'
    );
  });

  it('maps employment_type_code correctly', async () => {
    const offers = [
      { id: 1001, title: 'Intern', slug: 'intern', department: 'Eng', location: 'Berlin', country: 'Germany', city: 'Berlin', state: '', remote: false, description: '', requirements: '', careers_url: '', created_at: '2026-03-01T00:00:00Z', published_at: '2026-03-01T00:00:00Z', tags: [], employment_type_code: 'internship', min_hours: null, max_hours: null },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ offers }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].employmentType).toBe('Internship');
  });

  it('handles remote as string "true"', async () => {
    const offers = [
      { id: 1001, title: 'Dev', slug: 'dev', department: 'Eng', location: 'Remote', country: '', city: '', state: '', remote: 'true', description: '', requirements: '', careers_url: '', created_at: '', published_at: '', tags: [], employment_type_code: null, min_hours: null, max_hours: null },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ offers }),
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].remote).toBe(true);
  });
});

describe('scrapeAll', () => {
  it('returns sorted results by job count descending', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          offers: [{ id: 1001, title: 'A', slug: 'a', department: '', location: '', country: '', city: '', state: '', remote: false, description: '', requirements: '', careers_url: '', created_at: '', published_at: '', tags: [], employment_type_code: null, min_hours: null, max_hours: null }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          offers: [
            { id: 2001, title: 'B1', slug: 'b1', department: '', location: '', country: '', city: '', state: '', remote: false, description: '', requirements: '', careers_url: '', created_at: '', published_at: '', tags: [], employment_type_code: null, min_hours: null, max_hours: null },
            { id: 2002, title: 'B2', slug: 'b2', department: '', location: '', country: '', city: '', state: '', remote: false, description: '', requirements: '', careers_url: '', created_at: '', published_at: '', tags: [], employment_type_code: null, min_hours: null, max_hours: null },
            { id: 2003, title: 'B3', slug: 'b3', department: '', location: '', country: '', city: '', state: '', remote: false, description: '', requirements: '', careers_url: '', created_at: '', published_at: '', tags: [], employment_type_code: null, min_hours: null, max_hours: null },
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
          offers: [{ id: 1001, title: 'A', slug: 'a', department: '', location: '', country: '', city: '', state: '', remote: false, description: '', requirements: '', careers_url: '', created_at: '', published_at: '', tags: [], employment_type_code: null, min_hours: null, max_hours: null }],
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
        offers: [{ id: 1001, title: 'A', slug: 'a', department: '', location: '', country: '', city: '', state: '', remote: false, description: '', requirements: '', careers_url: '', created_at: '', published_at: '', tags: [], employment_type_code: null, min_hours: null, max_hours: null }],
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
          makeJob({ id: 1001, title: 'Frontend Engineer', remote: true }),
          makeJob({ id: 1002, title: 'Product Manager', remote: false }),
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
  it('queries Common Crawl and parses slugs from JSON lines', async () => {
    const ccResponse = [
      '{"url":"https://acme-corp.recruitee.com/o/some-job"}',
      '{"url":"https://acme-corp.recruitee.com/o/another-job"}',
      '{"url":"https://widget-inc.recruitee.com/o/job-123"}',
      '{"url":"https://widget-inc.recruitee.com/"}',
      'not-json',
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
    const ccResponse = '{"url":"https://acme-corp.recruitee.com/o/job-1"}\n';

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

  it('filters out excluded subdomains like www, api, app', async () => {
    const ccResponse = [
      '{"url":"https://www.recruitee.com/something"}',
      '{"url":"https://api.recruitee.com/v1/offers"}',
      '{"url":"https://app.recruitee.com/dashboard"}',
      '{"url":"https://help.recruitee.com/article"}',
      '{"url":"https://realcompany.recruitee.com/o/job"}',
    ].join('\n');

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => ccResponse,
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01'],
      knownSlugs: [],
    });

    expect(slugs).toContain('realcompany');
    expect(slugs).not.toContain('www');
    expect(slugs).not.toContain('api');
    expect(slugs).not.toContain('app');
    expect(slugs).not.toContain('help');
  });
});
