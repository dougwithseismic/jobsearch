import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  scrapeCompany,
  scrapeAll,
  searchJobs,
  discoverSlugs,
  _parseXml,
  _getTagContent,
  _isValidSlug,
} from '../index.js';
import { makeJob, makeCompanyJobs } from './fixtures.js';
import {
  SINGLE_JOB_XML,
  TWO_JOBS_XML,
  CDATA_XML,
  EMPTY_XML,
  EMPTY_FIELDS_XML,
  PLAIN_DESC_XML,
  MALFORMED_XML,
  makeXmlFeed,
  makePositionXml,
} from './fixtures.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

// --- parseXml ---

describe('parseXml', () => {
  it('parses a single position from XML', () => {
    const jobs = _parseXml(SINGLE_JOB_XML);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].id).toBe(12345);
    expect(jobs[0].name).toBe('Senior Software Engineer');
    expect(jobs[0].department).toBe('Engineering');
    expect(jobs[0].office).toBe('Berlin');
    expect(jobs[0].recruitingCategory).toBe('Full-time');
    expect(jobs[0].employmentType).toBe('permanent');
    expect(jobs[0].seniority).toBe('Senior');
    expect(jobs[0].schedule).toBe('full-time');
    expect(jobs[0].yearsOfExperience).toBe('5+');
    expect(jobs[0].keywords).toBe('typescript, react, node.js');
    expect(jobs[0].occupation).toBe('Engineering');
    expect(jobs[0].occupationCategory).toBe('Software Development');
    expect(jobs[0].createdAt).toBe('2026-01-15T10:30:00+01:00');
  });

  it('parses multiple positions', () => {
    const jobs = _parseXml(TWO_JOBS_XML);
    expect(jobs).toHaveLength(2);
    expect(jobs[0].id).toBe(12345);
    expect(jobs[1].id).toBe(12346);
    expect(jobs[1].name).toBe('Product Manager');
  });

  it('parses CDATA sections in job descriptions', () => {
    const jobs = _parseXml(CDATA_XML);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].jobDescriptions).toHaveLength(2);
    expect(jobs[0].jobDescriptions[0].name).toBe("What you'll do");
    expect(jobs[0].jobDescriptions[0].value).toContain('<h2>Responsibilities</h2>');
    expect(jobs[0].jobDescriptions[0].value).toContain('<li>Build React components</li>');
    expect(jobs[0].jobDescriptions[1].name).toBe('Requirements');
    expect(jobs[0].jobDescriptions[1].value).toContain('2+ years of experience');
  });

  it('parses plain text job descriptions (no CDATA)', () => {
    const jobs = _parseXml(PLAIN_DESC_XML);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].jobDescriptions).toHaveLength(1);
    expect(jobs[0].jobDescriptions[0].name).toBe('Description');
    expect(jobs[0].jobDescriptions[0].value).toBe('Analyze data and build dashboards');
  });

  it('handles empty XML feed', () => {
    const jobs = _parseXml(EMPTY_XML);
    expect(jobs).toHaveLength(0);
  });

  it('handles empty fields gracefully', () => {
    const jobs = _parseXml(EMPTY_FIELDS_XML);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].id).toBe(11111);
    expect(jobs[0].name).toBe('Mystery Role');
    expect(jobs[0].department).toBe('');
    expect(jobs[0].office).toBe('');
    expect(jobs[0].seniority).toBe('');
    expect(jobs[0].employmentType).toBe('');
    expect(jobs[0].jobDescriptions).toHaveLength(0);
  });

  it('skips positions with non-numeric IDs', () => {
    const jobs = _parseXml(MALFORMED_XML);
    // "broken" ID should be skipped, "33333" should parse
    expect(jobs).toHaveLength(1);
    expect(jobs[0].id).toBe(33333);
    expect(jobs[0].name).toBe('Valid Job After Broken');
  });

  it('handles completely empty string', () => {
    const jobs = _parseXml('');
    expect(jobs).toHaveLength(0);
  });

  it('handles non-XML content', () => {
    const jobs = _parseXml('This is not XML at all');
    expect(jobs).toHaveLength(0);
  });

  it('handles XML with no positions', () => {
    const jobs = _parseXml('<workzag-jobs></workzag-jobs>');
    expect(jobs).toHaveLength(0);
  });

  it('parses a position with multiple job descriptions', () => {
    const xml = makeXmlFeed([`<position>
      <id>55555</id>
      <name>DevOps Engineer</name>
      <department>Infrastructure</department>
      <office>Remote</office>
      <recruitingCategory>Full-time</recruitingCategory>
      <employmentType>permanent</employmentType>
      <seniority>Senior</seniority>
      <schedule>full-time</schedule>
      <yearsOfExperience>5+</yearsOfExperience>
      <keywords>kubernetes, docker, terraform</keywords>
      <occupation>Infrastructure</occupation>
      <occupationCategory>DevOps</occupationCategory>
      <createdAt>2026-02-10T12:00:00+01:00</createdAt>
      <jobDescriptions>
        <jobDescription>
          <name>About</name>
          <value><![CDATA[<p>About section</p>]]></value>
        </jobDescription>
        <jobDescription>
          <name>Requirements</name>
          <value><![CDATA[<p>Requirements section</p>]]></value>
        </jobDescription>
        <jobDescription>
          <name>Benefits</name>
          <value><![CDATA[<p>Benefits section</p>]]></value>
        </jobDescription>
      </jobDescriptions>
    </position>`]);

    const jobs = _parseXml(xml);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].jobDescriptions).toHaveLength(3);
    expect(jobs[0].jobDescriptions[2].name).toBe('Benefits');
  });

  it('handles position with no jobDescriptions tag', () => {
    const xml = makeXmlFeed([`<position>
      <id>66666</id>
      <name>No Desc Job</name>
      <department>Eng</department>
      <office>London</office>
      <recruitingCategory>Part-time</recruitingCategory>
      <employmentType>contract</employmentType>
      <seniority>Junior</seniority>
      <schedule>part-time</schedule>
      <yearsOfExperience>1+</yearsOfExperience>
      <keywords>python</keywords>
      <occupation>Engineering</occupation>
      <occupationCategory>Backend</occupationCategory>
      <createdAt>2026-03-01T00:00:00+01:00</createdAt>
    </position>`]);

    const jobs = _parseXml(xml);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].jobDescriptions).toHaveLength(0);
  });

  it('handles large ID numbers', () => {
    const xml = makeXmlFeed([makePositionXml({ id: '9999999' })]);
    const jobs = _parseXml(xml);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].id).toBe(9999999);
  });

  it('handles special characters in text fields', () => {
    const xml = makeXmlFeed([makePositionXml({
      name: 'Engineer &amp; Lead',
      department: 'R&amp;D',
      office: 'M\u00fcnchen',
    })]);
    const jobs = _parseXml(xml);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].name).toBe('Engineer &amp; Lead');
    expect(jobs[0].office).toBe('M\u00fcnchen');
  });

  it('parses 10 positions correctly', () => {
    const positions = Array.from({ length: 10 }, (_, i) =>
      makePositionXml({ id: String(100 + i), name: `Job ${i}` })
    );
    const xml = makeXmlFeed(positions);
    const jobs = _parseXml(xml);
    expect(jobs).toHaveLength(10);
    expect(jobs[0].id).toBe(100);
    expect(jobs[9].id).toBe(109);
  });
});

