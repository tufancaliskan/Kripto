from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class QuestionType(str, Enum):
    multiple_choice = "multiple_choice"
    text_input = "text_input"
    audio = "audio"


class QuizQuestion(BaseModel):
    id: str
    type: QuestionType
    prompt: str
    character: str | None = None
    morse: str | None = None
    options: list[str] | None = None


class QuizQuestionsResponse(BaseModel):
    level: int
    questions: list[QuizQuestion]


class QuizAnswer(BaseModel):
    question_id: str
    answer: str


class QuizSubmitRequest(BaseModel):
    level: int = Field(ge=1, le=5)
    answers: list[QuizAnswer]
    duration_seconds: int = Field(ge=0, le=3600)
    correct_count: int = Field(ge=0)
    wrong_count: int = Field(ge=0)


class QuizScoreOut(BaseModel):
    id: UUID
    score: int
    correct_answers: int
    wrong_answers: int
    duration_seconds: int
    level: int = 1
    quiz_date: datetime

    model_config = {"from_attributes": True}


class ProgressUpdate(BaseModel):
    character: str = Field(min_length=1, max_length=1)
    is_learned: bool = True


class UserStatsResponse(BaseModel):
    username: str
    learned_count: int
    total_characters: int
    learned_percent: float
    recent_scores: list[QuizScoreOut]
