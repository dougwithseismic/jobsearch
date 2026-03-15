# Freelance Landing Page

Static single-page site for Doug Silkstone's freelance engineering practice. Built with vanilla JS and Vite — no framework, no dependencies beyond the dev server.

## What it is

A sales page targeting funded startups, technical founders, and ops-heavy teams. Sections: hero with stats, pain points, three service funnels (founding sprint / browser moat / security audit), case studies, testimonials, process overview, FAQ, and CTA.

Pricing tiers presented on the page:

- **24-hour security audit** — $1,500
- **Founding sprint** — $7,000 / 2 weeks
- **Browser moat funnel** — scoped per brief

## Stack

- **Vite 6** — dev server and build
- **Vanilla JS** — no React, no framework. Template literals render to `#app`
- **CSS** — single stylesheet, IBM Plex Sans + Syne fonts, responsive down to 320px
- **IntersectionObserver** — scroll-reveal animations

## Files

```
index.html          Entry point
src/main.js         App shell, layout, scroll observer
src/content.js      All copy, pricing, case studies, testimonials as exported arrays
src/styles.css      Full stylesheet
public/media/       Images (Contra screenshots, client logos, withSeismic branding)
dist/               Built output
```

## Commands

```bash
pnpm dev        # http://localhost:4173
pnpm build      # Output to dist/
pnpm preview    # Serve built output on :4173
```

## Author

Doug Silkstone — [doug@withseismic.com](mailto:doug@withseismic.com)
