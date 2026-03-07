import { describe, it, expect } from 'vitest';
import { filterCompanyJobs, searchResults } from '../filters.js';
import { makeJob, makeCompanyJobs } from './fixtures.js';

describe('filterCompanyJobs', () => {
  it('filters by location/office regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { location: /San Francisco/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe(12346);
  });

  it('filters by department regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { department: /Product/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].department).toBe('Product');
  });

  it('filters by office regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { office: /Berlin/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].office).toBe('Berlin');
  });

  it('filters by keyword regex matching name', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { keyword: /Software/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].name).toContain('Software');
  });

  it('filters by keyword matching job description content', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          id: 1001,
          name: 'Generic Role',
          jobDescriptions: [{ name: 'About', value: '<p>We use Kubernetes extensively</p>' }],
        }),
        makeJob({ id: 1002, name: 'Another Role', jobDescriptions: [] }),
      ],
      jobCount: 2,
    });
    const result = filterCompanyJobs(company, { keyword: /Kubernetes/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe(1001);
  });

  it('filters by keyword matching keywords field', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: 1001, name: 'Dev', keywords: 'react, typescript', jobDescriptions: [] }),
        makeJob({ id: 1002, name: 'Designer', keywords: 'figma, sketch', jobDescriptions: [] }),
      ],
      jobCount: 2,
    });
    const result = filterCompanyJobs(company, { keyword: /typescript/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe(1001);
  });

  it('filters by seniority regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { seniority: /Senior/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].seniority).toBe('Senior');
  });

  it('filters by employmentType regex', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: 1001, employmentType: 'permanent' }),
        makeJob({ id: 1002, employmentType: 'contract' }),
      ],
      jobCount: 2,
    });
    const result = filterCompanyJobs(company, { employmentType: /contract/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe(1002);
  });

  it('applies combined filters (department + location)', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: 1001, department: 'Engineering', office: 'Berlin' }),
        makeJob({ id: 1002, department: 'Engineering', office: 'New York' }),
        makeJob({ id: 1003, department: 'Product', office: 'Berlin' }),
      ],
      jobCount: 3,
    });
    const result = filterCompanyJobs(company, {
      department: /Engineering/i,
      location: /Berlin/i,
    });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe(1001);
  });

  it('applies combined filters (seniority + department)', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: 1001, department: 'Engineering', seniority: 'Senior' }),
        makeJob({ id: 1002, department: 'Engineering', seniority: 'Junior' }),
        makeJob({ id: 1003, department: 'Product', seniority: 'Senior' }),
      ],
      jobCount: 3,
    });
    const result = filterCompanyJobs(company, {
      department: /Engineering/i,
      seniority: /Senior/i,
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
        makeJob({ id: 1001, office: 'New York (NYC)' }),
      ],
      jobCount: 1,
    });
    const result = filterCompanyJobs(company, {
      location: /New York \(NYC\)/,
    });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
  });

  it('updates jobCount when filtering', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { keyword: /Software/i });
    expect(result).not.toBeNull();
    expect(result!.jobCount).toBe(1);
  });

  it('preserves other company fields when filtering', () => {
    const company = makeCompanyJobs({ company: 'MyCompany', slug: 'myco', scrapedAt: '2026-01-01' });
    const result = filterCompanyJobs(company, { department: /Engineering/i });
    expect(result).not.toBeNull();
    expect(result!.company).toBe('MyCompany');
    expect(result!.slug).toBe('myco');
    expect(result!.scrapedAt).toBe('2026-01-01');
  });
});

describe('searchResults', () => {
  const data = [
    makeCompanyJobs({
      company: 'Acme Corp',
      slug: 'acme',
      jobs: [
        makeJob({ id: 1001, name: 'Frontend Engineer', department: 'Engineering', keywords: 'react, typescript', jobDescriptions: [] }),
        makeJob({ id: 1002, name: 'Backend Engineer', department: 'Engineering', keywords: 'node, python', jobDescriptions: [] }),
      ],
      jobCount: 2,
    }),
    makeCompanyJobs({
      company: 'Widget Inc',
      slug: 'widget',
      jobs: [
        makeJob({ id: 1003, name: 'Product Designer', department: 'Design', keywords: 'figma', jobDescriptions: [] }),
      ],
      jobCount: 1,
    }),
  ];

  it('returns all results when no filters or text provided', () => {
    const result = searchResults(data);
    expect(result).toHaveLength(2);
  });

  it('searches by text matching job name', () => {
    const result = searchResults(data, 'Frontend');
    expect(result).toHaveLength(1);
    expect(result[0].jobs).toHaveLength(1);
    expect(result[0].jobs[0].name).toBe('Frontend Engineer');
  });

  it('searches by text matching keywords', () => {
    const result = searchResults(data, 'typescript');
    expect(result).toHaveLength(1);
    expect(result[0].jobs).toHaveLength(1);
    expect(result[0].jobs[0].name).toBe('Frontend Engineer');
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

  it('applies structured filter only', () => {
    const result = searchResults(data, undefined, { department: /Design/i });
    expect(result).toHaveLength(1);
    expect(result[0].company).toBe('Widget Inc');
  });

  it('applies limit only', () => {
    const result = searchResults(data, undefined, undefined, 2);
    const totalJobs = result.reduce((s, r) => s + r.jobs.length, 0);
    expect(totalJobs).toBe(2);
  });

  it('limit of 0 returns all results', () => {
    const result = searchResults(data, undefined, undefined, 0);
    expect(result).toHaveLength(2);
  });

  it('limit greater than total returns all', () => {
    const result = searchResults(data, undefined, undefined, 999);
    const totalJobs = result.reduce((s, r) => s + r.jobs.length, 0);
    expect(totalJobs).toBe(3);
  });
});
