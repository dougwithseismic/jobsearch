export const navLinks = [
  { label: "Funnels", href: "#funnels" },
  { label: "Proof", href: "#proof" },
  { label: "Process", href: "#process" },
  { label: "FAQ", href: "#faq" },
];

export const logos = [
  "Contra",
  "MIT",
  "Sky",
  "Groupon",
  "The Motley Fool",
  "Techstars",
];

export const stats = [
  { value: "15+", label: "years shipping production systems" },
  { value: "35k+", label: "Chrome extension users at scale" },
  { value: "$20M+", label: "startup funding helped support" },
  { value: "5.0", label: "ratings across Contra and Clutch" },
];

export const painPoints = [
  {
    title: "Your prototype looks promising but falls apart under real usage",
    text: "I take greenfield products from demo energy to stable, investor-ready software with deployment, instrumentation, and sane architecture.",
  },
  {
    title: "Your team is stuck in repetitive browser workflows",
    text: "I build Chrome extensions, browser automation, and operator tooling that turns manual work into leverage.",
  },
  {
    title: "You need AI without shipping an expensive toy",
    text: "I wire LLMs into real workflows where speed, reliability, and margin matter more than novelty.",
  },
];

export const funnels = [
  {
    id: "build",
    eyebrow: "Best for founders",
    title: "Founding sprint",
    price: "$7,000 / 2 weeks",
    intro: "Ship the first serious version of the product, not a prettier backlog.",
    bullets: [
      "Discovery, scope, and build plan in week one",
      "Core product, integrations, and production deploy in week two",
      "Strong fit for MVPs, fundraise-ready demos, and broken prototypes",
    ],
    ctaLabel: "Book a sprint call",
    ctaHref: "https://cal.com/dougwithseismic/vip",
  },
  {
    id: "extension",
    eyebrow: "Best for marketplaces and ops-heavy teams",
    title: "Browser moat funnel",
    price: "Extension + automation roadmap",
    intro: "Turn daily browser behavior into distribution, data capture, or internal velocity.",
    bullets: [
      "Chrome extension concept and technical architecture",
      "Playwright or browser workflow automation where it makes more sense",
      "Good fit for lead gen, marketplace liquidity, research ops, and account workflows",
    ],
    ctaLabel: "Start an extension brief",
    ctaHref:
      "mailto:doug@withseismic.com?subject=Chrome%20extension%20brief&body=Company%3A%0AWhat%20the%20browser%20workflow%20looks%20like%20today%3A%0AWhat%20would%20make%20this%20worth%20building%3A",
  },
  {
    id: "audit",
    eyebrow: "Best for AI-built apps",
    title: "Security and AI audit",
    price: "$1,500 / 24 hours",
    intro: "Useful when the app shipped fast and now nobody trusts the stack.",
    bullets: [
      "Risk review for auth, secrets, data exposure, and common AI-app shortcuts",
      "Prioritized fixes, not vague security theater",
      "Ideal before launch, fundraising, or enterprise demos",
    ],
    ctaLabel: "Request the audit",
    ctaHref:
      "mailto:doug@withseismic.com?subject=24hr%20security%20audit&body=App%20URL%3A%0AStack%3A%0ABiggest%20concern%3A",
  },
];

export const caseStudies = [
  {
    title: "Contra: distributed opportunity engine",
    image: "/media/contra-profile.png",
    alt: "Doug Silkstone Contra profile screenshot",
    metrics: ["5.7M+ opportunities found", "2x marketplace inventory", "35k+ active nodes"],
    text: "Built the extension model that let user browsing act as the edge network, creating a distribution and data moat instead of a scraping bill.",
  },
  {
    title: "AI-native engineer marketplace",
    image: "/media/contra-ai-marketplace.webp",
    alt: "AI native engineer marketplace project artwork",
    metrics: ["React + TypeScript", "WebGL-heavy experience", "Positioning-led landing page"],
    text: "A concept site designed to sell technical credibility fast, with motion and interface choices aimed at developer buyers instead of generic SaaS gloss.",
  },
  {
    title: "Ctx.eng / Awwwards honorable mention",
    image: "/media/contra-ctxeng.webp",
    alt: "Ctx.eng case study artwork",
    metrics: ["8-week course launch", "Honorable Mention", "Narrative-driven product design"],
    text: "A learning product with a stronger visual system than most funded startups manage, built to communicate complex technical material without flattening it.",
  },
  {
    title: "Local Supabase instance manager",
    image: "/media/contra-supabase-manager.webp",
    alt: "Local Supabase manager artwork",
    metrics: ["React + Rust", "Desktop tooling", "Operator-first UX"],
    text: "A sharper example of product taste for developers: remove the friction, make the state obvious, and keep the workflow moving.",
  },
];

export const testimonials = [
  {
    quote:
      "Doug was incredible to work with and a great communicator. He operated quickly and efficiently, was open to pivots throughout, and proposed ways to improve the feature to exceed our expectations.",
    name: "Allison Nulty",
    role: "Head of Product, Contra",
  },
  {
    quote:
      "Doug made something highly complex appear simple. He anticipated scaling needs, built in safeguards, and delivered a tool that solved our immediate challenges and set us up for long-term success.",
    name: "Nico Marino",
    role: "Co-Founder, StellarGrowth",
  },
  {
    quote:
      "They're smart, fast, and trustworthy. The beta shipped, the product launched, and we could start go-to-market instead of sitting on a broken prototype.",
    name: "Shelby Stephens",
    role: "Founder, Snacker.ai",
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Find the leverage point",
    text: "We cut past generic discovery and identify the bottleneck that affects revenue, launch speed, or operational drag.",
  },
  {
    step: "02",
    title: "Ship the core path fast",
    text: "The priority is a working system in production with the right instrumentation, not a pile of mockups and Jira residue.",
  },
  {
    step: "03",
    title: "Leave the team stronger",
    text: "You get code, deployment context, and a next-step roadmap that your team can actually use after the sprint.",
  },
];

export const faqs = [
  {
    question: "Can we start small?",
    answer:
      "Yes. The fastest starting points are the 24-hour audit, a scoped sprint, or a browser automation brief.",
  },
  {
    question: "Do you only work on AI products?",
    answer:
      "No. AI is one capability. The real offer is product-minded engineering for startups that need leverage, speed, and technical judgment.",
  },
  {
    question: "What kinds of teams are the best fit?",
    answer:
      "Funded startups, technical founders, marketplace teams, and agencies building something ambitious under real commercial pressure.",
  },
  {
    question: "Do you stay involved after launch?",
    answer:
      "If useful. Some teams take full ownership immediately. Others keep a retained senior operator around for the next stage.",
  },
];
