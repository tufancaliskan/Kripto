import { useState } from "react";
import { Volume2 } from "lucide-react";
import { MORSE_MAP, api } from "../api/client.js";
import { useMorseAudio } from "../hooks/useMorseAudio.js";
import { useAuth } from "../context/AuthContext.jsx";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function LearnPanel() {
  const { playLetter } = useMorseAudio();
  const { isAuthenticated } = useAuth();
  const [active, setActive] = useState(null);
  const [flash, setFlash] = useState(null);

  const handleCard = async (letter) => {
    const morse = MORSE_MAP[letter];
    setActive(letter);
    setFlash(letter);
    setTimeout(() => setFlash(null), 400);
    await playLetter(morse);
    if (isAuthenticated) {
      api.updateProgress({ character: letter, is_learned: true }).catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="glow-text text-2xl font-bold text-neon-green">Öğrenme Paneli</h2>
        <p className="text-sm text-cyber-muted">
          Bir harfe tıklayın — Mors kodunu görün ve 800Hz ses desenini dinleyin
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {LETTERS.map((letter) => (
          <button
            key={letter}
            type="button"
            onClick={() => handleCard(letter)}
            className={`rounded-xl border p-4 text-center transition-all ${
              flash === letter ? "card-flash" : ""
            } ${
              active === letter
                ? "glow-green border-neon-green bg-neon-green/10"
                : "border-cyber-border bg-cyber-panel hover:border-neon-green/40"
            }`}
          >
            <span className="block text-2xl font-bold text-white">{letter}</span>
            <span className="mt-2 block text-xs text-neon-green">
              {active === letter ? MORSE_MAP[letter] : "·−"}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div className="flex items-center gap-3 rounded-xl border border-cyber-blue/40 bg-cyber-panel p-4">
          <Volume2 className="h-6 w-6 text-cyber-blue" />
          <div>
            <p className="text-sm text-cyber-muted">Seçili</p>
            <p className="text-xl">
              <span className="font-bold text-white">{active}</span>
              <span className="mx-2 text-cyber-muted">→</span>
              <span className="text-neon-green">{MORSE_MAP[active]}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
