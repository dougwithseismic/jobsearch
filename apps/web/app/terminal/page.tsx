"use client";

import { useState, useEffect } from "react";
import "./terminal.css";

const COVER_LETTER = [
  { type: "opener", text: "Hey," },
  {
    type: "p",
    text: "For most of the job specs I read, they all want roughly the same person. Someone who can pick up tickets, ship deliverables, join standup, sit through retro, stay proactive on Slack, and do that loop reliably for years.",
  },
  {
    type: "p",
    text: "If that's who you're hiring for, I know you'll find them. There is no shortage of good engineers who can do the basics well.",
  },
  { type: "p", text: "That isn't me anymore." },
  {
    type: "p",
    text: "I'm interested in the part of the job that starts after that. The messy part. The bit where the brief is incomplete, the tradeoffs are not obvious, and somebody has to think beyond their lane about product, revenue, conversion, risk, and speed.",
  },
  {
    type: "p",
    text: "Do me a favour. Name the people in your organisation who already do that for you. The ones you can pull into Slack and ask what UCP means, why agentic commerce matters, or how AI-driven commerce changes the shape of your funnel, and get a clear answer instead of hand-waving. If you have people like that, you already know how valuable they are. If you don't, you probably know where the gap is.",
  },
  {
    type: "p",
    text: "At first glance, those can look like separate disciplines. On an org chart, they usually are. But that split is exactly where teams lose time and clarity. You do not need every engineer to be a marketer, or every marketer to write code. You do need people who can see both sides well enough to connect user behaviour, commercial reality, and implementation detail. Otherwise the handoff becomes the bottleneck.",
  },
  {
    type: "p",
    text: "That's where I fit. I came into engineering through growth and technical marketing before moving fully into product engineering, so I naturally think about acquisition, conversion, revenue, architecture, and delivery as one system. I don't need the roadmap to be perfect before I can be useful. I can help define the problem, pressure-test priorities, make the tradeoffs, and then build the thing properly.",
  },
  {
    type: "p",
    text: "Over the last decade I've built and sold three products and run a consultancy that has delivered 100+ projects for companies including Contra, Framer, Sky, The Motley Fool, and MIT. I managed more than $10M in ad spend and worked across systems that saw over a billion product sessions. I built Contra's Chrome extension that turned 35,000 users into a distributed opportunity-finding network and helped double marketplace inventory. I contributed to MIT's Generative AI course, which reached 50,000+ students, and worked with startups that later raised more than $20M.",
  },
  {
    type: "p",
    text: "There is probably an elephant in the room here as well. A lot of teams are still resisting the shift that is already happening. If your instinct is to defend old process and treat AI as a distraction rather than a capability shift, we're probably not a fit. I've spent most of my career moving toward useful change, helping teams adapt to it, and raising the level of the people around me as we go.",
  },
  {
    type: "cta",
    text: "So this letter is really here to make that distinction early. If you need someone to stay inside a narrow lane, I'm probably not your best option. If you need someone who can think like an owner, move with the shift, and turn ambiguity into shipped outcomes, that's the work I'm looking for, and I suspect it's the work you're really hiring for.",
  },
  { type: "sign-off", text: "Doug" },
];

const SKILLS = [
  { label: "Languages", value: "TypeScript, Python, C++, Go" },
  { label: "AI / ML", value: "LLM agents, Mastra, MCP servers, RAG, RL (PPO)" },
  { label: "Frontend", value: "React (8yr), Next.js, TanStack, Tailwind, Svelte" },
  { label: "Testing", value: "Vitest, Jest, RTL, Playwright, Cypress" },
  { label: "Backend", value: "Node, Hono, Express, NestJS, FastAPI, Drizzle" },
  { label: "Observability", value: "Sentry, Prometheus, Grafana" },
  { label: "Infra", value: "AWS, GCP, K8s, Docker, Terraform, Postgres, Redis" },
  { label: "Specialisms", value: "Chrome MV3, Playwright, Puppeteer, Stripe, Shopify" },
];

