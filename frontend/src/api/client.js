const API_BASE = "/api";

const API_ERROR_TR = {
  "Not authenticated": "Oturum açmanız gerekiyor",
  "Invalid credentials": "Geçersiz kullanıcı adı veya şifre",
  "Invalid token": "Oturum süresi doldu, tekrar giriş yapın",
  "User not found": "Kullanıcı bulunamadı",
  "Username or email already registered": "Kullanıcı adı veya e-posta zaten kayıtlı",
  "Request failed": "İstek başarısız",
};

function translateApiError(message) {
  return API_ERROR_TR[message] || message;
}

function getToken() {
  return localStorage.getItem("morse_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("morse_token", token);
  else localStorage.removeItem("morse_token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.detail || (typeof data.detail === "string" ? data.detail : "İstek başarısız");
    const raw = Array.isArray(msg) ? msg[0]?.msg || "Hata" : msg;
    throw new Error(translateApiError(raw));
  }
  return data;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  translate: (body) => request("/morse/translate", { method: "POST", body: JSON.stringify(body) }),
  secureTranslate: (body) =>
    request("/morse/secure-translate", { method: "POST", body: JSON.stringify(body) }),
  quizQuestions: (level = 1) => request(`/quiz/questions?level=${level}`),
  quizSubmit: (body) => request("/quiz/submit", { method: "POST", body: JSON.stringify(body) }),
  quizStats: () => request("/quiz/stats", { cache: "no-store" }),
  updateProgress: (body) => request("/quiz/progress", { method: "POST", body: JSON.stringify(body) }),
  resetProgress: () => request("/quiz/progress", { method: "DELETE" }),
};

/** Client-side Morse map for offline / instant UI */
export const MORSE_MAP = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
};

export function localTextToMorse(text) {
  return text
    .toUpperCase()
    .split(/\s+/)
    .map((word) =>
      [...word]
        .filter((c) => MORSE_MAP[c])
        .map((c) => MORSE_MAP[c])
        .join(" ")
    )
    .filter(Boolean)
    .join(" / ");
}

const REV = Object.fromEntries(Object.entries(MORSE_MAP).map(([k, v]) => [v, k]));

export function localMorseToText(morse) {
  return morse
    .split(/\s*\/\s*|\s{2,}/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((s) => REV[s] || "")
        .join("")
    )
    .filter(Boolean)
    .join(" ");
}
