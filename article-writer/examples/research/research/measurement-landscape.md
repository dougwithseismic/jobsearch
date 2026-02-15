# Research Notes: How We Got the Metrics Wrong

## SPACE Framework
- Created by Nicole Forsgren, Margaret-Anne Storey, Chandra Maddila et al. (2021)
- Published in ACM Queue
- Five dimensions: Satisfaction & well-being, Performance, Activity, Communication & collaboration, Efficiency & flow
- Core insight: productivity cannot be measured by single metric or dimension
- Still being refined and applied to LLM evaluation challenges
- [Source: ACM Queue, Microsoft Research]

## DORA Metrics
- Four key indicators: deployment frequency, lead time for changes, change failure rate, MTTR
- Fifth metric (reliability) added recently
- **AI Paradox**: Individual output up (21% more tasks, 98% more PRs merged) but organizational delivery flat
- AI adoption correlated with 1.5% decrease in delivery throughput, 7.2% decrease in delivery stability
- Elite performers used AI chatbots more for incident response (50% vs 42%)
- [Source: DORA 2024 Report, Faros AI analysis]

## Vendor vs Academic Measurement

### Vendor approach:
- Time-to-completion on isolated tasks
- Lines of code generated
- Acceptance rates
- Self-reported satisfaction

### Academic approach:
- Controlled experiments with real-world tasks
- Full lifecycle measurement
- Code quality metrics (churn, defect rates)
- Longitudinal impact tracking

## Task Shifting Evidence
- Bottlenecks shift from code writing to code review and testing
- Marginal cost of producing code decreased, but downstream costs increased
- Cursor adoption study (806 repos): substantial but transient velocity gains, persistent technical debt increases
- Self-reinforcing cycle: productivity surges give way to maintenance burdens
- [Source: arXiv 2511.04427]

## Booking.com Case Study
- Deployed AI to 3,500 engineers
- Partnered with DX for measurement
- Daily AI users had 16% higher code throughput
- AI users saving time on routine tasks, redirecting to higher-value work
- Developer satisfaction with AI tooling rose 15 points in 6 months
- [Source: getdx.com/customers/booking]

## Google Internal Measurement
- RCT June-July 2024 with full-time engineers (1+ year tenure)
- Best estimate: 21% faster on task (large confidence interval)
- Newer developers: 35-39% speedup
- Experienced developers: 8-16% improvement
- [Source: arXiv 2410.12944]

## Key Insight
- Improving development process does not automatically improve software delivery
- Requires proper adherence to basics: small batch sizes, robust testing
- Atlassian 2025: developers saving 10 hrs/week with AI, losing 10 hrs/week to organizational inefficiencies
