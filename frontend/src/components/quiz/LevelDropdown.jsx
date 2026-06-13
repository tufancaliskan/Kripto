import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Layers } from "lucide-react";

export const QUIZ_LEVELS = [
  { value: 1, label: "Başlangıç", range: "A–J", letters: 10 },
  { value: 2, label: "Kolay", range: "A–N", letters: 14 },
  { value: 3, label: "Orta", range: "A–R", letters: 18 },
  { value: 4, label: "Zor", range: "A–V", letters: 22 },
  { value: 5, label: "Uzman", range: "A–Z", letters: 26 },
];

export default function LevelDropdown({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();
  const active = QUIZ_LEVELS.find((l) => l.value === value) ?? QUIZ_LEVELS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const select = (next) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-cyber-muted">
        Seviye
      </span>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={`flex min-w-[11.5rem] items-center gap-3 rounded-xl border bg-cyber-panel px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
          open
            ? "border-neon-green/50 glow-green"
            : "border-cyber-border hover:border-neon-green/30"
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neon-green/30 bg-neon-green/10 text-neon-green">
          <span className="text-sm font-bold">{active.value}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">{active.label}</span>
          <span className="block truncate text-[11px] text-cyber-muted">
            {active.range} · {active.letters} harf
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-cyber-muted transition-transform duration-200 ${
            open ? "rotate-180 text-neon-green" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Quiz seviyesi"
          className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-cyber-border bg-cyber-panel py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          <li className="flex items-center gap-2 border-b border-cyber-border px-3 py-2 text-[10px] uppercase tracking-wider text-cyber-muted">
            <Layers className="h-3.5 w-3.5" />
            Zorluk seçin
          </li>
          {QUIZ_LEVELS.map((lv) => {
            const selected = lv.value === value;
            return (
              <li key={lv.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => select(lv.value)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                    selected
                      ? "bg-neon-green/10 text-neon-green"
                      : "text-white hover:bg-cyber-bg"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                      selected
                        ? "border-neon-green/50 bg-neon-green/15 text-neon-green"
                        : "border-cyber-border bg-cyber-bg text-cyber-muted"
                    }`}
                  >
                    {lv.value}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{lv.label}</span>
                    <span
                      className={`block text-[11px] ${selected ? "text-neon-green/70" : "text-cyber-muted"}`}
                    >
                      {lv.range} · {lv.letters} harf havuzu
                    </span>
                  </span>
                  {selected && <Check className="h-4 w-4 shrink-0 text-neon-green" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
