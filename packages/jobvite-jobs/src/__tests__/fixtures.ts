import type { JobviteJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<JobviteJob>): JobviteJob {
  return {
    id: "oJk1abc",
    title: "Senior Software Engineer",
    category: "Engineering",
    jobType: "Full-Time",
    location: "Remote - Europe",
    date: "3/1/2026",
    detailUrl: "https://jobs.jobvite.com/testco/job/oJk1abc",
    applyUrl: "https://jobs.jobvite.com/testco/job/oJk1abc/apply",
    description: "<p>Job description here</p>",
    department: "Engineering",
    remoteType: "Remote",
    ...overrides,
  };
}

export function makeCompanyJobs(overrides?: Partial<CompanyJobs>): CompanyJobs {
  return {
    company: "TestCo",
    slug: "testco",
    companyId: "qAbCdEfG",
    jobCount: 2,
    jobs: [
      makeJob({
        id: "oJk1abc",
        title: "Senior Software Engineer",
        department: "Engineering",
        location: "Remote - Europe",
      }),
      makeJob({
        id: "oJk2def",
        title: "Product Manager",
        department: "Product",
        location: "San Francisco, CA",
      }),
    ],
    scrapedAt: "2026-03-01T00:00:00.000Z",
    ...overrides,
  };
}

export const SAMPLE_CAREERS_HTML = `
<!DOCTYPE html>
<html>
<head><title>TestCo Careers</title></head>
<body>
<script>
function getCompanyId() { return 'qAbCdEfG'; }
</script>
</body>
</html>
`;

export const SAMPLE_CAREERS_HTML_ALT = `
<!DOCTYPE html>
<html>
<body>
<script>
var companyId = 'xYz12345';
</script>
</body>
</html>
`;

export const SAMPLE_XML_FEED = `<?xml version="1.0" encoding="utf-8"?>
<result>
  <job>
    <id>oJk1abc</id>
    <title>Senior Software Engineer</title>
    <category>Engineering</category>
    <jobtype>Full-Time</jobtype>
    <location>Remote - Europe</location>
    <date>3/1/2026</date>
    <detail-url>https://jobs.jobvite.com/testco/job/oJk1abc</detail-url>
    <apply-url>https://jobs.jobvite.com/testco/job/oJk1abc/apply</apply-url>
    <description><![CDATA[<p>We are looking for a Senior Software Engineer.</p>]]></description>
    <department_x002F_division>Engineering</department_x002F_division>
    <remote_x0020_type>Remote</remote_x0020_type>
  </job>
  <job>
    <id>oJk2def</id>
    <title>Product Manager</title>
    <category>Product</category>
    <jobtype>Full-Time</jobtype>
    <location>San Francisco, CA</location>
    <date>2/15/2026</date>
    <detail-url>https://jobs.jobvite.com/testco/job/oJk2def</detail-url>
    <apply-url>https://jobs.jobvite.com/testco/job/oJk2def/apply</apply-url>
    <description><![CDATA[<p>We need a PM to lead our team.</p>]]></description>
    <department_x002F_division>Product</department_x002F_division>
    <remote_x0020_type>No Remote</remote_x0020_type>
  </job>
  <job>
    <id>oJk3ghi</id>
    <title>Data Analyst</title>
    <category>Data</category>
    <jobtype>Part-Time</jobtype>
    <location>Berlin, Germany</location>
    <date>1/20/2026</date>
    <detail-url>https://jobs.jobvite.com/testco/job/oJk3ghi</detail-url>
    <apply-url>https://jobs.jobvite.com/testco/job/oJk3ghi/apply</apply-url>
    <description>Basic description without CDATA</description>
    <department_x002F_division>Analytics</department_x002F_division>
    <remote_x0020_type>Hybrid</remote_x0020_type>
  </job>
</result>
`;

export const SAMPLE_XML_EMPTY = `<?xml version="1.0" encoding="utf-8"?>
<result>
</result>
`;
