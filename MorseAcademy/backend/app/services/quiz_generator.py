import random
import uuid

from app.schemas.quiz import QuestionType, QuizQuestion
from app.utils.morse import CHAR_TO_MORSE, MORSE_TO_CHAR

LETTERS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")


def _distractors(correct: str, count: int = 3) -> list[str]:
    pool = [c for c in LETTERS if c != correct]
    return random.sample(pool, min(count, len(pool)))


def generate_questions(level: int, count: int = 5) -> list[QuizQuestion]:
    level = max(1, min(5, level))
    pool = LETTERS[: 6 + level * 4]
    questions: list[QuizQuestion] = []
    types_cycle = [QuestionType.multiple_choice, QuestionType.text_input, QuestionType.audio]

    for i in range(count):
        char = random.choice(pool)
        morse = CHAR_TO_MORSE[char]
        qtype = types_cycle[i % 3]
        qid = str(uuid.uuid4())

        if qtype == QuestionType.multiple_choice:
            options = _distractors(char)
            options.append(char)
            random.shuffle(options)
            questions.append(
                QuizQuestion(
                    id=qid,
                    type=qtype,
                    prompt=f"Which letter matches Morse: {morse}?",
                    character=char,
                    morse=morse,
                    options=options,
                )
            )
        elif qtype == QuestionType.text_input:
            questions.append(
                QuizQuestion(
                    id=qid,
                    type=qtype,
                    prompt=f"Type the letter for Morse: {morse}",
                    character=char,
                    morse=morse,
                )
            )
        else:
            questions.append(
                QuizQuestion(
                    id=qid,
                    type=qtype,
                    prompt="Listen and type the correct letter.",
                    character=char,
                    morse=morse,
                )
            )
    return questions


def grade_answers(questions: list[QuizQuestion], answers: dict[str, str]) -> tuple[int, int]:
    correct = 0
    wrong = 0
    for q in questions:
        user_ans = answers.get(q.id, "").strip().upper()
        expected = (q.character or "").upper()
        if user_ans == expected:
            correct += 1
        else:
            wrong += 1
    return correct, wrong
