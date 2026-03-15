import type { JazzHRJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<JazzHRJob>): JazzHRJob {
  return {
    id: 'job_20250826203656_MQIVAEYBXFWYQFXJ',
    title: 'Senior Software Engineer',
    location: 'Remote - Europe',
    department: 'Engineering',
    applyUrl: 'https://testco.applytojob.com/apply/abc123/Senior-Software-Engineer',
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
        id: 'job_20250826203656_MQIVAEYBXFWYQFXJ',
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'Remote - Europe',
      }),
      makeJob({
        id: 'job_20250826195109_CMGM9F3IPPU22JVX',
        title: 'Product Manager',
        department: 'Product',
        location: 'San Francisco, CA',
      }),
    ],
    scrapedAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Simulated widget HTML for a single company with 2 jobs */
export function makeWidgetHtml(): string {
  return `
var resumatorScript = document.currentScript;
resumatorScript.insertAdjacentHTML('afterend', \`<div id="resumator-wrapper"></div>\`);
resumatorScript.insertAdjacentHTML('afterend', \`<div id="resumator-jobs"><div id="resumator-job-job_20250826203656_MQIVAEYBXFWYQFXJ" class="resumator-job resumator-jobs-text"><div class="resumator-job-title resumator-jobs-text">Senior Software Engineer</div><div class="resumator-job-info resumator-jobs-text"><span class="resumator-job-location resumator-job-heading resumator-jobs-text">Location: </span>Remote - Europe<span class="resumator-job-department resumator-job-heading resumator-jobs-text">Department: </span>Engineering</div><div class="resumator-job-view-details resumator-jobs-text"><a class="resumator-job-link resumator-jobs-text" target="_blank" href="https://testco.applytojob.com/apply/abc123/Senior-Software-Engineer?source=Widget">+ View details</a></div></div><div id="resumator-job-job_20250826195109_CMGM9F3IPPU22JVX" class="resumator-job resumator-jobs-text"><div class="resumator-job-title resumator-jobs-text">Product Manager</div><div class="resumator-job-info resumator-jobs-text"><span class="resumator-job-location resumator-job-heading resumator-jobs-text">Location: </span>San Francisco, CA<span class="resumator-job-department resumator-job-heading resumator-jobs-text">Department: </span>Product</div><div class="resumator-job-view-details resumator-jobs-text"><a class="resumator-job-link resumator-jobs-text" target="_blank" href="https://testco.applytojob.com/apply/def456/Product-Manager?source=Widget">+ View details</a></div></div></div>\`)
`;
}

/** Widget HTML with no jobs */
export function makeEmptyWidgetHtml(): string {
  return `
var resumatorScript = document.currentScript;
resumatorScript.insertAdjacentHTML('afterend', \`<div id="resumator-wrapper"></div>\`);
resumatorScript.insertAdjacentHTML('afterend', \`<div id="resumator-jobs"><p>No open positions at this time.</p></div>\`)
`;
}
