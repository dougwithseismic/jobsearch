import { describe, it, expect } from 'vitest';
import { toJSON, toCSV, toTable, flattenJobs } from '../output.js';
import { makeJob, makeCompanyJobs } from './fixtures.js';

describe('flattenJobs', () => {
  it('flattens CompanyJobs[] into FlatJob[]', () => {
    const data = [makeCompanyJobs()];
    const flat = flattenJobs(data);
    expect(flat).toHaveLength(2);
    expect(flat[0].company).toBe('TestCo');
    expect(flat[0].slug).toBe('testco');
    expect(flat[0].name).toBe('Senior Software Engineer');
    expect(flat[1].name).toBe('Product Manager');
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

  it('includes job URL in flattened output', () => {
    const data = [makeCompanyJobs({ slug: 'testco' })];
    const flat = flattenJobs(data);
    expect(flat[0].jobUrl).toBe('https://testco.jobs.personio.de/job/12345');
  });

  it('includes department in flat output', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 1001, department: 'Engineering' })],
        jobCount: 1,
      }),
    ];
    const flat = flattenJobs(data);
    expect(flat[0].department).toBe('Engineering');
  });

  it('includes office in flat output', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 1001, office: 'Berlin' })],
        jobCount: 1,
      }),
    ];
    const flat = flattenJobs(data);
    expect(flat[0].office).toBe('Berlin');
  });

  it('includes employment type fields', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 1001, employmentType: 'permanent', schedule: 'full-time', seniority: 'Senior' })],
        jobCount: 1,
      }),
    ];
    const flat = flattenJobs(data);
    expect(flat[0].employmentType).toBe('permanent');
    expect(flat[0].schedule).toBe('full-time');
    expect(flat[0].seniority).toBe('Senior');
  });

  it('includes recruiting category', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 1001, recruitingCategory: 'Internship' })],
        jobCount: 1,
      }),
    ];
    const flat = flattenJobs(data);
    expect(flat[0].recruitingCategory).toBe('Internship');
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

  it('preserves all job fields in JSON', () => {
    const data = [makeCompanyJobs({ jobs: [makeJob()], jobCount: 1 })];
    const json = toJSON(data);
    const parsed = JSON.parse(json);
    const job = parsed[0].jobs[0];
    expect(job.id).toBeDefined();
    expect(job.name).toBeDefined();
    expect(job.department).toBeDefined();
    expect(job.office).toBeDefined();
    expect(job.seniority).toBeDefined();
  });
});

describe('toCSV', () => {
  it('produces valid CSV with correct headers', () => {
    const data = [makeCompanyJobs()];
    const csv = toCSV(data);
    const lines = csv.split('\n');
    expect(lines[0]).toBe(
      'company,name,department,office,employmentType,seniority,schedule,createdAt,jobUrl'
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
            name: 'Engineer, Senior',
            office: 'San Francisco, CA',
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
            name: 'The "Best" Engineer',
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

  it('formats createdAt as date only', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 1001, createdAt: '2026-03-01T12:30:00+01:00' })],
        jobCount: 1,
      }),
    ];
    const csv = toCSV(data);
    expect(csv).toContain('2026-03-01');
    expect(csv).not.toContain('T12:30');
  });

  it('includes job URL in CSV', () => {
    const data = [makeCompanyJobs({ slug: 'myco' })];
    const csv = toCSV(data);
    expect(csv).toContain('https://myco.jobs.personio.de/job/');
  });

  it('handles empty string fields', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 1001, department: '', office: '', seniority: '' })],
        jobCount: 1,
      }),
    ];
    const csv = toCSV(data);
    // Empty fields should be quoted as ""
    expect(csv).toContain('""');
  });
});

describe('toTable', () => {
  it('produces formatted table with columns', () => {
    const data = [makeCompanyJobs()];
    const table = toTable(data);
    expect(table).toContain('Company');
    expect(table).toContain('Title');
    expect(table).toContain('Dept');
    expect(table).toContain('Office');
    expect(table).toContain('Seniority');
    expect(table).toContain('Created');
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
            name: 'This Is An Extremely Long Job Title That Should Be Truncated',
          }),
        ],
        jobCount: 1,
      }),
    ];
    const table = toTable(data);
    expect(table).toContain('\u2026');
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

  it('shows multiple companies', () => {
    const data = [
      makeCompanyJobs({ company: 'Alpha', jobs: [makeJob({ id: 1 })], jobCount: 1 }),
      makeCompanyJobs({ company: 'Beta', jobs: [makeJob({ id: 2 })], jobCount: 1 }),
    ];
    const table = toTable(data);
    expect(table).toContain('Alpha');
    expect(table).toContain('Beta');
    expect(table).toContain('2 jobs across 2 companies');
  });

  it('formats createdAt as date only in table', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 1, createdAt: '2026-05-15T10:00:00+01:00' })],
        jobCount: 1,
      }),
    ];
    const table = toTable(data);
    expect(table).toContain('2026-05-15');
    expect(table).not.toContain('T10:00');
  });
});
