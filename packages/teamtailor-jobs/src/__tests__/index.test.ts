import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrapeCompany, scrapeAll, searchJobs, discoverSlugs, parseRss, _parseItem } from '../index.js';
import { makeJob, makeCompanyJobs, makeRssXml } from './fixtures.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('parseRss', () => {
  it('parses RSS XML into TeamtailorJob array', () => {
    const xml = makeRssXml([{
      title: 'Frontend Developer',
      department: 'Engineering',
      role: 'Web Development',
      remoteStatus: 'hybrid',
      locations: [{ name: 'London', city: 'London', country: 'UK' }],
    }]);

    const jobs = parseRss(xml, true);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe('Frontend Developer');
    expect(jobs[0].department).toBe('Engineering');
    expect(jobs[0].role).toBe('Web Development');
    expect(jobs[0].remoteStatus).toBe('hybrid');
    expect(jobs[0].locations).toHaveLength(1);
    expect(jobs[0].locations[0].city).toBe('London');
    expect(jobs[0].locations[0].country).toBe('UK');
  });

  it('parses multiple items', () => {
    const xml = makeRssXml([
      { title: 'Job A' },
      { title: 'Job B' },
      { title: 'Job C' },
    ]);

    const jobs = parseRss(xml, false);
    expect(jobs).toHaveLength(3);
    expect(jobs[0].title).toBe('Job A');
    expect(jobs[1].title).toBe('Job B');
    expect(jobs[2].title).toBe('Job C');
  });

  it('excludes description when includeContent is false', () => {
    const xml = makeRssXml([{ description: '<p>Detailed description</p>' }]);
    const jobs = parseRss(xml, false);
    expect(jobs[0].description).toBe('');
  });

  it('includes description when includeContent is true', () => {
    const xml = makeRssXml([{ description: '<p>Detailed description</p>' }]);
    const jobs = parseRss(xml, true);
    expect(jobs[0].description).toBe('<p>Detailed description</p>');
  });

  it('handles missing optional fields', () => {
    const xml = makeRssXml([{
      title: 'Bare Job',
      remoteStatus: undefined,
      department: undefined,
      role: undefined,
      locations: [],
    }]);

    const jobs = parseRss(xml, false);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe('Bare Job');
    expect(jobs[0].remoteStatus).toBeUndefined();
    expect(jobs[0].department).toBeUndefined();
    expect(jobs[0].role).toBeUndefined();
  });

  it('returns empty array for XML with no items', () => {
    const xml = `<?xml version="1.0"?><rss><channel></channel></rss>`;
    const jobs = parseRss(xml, false);
    expect(jobs).toEqual([]);
  });
});

describe('scrapeCompany', () => {
  it('returns CompanyJobs for a valid slug', async () => {
    const rssXml = makeRssXml([
      { title: 'Job 1', guid: 'guid-1' },
      { title: 'Job 2', guid: 'guid-2' },
    ]);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => rssXml,
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

  it('returns null when no jobs in RSS', async () => {
    const emptyRss = `<?xml version="1.0"?><rss><channel><title>Empty</title></channel></rss>`;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => emptyRss,
    });

    const result = await scrapeCompany('empty');
    expect(result).toBeNull();
  });

  it('respects limit option', async () => {
    const items = Array.from({ length: 5 }, (_, i) => ({
      title: `Job ${i + 1}`,
      guid: `guid-${i + 1}`,
    }));
    const rssXml = makeRssXml(items);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => rssXml,
    });

    const result = await scrapeCompany('testco', { limit: 3 });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(3);
    expect(result!.jobCount).toBe(3);
  });

  it('calls the correct RSS URL', async () => {
    const rssXml = makeRssXml();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => rssXml,
    });

    await scrapeCompany('my-company');
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://my-company.teamtailor.com/jobs.rss?per_page=200&offset=0'
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
    const oneJob = makeRssXml([{ title: 'Job 1', guid: 'g1' }]);
    const threeJobs = makeRssXml([
      { title: 'Job A', guid: 'ga' },
      { title: 'Job B', guid: 'gb' },
      { title: 'Job C', guid: 'gc' },
    ]);

    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => oneJob })
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => threeJobs });

    const result = await scrapeAll(['small', 'large'], { concurrency: 1 });
    expect(result).toHaveLength(2);
    expect(result[0].jobCount).toBe(3);
    expect(result[1].jobCount).toBe(1);
  });

  it('skips companies that return null', async () => {
    const rssXml = makeRssXml();
    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => rssXml })
      .mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await scrapeAll(['exists', 'missing'], { concurrency: 1 });
    expect(result).toHaveLength(1);
  });

  it('calls onProgress callback', async () => {
    const rssXml = makeRssXml();
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: async () => rssXml });

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
          makeJob({ title: 'Frontend Engineer', department: 'Engineering' }),
          makeJob({ title: 'Product Manager', department: 'Product' }),
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
    const apiResponse = ['storytel', 'spotify', ''].join('\n');

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test.example.com/slugs',
      knownSlugs: [],
    });

    expect(slugs).toContain('storytel');
    expect(slugs).toContain('spotify');
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
    const apiResponse = 'storytel\n';

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => apiResponse,
    });

    const slugs = await discoverSlugs({
      slugApiUrl: 'https://test.example.com/slugs',
      knownSlugs: ['storytel'],
    });

    const count = slugs.filter((s) => s === 'storytel').length;
    expect(count).toBe(1);
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
