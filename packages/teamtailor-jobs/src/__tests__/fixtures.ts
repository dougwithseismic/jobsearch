import type { TeamtailorJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<TeamtailorJob>): TeamtailorJob {
  return {
    title: 'Senior Software Engineer',
    description: '<p>We are looking for...</p>',
    pubDate: 'Mon, 01 Mar 2026 00:00:00 +0000',
    link: 'https://testco.teamtailor.com/jobs/1001-senior-software-engineer',
    guid: 'https://testco.teamtailor.com/jobs/1001-senior-software-engineer',
    remoteStatus: 'fully',
    locations: [
      { name: 'Berlin Office', city: 'Berlin', country: 'Germany' },
    ],
    department: 'Engineering',
    role: 'Software Development',
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
        title: 'Senior Software Engineer',
        department: 'Engineering',
        locations: [{ name: 'Berlin Office', city: 'Berlin', country: 'Germany' }],
      }),
      makeJob({
        title: 'Product Manager',
        department: 'Product',
        locations: [{ name: 'SF Office', city: 'San Francisco', country: 'US' }],
        link: 'https://testco.teamtailor.com/jobs/1002-product-manager',
        guid: 'https://testco.teamtailor.com/jobs/1002-product-manager',
      }),
    ],
    scrapedAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Generate an RSS XML string for testing */
export function makeRssXml(items: Partial<TeamtailorJob>[] = [makeJob()]): string {
  const itemsXml = items.map((item) => {
    const job = { ...makeJob(), ...item };
    const locationsXml = job.locations.map((loc) => `
        <tt:location>
          <tt:name>${loc.name ?? ''}</tt:name>
          <tt:city>${loc.city ?? ''}</tt:city>
          <tt:country>${loc.country ?? ''}</tt:country>
        </tt:location>`).join('');

    return `
    <item>
      <title><![CDATA[${job.title}]]></title>
      <description><![CDATA[${job.description}]]></description>
      <pubDate>${job.pubDate}</pubDate>
      <link>${job.link}</link>
      <guid>${job.guid}</guid>
      ${job.remoteStatus ? `<remoteStatus>${job.remoteStatus}</remoteStatus>` : ''}
      <tt:locations>${locationsXml}
      </tt:locations>
      ${job.department ? `<tt:department>${job.department}</tt:department>` : ''}
      ${job.role ? `<tt:role>${job.role}</tt:role>` : ''}
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:tt="https://teamtailor.com">
  <channel>
    <title>TestCo Jobs</title>
    <link>https://testco.teamtailor.com</link>
    <description>Jobs at TestCo</description>
    ${itemsXml}
  </channel>
</rss>`;
}
