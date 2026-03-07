import { describe, it, expect } from 'vitest';
import { filterCompanyJobs, searchResults } from '../filters.js';
import { makeJob, makeCompanyJobs } from './fixtures.js';

describe('filterCompanyJobs', () => {
  it('filters by remote=true, keeping only remote jobs', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { remote: true });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe(1001);
    expect(result!.jobCount).toBe(1);
  });

  it('filters by location regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { location: /San Francisco/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe(1002);
  });

  it('matches location against city field', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          id: 1001,
          location: 'Office',
          city: 'Prague',
          country: 'Czech Republic',
          remote: false,
        }),
      ],
      jobCount: 1,
    });
    const result = filterCompanyJobs(company, { location: /Prague/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
  });

  it('matches location against country field', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          id: 1001,
          location: 'Office',
          country: 'Czech Republic',
          remote: false,
        }),
      ],
      jobCount: 1,
    });
    const result = filterCompanyJobs(company, { location: /Czech/i });
    expect(result).not.toBeNull();
  });

  it('matches location against state field', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          id: 1001,
          location: 'US Office',
          state: 'California',
          remote: false,
        }),
      ],
      jobCount: 1,
    });
    const result = filterCompanyJobs(company, { location: /California/i });
    expect(result).not.toBeNull();
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
          id: 1001,
          title: 'Generic Role',
          descriptionPlain: 'We use Kubernetes extensively',
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

  it('filters by country regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { country: /United States/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe(1002);
  });

  it('filters by employmentType regex', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: 1001, employmentType: 'FullTime' }),
        makeJob({ id: 1002, employmentType: 'PartTime' }),
      ],
      jobCount: 2,
    });
    const result = filterCompanyJobs(company, { employmentType: /PartTime/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe(1002);
  });

  it('applies combined filters (remote + location)', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: 1001, remote: true, location: 'Remote - Europe' }),
        makeJob({ id: 1002, remote: true, location: 'Remote - US' }),
        makeJob({ id: 1003, remote: false, location: 'San Francisco, CA' }),
      ],
      jobCount: 3,
    });
    const result = filterCompanyJobs(company, {
      remote: true,
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
    const result = filterCompanyJobs(company, { remote: true });
    expect(result).toBeNull();
  });

  it('handles regex special characters in location filter', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: 1001, location: 'New York (NYC)', remote: false }),
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
        makeJob({ id: 1001, title: 'Frontend Engineer', department: 'Engineering' }),
        makeJob({ id: 1002, title: 'Backend Engineer', department: 'Engineering' }),
      ],
      jobCount: 2,
    }),
    makeCompanyJobs({
      company: 'Widget Inc',
      slug: 'widget',
      jobs: [
        makeJob({ id: 1003, title: 'Product Designer', department: 'Design' }),
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

  it('searches by text matching Designer', () => {
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
    expect(result[0].jobs.every((j) => j.remote)).toBe(true);
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