// --- getTagContent ---

describe('_getTagContent', () => {
  it('extracts simple tag content', () => {
    expect(_getTagContent('<name>Hello</name>', 'name')).toBe('Hello');
  });

  it('extracts CDATA content', () => {
    expect(_getTagContent('<value><![CDATA[<p>HTML</p>]]></value>', 'value')).toBe('<p>HTML</p>');
  });

  it('returns empty string for missing tag', () => {
    expect(_getTagContent('<foo>bar</foo>', 'missing')).toBe('');
  });

  it('returns empty string for empty tag', () => {
    expect(_getTagContent('<name></name>', 'name')).toBe('');
  });

  it('handles whitespace in content', () => {
    expect(_getTagContent('<name>  Hello World  </name>', 'name')).toBe('Hello World');
  });

  it('handles multiline content', () => {
    const xml = '<value>\n  line1\n  line2\n</value>';
    expect(_getTagContent(xml, 'value')).toBe('line1\n  line2');
  });

  it('handles nested tags by taking first match', () => {
    const xml = '<name>outer</name><inner><name>inner</name></inner>';
    expect(_getTagContent(xml, 'name')).toBe('outer');
  });

  it('returns empty for completely empty input', () => {
    expect(_getTagContent('', 'anything')).toBe('');
  });
});

