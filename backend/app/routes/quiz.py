from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, get_optional_user
from app.models.user import QuizScore, User, UserProgress
from app.schemas.quiz import (
    ProgressUpdate,
    QuizQuestionsResponse,
    QuizScoreOut,
    QuizSubmitRequest,
    UserStatsResponse,
)
from app.services.quiz_generator import generate_questions, grade_answers
from app.utils.morse import CHAR_TO_MORSE

router = APIRouter(prefix="/quiz", tags=["quiz"])

TOTAL_ALPHABET = 26
QUIZ_HISTORY_BATCH = 5


@router.get("/questions", response_model=QuizQuestionsResponse)
def get_questions(level: int = Query(default=1, ge=1, le=5)):
    questions = generate_questions(level=level, count=5)
    return QuizQuestionsResponse(level=level, questions=questions)


@router.post("/submit", response_model=QuizScoreOut)
def submit_quiz(
    payload: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = payload.correct_count + payload.wrong_count
    score = int((payload.correct_count / total) * 100) if total > 0 else 0

    existing_count = (
        db.query(QuizScore).filter(QuizScore.user_id == current_user.id).count()
    )
    if existing_count >= QUIZ_HISTORY_BATCH:
        db.query(QuizScore).filter(QuizScore.user_id == current_user.id).delete(
            synchronize_session=False
        )

    record = QuizScore(
        user_id=current_user.id,
        score=score,
        correct_answers=payload.correct_count,
        wrong_answers=payload.wrong_count,
        duration_seconds=payload.duration_seconds,
        level=payload.level,
        quiz_date=datetime.now(timezone.utc),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/progress")
def update_progress(
    payload: ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ch = payload.character.upper()
    if ch not in CHAR_TO_MORSE:
        raise HTTPException(status_code=400, detail="Invalid character")
    row = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == current_user.id, UserProgress.character == ch)
        .first()
    )
    now = datetime.now(timezone.utc)
    if row:
        row.is_learned = payload.is_learned
        row.last_practiced = now
    else:
        row = UserProgress(
            user_id=current_user.id,
            character=ch,
            is_learned=payload.is_learned,
            last_practiced=now,
        )
        db.add(row)
    db.commit()
    return {"character": ch, "is_learned": payload.is_learned}


@router.delete("/progress")
def reset_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    progress_deleted = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == current_user.id)
        .delete(synchronize_session=False)
    )
    scores_deleted = (
        db.query(QuizScore)
        .filter(QuizScore.user_id == current_user.id)
        .delete(synchronize_session=False)
    )
    db.commit()
    return {"reset_count": progress_deleted, "quiz_scores_deleted": scores_deleted}


@router.get("/stats", response_model=UserStatsResponse)
def user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    learned = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == current_user.id, UserProgress.is_learned.is_(True))
        .count()
    )
    recent = (
        db.query(QuizScore)
        .filter(QuizScore.user_id == current_user.id)
        .order_by(QuizScore.quiz_date.desc())
        .limit(5)
        .all()
    )
    percent = round((learned / TOTAL_ALPHABET) * 100, 1)
    return UserStatsResponse(
        username=current_user.username,
        learned_count=learned,
        total_characters=TOTAL_ALPHABET,
        learned_percent=percent,
        recent_scores=recent,
    )