const EXPERIENCE = [
  {
    role: "Founder & Lead Engineer",
    company: "WithSeismic",
    period: "2016 – Present",
    tech: "TypeScript · React · Next.js · Node · Python · C++ · AWS · GCP · Postgres",
    summary:
      "Longstanding engineering consultancy — over 100 projects delivered in the last 10 years. Led teams of hired engineers and designers across client engagements, with active management of delivery, architecture, and mentorship.",
    highlights: [
      "Built Contra's Indy.ai Chrome Extension: turned 35,000+ users into a distributed opportunity-finding network using LLM workflows to identify hiring signals; 2x increase in marketplace inventory. #1 Product Hunt Product of the Week",
      "Component library development (MUI + Storybook) and monorepo management (Yarn workspaces, Turborepo)",
      "Built custom Chrome extension for prospect data collection with proxy rotation, rate limiting, and CRM integration",
      "Won Performance Marketing Award 2016 (NOW TV, cross-channel) and 2017 (TOPMAN, NLP chatbots on Messenger)",
      "Motley Fool PPC automation managing multi-million-dollar budget. Growth Society benchmarking across UK's top 200 brands",
      "Clients include Contra, Sky, Framer, The Motley Fool, STRV, MIT, and Techstars-backed startups",
    ],
  },
  {
    role: "Technical Founder",
    company: "DinnersWithFriends.co.uk",
    period: "Nov 2024 – Present",
    tech: "TypeScript · React · Next.js · Hono · Postgres · GCP",
    highlights: [
      "Designed, developed, and own all aspects of digital for a platform matching people for no-expectation evenings of good conversation. 20+ events in 2025, 250+ guests",
      "Implemented complex merchant-of-record setup using Stripe Connect to support franchise model and growth",
      "Heavily SEO-optimised with product/market analytics, email automation, messaging queues, revenue dashboards, and LLM-powered workflows in the admin panel",
    ],
  },
  {
    role: "Founder & Lead Engineer",
    company: "getBenson.com",
    period: "Mar 2020 – Jan 2023",
    tech: "TypeScript · React · Next.js · Node · Express · GraphQL · Postgres",
    highlights: [
      "Solo-founded SaaS that detected and blocked web extensions from leaking discount codes. Protected 25M monthly sessions across 500+ stores",
      "GraphQL API serving real-time analytics dashboards (Recharts); onboarded 80+ e-commerce brands through C-suite technical sales",
      "Rewrote MVP to production-grade with strict TypeScript and RTL coverage. Commercially exited 2023",
    ],
  },
  {
    role: "Founder & Lead Engineer",
    company: "Vouchernaut.com",
    period: "Jan 2016 – Nov 2022",
    tech: "TypeScript · Next.js · Node · Puppeteer · Postgres",
    highlights: [
      "Founded UK's fastest voucher platform: 250k sessions/month, 100,000+ brands automated, 90% profit margins",
      "Scaled to $100k ARR. Sold to PE investors 2021",
    ],
  },
  {
    role: "Lead Growth Engineer",
    company: "Patrianna Ltd",
    period: "Nov 2022 – Jul 2023",
    tech: "TypeScript · React · Next.js · Redux · Postgres",
    highlights: [
      "Led greenfield in-house Game Studio for top-three social casino — zero to 1M players",
      "Architected and shipped five high-stakes social casino games using React, optimised for millions of concurrent players",
      "Hired and led 9-member team across frontend, game development, and QA",
    ],
  },
  {
    role: "Head of Digital",
    company: "Reach Robotics",
    period: "Nov 2016 – May 2018",
    tech: "",
    highlights: [
      "Go-to-market for AR robot launched in Apple Stores globally. Built e-commerce platform and full martech stack. Hired and led cross-functional team",
      "Won Performance Marketing Award for Most Creative Performance Campaign",
    ],
  },
  {
    role: "Performance Marketing & Automation",
    company: "Vouchercloud (now Groupon)",
    period: "Nov 2014 – Nov 2016",
    tech: "",
    highlights: [
      "Managed multi-million-pound paid search across 15 international sites. Built React tools saving 240 hrs/month, cutting SEM team overhead by 40%",
      "Company acquired by NASDAQ-listed Groupon",
    ],
  },
];

const OSS = [
  { name: "TanStack", tag: "112k+ stars", desc: "Contributor — Query, Router, Start" },
  { name: "Mastra AI", tag: "19k stars", desc: "Contributor — TypeScript AI agent framework" },
  { name: "S2 Framework", tag: "C++ / Python", desc: "Self-learning AI for Counter-Strike — RL (PPO), 50K-param transformer" },
  { name: "Promptheus", tag: "Exited '24", desc: "Voice-to-ChatGPT Chrome extension. 30k+ users. Sold Jan 2024" },
  { name: "chrome-ext-template", tag: "73 stars", desc: "Zero-config React + Tailwind Chrome Extension starter" },
  { name: "YouTube", tag: "@dougsilkstone", desc: "Teaching operator engineering and agentic workflows" },
];

const AWARDS = [
  "Performance Marketing Award 2016 — Most Effective Cross-Channel Campaign (NOW TV)",
  "Performance Marketing Award 2017 — Most Creative Campaign (TOPMAN)",
  "#1 Product Hunt Product of the Week — Indy.ai Chrome extension for Contra",
  "Awwwards Honorable Mention — ctxdc.com, Conway's Game of Life interface",
  "MIT Generative AI & LLM course — subject contributor, 50,000+ students",
  "Top 1% Contra freelancer — 5.0/5.0 rating",
];

