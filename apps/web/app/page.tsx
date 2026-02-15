"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { companies, type Company } from "./data/companies";
import { slugify } from "./lib/slugify";

type Decision = "yes" | "no" | "maybe";
type Decisions = Record<number, Decision>;

async function loadDecisions(): Promise<Decisions> {
  try {
    const res = await fetch("/api/decisions");
    return await res.json();
  } catch {
    return {};
  }
}

async function saveDecision(companyId: number, decision: Decision) {
  await fetch("/api/decisions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [companyId]: decision }),
  });
}

async function removeSaveDecision(companyId: number) {
  // Load current, remove the key, overwrite
  const current = await loadDecisions();
  delete current[companyId];
  await fetch("/api/decisions", {
    method: "DELETE",
  });
  await fetch("/api/decisions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(current),
  });
}

async function clearAllDecisions() {
  await fetch("/api/decisions", { method: "DELETE" });
}

function getDomain(url: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function CompanyLogo({ company }: { company: Company }) {
  const domain = getDomain(company.website);
  if (!domain) return <div className="logo-placeholder" />;
  // Google favicon service - free, no API key, high quality at 128px
  const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  return (
    <img
      className="company-logo"
      src={src}
      alt={company.name}
      width={48}
      height={48}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function FitBadge({ score }: { score: number }) {
  return (
    <span className={`fit-badge fit-${Math.max(2, Math.min(5, score))}`}>
      {score}/5 fit
    </span>
  );
}

function ReputationBadge({ reputation }: { reputation: string }) {
  if (!reputation) return null;
  const grade = reputation.charAt(0).toUpperCase();
  const gradeClass =
    grade === "A" ? "rep-a" :
    grade === "B" ? "rep-b" :
    grade === "C" ? "rep-c" : "rep-d";
  return (
    <span className={`rep-badge ${gradeClass}`} title={reputation}>
      {grade}
    </span>
  );
}

function CompanyCard({
  company,
  swipeDir,
}: {
  company: Company;
  swipeDir: "left" | "right" | null;
}) {
  return (
    <div
      className={`card ${swipeDir === "left" ? "swipe-left" : swipeDir === "right" ? "swipe-right" : ""}`}
    >
      <div className="card-header">
        <div className="card-header-left">
          <CompanyLogo company={company} />
          <div>
            <h2 className="company-name">
              <Link href={`/company/${slugify(company.name)}`} className="company-name-link">
                {company.name}
              </Link>
            </h2>
            {company.category && (
              <span className="category-label">{company.category}</span>
            )}
          </div>
        </div>
        <div className="card-badges">
          <ReputationBadge reputation={company.reputation} />
          <FitBadge score={company.fitScore} />
        </div>
      </div>

      {company.description && (
        <p className="card-description">{company.description}</p>
      )}

      <div className="card-meta">
        {company.role && (
          <div className="meta-row">
            <span className="label">Role</span>
            <span>{company.role}</span>
          </div>
        )}
        <div className="meta-row">
          <span className="label">Location</span>
          <span>{company.location || "Unknown"}{company.workModel ? ` · ${company.workModel}` : ""}</span>
        </div>
        {company.salaryRange && (
          <div className="meta-row">
            <span className="label">Salary</span>
            <span>{company.salaryRange}</span>
          </div>
        )}
        {(company.funding || company.teamSize) && (
          <div className="meta-row">
            <span className="label">Company</span>
            <span>{[company.funding, company.teamSize].filter(Boolean).join(" · ")}</span>
          </div>
        )}
        {company.reputation && (
          <div className="meta-row">
            <span className="label">Rep</span>
            <span>{company.reputation}</span>
          </div>
        )}
      </div>

      {company.whyCool && (
        <div className="card-whycool">
          <span className="label">Why cool</span>
          <p>{company.whyCool}</p>
        </div>
      )}

      {company.techStack && (
        <div className="card-tags">
          {company.techStack.split(",").map((t) => (
            <span key={t.trim()} className="tag">{t.trim()}</span>
          ))}
        </div>
      )}

      {company.website && (
        <div className="card-link">
          <a href={company.website} target="_blank" rel="noopener noreferrer">
            {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
          </a>
        </div>
      )}

      {company.notes && (
        <div className="card-notes">{company.notes}</div>
      )}
    </div>
  );
}

interface HNResult {
  title: string;
  url: string;
  points: number;
  numComments: number;
  createdAt: string;
}

function ResearchPanel({ company }: { company: Company }) {
  const [hnResults, setHnResults] = useState<HNResult[]>([]);
  const [hnLoading, setHnLoading] = useState(true);
  const [screenshotSrc, setScreenshotSrc] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);

  useEffect(() => {
    setHnLoading(true);
    setHnResults([]);

    fetch(`/api/research?company=${encodeURIComponent(company.name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHnResults(data);
      })
      .catch(() => {})
      .finally(() => setHnLoading(false));
  }, [company.name]);

  useEffect(() => {
    if (!company.website) return;
    setScreenshotSrc(null);
    setScreenshotLoading(true);
    setScreenshotError(false);

    fetch(`/api/screenshot?url=${encodeURIComponent(company.website)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.src) setScreenshotSrc(data.src);
        else setScreenshotError(true);
      })
      .catch(() => setScreenshotError(true))
      .finally(() => setScreenshotLoading(false));
  }, [company.website]);

  const encodedName = encodeURIComponent(company.name);

  return (
    <div className="research-panel">
      {company.website && (
        <div>
          <h3>Website Preview</h3>
          <div className="research-screenshot">
            {screenshotLoading && (
              <div className="screenshot-loading">Capturing screenshot...</div>
            )}
            {screenshotError && (
              <div className="screenshot-loading">Could not capture screenshot</div>
            )}
            {screenshotSrc && (
              <img
                src={screenshotSrc}
                alt={`${company.name} website`}
              />
            )}
          </div>
        </div>
      )}

      <div>
        <h3>Quick Research</h3>
        <div className="research-links">
          <a
            href={`https://www.google.com/search?q=${encodedName}+company&tbm=nws`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google News
          </a>
          <a
            href={`https://www.linkedin.com/search/results/companies/?keywords=${encodedName}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href={`https://www.glassdoor.com/Search/results.htm?keyword=${encodedName}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Glassdoor
          </a>
          <a
            href={`https://github.com/search?q=${encodedName}&type=repositories`}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>

      <div>
        <h3>Hacker News Mentions</h3>
        {hnLoading ? (
          <p className="hn-empty">Searching HN...</p>
        ) : hnResults.length === 0 ? (
          <p className="hn-empty">No mentions found</p>
        ) : (
          <div className="research-hn">
            {hnResults.map((item, i) => (
              <div key={i} className="hn-item">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
                <div className="hn-meta">
                  <span>{item.points} pts</span>
                  <span>{item.numComments} comments</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultsList({
  decisions,
  onRestart,
  onClear,
}: {
  decisions: Decisions;
  onRestart: () => void;
  onClear: () => void;
}) {
  const [tab, setTab] = useState<Decision | "all">("yes");

  const filtered = companies.filter((c) => {
    if (tab === "all") return c.id in decisions;
    return decisions[c.id] === tab;
  });

  const yesCount = companies.filter((c) => decisions[c.id] === "yes").length;
  const noCount = companies.filter((c) => decisions[c.id] === "no").length;
  const maybeCount = companies.filter(
    (c) => decisions[c.id] === "maybe"
  ).length;

  function exportJSON() {
    const data = companies
      .filter((c) => decisions[c.id] === "yes" || decisions[c.id] === "maybe")
      .map((c) => ({
        name: c.name,
        decision: decisions[c.id],
        category: c.category,
        description: c.description,
        website: c.website,
        role: c.role,
        location: c.location,
        workModel: c.workModel,
        salaryRange: c.salaryRange,
        funding: c.funding,
        teamSize: c.teamSize,
        techStack: c.techStack,
        whyCool: c.whyCool,
        reputation: c.reputation,
        fitScore: c.fitScore,
        notes: c.notes,
      }));
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shortlisted-companies.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const rows = companies
      .filter((c) => decisions[c.id] === "yes" || decisions[c.id] === "maybe")
      .map((c) =>
        [
          c.name,
          decisions[c.id],
          c.website,
          c.role,
          c.location,
          c.fitScore,
          `"${c.notes}"`,
        ].join(",")
      );
    const csv = [
      "Name,Decision,Website,Role,Location,FitScore,Notes",
      ...rows,
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shortlisted-companies.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="results">
      <h2>Review Complete</h2>

      <div className="results-tabs">
        <button
          className={`tab-btn ${tab === "yes" ? "active" : ""}`}
          onClick={() => setTab("yes")}
        >
          Yes ({yesCount})
        </button>
        <button
          className={`tab-btn ${tab === "maybe" ? "active" : ""}`}
          onClick={() => setTab("maybe")}
        >
          Maybe ({maybeCount})
        </button>
        <button
          className={`tab-btn ${tab === "no" ? "active" : ""}`}
          onClick={() => setTab("no")}
        >
          No ({noCount})
        </button>
        <button
          className={`tab-btn ${tab === "all" ? "active" : ""}`}
          onClick={() => setTab("all")}
        >
          All ({yesCount + noCount + maybeCount})
        </button>
      </div>

      <p className="results-count">{filtered.length} companies</p>

      {filtered.map((c) => (
        <div key={c.id} className="result-item">
          <div>
            <div className="ri-name">
              <Link href={`/company/${slugify(c.name)}`} className="company-name-link">
                {c.name}
              </Link>
              {c.website && (
                <>
                  {" "}
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 400 }}
                  >
                    ↗
                  </a>
                </>
              )}
            </div>
            <div className="ri-loc">{c.location}</div>
            <div className="ri-notes">{c.notes}</div>
          </div>
          <div className="ri-right">
            <FitBadge score={c.fitScore} />
          </div>
        </div>
      ))}

      <div className="button-row">
        <button className="export-btn" onClick={exportJSON}>
          Export JSON
        </button>
        <button className="export-btn" onClick={exportCSV}>
          Export CSV
        </button>
      </div>
      <div className="button-row">
        <button className="restart-btn" onClick={onRestart}>
          Review Again
        </button>
        <button className="restart-btn" onClick={onClear}>
          Clear All & Restart
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [decisions, setDecisions] = useState<Decisions>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load saved state
  useEffect(() => {
    loadDecisions().then((saved) => {
      setDecisions(saved);
      const firstUndecided = companies.findIndex((c) => !(c.id in saved));
      if (firstUndecided === -1) {
        setIsComplete(true);
      } else {
        setCurrentIndex(firstUndecided);
      }
      setLoaded(true);
    });
  }, []);

  const company = companies[currentIndex];

  const decide = useCallback(
    (decision: Decision) => {
      if (isComplete || !company) return;

      // Animate
      setSwipeDir(decision === "no" ? "left" : "right");

      setTimeout(() => {
        const next = { ...decisions, [company.id]: decision };
        setDecisions(next);
        saveDecision(company.id, decision);
        setHistory((h) => [...h, currentIndex]);

        // Find next undecided
        let nextIdx = currentIndex + 1;
        while (nextIdx < companies.length && companies[nextIdx]!.id in next) {
          nextIdx++;
        }

        if (nextIdx >= companies.length) {
          // Check if any earlier ones are undecided
          const earlier = companies.findIndex((c) => !(c.id in next));
          if (earlier === -1) {
            setIsComplete(true);
          } else {
            setCurrentIndex(earlier);
          }
        } else {
          setCurrentIndex(nextIdx);
        }
        setSwipeDir(null);
      }, 150);
    },
    [company, currentIndex, decisions, isComplete]
  );

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prevIndex = history[history.length - 1]!;
    const prevCompany = companies[prevIndex]!;
    const next = { ...decisions };
    delete next[prevCompany.id];
    setDecisions(next);
    removeSaveDecision(prevCompany.id);
    setHistory((h) => h.slice(0, -1));
    setCurrentIndex(prevIndex);
    setIsComplete(false);
  }, [history, decisions]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key.toLowerCase()) {
        case "y":
        case "arrowright":
          e.preventDefault();
          decide("yes");
          break;
        case "n":
        case "arrowleft":
          e.preventDefault();
          decide("no");
          break;
        case "m":
        case "arrowdown":
          e.preventDefault();
          decide("maybe");
          break;
        case "u":
        case "z":
        case "backspace":
          e.preventDefault();
          undo();
          break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [decide, undo]);

  if (!loaded) {
    return (
      <div className="app">
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      </div>
    );
  }

  const decidedCount = Object.keys(decisions).length;
  const totalCount = companies.length;
  const yesCount = Object.values(decisions).filter((d) => d === "yes").length;
  const maybeCount = Object.values(decisions).filter(
    (d) => d === "maybe"
  ).length;

  return (
    <div className="app">
      {/* Progress */}
      <div className="progress-container">
        <div className="progress-header">
          <span>
            {decidedCount} / {totalCount} reviewed
          </span>
          <span>
            {yesCount} yes · {maybeCount} maybe
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(decidedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {isComplete ? (
        <ResultsList
          decisions={decisions}
          onRestart={() => {
            setCurrentIndex(0);
            setIsComplete(false);
          }}
          onClear={() => {
            setDecisions({});
            clearAllDecisions();
            setCurrentIndex(0);
            setHistory([]);
            setIsComplete(false);
          }}
        />
      ) : company ? (
        <>
          <CompanyCard company={company} swipeDir={swipeDir} />
          <ResearchPanel company={company} />

          <div className="actions">
            <button className="btn btn-no" onClick={() => decide("no")}>
              Nope <span className="kbd">←</span>
            </button>
            <button className="btn btn-maybe" onClick={() => decide("maybe")}>
              Maybe <span className="kbd">↓</span>
            </button>
            <button className="btn btn-yes" onClick={() => decide("yes")}>
              Yes <span className="kbd">→</span>
            </button>
          </div>

          {history.length > 0 && (
            <div className="actions" style={{ marginTop: "0.5rem" }}>
              <button className="btn btn-undo" onClick={undo}>
                Undo <span className="kbd">⌫</span>
              </button>
            </div>
          )}

          <div className="shortcuts">
            ← No · ↓ Maybe · → Yes · Backspace Undo · Y/N/M also work
          </div>
        </>
      ) : null}
    </div>
  );
}
