# Tractive -- Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 1 (Hot)
**Overall Assessment:** One of the best-rated employers in EU tech (Glassdoor 4.8, 92% recommend) with a 4-day work week, actively hiring Senior Full-Stack Developers, and just crossed EUR 100M ARR. The product is genuinely fun (GPS pet trackers), the tech stack includes React, and Linz is 3 hours from Prague. The main concerns are the Java/Kotlin backend (not Doug's primary backend language) and the EUR 65k salary ceiling. Despite that, the quality-of-life package and active hiring make this a strong opportunity.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Senior Full-Stack Developer | Software Development | https://tractive.com/en/jd/senior-full-stack-developer | Active | Not posted | **Moderate-Strong** -- React/Vue frontend fits, but backend is Java/Kotlin + Spring Boot which isn't Doug's primary stack. Mentoring, architecture, getting-things-done mentality all match. |
| Senior Software Engineer (Full-Stack) | Manufacturing/Logistics platforms | https://tractive.com/en/jd/senior-software-engineer-full-stack | Active | EUR 65,000/yr | **Moderate** -- Java/Kotlin + Spring Boot backend, Angular/React/Vue frontend. 7+ years required. Focuses on manufacturing, logistics, RMA platforms. Less product-facing than Doug would prefer. |
| Senior Software Engineer Ruby on Rails | Backend | https://tractive.com/en/jd/senior-software-engineer-ruby-on-rails | Active | Not posted | **Weak** -- Ruby on Rails specialist role. Not Doug's stack. |
| Frontend Developer | Web | https://tractive.com/en/jd/frontend-developer | Active | Not posted | **Moderate** -- Frontend role but likely mid-level. May be below Doug's seniority. |
| Senior Software Developer Java/Kotlin | Backend | https://tractive.com/en/jd/senior-software-developer-java-kotlin | Active | Not posted | **Weak** -- Java/Kotlin specialist. Not Doug's stack. |
| Senior Software Developer in Test | QA/Testing | https://tractive.com/en/jd/senior-software-developer-in-test | Active | Not posted | **Weak** -- Test engineering role. |

**Notes:** Tractive has 17+ open positions across engineering, hardware, data, and business roles. The Senior Full-Stack Developer role is the best match. The explicitly posted salary of EUR 65k for the Full-Stack SE role is below what Doug should target, though the 4-day work week effectively raises the hourly rate. Backend requirement for Java/Kotlin + Spring Boot is a gap.

## Recent Activity (Last 6 Months)

- **2025 (Full Year):** Crossed EUR 100M ARR. Revenue growing 35-40% YoY. Hardware sales bring total revenue significantly higher than ARR alone.
- **Jul 2025:** Acquired Whistle from Mars Petcare -- a major competitive acquisition giving Tractive access to Whistle's US customer base and accelerating global pet tech leadership.
- **Jan 2025 (CES):** Unveiled next-generation dog tracker with health and behavior monitoring (bark monitoring, separation anxiety detection).
- **2025:** Launched resting heart rate and respiratory rate monitoring -- a first in the pet GPS and health tracking category.
- **2025:** CEO Michael Hurnaus stated no plans to seek external funding in the short-to-mid term. Company is self-funding growth from revenue.
- **Ongoing:** 1.3M+ active customers. Product retails at $69.99 with $5/month subscription.
- **No layoffs reported.** Company is profitable and growing. Some Glassdoor reviews mention people being let go, but this appears to be normal turnover rather than restructuring.

## Tech & Engineering

**Stack:** Java, Kotlin, Spring Boot, Ruby on Rails, React, Vue.js, Angular, MongoDB, MySQL, AWS (CloudFront, RDS, Machine Learning), IoT/firmware, GPS/GNSS, embedded systems (C/C++ for hardware)
**Engineering Blog:** None found. Tractive has a product blog but no dedicated engineering/tech blog.
**GitHub Org:** None found publicly.
**Open Source Activity:** None found. Tractive appears to be a closed-source company.
**Culture Signal:** **Moving fast** -- Product-focused company shipping hardware and software iterations rapidly. CES launches, frequent product updates, and acquisitions suggest a shipping culture. However, the 4-day work week and high Glassdoor ratings suggest they've found a balance between speed and sustainability.

Technical details from job postings: The backend is primarily Java/Kotlin with Spring Boot, supplemented by Ruby on Rails services. Frontend uses a mix of React, Vue.js, and Angular (suggesting different products/teams use different frameworks). Databases include both MongoDB and MySQL. AWS is the primary cloud provider. The company also has significant hardware/firmware engineering (embedded systems, GPS/GNSS, IoT).

The lack of an engineering blog and open source presence means less visibility into their engineering practices. This isn't necessarily negative -- many product companies keep their engineering private -- but it means Doug would need to learn more during the interview process.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Michael Hurnaus | CEO & Co-Founder | https://at.linkedin.com/in/michaelhurnaus | EU-Startups Podcast (Jan 2025), press interviews on crossing EUR 100M ARR | Public-facing founder. Ex-Amazon (led Kindle Fire development), ex-Microsoft. Accessible through podcast/press appearances. |
| Dominik Hurnaus | CTO & Co-Founder | N/A | No public content found | CTO overseeing hardware & services. Limited public presence. |
| Michael Tschernuth | Mobile Lead & Co-Founder | N/A | No public content found | Mobile engineering co-founder. |
| Michael Lettner | Director R&D & Co-Founder | N/A | No public content found | R&D leadership. |

**Recommended first contact:** Michael Hurnaus (CEO) -- Unusually, the CEO is the most approachable person at Tractive due to his podcast appearances and press interviews. The founding team (4 co-founders, all technical) has limited public content beyond the CEO. For engineering-specific conversations, try to find the engineering managers or team leads on LinkedIn who may be more accessible than the C-suite co-founders.

**Alternative approach:** Apply directly through the careers page. With 92% positive interview experience and 22-day average process, Tractive appears to have a well-organized hiring pipeline. The direct application route may be more effective here than cold outreach, supplemented by a thoughtful cover letter referencing specific product knowledge.

## Pain Points & Opportunities

### What They Need
- **Scaling web platform after Whistle acquisition:** Integrating Whistle's user base and product features into the Tractive platform is a major engineering challenge.
- **Health monitoring data platform:** Heart rate, respiratory rate, bark monitoring -- these features generate massive amounts of IoT data that needs real-time processing and user-facing dashboards.
- **Subscription growth and retention:** With a subscription model ($5/month), optimizing conversion funnels, reducing churn, and improving the subscriber experience is directly revenue-impacting.
- **Manufacturing/logistics platform modernization:** The Senior SE Full-Stack role focuses on manufacturing and logistics platforms supporting global GPS tracker production. This suggests internal tooling needs.
- **International expansion:** US market expansion (post-Whistle acquisition) and continued EU growth require platform internationalization and localization.

### How Doug Solves It
- **Growth engineering for subscription business:** Doug led growth from 0 to 1M players (subscription gaming) at Patrianna. Built growth/conversion infrastructure at Contra, Groupon, Motley Fool. Subscription optimization is core to his experience.
- **Frontend/dashboard expertise:** Building user-facing health monitoring dashboards, activity tracking interfaces, and pet owner experiences aligns with Doug's React expertise and UX sensibility.
- **Data processing at scale:** Built systems handling 25M monthly sessions (getBenson) and 250k monthly sessions (Vouchernaut). Understands high-throughput data processing.
- **Automation & internal tooling:** The manufacturing/logistics platform role aligns with Doug's automation background. Author of NPM automation packages.
- **Team mentoring:** Job descriptions emphasize mentoring junior developers. Doug has mentored and built teams at Patrianna (9-person team) and Mekamon.

### First 90 Days Sketch
- **Month 1:** Onboard to the frontend codebase (React/Vue). Get familiar with the subscription platform and user-facing features. Ship a frontend improvement or bug fix. Begin learning the Java/Kotlin backend enough to be productive across the stack.
- **Month 2:** Take ownership of a frontend feature -- potentially a health monitoring dashboard improvement or subscription flow optimization. Apply growth engineering principles to identify conversion opportunities.
- **Month 3:** Lead a small initiative combining frontend expertise with growth engineering -- perhaps an A/B testing framework for the subscription funnel, or a new onboarding flow for Whistle migrators. Begin contributing architectural ideas for the post-acquisition platform consolidation.

## Proposed Angles

1. **Subscription Growth Expert** (Business)
   "Congrats on crossing EUR 100M ARR and the Whistle acquisition -- impressive milestones. At Patrianna, I led the growth team that scaled a subscription product from zero to 1M users, and I've optimized conversion funnels at companies like Groupon and The Motley Fool. I'd be interested to discuss how you're thinking about subscriber growth and retention as you integrate the Whistle user base."

2. **IoT Data Dashboard Builder** (Technical)
   "The health monitoring features -- heart rate, respiratory rate, bark monitoring -- represent a fascinating data visualization challenge. I've built real-time dashboards processing data at scale (25M monthly sessions) and have deep React experience. I'd love to explore how the pet health data pipeline works and what the frontend engineering challenges look like for making that data intuitive for pet owners."

3. **Full-Stack with Growth DNA** (Business/Technical)
   "I noticed you're hiring Senior Full-Stack Developers as you scale past EUR 100M. I bring 15 years of full-stack experience with a growth engineering specialty -- I don't just build features, I instrument them and optimize for business outcomes. My background spans React, Node.js, and database-heavy applications, and I've consistently helped companies connect engineering output to revenue growth."

## Notes

- **Salary concern:** EUR 65,000/year is explicitly posted for the Senior SE Full-Stack role. This is below market for Doug's experience level, even accounting for the 4-day work week and Austrian cost of living. Worth negotiating or discussing whether higher compensation is possible for exceptional candidates.
- **Java/Kotlin gap:** Doug's backend experience is Node.js/Express, Python, Hono -- not Java/Kotlin + Spring Boot. This is the biggest technical gap. However, the frontend skills (React/Vue) are a strong match, and many "full-stack" engineers at companies like Tractive end up being frontend-heavy in practice.
- **4-day work week is exceptional:** 35 hours at 100% salary. This is one of the best benefits in EU tech and genuinely rare. For quality of life, this is a huge differentiator.
- **Location:** Linz is 3 hours from Prague by train/car. The role is hybrid (2 days remote). This could work as a commute pattern (2-3 days in Linz per week) but it's not trivial. Worth discussing remote flexibility during interviews.
- **Pet tech = fun product:** Tractive makes a genuinely delightful consumer product. This isn't another B2B SaaS dashboard -- it's a product that pet owners love. Glassdoor reviews consistently mention the product as a positive.
- **Founder-led company:** 4 technical co-founders still active. No external board pressure (self-funding). This means engineering decisions are made by engineers, not investors.
- **Interview process:** 92% positive experience, 22-day average. This is one of the smoothest hiring pipelines found in the research. Low friction to apply.
- **Career growth concern:** Some Glassdoor reviews mention limited career growth potential. At 270+ employees, there may be a ceiling for advancement, especially with 4 co-founders in leadership roles.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
