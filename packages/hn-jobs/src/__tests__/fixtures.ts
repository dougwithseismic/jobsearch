import type { HNJob } from "../types.js";

export function makeJob(overrides?: Partial<HNJob>): HNJob {
  return {
    hnId: 12345678,
    rawHtml: "<p>Acme Corp | Senior Engineer | Remote</p>",
    rawText: "Acme Corp | Senior Engineer | Remote",
    company: "Acme Corp",
    title: "Senior Engineer",
    location: "Remote",
    isRemote: true,
    isOnsite: false,
    isHybrid: false,
    salary: "",
    url: "https://acme.com/careers",
    applyUrl: "https://acme.com/careers",
    technologies: ["typescript", "react", "node.js"],
    description: "We are looking for a senior engineer to join our team.",
    postedAt: "2026-03-01T00:00:00.000Z",
    threadMonth: "March 2026",
    threadUrl: "https://news.ycombinator.com/item?id=99999999",
    commentUrl: "https://news.ycombinator.com/item?id=12345678",
    ...overrides,
  };
}

/** Remote EU job with salary and full tech stack */
export const remoteEuJob = makeJob({
  hnId: 40000001,
  company: "Lightstream GmbH",
  title: "Full Stack Engineer",
  location: "Remote (EU only)",
  isRemote: true,
  isOnsite: false,
  isHybrid: false,
  salary: "$120k-$160k",
  url: "https://lightstream.io/careers",
  applyUrl: "https://lightstream.io/careers/apply",
  technologies: ["typescript", "react", "next.js", "postgresql", "aws", "docker", "kubernetes"],
  description:
    "Lightstream GmbH | Full Stack Engineer | Remote (EU only) | $120k-$160k\n\n" +
    "We build real-time video tools for creators. Stack: TypeScript, React, Next.js, " +
    "PostgreSQL, AWS, Docker, Kubernetes.\n\nBenefits: 30 days PTO, home office budget.",
  postedAt: "2026-03-01T10:00:00.000Z",
  threadMonth: "March 2026",
});

/** US onsite-only job */
export const usOnsiteJob = makeJob({
  hnId: 40000002,
  company: "Datacore Systems",
  title: "Backend Engineer",
  location: "San Francisco, CA",
  isRemote: false,
  isOnsite: true,
  isHybrid: false,
  salary: "$180k-$220k",
  url: "https://datacore.io/jobs",
  applyUrl: "https://datacore.io/jobs/backend",
  technologies: ["go", "postgresql", "kubernetes", "grpc", "aws"],
  description:
    "Datacore Systems | Backend Engineer | San Francisco, CA | Onsite | $180k-$220k\n\n" +
    "Building next-gen data pipelines. Go, PostgreSQL, Kubernetes, gRPC.\n\n" +
    "Must be willing to work from our SF office 5 days/week.",
  postedAt: "2026-03-01T11:00:00.000Z",
  threadMonth: "March 2026",
});

/** Founding engineer posting with YC tag */
export const foundingEngineerJob = makeJob({
  hnId: 40000003,
  company: "Wavelet (YC W26)",
  title: "Founding Engineer",
  location: "Remote (US)",
  isRemote: true,
  isOnsite: false,
  isHybrid: false,
  salary: "$140k-$180k + 1-2% equity",
  url: "https://wavelet.ai",
  applyUrl: "https://wavelet.ai/careers",
  technologies: ["python", "typescript", "react", "openai", "postgresql"],
  description:
    "Wavelet (YC W26) | Founding Engineer | Remote (US) | $140k-$180k + 1-2% equity\n\n" +
    "We're building AI-powered audio tools. Looking for a founding engineer who can " +
    "own the full stack. Python, TypeScript, React, OpenAI APIs, PostgreSQL.\n\n" +
    "Small team (3 people), huge ambition. YC W26 batch.",
  postedAt: "2026-03-01T12:00:00.000Z",
  threadMonth: "March 2026",
});

/** Minimal/poorly formatted posting */
export const minimalJob = makeJob({
  hnId: 40000004,
  company: "NovaTech",
  title: "",
  location: "",
  isRemote: false,
  isOnsite: false,
  isHybrid: false,
  salary: "",
  url: "",
  applyUrl: "",
  technologies: ["python"],
  description:
    "NovaTech - we're hiring python developers. Email jobs@novatech.io if interested.",
  postedAt: "2026-03-02T08:00:00.000Z",
  threadMonth: "March 2026",
});

/** Hybrid job in London */
export const londonHybridJob = makeJob({
  hnId: 40000005,
  company: "Meridian Labs",
  title: "Senior Frontend Developer",
  location: "London, UK (Hybrid)",
  isRemote: false,
  isOnsite: false,
  isHybrid: true,
  salary: "£80k-£110k",
  url: "https://meridianlabs.co.uk/careers",
  applyUrl: "https://meridianlabs.co.uk/careers/frontend",
  technologies: ["typescript", "react", "next.js", "tailwind", "graphql"],
  description:
    "Meridian Labs | Senior Frontend Developer | London, UK (Hybrid) | £80k-£110k\n\n" +
    "Building design tools for architects. TypeScript, React, Next.js, Tailwind, GraphQL.\n\n" +
    "2 days/week in our Shoreditch office, rest remote. Visa sponsorship available.",
  postedAt: "2026-03-02T09:00:00.000Z",
  threadMonth: "March 2026",
});

/** All sample jobs for convenience */
export const allJobs: HNJob[] = [
  remoteEuJob,
  usOnsiteJob,
  foundingEngineerJob,
  minimalJob,
  londonHybridJob,
];
