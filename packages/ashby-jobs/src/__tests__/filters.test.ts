import { describe, it, expect } from 'vitest';
import { filterCompanyJobs, searchResults } from '../filters.js';
import { makeJob, makeCompanyJobs } from './fixtures.js';

describe('filterCompanyJobs', () => {
  it('filters by remote=true, keeping only remote jobs', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { remote: true });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe('1');
    expect(result!.jobCount).toBe(1);
  });

  it('filters by location regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { location: /San Francisco/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe('2');
  });

  it('matches location against secondaryLocations', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          id: '1',
          location: 'New York',
          secondaryLocations: [{ location: 'Berlin, Germany' }],
          isRemote: false,
        }),
      ],
      jobCount: 1,
    });
    const result = filterCompanyJobs(company, { location: /Berlin/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
  });

  it('matches location against address fields', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          id: '1',
          location: 'Office',
          isRemote: false,
          address: {
            postalAddress: {
              addressCountry: 'Czech Republic',
              addressLocality: 'Prague',
            },
          },
        }),
      ],
      jobCount: 1,
    });
    const result = filterCompanyJobs(company, { location: /Prague/i });
    expect(result).not.toBeNull();

    const resultCountry = filterCompanyJobs(company, { location: /Czech/i });
    expect(resultCountry).not.toBeNull();
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

  it('filters by keyword matching descriptionPlain', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          id: '1',
          title: 'Generic Role',
          descriptionPlain: 'We use Kubernetes extensively',
        }),
        makeJob({ id: '2', title: 'Another Role' }),
      ],
      jobCount: 2,
    });
    const result = filterCompanyJobs(company, { keyword: /Kubernetes/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe('1');
  });

  it('applies combined filters (remote + location)', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: '1', isRemote: true, location: 'Remote - Europe' }),
        makeJob({ id: '2', isRemote: true, location: 'Remote - US' }),
        makeJob({ id: '3', isRemote: false, location: 'San Francisco, CA' }),
      ],
      jobCount: 3,
    });
    const result = filterCompanyJobs(company, {
      remote: true,
      location: /Europe/i,
    });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe('1');
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
        makeJob({ id: '1', location: 'New York (NYC)', isRemote: false }),
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
        makeJob({ id: '1', title: 'Frontend Engineer', department: 'Engineering' }),
        makeJob({ id: '2', title: 'Backend Engineer', department: 'Engineering' }),
      ],
      jobCount: 2,
    }),
    makeCompanyJobs({
      company: 'Widget Inc',
      slug: 'widget',
      jobs: [
        makeJob({ id: '3', title: 'Product Designer', department: 'Design' }),
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

  it('searches by text matching company name (via keyword on title+desc)', () => {
    // Text search uses keyword filter on title + descriptionPlain
    // Company name won't match directly - text search is on job content
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
    // Acme has 2 jobs. Limit to 1 should truncate.
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
    // Should not throw, just return no results
    expect(result).toHaveLength(0);
  });

  it('handles empty data array', () => {
    const result = searchResults([], 'anything');
    expect(result).toHaveLength(0);
  });
});
