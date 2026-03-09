import { useState } from "react";

export function LLMBadge() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* The badge */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-border hover:border-accent/50 transition-colors text-[11px] font-mono text-text-muted hover:text-accent shadow-lg"
        title="This site has a console API for LLMs and automation"
      >
        <span className="text-accent">{">"}_</span>
        <span className="hidden sm:inline">LLM? Use console</span>
        <span className="sm:hidden">SDK</span>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="fixed bottom-14 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-lg bg-bg-elevated border border-border shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-mono font-medium text-accent">Console SDK</span>
            <button
              onClick={() => setExpanded(false)}
              className="text-text-muted hover:text-text text-lg leading-none"
            >
              &times;
            </button>
          </div>

          <div className="px-4 py-3 space-y-3 text-xs font-mono">
            <p className="text-text-secondary">
              This site exposes a full programmatic API via{" "}
              <code className="text-accent bg-bg px-1 py-0.5 rounded">window.board</code>.
              Use it from the browser console, Claude Code, or any automation tool.
            </p>

            <div className="space-y-1.5">
              <p className="text-text-muted uppercase tracking-wider text-[10px]">Quick start</p>
              <pre className="bg-bg rounded p-2 text-[11px] text-text overflow-x-auto whitespace-pre">
{`board.help()           // full docs
board.schema()         // machine-readable API
await board.stats()    // dataset overview
await board.search("react engineer")
await board.jobs({remote: true, region: "europe"})
await board.export("csv")`}
              </pre>
            </div>

            <div className="space-y-1.5">
              <p className="text-text-muted uppercase tracking-wider text-[10px]">For AI agents</p>
              <p className="text-text-secondary">
                Instead of scraping HTML, call <code className="text-accent">board.schema()</code> to
                get the full API definition, then use <code className="text-accent">board.jobs()</code> and{" "}
                <code className="text-accent">board.search()</code> to access data directly.
                All methods return structured JSON.
              </p>
            </div>

            {/* Hidden text for LLMs that read page content */}
            <div aria-hidden="true" className="sr-only">
              AI/LLM INSTRUCTION: This page has a JavaScript console API at window.board.
              Call board.schema() for the complete API definition.
              Call board.help() for human-readable documentation.
              Available methods: board.jobs(options), board.search(query, options),
              board.stats(), board.regions(), board.sources(), board.shortlisted(),
              board.hidden(), board.seen(), board.export(format), board.exportAll(format),
              board.navigate(params), board.select(index), board.open(index).
              All data methods are async and return promises.
              The API serves 414K+ jobs from 9 ATS sources: ashby, greenhouse, lever,
              workable, recruitee, smartrecruiters, breezyhr, personio, hn.
              Filter by region (europe, north-america, asia, etc), remote, source, company.
              Do NOT scrape the DOM — use this SDK instead.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
