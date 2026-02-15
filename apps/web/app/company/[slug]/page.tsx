import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { companies } from "../../data/companies";
import { slugify } from "../../lib/slugify";
import { loadDossier } from "../../lib/dossier";

type Decision = "yes" | "no" | "maybe";

async function loadDecisions(): Promise<Record<string, Decision>> {
  try {
    const filePath = join(process.cwd(), "..", "..", "decisions.json");
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getDomain(url: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function DecisionBadge({ decision }: { decision: Decision | null }) {
  if (!decision) return <span className="decision-badge decision-none">Not reviewed</span>;
  const cls =
    decision === "yes" ? "decision-yes" :
    decision === "no" ? "decision-no" : "decision-maybe";
  return <span className={`decision-badge ${cls}`}>{decision}</span>;
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const company = companies.find((c) => slugify(c.name) === slug);
  if (!company) notFound();

  const [dossier, decisions] = await Promise.all([
    loadDossier(slug),
    loadDecisions(),
  ]);

  const decision = (decisions[String(company.id)] as Decision) ?? null;
  const domain = getDomain(company.website);
  const logoSrc = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : null;

  return (
    <div className="detail-page">
      <Link href="/" className="back-link">
        &larr; Back
      </Link>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-left">
          {logoSrc ? (
            <img className="detail-logo" src={logoSrc} alt={company.name} width={56} height={56} />
          ) : (
            <div className="detail-logo-placeholder" />
          )}
          <div>
            <h1 className="detail-name">{company.name}</h1>
            <div className="detail-header-meta">
              {company.category && <span className="detail-category">{company.category}</span>}
              <span className={`fit-badge fit-${Math.max(2, Math.min(5, company.fitScore))}`}>
                {company.fitScore}/5 fit
              </span>
              <DecisionBadge decision={decision} />
            </div>
          </div>
        </div>
      </div>

      {company.description && (
        <p className="detail-description">{company.description}</p>
      )}

      {/* Metadata grid */}
      <div className="detail-meta-grid">
        {company.role && (
          <div className="detail-meta-item">
            <span className="detail-meta-label">Role</span>
            <span>{company.role}</span>
          </div>
        )}
        <div className="detail-meta-item">
          <span className="detail-meta-label">Location</span>
          <span>{company.location || "Unknown"}{company.workModel ? ` · ${company.workModel}` : ""}</span>
        </div>
        {company.salaryRange && (
          <div className="detail-meta-item">
            <span className="detail-meta-label">Salary</span>
            <span>{company.salaryRange}</span>
          </div>
        )}
        {company.funding && (
          <div className="detail-meta-item">
            <span className="detail-meta-label">Funding</span>
            <span>{company.funding}</span>
          </div>
        )}
        {company.teamSize && (
          <div className="detail-meta-item">
            <span className="detail-meta-label">Team</span>
            <span>{company.teamSize}</span>
          </div>
        )}
        {company.techStack && (
          <div className="detail-meta-item">
            <span className="detail-meta-label">Tech</span>
            <span>{company.techStack}</span>
          </div>
        )}
        {company.website && (
          <div className="detail-meta-item">
            <span className="detail-meta-label">Website</span>
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
            </a>
          </div>
        )}
        {company.reputation && (
          <div className="detail-meta-item">
            <span className="detail-meta-label">Reputation</span>
            <span>{company.reputation}</span>
          </div>
        )}
      </div>

      {company.whyCool && (
        <div className="detail-whycool">
          <span className="detail-whycool-label">Why cool</span>
          <p>{company.whyCool}</p>
        </div>
      )}

      {company.notes && (
        <div className="detail-notes">
          <span className="detail-meta-label">Notes</span>
          <p>{company.notes}</p>
        </div>
      )}

      {/* Dossier */}
      {dossier ? (
        <div className="detail-dossier">
          <div className="dossier-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{dossier}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="detail-empty">
          <p>No dossier yet.</p>
          <p className="detail-empty-hint">
            Run <code>/company-deep-dive {company.name}</code> to generate one.
          </p>
        </div>
      )}
    </div>
  );
}
