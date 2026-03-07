import "./styles.css";
import {
  caseStudies,
  faqs,
  funnels,
  logos,
  navLinks,
  painPoints,
  processSteps,
  stats,
  testimonials,
} from "./content.js";

const app = document.querySelector("#app");

const renderList = (items, renderItem) => items.map(renderItem).join("");

app.innerHTML = `
  <div class="page-shell">
    <div class="noise"></div>
    <header class="site-header">
      <a class="brand" href="#top">
        <span class="brand-mark">DS</span>
        <span>
          <strong>Doug Silkstone</strong>
          <small>Freelance full-stack engineer</small>
        </span>
      </a>
      <nav class="site-nav">
        ${renderList(navLinks, ({ label, href }) => `<a href="${href}">${label}</a>`)}
      </nav>
      <div class="header-actions">
        <a class="button button-ghost" href="mailto:doug@withseismic.com">Email</a>
        <a class="button button-primary" href="https://cal.com/dougwithseismic/vip" target="_blank" rel="noreferrer">Book call</a>
      </div>
    </header>

    <main id="top">
      <section class="hero section">
        <div class="hero-copy">
          <p class="eyebrow">For funded startups, technical founders, and teams that need leverage fast</p>
          <h1>I build launch-ready products, browser tools, and AI workflows that move revenue instead of just velocity.</h1>
          <p class="hero-text">
            You are hiring for judgment as much as code. I bring founder-level product sense, 15+ years of production engineering, and a track record across Contra, MIT, Sky, Groupon, and early-stage startups that raised more than $20M.
          </p>
          <div class="hero-actions">
            <a class="button button-primary" href="#funnels">Choose a funnel</a>
            <a class="button button-ghost" href="#proof">See proof</a>
          </div>
          <div class="hero-proof">
            ${renderList(stats, ({ value, label }) => `
              <article class="stat-card reveal">
                <strong>${value}</strong>
                <span>${label}</span>
              </article>
            `)}
          </div>
        </div>

        <div class="hero-visual reveal">
          <div class="hero-card hero-card-main">
            <img src="/media/contra-profile.png" alt="Doug Silkstone Contra profile screenshot" />
          </div>
          <div class="hero-card hero-card-float hero-card-float-top">
            <span>Top 1% on Contra</span>
            <strong>Investor-ready product work</strong>
          </div>
          <div class="hero-card hero-card-float hero-card-float-bottom">
            <span>Offer stack</span>
            <strong>$1.5k audit / $7k sprint / senior build support</strong>
          </div>
        </div>
      </section>

      <section class="logo-strip section reveal">
        <p>Trusted by teams and operators around</p>
        <div class="logo-row">
          ${renderList(logos, (logo) => `<span>${logo}</span>`)}
        </div>
      </section>

      <section class="problems section">
        <div class="section-heading reveal">
          <p class="eyebrow">Where I am useful</p>
          <h2>You do not need another generalist agency.</h2>
          <p>I fit best when there is a sharp commercial problem, an unfinished product, or an internal workflow that should already be automated.</p>
        </div>
        <div class="problem-grid">
          ${renderList(painPoints, ({ title, text }) => `
            <article class="problem-card reveal">
              <h3>${title}</h3>
              <p>${text}</p>
            </article>
          `)}
        </div>
      </section>

      <section id="funnels" class="funnels section">
        <div class="section-heading reveal">
          <p class="eyebrow">Funnels</p>
          <h2>Three smart ways to start.</h2>
          <p>Different buying intents need different entry points. These offers are designed to shorten the path from interest to useful work.</p>
        </div>
        <div class="funnel-grid">
          ${renderList(funnels, ({ eyebrow, title, price, intro, bullets, ctaLabel, ctaHref }) => `
            <article class="funnel-card reveal">
              <p class="card-eyebrow">${eyebrow}</p>
              <h3>${title}</h3>
              <strong class="price">${price}</strong>
              <p>${intro}</p>
              <ul>
                ${renderList(bullets, (bullet) => `<li>${bullet}</li>`)}
              </ul>
              <a class="button button-primary" href="${ctaHref}" target="_blank" rel="noreferrer">${ctaLabel}</a>
            </article>
          `)}
        </div>
      </section>

      <section id="proof" class="proof section">
        <div class="section-heading reveal">
          <p class="eyebrow">Proof</p>
          <h2>Technical depth, product taste, and commercial outcomes.</h2>
          <p>These are not made-up portfolio stories. They are the patterns clients hire for: launch speed, edge-distribution thinking, interface clarity, and usable systems.</p>
        </div>
        <div class="case-grid">
          ${renderList(caseStudies, ({ title, image, alt, metrics, text }) => `
            <article class="case-card reveal">
              <div class="case-image-wrap">
                <img src="${image}" alt="${alt}" loading="lazy" />
              </div>
              <div class="case-body">
                <h3>${title}</h3>
                <div class="metric-row">
                  ${renderList(metrics, (metric) => `<span>${metric}</span>`)}
                </div>
                <p>${text}</p>
              </div>
            </article>
          `)}
        </div>
      </section>

      <section class="testimonials section">
        <div class="section-heading reveal">
          <p class="eyebrow">Client signal</p>
          <h2>High trust and high velocity is the recurring theme.</h2>
        </div>
        <div class="testimonial-grid">
          ${renderList(testimonials, ({ quote, name, role }) => `
            <blockquote class="testimonial-card reveal">
              <p>"${quote}"</p>
              <footer>
                <strong>${name}</strong>
                <span>${role}</span>
              </footer>
            </blockquote>
          `)}
        </div>
      </section>

      <section id="process" class="process section">
        <div class="section-heading reveal">
          <p class="eyebrow">Process</p>
          <h2>Operator engineering, not ceremony.</h2>
          <p>The point is to get useful software into production quickly, with enough rigor that it stays there.</p>
        </div>
        <div class="process-grid">
          ${renderList(processSteps, ({ step, title, text }) => `
            <article class="process-card reveal">
              <span>${step}</span>
              <h3>${title}</h3>
              <p>${text}</p>
            </article>
          `)}
        </div>
      </section>

      <section id="faq" class="faq section">
        <div class="section-heading reveal">
          <p class="eyebrow">FAQ</p>
          <h2>Short answers for fast buyers.</h2>
        </div>
        <div class="faq-list">
          ${renderList(faqs, ({ question, answer }) => `
            <details class="faq-item reveal">
              <summary>${question}</summary>
              <p>${answer}</p>
            </details>
          `)}
        </div>
      </section>

      <section class="final-cta section reveal">
        <div>
          <p class="eyebrow">Next step</p>
          <h2>If the problem is expensive, start with the fastest useful engagement.</h2>
          <p>Book the sprint call, send the browser workflow, or hand over the AI app for a 24-hour audit. All three paths are designed to get to signal quickly.</p>
        </div>
        <div class="final-cta-actions">
          <a class="button button-primary" href="https://cal.com/dougwithseismic/vip" target="_blank" rel="noreferrer">Book a call</a>
          <a class="button button-ghost" href="mailto:doug@withseismic.com">doug@withseismic.com</a>
          <a class="button button-ghost" href="https://linkedin.com/in/dougsilkstone" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </section>
    </main>
  </div>
`;

const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

reveals.forEach((element, index) => {
  element.style.setProperty("--delay", `${Math.min(index * 55, 360)}ms`);
  observer.observe(element);
});
