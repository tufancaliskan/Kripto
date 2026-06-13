import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Radio } from "lucide-react";
import { localMorseToText } from "../api/client.js";

const DOT_THRESHOLD = 200;
const CHAR_GAP = 400;
const WORD_GAP = 1000;

export default function TelegraphSimulator() {
  const [morse, setMorse] = useState("");
  const [active, setActive] = useState(false);
  const pressStart = useRef(null);
  const lastRelease = useRef(null);
  const spaceHeld = useRef(false);

  const appendSymbol = useCallback((sym) => {
    setMorse((prev) => prev + sym);
  }, []);

  const handleGaps = useCallback(() => {
    const now = Date.now();
    if (lastRelease.current) {
      const idle = now - lastRelease.current;
      if (idle > WORD_GAP) {
        setMorse((prev) => {
          const trimmed = prev.trimEnd();
          if (!trimmed.endsWith("/")) return `${trimmed} / `;
          return prev;
        });
      } else if (idle > CHAR_GAP) {
        setMorse((prev) => (prev.endsWith(" ") ? prev : `${prev} `));
      }
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code !== "Space" || e.repeat) return;
      e.preventDefault();
      if (spaceHeld.current) return;
      spaceHeld.current = true;
      pressStart.current = Date.now();
      handleGaps();
      setActive(true);
    };

    const onKeyUp = (e) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      if (!spaceHeld.current) return;
      spaceHeld.current = false;
      setActive(false);
      const duration = Date.now() - (pressStart.current || Date.now());
      const sym = duration < DOT_THRESHOLD ? "." : "-";
      appendSymbol(sym);
      lastRelease.current = Date.now();
      pressStart.current = null;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [appendSymbol, handleGaps]);

  const translated = localMorseToText(morse.replace(/\s*\/\s*/g, " / "));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="glow-text flex items-center gap-2 text-2xl font-bold text-neon-green">
          <Radio className="h-7 w-7" />
          Telgraf Simülatörü
        </h2>
        <p className="mt-1 text-sm text-cyber-muted">
          <kbd className="rounded border border-cyber-border px-1">Boşluk</kbd> tuşuna basılı tutun —
          kısa basış = nokta, uzun = tire. Bırakma aralıkları harf ve kelime oluşturur.
        </p>
      </header>

      <div
        className={`rounded-xl border-2 p-8 text-center transition-all ${
          active
            ? "glow-green border-neon-green bg-neon-green/5"
            : "border-cyber-border bg-cyber-panel"
        }`}
      >
        <div className="mb-4 flex justify-center">
          <Keyboard
            className={`h-16 w-16 ${active ? "animate-pulse-neon text-neon-green" : "text-cyber-muted"}`}
          />
        </div>
        <p className="text-xs uppercase tracking-widest text-cyber-muted">
          {active ? "Yayın yapılıyor..." : "Boşluk tuşuna basılı tutun"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-cyber-border bg-cyber-panel p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase text-cyber-blue">Canlı Mors</h3>
          <p className="min-h-[4rem] break-all text-xl text-neon-green">{morse || "—"}</p>
        </div>
        <div className="rounded-xl border border-cyber-border bg-cyber-panel p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase text-cyber-blue">Çözülmüş Metin</h3>
          <p className="min-h-[4rem] text-xl text-white">{translated || "—"}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setMorse("");
          lastRelease.current = null;
        }}
        className="rounded-lg border border-cyber-border px-4 py-2 text-sm text-cyber-muted hover:text-white"
      >
        Tamponu temizle
      </button>
    </div>
  );
}
