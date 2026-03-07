import { describe, it, expect } from 'vitest';
import { filterCompanyJobs, searchResults } from '../filters.js';
import { makeJob, makeCompanyJobs } from './fixtures.js';

describe('filterCompanyJobs', () => {
  it('filters by location regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { location: /San Francisco/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe(1002);
  });

  it('filters by department regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { department: /Product/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].departments).toContain('Product');
  });

  it('filters by office regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { office: /Berlin/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].offices).toContain('Berlin');
  });

  it('filters by keyword regex matching title', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { keyword: /Software/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].title).toContain('Software');
  });

  it('filters by keyword matching content', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          id: 1001,
          title: 'Generic Role',
          content: '<p>We use Kubernetes extensively</p>',
        }),
        makeJob({ id: 1002, title: 'Another Role' }),
      ],
      jobCount: 2,
    });
    const result = filterCompanyJobs(company, { keyword: /Kubernetes/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe(1001);
  });

  it('applies combined filters (department + location)', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: 1001, departments: ['Engineering'], location: 'Remote - Europe' }),
        makeJob({ id: 1002, departments: ['Engineering'], location: 'Remote - US' }),
        makeJob({ id: 1003, departments: ['Product'], location: 'Remote - Europe' }),
      ],
      jobCount: 3,
    });
    const result = filterCompanyJobs(company, {
      department: /Engineering/i,
      location: /Europe/i,
    });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe(1001);
  });

  it('returns null when all jobs are filtered out', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { location: /Antarctica/i });
    expect(result).toBeNull();
  });

  it('returns null for empty jobs array', () => {
    const company = makeCompanyJobs({ jobs: [], jobCount: 0 });
    const result = filterCompanyJobs(company, { department: /Engineering/i });
    expect(result).toBeNull();
  });

  it('handles regex special characters in location filter', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: 1001, location: 'New York (NYC)' }),
      ],
      jobCount: 1,
    });
    const result = filterCompanyJobs(company, {
      location: /New York \(NYC\)/,
    });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
  });

  it('matches department with multiple departments on a job', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: 1001, departments: ['Engineering', 'Data Science'] }),
      ],
      jobCount: 1,
    });
    const result = filterCompanyJobs(company, { department: /Data Science/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
  });

  it('updates jobCount when filtering', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { keyword: /Software/i });
    expect(result).not.toBeNull();
    expect(result!.jobCount).toBe(1);
  });
});

describe('searchResults', () => {
  const data = [
    makeCompanyJobs({
      company: 'Acme Corp',
      slug: 'acme',
      jobs: [
        makeJob({ id: 1001, title: 'Frontend Engineer', departments: ['Engineering'] }),
        makeJob({ id: 1002, title: 'Backend Engineer', departments: ['Engineering'] }),
      ],
      jobCount: 2,
    }),
    makeCompanyJobs({
      company: 'Widget Inc',
      slug: 'widget',
      jobs: [
        makeJob({ id: 1003, title: 'Product Designer', departments: ['Design'] }),
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

  it('searches by text matching department via keyword', () => {
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
    const result = searchResults(data, 'Engineer', { department: /Engineering/i });
    expect(result).toHaveLength(1);
    expect(result[0].jobs.length).toBeGreaterThan(0);
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
