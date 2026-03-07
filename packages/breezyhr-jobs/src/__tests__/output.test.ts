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

  it('extracts location name correctly', () => {
    const data = [
      makeCompanyJobs({
        jobs: [
          makeJob({
            id: 'j1',
            location: {
              country: { name: 'Germany', id: 'DE' },
              state: null,
              city: 'Berlin',
              primary: true,
              isRemote: false,
              name: 'Berlin, Germany',
            },
          }),
        ],
        jobCount: 1,
      }),
    ];
    const flat = flattenJobs(data);
    expect(flat[0].location).toBe('Berlin, Germany');
  });

  it('extracts isRemote flag', () => {
    const data = [
      makeCompanyJobs({
        jobs: [
          makeJob({
            id: 'j1',
            location: {
              country: null, state: null, city: '', primary: true,
              isRemote: true, name: 'Remote',
            },
          }),
        ],
        jobCount: 1,
      }),
    ];
    const flat = flattenJobs(data);
    expect(flat[0].isRemote).toBe(true);
  });

  it('extracts salary', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 'j1', salary: '$100k - $150k' })],
        jobCount: 1,
      }),
    ];
    const flat = flattenJobs(data);
    expect(flat[0].salary).toBe('$100k - $150k');
  });

  it('extracts type name', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 'j1', type: { id: 'full-time', name: 'Full Time' } })],
        jobCount: 1,
      }),
    ];
    const flat = flattenJobs(data);
    expect(flat[0].type).toBe('Full Time');
  });

  it('extracts url', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 'j1', url: 'https://example.breezy.hr/p/j1-test' })],
        jobCount: 1,
      }),
    ];
    const flat = flattenJobs(data);
    expect(flat[0].url).toBe('https://example.breezy.hr/p/j1-test');
  });

  it('extracts publishedDate', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 'j1', publishedDate: '2026-01-15T10:00:00.000Z' })],
        jobCount: 1,
      }),
    ];
    const flat = flattenJobs(data);
    expect(flat[0].publishedDate).toBe('2026-01-15T10:00:00.000Z');
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
    const data = [makeCompanyJobs({
      jobs: [makeJob({ id: 'j1', salary: '$100k', department: 'Eng' })],
      jobCount: 1,
    })];
    const json = toJSON(data);
    const parsed = JSON.parse(json);
    expect(parsed[0].jobs[0].salary).toBe('$100k');
    expect(parsed[0].jobs[0].department).toBe('Eng');
  });
});

describe('toCSV', () => {
  it('produces valid CSV with correct headers', () => {
    const data = [makeCompanyJobs()];
    const csv = toCSV(data);
    const lines = csv.split('\n');
    expect(lines[0]).toBe(
      'company,name,department,location,isRemote,salary,type,publishedDate,url'
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
            id: 'j1',
            name: 'Engineer, Senior',
            location: {
              country: null, state: null, city: '', primary: true,
              isRemote: false, name: 'San Francisco, CA',
            },
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
            id: 'j1',
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

  it('formats publishedDate as date only', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 'j1', publishedDate: '2026-03-01T12:30:00.000Z' })],
        jobCount: 1,
      }),
    ];
    const csv = toCSV(data);
    expect(csv).toContain('2026-03-01');
    expect(csv).not.toContain('T12:30');
  });

  it('includes isRemote as boolean string', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({
          id: 'j1',
          location: { country: null, state: null, city: '', primary: true, isRemote: true, name: 'Remote' },
        })],
        jobCount: 1,
      }),
    ];
    const csv = toCSV(data);
    expect(csv).toContain('true');
  });

  it('includes salary in CSV', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 'j1', salary: '$80,000 - $120,000 / yr' })],
        jobCount: 1,
      }),
    ];
    const csv = toCSV(data);
    expect(csv).toContain('$80,000 - $120,000 / yr');
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
    expect(table).toContain('Salary');
    expect(table).toContain('Published');
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
            id: 'j1',
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
        jobs: [makeJob({ id: 'j1' })],
        jobCount: 1,
      }),
    ];
    const table = toTable(data);
    expect(table).toContain('1 jobs across 1 companies');
  });

  it('shows multiple companies', () => {
    const data = [
      makeCompanyJobs({ company: 'Alpha', slug: 'alpha', jobs: [makeJob({ id: 'j1' })], jobCount: 1 }),
      makeCompanyJobs({ company: 'Beta', slug: 'beta', jobs: [makeJob({ id: 'j2' })], jobCount: 1 }),
    ];
    const table = toTable(data);
    expect(table).toContain('Alpha');
    expect(table).toContain('Beta');
    expect(table).toContain('2 jobs across 2 companies');
  });

  it('formats publishedDate as date only in table', () => {
    const data = [
      makeCompanyJobs({
        jobs: [makeJob({ id: 'j1', publishedDate: '2026-03-15T14:00:00.000Z' })],
        jobCount: 1,
      }),
    ];
    const table = toTable(data);
    expect(table).toContain('2026-03-15');
    expect(table).not.toContain('T14:00');
  });
});
