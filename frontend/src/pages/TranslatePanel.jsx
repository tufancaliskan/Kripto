import { useState } from "react";
import { Play } from "lucide-react";
import { localMorseToText, localTextToMorse } from "../api/client.js";
import { useMorseAudio } from "../hooks/useMorseAudio.js";

export default function TranslatePanel() {
  const { playMorseString } = useMorseAudio();
  const [textIn, setTextIn] = useState("SOS");
  const [morseIn, setMorseIn] = useState("... --- ...");
  const [playing, setPlaying] = useState(false);

  const onTextChange = (value) => {
    setTextIn(value);
    setMorseIn(localTextToMorse(value));
  };

  const onMorseChange = (value) => {
    setMorseIn(value);
    setTextIn(localMorseToText(value));
  };

  const handlePlay = async () => {
    setPlaying(true);
    await playMorseString(morseIn);
    setPlaying(false);
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="glow-text text-2xl font-bold text-neon-green">Çeviri Paneli</h2>
        <p className="text-sm text-cyber-muted">Anlık Mors ↔ Metin çevirisi</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col">
          <div className="mb-2 flex h-9 items-center">
            <label className="text-xs font-semibold uppercase text-cyber-blue">
              Düz Metin
            </label>
          </div>
          <textarea
            value={textIn}
            onChange={(e) => onTextChange(e.target.value)}
            rows={8}
            className="w-full flex-1 resize-none rounded-xl border border-cyber-border bg-cyber-panel p-4 font-mono text-white outline-none focus:border-neon-green/50"
            placeholder="Metin girin..."
          />
        </div>
        <div className="flex flex-col">
          <div className="mb-2 flex h-9 items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase text-cyber-blue">Mors Çıktısı</label>
            <button
              type="button"
              onClick={handlePlay}
              disabled={playing}
              className="flex shrink-0 items-center gap-1 rounded border border-neon-green/40 px-2 py-1 text-xs text-neon-green hover:bg-neon-green/10 disabled:opacity-50"
            >
              <Play className="h-3 w-3" />
              Mors Sesi Çal
            </button>
          </div>
          <textarea
            value={morseIn}
            onChange={(e) => onMorseChange(e.target.value)}
            rows={8}
            className="w-full flex-1 resize-none rounded-xl border border-cyber-border bg-cyber-panel p-4 font-mono text-neon-green outline-none focus:border-neon-green/50"
            placeholder="... --- ..."
          />
        </div>
      </div>
    </div>
  );
}
