"""Morse code encoding/decoding and Caesar cipher utilities."""

MORSE_TO_CHAR: dict[str, str] = {
    ".-": "A",
    "-...": "B",
    "-.-.": "C",
    "-..": "D",
    ".": "E",
    "..-.": "F",
    "--.": "G",
    "....": "H",
    "..": "I",
    ".---": "J",
    "-.-": "K",
    ".-..": "L",
    "--": "M",
    "-.": "N",
    "---": "O",
    ".--.": "P",
    "--.-": "Q",
    ".-.": "R",
    "...": "S",
    "-": "T",
    "..-": "U",
    "...-": "V",
    ".--": "W",
    "-..-": "X",
    "-.--": "Y",
    "--..": "Z",
    "-----": "0",
    ".----": "1",
    "..---": "2",
    "...--": "3",
    "....-": "4",
    ".....": "5",
    "-....": "6",
    "--...": "7",
    "---..": "8",
    "----.": "9",
    ".-.-.-": ".",
    "--..--": ",",
    "..--..": "?",
    "-.-.--": "!",
    "-....-": "-",
    "-..-.": "/",
    "-...-": "=",
    ".-.-.": "+",
    "---...": ":",
    "-.-.-.": ";",
    "-...-.": "(",
    "-...--": ")",
    ".-..-.": '"',
    ".----.": "'",
    ".--.-.": "@",
}

CHAR_TO_MORSE: dict[str, str] = {v: k for k, v in MORSE_TO_CHAR.items()}

ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def text_to_morse(text: str) -> str:
    text = text.upper()
    words: list[str] = []
    for word in text.split():
        chars: list[str] = []
        for ch in word:
            if ch in CHAR_TO_MORSE:
                chars.append(CHAR_TO_MORSE[ch])
            elif ch == " ":
                continue
        if chars:
            words.append(" ".join(chars))
    return " / ".join(words) if words else ""


def morse_to_text(morse: str) -> str:
    morse = morse.strip()
    if not morse:
        return ""
    words: list[str] = []
    for word_token in morse.replace("  ", " ").split(" / "):
        word_token = word_token.strip()
        if not word_token:
            continue
        letters: list[str] = []
        for symbol in word_token.split():
            decoded = MORSE_TO_CHAR.get(symbol)
            if decoded:
                letters.append(decoded)
        if letters:
            words.append("".join(letters))
    return " ".join(words)


def caesar_encrypt(plain: str, key: int) -> str:
    key = key % 26
    result: list[str] = []
    for ch in plain.upper():
        if ch in ALPHABET:
            idx = (ALPHABET.index(ch) + key) % 26
            result.append(ALPHABET[idx])
        else:
            result.append(ch)
    return "".join(result)


def caesar_decrypt(cipher: str, key: int) -> str:
    return caesar_encrypt(cipher, -key)


def secure_encode(plain_text: str, key: int) -> tuple[str, str, str]:
    """Encrypt with Caesar, then encode ciphertext to Morse."""
    ciphertext = caesar_encrypt(plain_text, key)
    morse = text_to_morse(ciphertext)
    return ciphertext, morse, str(key)


def secure_decode(morse: str, key: int) -> str:
    """Decode Morse to ciphertext, then decrypt Caesar."""
    ciphertext = morse_to_text(morse)
    return caesar_decrypt(ciphertext, key)