const TESTIMONIALS = [
  {
    text: "They're smart, fast, and trustworthy! Took our broken prototype to a revenue-generating platform.",
    attr: "Shelby Stevens, Founder — Snacker.ai",
  },
  {
    text: "Doug was incredible to work with. He operated quickly & efficiently, and even proposed ways to improve the feature to exceed our expectations. 10/10!",
    attr: "Allison Nulty, Head of Product — Contra",
  },
  {
    text: "Doug is a pro. I'd hire him again for any future marketing & technology initiatives.",
    attr: "Brian Tighe, Head Of Technology — The Motley Fool",
  },
];

function CVView() {
  return (
    <div className="term-cv">
      <div className="term-section">
        <p className="term-about">
          Full-stack engineer with 10 years building and shipping production
          products. Most of my hands-on work is TypeScript and React, with more
          recent work in Python, C++, and LLM tooling. I've founded and sold
          three products and spent the last decade running WithSeismic,
          delivering product and engineering work for companies including Contra,
          Sky, The Motley Fool, and MIT.
        </p>
      </div>

      <div className="term-section">
        <h2 className="term-label">skills</h2>
        <div className="term-skills">
          {SKILLS.map((s) => (
            <div key={s.label} className="term-skill-row">
              <span className="term-skill-key">{s.label}</span>
              <span className="term-skill-val">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="term-section">
        <h2 className="term-label">experience</h2>
        <div className="term-jobs">
          {EXPERIENCE.map((job, i) => (
            <div key={i} className="term-job">
              <div className="term-job-top">
                <span className="term-job-role">{job.role}</span>
                <span className="term-job-dot" aria-hidden="true" />
                <span className="term-job-period">{job.period}</span>
              </div>
              <div className="term-job-co">{job.company}</div>
              {job.tech && (
                <div className="term-job-tech">{job.tech}</div>
              )}
              {job.summary && (
                <p className="term-job-summary">{job.summary}</p>
              )}
              <ul className="term-job-hl">
                {job.highlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="term-section">
        <h2 className="term-label">open source & projects</h2>
        <div className="term-oss">
          {OSS.map((p) => (
            <div key={p.name} className="term-oss-item">
              <span className="term-oss-name">{p.name}</span>
              <span className="term-oss-tag">{p.tag}</span>
              <span className="term-oss-desc">{p.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="term-section">
        <h2 className="term-label">awards</h2>
        <ul className="term-awards">
          {AWARDS.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="term-section">
        <h2 className="term-label">references</h2>
        <div className="term-refs">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="term-ref">
              <p className="term-ref-text">&quot;{t.text}&quot;</p>
              <p className="term-ref-attr">{t.attr}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="term-section">
        <h2 className="term-label">clients</h2>
        <p className="term-dim">
          Contra · Framer (Official Partner) · The Motley Fool · Groupon · Sky ·
          MIT · Techstars-backed startups
        </p>
      </div>
    </div>
  );
}

function CoverLetterView() {
  return (
    <div className="term-letter">
      {COVER_LETTER.map((para, i) => (
        <p key={i} className={`term-lp term-lp-${para.type}`}>
          {para.text}
        </p>
      ))}
    </div>
  );
}

export default function TerminalPage() {
  const [tab, setTab] = useState<"cv" | "letter">("cv");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "1") setTab("cv");
      if (e.key === "2") setTab("letter");
      if (e.key === "p" || e.key === "P") window.print();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="term">
      <div className="term-scan" aria-hidden="true" />

      <div className="term-wrap">
        <header className="term-head">
          <h1 className="term-name">Doug Silkstone</h1>
          <p className="term-title">
            Lead Full-Stack Engineer · 10 years · 3 exits
          </p>
          <p className="term-info">Prague, CZ · Remote / Hybrid</p>
          <div className="term-links">
            <a href="mailto:doug@withseismic.com">doug@withseismic.com</a>
            <a
              href="https://github.com/dougwithseismic"
              target="_blank"
              rel="noopener"
            >
              github
            </a>
            <a
              href="https://linkedin.com/in/dougsilkstone"
              target="_blank"
              rel="noopener"
            >
              linkedin
            </a>
            <a
              href="https://contra.com/doug_silkstone/work"
              target="_blank"
              rel="noopener"
            >
              portfolio
            </a>
            <a
              href="https://withseismic.com"
              target="_blank"
              rel="noopener"
            >
              withseismic.com
            </a>
          </div>
        </header>

        <nav className="term-nav no-print">
          <button
            className={`term-tab ${tab === "cv" ? "on" : ""}`}
            onClick={() => setTab("cv")}
          >
            cv
          </button>
          <button
            className={`term-tab ${tab === "letter" ? "on" : ""}`}
            onClick={() => setTab("letter")}
          >
            letter
          </button>
          <button className="term-tab" onClick={() => window.print()}>
            print
          </button>
        </nav>

        <main className="term-body">
          {tab === "cv" && <CVView />}
          {tab === "letter" && <CoverLetterView />}
        </main>

        <footer className="term-foot no-print">
          <span>1 cv · 2 letter · p print</span>
        </footer>
      </div>
    </div>
  );
}
