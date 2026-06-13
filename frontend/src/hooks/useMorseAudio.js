import { useCallback, useRef } from "react";

const FREQUENCY = 800;
const DOT_MS = 120;
const DASH_MS = DOT_MS * 3;
const GAP_MS = 80;
const CHAR_GAP_MS = 240;

export function useMorseAudio() {
  const ctxRef = useRef(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback(
    (durationMs) =>
      new Promise((resolve) => {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = FREQUENCY;
        gain.gain.value = 0.15;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        osc.start(now);
        osc.stop(now + durationMs / 1000);
        osc.onended = resolve;
      }),
    [getContext]
  );

  const playSymbol = useCallback(
    async (symbol) => {
      if (symbol === ".") await playTone(DOT_MS);
      else if (symbol === "-") await playTone(DASH_MS);
    },
    [playTone]
  );

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const playMorseString = useCallback(
    async (morse) => {
      if (!morse?.trim()) return;
      const tokens = morse.trim().split(/(\s+|\/+)/);
      for (const token of tokens) {
        if (!token || token === " ") continue;
        if (token === "/" || token.includes("/")) {
          await sleep(CHAR_GAP_MS * 2);
          continue;
        }
        if (token.includes(" ")) {
          const parts = token.split(/\s+/);
          for (let i = 0; i < parts.length; i++) {
            for (const ch of parts[i]) {
              if (ch === "." || ch === "-") {
                await playSymbol(ch);
                await sleep(GAP_MS);
              }
            }
            if (i < parts.length - 1) await sleep(CHAR_GAP_MS);
          }
          continue;
        }
        for (const ch of token) {
          if (ch === "." || ch === "-") {
            await playSymbol(ch);
            await sleep(GAP_MS);
          }
        }
      }
    },
    [playSymbol]
  );

  const playLetter = useCallback(
    async (morsePattern) => {
      await playMorseString(morsePattern);
    },
    [playMorseString]
  );

  return { playSymbol, playMorseString, playLetter, playTone };
}
