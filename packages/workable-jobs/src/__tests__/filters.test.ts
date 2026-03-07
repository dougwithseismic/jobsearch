import { describe, it, expect } from 'vitest';
import { filterCompanyJobs, searchResults } from '../filters.js';
import { makeJob, makeCompanyJobs } from './fixtures.js';

describe('filterCompanyJobs', () => {
  it('filters by remote=true, keeping only remote jobs', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { remote: true });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].shortcode).toBe('1');
    expect(result!.jobCount).toBe(1);
  });

  it('filters by location regex matching country', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { location: /United States/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].shortcode).toBe('2');
  });

  it('filters by location regex matching city', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { location: /San Francisco/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].shortcode).toBe('2');
  });

  it('filters by location regex matching state', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { location: /California/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].shortcode).toBe('2');
  });

  it('matches location against locations array', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          shortcode: '1',
          country: 'United States',
          city: 'New York',
          state: 'New York',
          locations: [
            { country: 'United States', countryCode: 'US', city: 'New York', region: 'New York' },
            { country: 'Germany', countryCode: 'DE', city: 'Berlin', region: 'Berlin' },
          ],
          isRemote: false,
        }),
      ],
      jobCount: 1,
    });
    const result = filterCompanyJobs(company, { location: /Berlin/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
  });

  it('matches location against countryCode in locations', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          shortcode: '1',
          country: 'Germany',
          city: 'Berlin',
          state: 'Berlin',
          locations: [
            { country: 'Germany', countryCode: 'DE', city: 'Berlin', region: 'Berlin' },
          ],
          isRemote: false,
        }),
      ],
      jobCount: 1,
    });
    const result = filterCompanyJobs(company, { location: /^DE$/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
  });

  it('filters by department regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { department: /Product/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].department).toBe('Product');
  });

  it('filters by keyword regex matching title', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { keyword: /Software/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].title).toContain('Software');
  });

  it('filters by keyword matching descriptionHtml', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          shortcode: '1',
          title: 'Generic Role',
          descriptionHtml: '<p>We use Kubernetes extensively</p>',
        }),
        makeJob({ shortcode: '2', title: 'Another Role' }),
      ],
      jobCount: 2,
    });
    const result = filterCompanyJobs(company, { keyword: /Kubernetes/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].shortcode).toBe('1');
  });

  it('applies combined filters (remote + location)', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ shortcode: '1', isRemote: true, country: 'Germany', city: 'Berlin', state: 'Berlin', locations: [{ country: 'Germany', countryCode: 'DE', city: 'Berlin', region: 'Berlin' }] }),
        makeJob({ shortcode: '2', isRemote: true, country: 'United States', city: 'Austin', state: 'Texas', locations: [{ country: 'United States', countryCode: 'US', city: 'Austin', region: 'Texas' }] }),
        makeJob({ shortcode: '3', isRemote: false, country: 'United States', city: 'San Francisco', state: 'California', locations: [{ country: 'United States', countryCode: 'US', city: 'San Francisco', region: 'California' }] }),
      ],
      jobCount: 3,
    });
    const result = filterCompanyJobs(company, {
      remote: true,
      location: /Germany/i,
    });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].shortcode).toBe('1');
  });

  it('returns null when all jobs are filtered out', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { location: /Antarctica/i });
    expect(result).toBeNull();
  });

  it('returns null for empty jobs array', () => {
    const company = makeCompanyJobs({ jobs: [], jobCount: 0 });
    const result = filterCompanyJobs(company, { remote: true });
    expect(result).toBeNull();
  });

  it('handles regex special characters in location filter', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ shortcode: '1', city: 'New York (NYC)', isRemote: false }),
      ],
      jobCount: 1,
    });
    const result = filterCompanyJobs(company, {
      location: /New York \(NYC\)/,
    });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
  });
});

describe('searchResults', () => {
  const data = [
    makeCompanyJobs({
      company: 'Acme Corp',
      slug: 'acme',
      jobs: [
        makeJob({ shortcode: '1', title: 'Frontend Engineer', department: 'Engineering' }),
        makeJob({ shortcode: '2', title: 'Backend Engineer', department: 'Engineering' }),
      ],
      jobCount: 2,
    }),
    makeCompanyJobs({
      company: 'Widget Inc',
      slug: 'widget',
      jobs: [
        makeJob({ shortcode: '3', title: 'Product Designer', department: 'Design' }),
      ],
      jobCount: 1,
    }),
  ];

  it('returns all results when no filters or text provided', () => {
    const result = searchResults(data);
    expect(result).toHaveLength(2);
  });

  it('searches by text matching job title', () => {
    const result = searchResults(data, 'Frontend');
    expect(result).toHaveLength(1);
    expect(result[0].jobs).toHaveLength(1);
    expect(result[0].jobs[0].title).toBe('Frontend Engineer');
  });

  it('searches by text matching department content', () => {
    const result = searchResults(data, 'Designer');
    expect(result).toHaveLength(1);
    expect(result[0].company).toBe('Widget Inc');
  });

  it('applies limit across total jobs', () => {
    const result = searchResults(data, undefined, undefined, 1);
    const totalJobs = result.reduce((s, r) => s + r.jobs.length, 0);
    expect(totalJobs).toBe(1);
  });

  it('applies limit that splits a company jobs array', () => {
    const result = searchResults(data, 'Engineer', undefined, 1);
    expect(result).toHaveLength(1);
    expect(result[0].jobs).toHaveLength(1);
    expect(result[0].jobCount).toBe(1);
  });

  it('combines text and structured filters', () => {
    const result = searchResults(data, 'Engineer', { remote: true });
    expect(result).toHaveLength(1);
    expect(result[0].jobs.every((j) => j.isRemote)).toBe(true);
  });

  it('returns empty array when nothing matches', () => {
    const result = searchResults(data, 'Nonexistent');
    expect(result).toHaveLength(0);
  });

  it('escapes regex special chars in text search', () => {
    const result = searchResults(data, 'Frontend (React)');
    expect(result).toHaveLength(0);
  });

  it('handles empty data array', () => {
    const result = searchResults([], 'anything');
    expect(result).toHaveLength(0);
  });
});
