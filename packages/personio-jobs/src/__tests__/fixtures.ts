import type { PersonioJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<PersonioJob>): PersonioJob {
  return {
    id: 12345,
    name: 'Senior Software Engineer',
    department: 'Engineering',
    office: 'Berlin',
    recruitingCategory: 'Full-time',
    employmentType: 'permanent',
    seniority: 'Senior',
    schedule: 'full-time',
    yearsOfExperience: '5+',
    keywords: 'typescript, react, node.js',
    occupation: 'Engineering',
    occupationCategory: 'Software Development',
    createdAt: '2026-01-15T10:30:00+01:00',
    jobDescriptions: [
      { name: 'About the role', value: '<p>Job description here</p>' },
    ],
    ...overrides,
  };
}

export function makeCompanyJobs(overrides?: Partial<CompanyJobs>): CompanyJobs {
  return {
    company: 'TestCo',
    slug: 'testco',
    jobCount: 2,
    jobs: [
      makeJob({
        id: 12345,
        name: 'Senior Software Engineer',
        department: 'Engineering',
        office: 'Berlin',
        seniority: 'Senior',
      }),
      makeJob({
        id: 12346,
        name: 'Product Manager',
        department: 'Product',
        office: 'San Francisco',
        seniority: 'Mid',
      }),
    ],
    scrapedAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Mock XML for a single position */
export function makePositionXml(overrides?: Record<string, string>): string {
  const defaults: Record<string, string> = {
    id: '12345',
    name: 'Senior Software Engineer',
    department: 'Engineering',
    office: 'Berlin',
    recruitingCategory: 'Full-time',
    employmentType: 'permanent',
    seniority: 'Senior',
    schedule: 'full-time',
    yearsOfExperience: '5+',
    keywords: 'typescript, react, node.js',
    occupation: 'Engineering',
    occupationCategory: 'Software Development',
    createdAt: '2026-01-15T10:30:00+01:00',
  };
  const vals = { ...defaults, ...overrides };

  return `<position>
    <id>${vals.id}</id>
    <name>${vals.name}</name>
    <department>${vals.department}</department>
    <office>${vals.office}</office>
    <recruitingCategory>${vals.recruitingCategory}</recruitingCategory>
    <employmentType>${vals.employmentType}</employmentType>
    <seniority>${vals.seniority}</seniority>
    <schedule>${vals.schedule}</schedule>
    <yearsOfExperience>${vals.yearsOfExperience}</yearsOfExperience>
    <keywords>${vals.keywords}</keywords>
    <occupation>${vals.occupation}</occupation>
    <occupationCategory>${vals.occupationCategory}</occupationCategory>
    <createdAt>${vals.createdAt}</createdAt>
    <jobDescriptions>
      <jobDescription>
        <name>About the role</name>
        <value><![CDATA[<p>Job description here</p>]]></value>
      </jobDescription>
    </jobDescriptions>
  </position>`;
}

/** Make a complete XML feed with multiple positions */
export function makeXmlFeed(positions: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<workzag-jobs>
  ${positions.join('\n  ')}
</workzag-jobs>`;
}

/** Simple single-position XML feed */
export const SINGLE_JOB_XML = makeXmlFeed([makePositionXml()]);

/** Two-position XML feed */
export const TWO_JOBS_XML = makeXmlFeed([
  makePositionXml({ id: '12345', name: 'Senior Software Engineer' }),
  makePositionXml({ id: '12346', name: 'Product Manager', department: 'Product', office: 'San Francisco', seniority: 'Mid' }),
]);

/** XML with CDATA in job descriptions */
export const CDATA_XML = makeXmlFeed([
  `<position>
    <id>99999</id>
    <name>Frontend Developer</name>
    <department>Engineering</department>
    <office>Remote</office>
    <recruitingCategory>Full-time</recruitingCategory>
    <employmentType>permanent</employmentType>
    <seniority>Junior</seniority>
    <schedule>full-time</schedule>
    <yearsOfExperience>2+</yearsOfExperience>
    <keywords>react, css</keywords>
    <occupation>Engineering</occupation>
    <occupationCategory>Frontend</occupationCategory>
    <createdAt>2026-02-01T08:00:00+01:00</createdAt>
    <jobDescriptions>
      <jobDescription>
        <name>What you'll do</name>
        <value><![CDATA[<h2>Responsibilities</h2><ul><li>Build React components</li><li>Write CSS</li></ul>]]></value>
      </jobDescription>
      <jobDescription>
        <name>Requirements</name>
        <value><![CDATA[<p>2+ years of experience with React and TypeScript</p>]]></value>
      </jobDescription>
    </jobDescriptions>
  </position>`,
]);

/** Empty feed */
export const EMPTY_XML = `<?xml version="1.0" encoding="UTF-8"?>
<workzag-jobs>
</workzag-jobs>`;

/** XML with empty fields */
export const EMPTY_FIELDS_XML = makeXmlFeed([
  `<position>
    <id>11111</id>
    <name>Mystery Role</name>
    <department></department>
    <office></office>
    <recruitingCategory></recruitingCategory>
    <employmentType></employmentType>
    <seniority></seniority>
    <schedule></schedule>
    <yearsOfExperience></yearsOfExperience>
    <keywords></keywords>
    <occupation></occupation>
    <occupationCategory></occupationCategory>
    <createdAt></createdAt>
    <jobDescriptions></jobDescriptions>
  </position>`,
]);

/** XML with no CDATA (plain text descriptions) */
export const PLAIN_DESC_XML = makeXmlFeed([
  `<position>
    <id>22222</id>
    <name>Data Analyst</name>
    <department>Data</department>
    <office>Munich</office>
    <recruitingCategory>Full-time</recruitingCategory>
    <employmentType>permanent</employmentType>
    <seniority>Mid</seniority>
    <schedule>full-time</schedule>
    <yearsOfExperience>3+</yearsOfExperience>
    <keywords>sql, python</keywords>
    <occupation>Data</occupation>
    <occupationCategory>Analytics</occupationCategory>
    <createdAt>2026-01-20T09:00:00+01:00</createdAt>
    <jobDescriptions>
      <jobDescription>
        <name>Description</name>
        <value>Analyze data and build dashboards</value>
      </jobDescription>
    </jobDescriptions>
  </position>`,
]);

/** Malformed XML (missing closing tags) */
export const MALFORMED_XML = `<?xml version="1.0" encoding="UTF-8"?>
<workzag-jobs>
  <position>
    <id>broken</id>
    <name>This won't parse
  </position>
  <position>
    <id>33333</id>
    <name>Valid Job After Broken</name>
    <department>Engineering</department>
    <office>London</office>
    <recruitingCategory>Full-time</recruitingCategory>
    <employmentType>permanent</employmentType>
    <seniority>Senior</seniority>
    <schedule>full-time</schedule>
    <yearsOfExperience>5+</yearsOfExperience>
    <keywords>java</keywords>
    <occupation>Engineering</occupation>
    <occupationCategory>Backend</occupationCategory>
    <createdAt>2026-03-01T00:00:00+01:00</createdAt>
    <jobDescriptions></jobDescriptions>
  </position>
</workzag-jobs>`;
