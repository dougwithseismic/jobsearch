import { useState, useEffect, useCallback } from "react";

interface PreviewPanelProps {
  url: string | null;
  jobTitle: string;
  company: string;
}

const STORAGE_KEY = "preview-sidebar-open";

function getStoredOpen(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "true";
  } catch {
    return false;
  }
}

export function PreviewPanel({ url, jobTitle, company }: PreviewPanelProps) {
  const [isOpen, setIsOpen] = useState(getStoredOpen);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Persist open/closed state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isOpen));
    } catch {
      // ignore
    }
  }, [isOpen]);

  // Reset iframe state when URL changes
  useEffect(() => {
    setFailed(false);
    setLoading(true);
  }, [url]);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // Keyboard shortcut: P to toggle
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggle]);

  return (
    <>
      {/* Toggle tab — always visible on right edge */}
      <button
        onClick={toggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-bg-elevated border border-r-0 border-border rounded-l-md px-1.5 py-3 text-[10px] font-mono text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          // Shift left when sidebar is open so it stays on the sidebar edge
          transform: isOpen
            ? "translateY(-50%) translateX(-450px)"
            : "translateY(-50%)",
          transition: "transform 300ms ease",
        }}
        title="Toggle preview (P)"
      >
        {isOpen ? "\u2716 Preview" : "\u25B6 Preview"}
      </button>

      {/* Sidebar */}
      <div
        className="fixed right-0 top-0 bottom-0 z-30 w-[450px] bg-bg-elevated border-l border-border shadow-[-8px_0_30px_rgba(0,0,0,0.5)] flex flex-col"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-bg-alt shrink-0">
          <div className="truncate mr-2">
            {url ? (
              <>
                <span className="text-[10px] font-mono text-accent">
                  {company}
                </span>
                <span className="text-[10px] font-mono text-text-muted mx-1">
                  /
                </span>
                <span className="text-[10px] font-mono text-text-secondary truncate">
                  {jobTitle}
                </span>
              </>
            ) : (
              <span className="text-[10px] font-mono text-text-muted">
                No job selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono px-2 py-1 rounded border border-border text-text-secondary hover:text-accent hover:border-accent/50 transition-colors"
              >
                Open &nearr;
              </a>
            )}
            <button
              onClick={toggle}
              className="text-xs font-mono px-1.5 py-0.5 rounded text-text-muted hover:text-accent transition-colors"
              title="Close preview"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content — only render iframe when sidebar is open (lazy loading) */}
        <div className="flex-1 relative">
          {isOpen && url ? (
            <>
              {loading && !failed && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-alt">
                  <div className="text-xs font-mono text-text-muted animate-pulse">
                    Loading preview...
                  </div>
                </div>
              )}

              {failed ? (
                <div className="h-full flex flex-col items-center justify-center px-4 text-center gap-3">
                  <div className="text-text-muted text-xs font-mono">
                    Preview unavailable — site blocks embedding.
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono px-3 py-1.5 rounded-md border border-accent text-accent hover:bg-accent/10 transition-colors"
                  >
                    Open in new tab &nearr;
                  </a>
                </div>
              ) : (
                <iframe
                  src={url}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setFailed(true);
                    setLoading(false);
                  }}
                />
              )}
            </>
          ) : isOpen && !url ? (
            <div className="h-full flex items-center justify-center px-4 text-center">
              <div className="text-text-muted text-xs font-mono">
                Navigate to a job to preview it.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
