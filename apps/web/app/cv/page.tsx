"use client";

import { useState, useEffect } from "react";
import "./cv.css";

interface CVData {
  name: string;
  title: string;
  availability: string;
  location: string;
  experience_years: string;
  links: {
    github: string;
    portfolio: string;
    linkedin: string;
  };
  about: string;
  skills: Record<string, string[]>;
  notable_clients: string[];
  highlights: {
    exits: number;
    client_funding_raised: string;
    mit_course_students: string;
    team_leadership: boolean;
  };
  experience: {
    company: string;
    role: string;
    period: string;
    tech: string[];
    highlights: string[];
  }[];
}

const SKILL_LABELS: Record<string, string> = {
  languages: "Languages",
  frontend: "Frontend",
  backend: "Backend",
  infrastructure: "Infra",
  observability: "Observability",
  testing: "Testing",
  tooling: "Tooling",
  technologies: "Technologies",
  other: "Other",
};

export default function CVPage() {
  const [cv, setCv] = useState<CVData | null>(null);
  const [variant, setVariant] = useState("outreach");

  useEffect(() => {
    fetch(`/api/cv?variant=${variant}`)
      .then((r) => r.json())
      .then(setCv)
      .catch(console.error);
  }, [variant]);

  useEffect(() => {
    document.title = "Doug Silkstone — CV";
  }, []);

  if (!cv) return null;

  return (
    <div className="cv-page">
      <div className="cv-toolbar no-print">
        <select
          value={variant}
          onChange={(e) => setVariant(e.target.value)}
          className="cv-variant-select"
        >
          <option value="outreach">Outreach (tailored)</option>
          <option value="rankacy">Rankacy (tailored)</option>
          <option value="default">Default</option>
        </select>
        <button onClick={() => window.print()}>Print / Save as PDF</button>
        <span className="cv-toolbar-hint">
          Set margins to &quot;None&quot; and enable &quot;Background
          graphics&quot;
        </span>
      </div>

      <div className="cv-sheet">
        {/* Header */}
        <header className="cv-header">
          <div className="cv-header-left">
            <h1>{cv.name}</h1>
            <p className="cv-title">{cv.title}</p>
            <p className="cv-meta">
              {cv.location} &middot; {cv.experience_years} years &middot;
              Available {cv.availability}
            </p>
          </div>
          <div className="cv-header-right">
            <a href={cv.links.linkedin}>
              linkedin.com/in/dougsilkstone
            </a>
            <a href={cv.links.github}>github.com/dougwithseismic</a>
            <a href={cv.links.portfolio}>contra.com/doug_silkstone</a>
          </div>
        </header>

        {/* About */}
        <section className="cv-section">
          <p className="cv-about">{cv.about}</p>
        </section>

        {/* Skills — 2 col */}
        <section className="cv-section">
          <h2>Skills</h2>
          <div className="cv-skills-grid">
            {Object.entries(cv.skills).map(([key, values]) => (
              <div key={key} className="cv-skill-group">
                <span className="cv-skill-label">
                  {SKILL_LABELS[key] || key}
                </span>
                <span className="cv-skill-values">{values.join(" · ")}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="cv-section">
          <h2>Experience</h2>
          {cv.experience.map((job, i) => (
            <div key={i} className="cv-job">
              <div className="cv-job-header">
                <div>
                  <span className="cv-job-role">{job.role}</span>
                  <span className="cv-job-company"> — {job.company}</span>
                </div>
                <span className="cv-job-period">{job.period}</span>
              </div>
              {job.tech.length > 0 && (
                <p className="cv-job-tech">{job.tech.join(" · ")}</p>
              )}
              {job.highlights.length > 0 && (
                <ul className="cv-job-highlights">
                  {job.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>

        {/* Clients — inline at the bottom */}
        <section className="cv-section cv-section-last">
          <h2>Notable Clients</h2>
          <p className="cv-clients">{cv.notable_clients.join(" · ")}</p>
        </section>
      </div>
    </div>
  );
}
