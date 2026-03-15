import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapeCompany, scrapeAll, searchJobs, discoverSlugs, _parseWidget } from '../index.js';
import { makeJob, makeCompanyJobs, makeWidgetHtml, makeEmptyWidgetHtml } from './fixtures.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('_parseWidget', () => {
  it('parses widget HTML into job entries', () => {
    const html = makeWidgetHtml();
    const jobs = _parseWidget(html, 'testco');
    expect(jobs).toHaveLength(2);
    expect(jobs[0].id).toBe('job_20250826203656_MQIVAEYBXFWYQFXJ');
    expect(jobs[0].title).toBe('Senior Software Engineer');
    expect(jobs[0].location).toBe('Remote - Europe');
    expect(jobs[0].department).toBe('Engineering');
    expect(jobs[0].applyUrl).toBe('https://testco.applytojob.com/apply/abc123/Senior-Software-Engineer');
  });

  it('returns empty array for HTML with no jobs', () => {
    const html = makeEmptyWidgetHtml();
    const jobs = _parseWidget(html, 'testco');
    expect(jobs).toHaveLength(0);
  });

  it('extracts second job correctly', () => {
    const html = makeWidgetHtml();
    const jobs = _parseWidget(html, 'testco');
    expect(jobs[1].id).toBe('job_20250826195109_CMGM9F3IPPU22JVX');
    expect(jobs[1].title).toBe('Product Manager');
    expect(jobs[1].location).toBe('San Francisco, CA');
    expect(jobs[1].department).toBe('Product');
  });

  it('returns empty array for empty string', () => {
    const jobs = _parseWidget('', 'testco');
    expect(jobs).toHaveLength(0);
  });
});

describe('scrapeCompany', () => {
  it('returns CompanyJobs for a valid slug', async () => {
    const html = makeWidgetHtml();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => html,
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
      text: async () => makeEmptyWidgetHtml(),
    });

    const result = await scrapeCompany('empty');
    expect(result).toBeNull();
  });

  it('calls the correct widget URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => makeWidgetHtml(),
    });

    await scrapeCompany('my-company');
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://app.jazz.co/widgets/basic/create/my-company'
    );
  });

  it('returns null on fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await scrapeCompany('testco');
    expect(result).toBeNull();
    mockFetch.mockReset();
  }, 30000);
});

describe('scrapeAll', () => {
  it('returns sorted results by job count descending', async () => {
    const smallHtml = `<div id="resumator-job-job_001" class="resumator-job resumator-jobs-text"><div class="resumator-job-title resumator-jobs-text">Job A</div><div class="resumator-job-info resumator-jobs-text"><span class="resumator-job-location resumator-job-heading resumator-jobs-text">Location: </span>NYC</div><div class="resumator-job-view-details resumator-jobs-text"><a class="resumator-job-link resumator-jobs-text" target="_blank" href="https://small.applytojob.com/apply/x/Job-A?source=Widget">+ View details</a></div></div>`;
    const largeHtml = makeWidgetHtml();

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => smallHtml,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => largeHtml,
      });

    const result = await scrapeAll(['small', 'large'], { concurrency: 1 });
    expect(result).toHaveLength(2);
    expect(result[0].jobCount).toBe(2);
    expect(result[1].jobCount).toBe(1);
  });

  it('skips companies that return null', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => makeWidgetHtml(),
      })
      .mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await scrapeAll(['exists', 'missing'], { concurrency: 1 });
    expect(result).toHaveLength(1);
  });

  it('calls onProgress callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => makeWidgetHtml(),
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
          makeJob({ id: 'job_001', title: 'Frontend Engineer', department: 'Engineering' }),
          makeJob({ id: 'job_002', title: 'Product Manager', department: 'Product' }),
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
