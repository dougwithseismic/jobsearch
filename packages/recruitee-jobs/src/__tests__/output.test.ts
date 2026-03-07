import { describe, it, expect } from 'vitest';
import { toJSON, toCSV, toTable, flattenJobs } from '../output.js';
import { makeJob, makeCompanyJobs } from './fixtures.js';

describe('flattenJobs', () => {
  it('flattens CompanyJobs[] into FlatJob[]', () => {
    const data = [makeCompanyJobs()];
    const flat = flattenJobs(data);
    expect(flat).toHaveLength(2);
    expect(flat[0].company).toBe('TestCo');
    expect(flat[0].companySlug).toBe('testco');
    expect(flat[0].title).toBe('Senior Software Engineer');
    expect(flat[1].title).toBe('Product Manager');
  });

  it('flattens multiple companies', () => {
    const data = [
      makeCompanyJobs({ company: 'A', slug: 'a' }),
      makeCompanyJobs({ company: 'B', slug: 'b' }),
    ];
    const flat = flattenJobs(data);
    expect(flat).toHaveLength(4);
    expect(flat[0].company).toBe('A');
    expect(flat[2].company).toBe('B');
  });

  it('returns empty array for empty input', () => {
    expect(flattenJobs([])).toEqual([]);
  });

  it('handles company with no jobs', () => {
    const data = [makeCompanyJobs({ jobs: [], jobCount: 0 })];
    expect(flattenJobs(data)).toEqual([]);
  });

  it('joins tags as comma-separated string', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 1001, tags: ['engineering', 'remote', 'senior'] })],
        jobCount: 1,
      }),
    ];
    const flat = flattenJobs(data);
    expect(flat[0].tags).toBe('engineering, remote, senior');
  });
});

describe('toJSON', () => {
  it('produces valid JSON (pretty)', () => {
    const data = [makeCompanyJobs()];
    const json = toJSON(data);
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].company).toBe('TestCo');
    expect(json).toContain('\n');
  });

  it('produces compact JSON when pretty=false', () => {
    const data = [makeCompanyJobs()];
    const json = toJSON(data, false);
    expect(json).not.toContain('\n');
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(1);
  });

  it('handles empty results', () => {
    const json = toJSON([]);
    expect(JSON.parse(json)).toEqual([]);
  });
});

describe('toCSV', () => {
  it('produces valid CSV with correct headers', () => {
    const data = [makeCompanyJobs()];
    const csv = toCSV(data);
    const lines = csv.split('\n');
    expect(lines[0]).toBe(
      'company,title,department,location,country,city,remote,employmentType,publishedAt,careersUrl,tags'
    );
    // 1 header + 2 data rows
    expect(lines).toHaveLength(3);
  });

  it('handles commas in values by quoting', () => {
    const data = [
      makeCompanyJobs({
        company: 'Acme, Inc.',
        jobs: [
          makeJob({
            id: 1001,
            title: 'Engineer, Senior',
            location: 'San Francisco, CA',
          }),
        ],
        jobCount: 1,
      }),
    ];
    const csv = toCSV(data);
    const lines = csv.split('\n');
    expect(lines[1]).toContain('"Acme, Inc."');
    expect(lines[1]).toContain('"Engineer, Senior"');
  });

  it('escapes double quotes in values', () => {
    const data = [
      makeCompanyJobs({
        jobs: [
          makeJob({
            id: 1001,
            title: 'The "Best" Engineer',
          }),
        ],
        jobCount: 1,
      }),
    ];
    const csv = toCSV(data);
    expect(csv).toContain('"The ""Best"" Engineer"');
  });

  it('handles empty results', () => {
    const csv = toCSV([]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(1);
  });

  it('formats publishedAt as date only', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 1001, publishedAt: '2026-03-01T12:30:00.000Z' })],
        jobCount: 1,
      }),
    ];
    const csv = toCSV(data);
    expect(csv).toContain('2026-03-01');
    expect(csv).not.toContain('T12:30');
  });
});

describe('toTable', () => {
  it('produces formatted table with columns', () => {
    const data = [makeCompanyJobs()];
    const table = toTable(data);
    expect(table).toContain('Company');
    expect(table).toContain('Title');
    expect(table).toContain('Dept');
    expect(table).toContain('Location');
    expect(table).toContain('Remote');
    expect(table).toContain('Posted');
    expect(table).toContain('------');
    expect(table).toContain('2 jobs across 1 companies');
  });

  it('returns "No results found." for empty results', () => {
    expect(toTable([])).toBe('No results found.');
  });

  it('truncates long values with ellipsis', () => {
    const data = [
      makeCompanyJobs({
        jobs: [
          makeJob({
            id: 1001,
            title: 'This Is An Extremely Long Job Title That Should Be Truncated',
          }),
        ],
        jobCount: 1,
      }),
    ];
    const table = toTable(data);
    expect(table).toContain('\u2026');
  });

  it('shows Yes/No for remote column', () => {
    const data = [makeCompanyJobs()];
    const table = toTable(data);
    expect(table).toContain('Yes');
    expect(table).toContain('No');
  });

  it('handles single job', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 1001 })],
        jobCount: 1,
      }),
    ];
    const table = toTable(data);
    expect(table).toContain('1 jobs across 1 companies');
  });
});