// --- isValidSlug ---

describe('_isValidSlug', () => {
  it('accepts valid company slugs', () => {
    expect(_isValidSlug('n26')).toBe(true);
    expect(_isValidSlug('celonis')).toBe(true);
    expect(_isValidSlug('my-company')).toBe(true);
    expect(_isValidSlug('ab')).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(_isValidSlug('www')).toBe(false);
    expect(_isValidSlug('api')).toBe(false);
    expect(_isValidSlug('static')).toBe(false);
    expect(_isValidSlug('cdn')).toBe(false);
    expect(_isValidSlug('assets')).toBe(false);
  });

  it('rejects slugs with dots', () => {
    expect(_isValidSlug('favicon.ico')).toBe(false);
    expect(_isValidSlug('robots.txt')).toBe(false);
  });

  it('rejects too short slugs', () => {
    expect(_isValidSlug('a')).toBe(false);
  });

  it('rejects too long slugs', () => {
    expect(_isValidSlug('a'.repeat(81))).toBe(false);
  });

  it('accepts max length slug', () => {
    expect(_isValidSlug('a'.repeat(80))).toBe(true);
  });
});

// --- scrapeCompany ---

describe('scrapeCompany', () => {
  it('returns CompanyJobs for a valid slug', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => TWO_JOBS_XML,
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
    vi.useFakeTimers();
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const promise = scrapeCompany('broken');
    await vi.advanceTimersByTimeAsync(30000);
    const result = await promise;
    expect(result).toBeNull();
    vi.useRealTimers();
    mockFetch.mockReset();
  }, 30000);

  it('returns null when no jobs exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => EMPTY_XML,
    });

    const result = await scrapeCompany('empty');
    expect(result).toBeNull();
  });

  it('strips job descriptions by default', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SINGLE_JOB_XML,
    });

    const result = await scrapeCompany('testco');
    expect(result).not.toBeNull();
    expect(result!.jobs[0].jobDescriptions).toEqual([]);
  });

  it('includes job descriptions when option set', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SINGLE_JOB_XML,
    });

    const result = await scrapeCompany('testco', { includeContent: true });
    expect(result).not.toBeNull();
    expect(result!.jobs[0].jobDescriptions).toHaveLength(1);
    expect(result!.jobs[0].jobDescriptions[0].value).toContain('Job description here');
  });

  it('returns null on fetch error', async () => {
    vi.useFakeTimers();
    // All retry attempts fail
    mockFetch.mockRejectedValue(new Error('Network error'));

    const promise = scrapeCompany('testco');
    // Advance timers through all backoff sleeps
    await vi.advanceTimersByTimeAsync(30000);
    const result = await promise;
    expect(result).toBeNull();
    vi.useRealTimers();
    mockFetch.mockReset();
  }, 30000);

  it('calls the correct URL with language parameter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SINGLE_JOB_XML,
    });

    await scrapeCompany('my-company');
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://my-company.jobs.personio.de/xml?language=en'
    );
  });

  it('supports custom language parameter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SINGLE_JOB_XML,
    });

    await scrapeCompany('my-company', { language: 'de' });
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://my-company.jobs.personio.de/xml?language=de'
    );
  });

  it('retries on 429 status', async () => {
    vi.useFakeTimers();
    // First call: 429
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
    });
    // Second call: success
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SINGLE_JOB_XML,
    });

    const promise = scrapeCompany('testco');
    await vi.advanceTimersByTimeAsync(30000);
    const result = await promise;
    expect(result).not.toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('gives up after max retries on persistent 429', async () => {
    vi.useFakeTimers();
    // All calls return 429
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
    });

    const promise = scrapeCompany('testco');
    await vi.advanceTimersByTimeAsync(30000);
    const result = await promise;
    // Should have retried MAX_RETRIES + 1 times total
    expect(result).toBeNull();
    expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    vi.useRealTimers();
  });
});

// --- scrapeAll ---

