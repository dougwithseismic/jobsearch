import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  scrapeCompany,
  scrapeAll,
  searchJobs,
  extractCompanyId,
  parseXmlFeed,
} from '../index.js';
import {
  makeJob,
  makeCompanyJobs,
  SAMPLE_CAREERS_HTML,
  SAMPLE_CAREERS_HTML_ALT,
  SAMPLE_XML_FEED,
  SAMPLE_XML_EMPTY,
} from './fixtures.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('extractCompanyId', () => {
  it('extracts companyId from getCompanyId() pattern', () => {
    const id = extractCompanyId(SAMPLE_CAREERS_HTML);
    expect(id).toBe('qAbCdEfG');
  });

  it('extracts companyId from companyId = pattern', () => {
    const id = extractCompanyId(SAMPLE_CAREERS_HTML_ALT);
    expect(id).toBe('xYz12345');
  });

  it('returns null when no companyId found', () => {
    const id = extractCompanyId('<html><body>No id here</body></html>');
    expect(id).toBeNull();
  });
});

describe('parseXmlFeed', () => {
  it('parses job elements from XML feed', () => {
    const jobs = parseXmlFeed(SAMPLE_XML_FEED);
    expect(jobs).toHaveLength(3);
  });

  it('extracts all fields from a job element', () => {
    const jobs = parseXmlFeed(SAMPLE_XML_FEED);
    const first = jobs[0]!;
    expect(first.id).toBe('oJk1abc');
    expect(first.title).toBe('Senior Software Engineer');
    expect(first.category).toBe('Engineering');
    expect(first.jobType).toBe('Full-Time');
    expect(first.location).toBe('Remote - Europe');
    expect(first.date).toBe('3/1/2026');
    expect(first.detailUrl).toBe('https://jobs.jobvite.com/testco/job/oJk1abc');
    expect(first.applyUrl).toBe('https://jobs.jobvite.com/testco/job/oJk1abc/apply');
    expect(first.department).toBe('Engineering');
    expect(first.remoteType).toBe('Remote');
  });

  it('handles CDATA sections in descriptions', () => {
    const jobs = parseXmlFeed(SAMPLE_XML_FEED);
    expect(jobs[0]!.description).toBe('<p>We are looking for a Senior Software Engineer.</p>');
  });

  it('handles plain text descriptions (no CDATA)', () => {
    const jobs = parseXmlFeed(SAMPLE_XML_FEED);
    expect(jobs[2]!.description).toBe('Basic description without CDATA');
  });

  it('returns empty array for empty feed', () => {
    const jobs = parseXmlFeed(SAMPLE_XML_EMPTY);
    expect(jobs).toHaveLength(0);
  });

  it('returns empty array for invalid XML', () => {
    const jobs = parseXmlFeed('not xml at all');
    expect(jobs).toHaveLength(0);
  });
});

describe('scrapeCompany', () => {
  it('returns CompanyJobs for a valid slug', async () => {
    // Step 1: careers page fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SAMPLE_CAREERS_HTML,
    });
    // Step 2: XML feed fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SAMPLE_XML_FEED,
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.slug).toBe('testco');
    expect(result!.company).toBe('testco');
    expect(result!.companyId).toBe('qAbCdEfG');
    expect(result!.jobs).toHaveLength(3);
    expect(result!.jobCount).toBe(3);
    expect(result!.scrapedAt).toBeDefined();
  });

  it('returns null when careers page returns 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await scrapeCompany('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null when no companyId can be extracted', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => '<html><body>No company id</body></html>',
    });

    const result = await scrapeCompany('broken');
    expect(result).toBeNull();
  });

  it('returns null when XML feed returns empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SAMPLE_CAREERS_HTML,
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SAMPLE_XML_EMPTY,
    });

    const result = await scrapeCompany('empty');
    expect(result).toBeNull();
  });

  it('respects limit option', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SAMPLE_CAREERS_HTML,
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SAMPLE_XML_FEED,
    });

    const result = await scrapeCompany('testco', { limit: 1 });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobCount).toBe(1);
  });

  it('strips descriptions when includeContent is false', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SAMPLE_CAREERS_HTML,
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SAMPLE_XML_FEED,
    });

    const result = await scrapeCompany('testco', { includeContent: false });
    expect(result).not.toBeNull();
    expect(result!.jobs[0]!.description).toBeUndefined();
  });

  it('calls the correct careers URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SAMPLE_CAREERS_HTML,
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SAMPLE_XML_FEED,
    });

    await scrapeCompany('my-company');
    expect(mockFetch.mock.calls[0]![0]).toBe(
      'https://jobs.jobvite.com/my-company'
    );
  });

  it('calls the correct XML feed URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SAMPLE_CAREERS_HTML,
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SAMPLE_XML_FEED,
    });

    await scrapeCompany('my-company');
    expect(mockFetch.mock.calls[1]![0]).toBe(
      'https://app.jobvite.com/CompanyJobs/Xml.aspx?c=qAbCdEfG'
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
    // Company 1: 1 job
    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => SAMPLE_CAREERS_HTML })
      .mockResolvedValueOnce({
        ok: true, status: 200,
        text: async () => `<?xml version="1.0"?><result><job><id>j1</id><title>Job 1</title><category></category><jobtype></jobtype><location></location><date></date><detail-url></detail-url><apply-url></apply-url><description></description><department_x002F_division></department_x002F_division><remote_x0020_type></remote_x0020_type></job></result>`,
      })
      // Company 2: 3 jobs
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => SAMPLE_CAREERS_HTML })
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => SAMPLE_XML_FEED });

    const result = await scrapeAll(['small', 'large'], { concurrency: 1 });
    expect(result).toHaveLength(2);
    expect(result[0]!.jobCount).toBe(3);
    expect(result[1]!.jobCount).toBe(1);
  });

  it('skips companies that return null', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => SAMPLE_CAREERS_HTML })
      .mockResolvedValueOnce({ ok: true, status: 200, text: async () => SAMPLE_XML_FEED })
      .mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await scrapeAll(['exists', 'missing'], { concurrency: 1 });
    expect(result).toHaveLength(1);
  });

  it('handles empty slugs array', async () => {
    const result = await scrapeAll([]);
    expect(result).toEqual([]);
  });
});

describe('searchJobs', () => {
  it('filters by text and structured filters', () => {
    const data = [
      makeCompanyJobs({
        company: 'Acme',
        jobs: [
          makeJob({ id: 'j1', title: 'Frontend Engineer', department: 'Engineering' }),
          makeJob({ id: 'j2', title: 'Product Manager', department: 'Product' }),
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
    expect(result[0]!.jobs).toHaveLength(1);
    expect(result[0]!.jobs[0]!.title).toBe('Frontend Engineer');
  });
});
