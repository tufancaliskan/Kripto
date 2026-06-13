from enum import Enum

from pydantic import BaseModel, Field


class TranslateDirection(str, Enum):
    text_to_morse = "text_to_morse"
    morse_to_text = "morse_to_text"


class TranslateRequest(BaseModel):
    input: str = Field(..., min_length=0, max_length=5000)
    direction: TranslateDirection


class TranslateResponse(BaseModel):
    input: str
    output: str
    direction: TranslateDirection


class SecureTranslateRequest(BaseModel):
    input: str = Field(..., min_length=1, max_length=2000)
    key: int = Field(default=3, ge=1, le=25)
    encrypt: bool = True


class SecureTranslateResponse(BaseModel):
    plain_text: str | None = None
    ciphertext: str | None = None
    morse: str
    key: int
    decrypted_plain: str | None = None