describe('scrapeAll', () => {
  it('returns sorted results by job count descending', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => SINGLE_JOB_XML,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => TWO_JOBS_XML,
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
        text: async () => SINGLE_JOB_XML,
      })
      .mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await scrapeAll(['exists', 'missing'], { concurrency: 1 });
    expect(result).toHaveLength(1);
  });

  it('calls onProgress callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SINGLE_JOB_XML,
    });

    const onProgress = vi.fn();
    await scrapeAll(['test'], { concurrency: 1, onProgress });
    expect(onProgress).toHaveBeenCalledWith(1, 1, 1);
  });

  it('handles empty slugs array', async () => {
    const result = await scrapeAll([]);
    expect(result).toEqual([]);
  });

  it('defaults to concurrency of 5', async () => {
    // Just verify it doesn't crash with default concurrency
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => SINGLE_JOB_XML,
    });

    const result = await scrapeAll(['a', 'b', 'c']);
    expect(result).toHaveLength(3);
  });

  it('passes language option through', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => SINGLE_JOB_XML,
    });

    await scrapeAll(['test'], { concurrency: 1, language: 'de' });
    expect(mockFetch.mock.calls[0][0]).toBe(
      'https://test.jobs.personio.de/xml?language=de'
    );
  });
});

// --- searchJobs ---

describe('searchJobs', () => {
  it('delegates to searchResults correctly', () => {
    const data = [
      makeCompanyJobs({
        company: 'Acme',
        jobs: [
          makeJob({ id: 1001, name: 'Frontend Engineer', department: 'Engineering' }),
          makeJob({ id: 1002, name: 'Product Manager', department: 'Product' }),
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

  it('returns all results when no query provided', () => {
    const data = [makeCompanyJobs()];
    const result = searchJobs(data, {});
    expect(result).toHaveLength(1);
    expect(result[0].jobs).toHaveLength(2);
  });
});

// --- discoverSlugs ---

describe('discoverSlugs', () => {
  it('queries Common Crawl and parses slugs from URLs', async () => {
    const ccResponse = [
      'https://acmecorp.jobs.personio.de/job/12345',
      'https://acmecorp.jobs.personio.de/job/67890',
      'https://widgetinc.jobs.personio.de/job/11111',
      'https://widgetinc.jobs.personio.de/',
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
      crawlIds: ['CC-TEST-2025-01'],
      knownSlugs: ['my-known-company'],
    });

    expect(slugs).toContain('my-known-company');
  });

  it('deduplicates slugs across crawls', async () => {
    const ccResponse = 'https://acmecorp.jobs.personio.de/job/1\n';

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => ccResponse,
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01', 'CC-TEST-2025-02'],
      knownSlugs: ['acmecorp'],
    });

    const acmeCount = slugs.filter((s) => s === 'acmecorp').length;
    expect(acmeCount).toBe(1);
  });

  it('handles HTTP errors gracefully', async () => {
    vi.useFakeTimers();
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const promise = discoverSlugs({
      crawlIds: ['CC-TEST-2025-01'],
      knownSlugs: ['fallback'],
    });

    await vi.advanceTimersByTimeAsync(30000);
    const slugs = await promise;
    expect(slugs).toContain('fallback');
    vi.useRealTimers();
    mockFetch.mockReset();
  }, 30000);

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

  it('filters out invalid slugs', async () => {
    const ccResponse = [
      'https://www.jobs.personio.de/something',
      'https://api.jobs.personio.de/something',
      'https://static.jobs.personio.de/something',
      'https://validcompany.jobs.personio.de/job/1',
    ].join('\n');

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => ccResponse,
    });

    const slugs = await discoverSlugs({
      crawlIds: ['CC-TEST-2025-01'],
      knownSlugs: [],
    });

    expect(slugs).not.toContain('www');
    expect(slugs).not.toContain('api');
    expect(slugs).not.toContain('static');
    expect(slugs).toContain('validcompany');
  });

  it('uses correct Common Crawl URL pattern', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => '',
    });

    await discoverSlugs({
      crawlIds: ['CC-MAIN-2025-08'],
      knownSlugs: [],
    });

    expect(mockFetch.mock.calls[0][0]).toContain('*.jobs.personio.de/*');
  });
});
