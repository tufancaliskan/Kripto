from fastapi import APIRouter

from app.schemas.morse import (
    SecureTranslateRequest,
    SecureTranslateResponse,
    TranslateDirection,
    TranslateRequest,
    TranslateResponse,
)
from app.utils.morse import morse_to_text, secure_decode, secure_encode, text_to_morse

router = APIRouter(prefix="/morse", tags=["morse"])


@router.post("/translate", response_model=TranslateResponse)
def translate(payload: TranslateRequest):
    if payload.direction == TranslateDirection.text_to_morse:
        output = text_to_morse(payload.input)
    else:
        output = morse_to_text(payload.input)
    return TranslateResponse(input=payload.input, output=output, direction=payload.direction)


@router.post("/secure-translate", response_model=SecureTranslateResponse)
def secure_translate(payload: SecureTranslateRequest):
    if payload.encrypt:
        ciphertext, morse, _ = secure_encode(payload.input, payload.key)
        return SecureTranslateResponse(
            plain_text=payload.input,
            ciphertext=ciphertext,
            morse=morse,
            key=payload.key,
        )
    decrypted = secure_decode(payload.input, payload.key)
    ciphertext = morse_to_text(payload.input)
    return SecureTranslateResponse(
        morse=payload.input,
        key=payload.key,
        decrypted_plain=decrypted,
        ciphertext=ciphertext,
    )
