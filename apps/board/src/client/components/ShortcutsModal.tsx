interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ["W", "\u2191"], desc: "Move highlight up" },
  { keys: ["S", "\u2193"], desc: "Move highlight down" },
  { keys: ["D"], desc: "Toggle shortlist on highlighted job" },
  { keys: ["A"], desc: "Hide/dismiss highlighted job" },
  { keys: ["Enter"], desc: "Open highlighted job's apply URL" },
  { keys: ["/"], desc: "Focus search bar" },
  { keys: ["P"], desc: "Toggle preview sidebar" },
  { keys: ["Esc"], desc: "Clear highlight / blur search" },
  { keys: ["?"], desc: "Show this help" },
];

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-bg-elevated border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors text-lg leading-none"
          >
            &times;
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.desc} className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">{s.desc}</span>
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-bg text-accent min-w-[1.5rem] text-center"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border-subtle">
          <p className="text-[10px] font-mono text-text-muted">
            Console: <span className="text-accent">window.board.help()</span> for programmatic API
          </p>
        </div>
      </div>
    </div>
  );
}
