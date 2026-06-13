# MorseAcademy

Kriptoloji dersi için Morse alfabesi öğretim platformu — gamification, Caesar şifreleme ve telegraf simülatörü.

## Tech Stack

| Layer    | Stack                                      |
| -------- | ------------------------------------------ |
| Frontend | React (Vite), Tailwind CSS v4, Lucide React |
| Backend  | FastAPI, SQLAlchemy, JWT (PyJWT)           |
| Database | PostgreSQL                                 |
| AI Lab   | OpenCV + MediaPipe (visual Morse stubs)    |

## Project Structure

```
MorseAcademy/
├── backend/
│   ├── app/
│   │   ├── core/          # config, DB, JWT security
│   │   ├── models/        # User, UserProgress, QuizScore
│   │   ├── schemas/       # Pydantic DTOs
│   │   ├── routes/        # auth, morse, quiz
│   │   ├── services/      # quiz question generator
│   │   └── utils/         # Morse + Caesar cipher
│   ├── ai_features/       # Visual Morse (blink detection)
│   └── requirements.txt
└── frontend/
    └── src/
        ├── hooks/useMorseAudio.js
        ├── components/TelegraphSimulator.jsx
        └── pages/           # Dashboard, Learn, Translate, Quiz
```

## Quick Start

### 1. PostgreSQL

```sql
CREATE DATABASE morseacademy;
```

### 2. Backend (one-time setup)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env          # edit DATABASE_URL & SECRET_KEY
```

### 3. Run app (backend + frontend)

```bash
cd frontend
npm install
npm run dev
```

From the repo root you can also run `npm run dev` (delegates to `frontend`).

Open http://localhost:5173 — API at http://127.0.0.1:8000, proxied via `/api` → backend.

## API Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/auth/register` | Register + JWT |
| POST | `/auth/login` | Login + JWT |
| POST | `/morse/translate` | Text ↔ Morse |
| POST | `/morse/secure-translate` | Caesar + Morse encrypt/decrypt |
| GET | `/quiz/questions?level=1` | Random quiz set |
| POST | `/quiz/submit` | Save score (auth required) |
| GET | `/quiz/stats` | Dashboard stats (auth) |

## Visual Morse (AI Lab)

```bash
cd backend
python -m ai_features.visual_morse
```

Requires webcam. Short blink = dot, long blink = dash.

## Theme

- Background: `#0d1117`
- Accent: `#00ff66` (neon green)
- Secondary: `#58a6ff` (cyber blue)
- Font: JetBrains Mono
