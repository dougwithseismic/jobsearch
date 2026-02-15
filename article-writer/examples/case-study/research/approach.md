# Research: Speed as a Feature and Other Bets

## Technical Architecture - The Sync Engine
- Local-first architecture: data synced to device, UI updates before server responds
- Enables offline functionality and optimistic updates that feel instant
- Tech stack: React, MobX, TypeScript, Node.js with PostgreSQL + "home-made sync magic"
- Tuomas Artman had built sync engines for over a decade before Linear
- Artman gave talks at Local First Conf about the sync engine
- New features can be developed without modifying server-side code
- Reverse-engineered and documented by community, endorsed by Tuomas

## Keyboard-First Design
- Cmd+K global command menu
- / for instant view filtering
- E for assigning or moving issues
- Every action accessible via keyboard shortcuts
- Designed for developers who live in terminals and code editors

## Opinionated Workflow (The Linear Method)
- Instead of infinite configurability, Linear provides strong defaults
- Issues move from Triage -> Backlog -> In Progress by default
- 2-week cycles as the standard unit of work
- Three abstractions: Roadmaps, Projects, Cycles
- Unfinished items auto-move to next cycle
- Designers and engineers work together on projects
- "You can't build the optimal tool for anything if it's very flexible" - Karri

## Product-Led Growth Strategy
- No outbound sales initially - product sells itself
- Bottom-up adoption: individual engineers adopt, then spread within teams
- Network effects: every new user makes the product better for others
- Building in public on Twitter as live changelog
- Invite-only beta for almost a year, inviting 10-20 users at a time
- "Go slow to go fast" philosophy

## Pricing Strategy
- Free tier with unlimited members (strategic departure from competitors)
- Teams as primary value metric, not per-seat
- Clear upgrade triggers based on feature needs
- Free tier creates stickiness early

## Design Philosophy
- Craft and quality as differentiators
- "Design something for someone, not for everyone" - Karri
- Taste and opinions over AB tests and metrics
- Active user engagement and behavior observation
