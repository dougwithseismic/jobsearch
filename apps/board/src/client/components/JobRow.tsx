import { useEffect, useRef, useCallback } from "react";
import { timeAgo, getSourceColor } from "../lib/utils";
import { markSeen } from "../lib/useBoardStore";

interface Job {
  id: string;
  source: string;
  company: string;
  title: string;
  location: string;
  isRemote: boolean;
  department: string;
  publishedAt: string;
  applyUrl: string;
  jobUrl: string;
}

interface JobRowProps {
  job: Job;
  highlighted?: boolean;
  seen?: boolean;
  shortlisted?: boolean;
  hidden?: boolean;
  onMouseEnter?: () => void;
  style?: React.CSSProperties;
  measureRef?: (el: HTMLElement | null) => void;
}

export const JOB_ROW_HEIGHT = 48;

export function JobRow({ job, highlighted, seen, shortlisted, hidden, onMouseEnter, style, measureRef }: JobRowProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const combinedRef = useCallback((el: HTMLAnchorElement | null) => {
    (ref as React.MutableRefObject<HTMLAnchorElement | null>).current = el;
    measureRef?.(el);
  }, [measureRef]);

  // IntersectionObserver to mark as seen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markSeen(job.id);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [job.id]);

  // Scroll into view when highlighted (only when not virtualized - parent handles it)
  useEffect(() => {
    if (highlighted && ref.current && !style) {
      ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [highlighted]);

  return (
    <a
      ref={combinedRef}
      href={job.applyUrl || job.jobUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-job-id={job.id}
      onMouseEnter={onMouseEnter}
      style={style}
      className={`group job-row-grid items-center gap-y-1 px-4 sm:px-6 py-3 border-b border-border-subtle transition-colors ${
        highlighted
          ? shortlisted
            ? "border-l-2 !border-l-green-400"
            : "border-l-2 !border-l-accent"
          : "hover:bg-bg-hover"
      } ${
        hidden
          ? "opacity-30"
          : shortlisted
            ? highlighted
              ? "bg-green-950/40"
              : "bg-green-950/20"
            : highlighted
              ? "bg-bg-hover"
              : ""
      } ${seen && !highlighted && !hidden ? "opacity-70" : ""}`}
    >
      {/* Company */}
      <span className="font-mono text-sm text-accent truncate flex items-center gap-1.5 min-w-0">
        {shortlisted && (
          <span className="text-accent text-xs shrink-0" title="Shortlisted">&#9733;</span>
        )}
        <span className="truncate">{job.company}</span>
      </span>

      {/* Title */}
      <span className="text-sm font-medium text-text group-hover:text-accent transition-colors truncate min-w-0">
        {job.title}
      </span>

      {/* Location */}
      <span className="font-mono text-xs text-text-secondary truncate hidden sm:block min-w-0">
        {job.location || "\u2014"}
      </span>

      {/* Remote badge */}
      <span className="hidden sm:flex items-center">
        {job.isRemote && (
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-remote-bg text-remote">
            REMOTE
          </span>
        )}
      </span>

      {/* Date */}
      <span className="font-mono text-xs text-text-muted hidden sm:block whitespace-nowrap truncate min-w-0">
        {timeAgo(job.publishedAt)}
      </span>

      {/* Source badge */}
      <span
        className="hidden sm:inline-block text-[10px] font-mono font-medium px-1.5 py-0.5 rounded truncate min-w-0"
        style={{
          color: getSourceColor(job.source),
          backgroundColor: `${getSourceColor(job.source)}15`,
        }}
      >
        {job.source}
      </span>

      {/* Mobile meta line */}
      <div className="sm:hidden flex items-center gap-2 text-xs font-mono text-text-muted">
        {job.location && <span>{job.location}</span>}
        {job.isRemote && (
          <span className="text-remote bg-remote-bg px-1 py-0.5 rounded text-[10px]">REMOTE</span>
        )}
        <span>{timeAgo(job.publishedAt)}</span>
        <span style={{ color: getSourceColor(job.source) }}>{job.source}</span>
      </div>
    </a>
  );
}
