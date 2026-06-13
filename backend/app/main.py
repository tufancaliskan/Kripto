from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import Base, engine
from app.routes import auth, morse, quiz


def _ensure_quiz_score_level_column() -> None:
    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE quiz_scores "
                "ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1"
            )
        )


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    _ensure_quiz_score_level_column()
    yield


app = FastAPI(
    title="MorseAcademy API",
    description="Morse code learning platform with cryptography features",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(morse.router)
app.include_router(quiz.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "MorseAcademy"}
