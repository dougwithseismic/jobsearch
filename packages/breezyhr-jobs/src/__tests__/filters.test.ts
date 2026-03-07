import { describe, it, expect } from 'vitest';
import { filterCompanyJobs, searchResults } from '../filters.js';
import { makeJob, makeCompanyJobs } from './fixtures.js';

describe('filterCompanyJobs', () => {
  it('filters by location regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { location: /San Francisco/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe('xyz789ghi012');
  });

  it('filters by department regex', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { department: /Product/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].department).toBe('Product');
  });

  it('filters by keyword regex matching name', () => {
    const company = makeCompanyJobs();
    const result = filterCompanyJobs(company, { keyword: /Software/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].name).toContain('Software');
  });

  it('filters by keyword matching department text', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: 'j1', name: 'Generic Role', department: 'Data Science' }),
        makeJob({ id: 'j2', name: 'Another Role', department: 'Sales' }),
      ],
      jobCount: 2,
    });
    const result = filterCompanyJobs(company, { keyword: /Data Science/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe('j1');
  });

  it('filters by salary regex', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({ id: 'j1', salary: '$80,000 - $120,000 / yr' }),
        makeJob({ id: 'j2', salary: '' }),
      ],
      jobCount: 2,
    });
    const result = filterCompanyJobs(company, { salary: /\$80,000/i });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe('j1');
  });

  it('filters by remoteOnly', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          id: 'j1',
          location: {
            country: null, state: null, city: '', primary: true,
            isRemote: true, name: 'Remote',
          },
        }),
        makeJob({
          id: 'j2',
          location: {
            country: { name: 'Germany', id: 'DE' }, state: null, city: 'Berlin', primary: true,
            isRemote: false, name: 'Berlin, Germany',
          },
        }),
      ],
      jobCount: 2,
    });
    const result = filterCompanyJobs(company, { remoteOnly: true });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe('j1');
  });

  it('applies combined filters (department + location)', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          id: 'j1', department: 'Engineering',
          location: { country: null, state: null, city: '', primary: true, isRemote: true, name: 'Remote - Europe' },
        }),
        makeJob({
          id: 'j2', department: 'Engineering',
          location: { country: null, state: null, city: '', primary: true, isRemote: false, name: 'Remote - US' },
        }),
        makeJob({
          id: 'j3', department: 'Product',
          location: { country: null, state: null, city: '', primary: true, isRemote: true, name: 'Remote - Europe' },
        }),
      ],
      jobCount: 3,
    });
    const result = filterCompanyJobs(company, {
      department: /Engineering/i,
      location: /Europe/i,
    });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe('j1');
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
        makeJob({
          id: 'j1',
          location: { country: null, state: null, city: '', primary: true, isRemote: false, name: 'New York (NYC)' },
        }),
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

  it('preserves company metadata in filtered result', () => {
    const company = makeCompanyJobs({ company: 'Special Corp', slug: 'special' });
    const result = filterCompanyJobs(company, { keyword: /Software/i });
    expect(result).not.toBeNull();
    expect(result!.company).toBe('Special Corp');
    expect(result!.slug).toBe('special');
    expect(result!.scrapedAt).toBe('2026-03-01T00:00:00.000Z');
  });

  it('combines remoteOnly with department filter', () => {
    const company = makeCompanyJobs({
      jobs: [
        makeJob({
          id: 'j1', department: 'Engineering',
          location: { country: null, state: null, city: '', primary: true, isRemote: true, name: 'Remote' },
        }),
        makeJob({
          id: 'j2', department: 'Engineering',
          location: { country: null, state: null, city: 'Berlin', primary: true, isRemote: false, name: 'Berlin' },
        }),
        makeJob({
          id: 'j3', department: 'Design',
          location: { country: null, state: null, city: '', primary: true, isRemote: true, name: 'Remote' },
        }),
      ],
      jobCount: 3,
    });
    const result = filterCompanyJobs(company, {
      department: /Engineering/i,
      remoteOnly: true,
    });
    expect(result).not.toBeNull();
    expect(result!.jobs).toHaveLength(1);
    expect(result!.jobs[0].id).toBe('j1');
  });
});

describe('searchResults', () => {
  const data = [
    makeCompanyJobs({
      company: 'Acme Corp',
      slug: 'acme',
      jobs: [
        makeJob({ id: 'j1', name: 'Frontend Engineer', department: 'Engineering' }),
        makeJob({ id: 'j2', name: 'Backend Engineer', department: 'Engineering' }),
      ],
      jobCount: 2,
    }),
    makeCompanyJobs({
      company: 'Widget Inc',
      slug: 'widget',
      jobs: [
        makeJob({ id: 'j3', name: 'Product Designer', department: 'Design' }),
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

  it('applies limit of 0 (returns all)', () => {
    const result = searchResults(data, undefined, undefined, 0);
    expect(result).toHaveLength(2);
  });

  it('applies structured filter without text', () => {
    const result = searchResults(data, undefined, { department: /Design/i });
    expect(result).toHaveLength(1);
    expect(result[0].company).toBe('Widget Inc');
  });

  it('handles limit larger than total jobs', () => {
    const result = searchResults(data, undefined, undefined, 100);
    const totalJobs = result.reduce((s, r) => s + r.jobs.length, 0);
    expect(totalJobs).toBe(3);
  });
});
