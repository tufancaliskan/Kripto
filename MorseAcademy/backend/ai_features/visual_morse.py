"""
Visual Morse via eye-blink detection (OpenCV + MediaPipe Face Mesh).

Blink duration mapping:
  - Short blink (< 200ms)  -> dot (.)
  - Long blink  (>= 200ms) -> dash (-)
  - Idle > 400ms between blinks -> end of character
  - Idle > 1000ms -> end of word

This module provides a stub implementation suitable for extension in a
cryptography lab demo. Requires webcam and optional heavy deps.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Callable

try:
    import cv2
    import mediapipe as mp
except ImportError:  # pragma: no cover
    cv2 = None
    mp = None


EYE_AR_THRESH = 0.21
DOT_MS = 200
CHAR_GAP_MS = 400
WORD_GAP_MS = 1000


@dataclass
class VisualMorseState:
    morse_buffer: str = ""
    message: str = ""
    blink_start: float | None = None
    last_event: float = field(default_factory=time.time)


def eye_aspect_ratio(landmarks, left_indices, right_indices) -> float:
    """Compute average eye aspect ratio from face mesh landmarks."""
    def dist(i, j):
        a = landmarks[i]
        b = landmarks[j]
        return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5

    left = (dist(left_indices[1], left_indices[5]) + dist(left_indices[2], left_indices[4])) / (
        2.0 * dist(left_indices[0], left_indices[3]) + 1e-6
    )
    right = (dist(right_indices[1], right_indices[5]) + dist(right_indices[2], right_indices[4])) / (
        2.0 * dist(right_indices[0], right_indices[3]) + 1e-6
    )
    return (left + right) / 2.0


class VisualMorseTracker:
    """Tracks blinks and builds Morse sequences from webcam input."""

    def __init__(self, on_update: Callable[[str, str], None] | None = None):
        if cv2 is None or mp is None:
            raise RuntimeError("opencv-python and mediapipe are required for VisualMorseTracker")
        self.on_update = on_update
        self.state = VisualMorseState()
        self._mp_face = mp.solutions.face_mesh
        self._face = self._mp_face.FaceMesh(max_num_faces=1, refine_landmarks=True)
        # MediaPipe Face Mesh eye landmark indices (simplified)
        self._left_eye = [33, 160, 158, 133, 153, 144]
        self._right_eye = [362, 385, 387, 263, 373, 380]

    def _flush_gaps(self, now: float) -> None:
        idle_ms = (now - self.state.last_event) * 1000
        if idle_ms > WORD_GAP_MS and self.state.morse_buffer:
            self.state.message += " "
            self.state.morse_buffer = ""
        elif idle_ms > CHAR_GAP_MS and self.state.morse_buffer.endswith((".", "-")):
            self.state.morse_buffer += " "

    def _register_blink(self, duration_ms: float) -> None:
        symbol = "." if duration_ms < DOT_MS else "-"
        self.state.morse_buffer += symbol
        self.state.last_event = time.time()
        if self.on_update:
            self.on_update(self.state.morse_buffer, self.state.message)

    def process_frame(self, frame) -> tuple[bool, str]:
        """Process one BGR frame; returns (eyes_closed, current_morse_buffer)."""
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self._face.process(rgb)
        now = time.time()
        self._flush_gaps(now)
        eyes_closed = False
        if results.multi_face_landmarks:
            lm = results.multi_face_landmarks[0].landmark
            ear = eye_aspect_ratio(lm, self._left_eye, self._right_eye)
            if ear < EYE_AR_THRESH:
                eyes_closed = True
                if self.state.blink_start is None:
                    self.state.blink_start = now
            elif self.state.blink_start is not None:
                duration_ms = (now - self.state.blink_start) * 1000
                self._register_blink(duration_ms)
                self.state.blink_start = None
        return eyes_closed, self.state.morse_buffer

    def run_webcam(self, camera_index: int = 0) -> None:
        """Blocking demo loop — press Q to quit."""
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            raise RuntimeError("Webcam not available")
        try:
            while cap.isOpened():
                ok, frame = cap.read()
                if not ok:
                    break
                closed, buf = self.process_frame(frame)
                color = (0, 255, 102) if not closed else (255, 80, 80)
                cv2.putText(frame, f"Morse: {buf}", (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
                cv2.imshow("MorseAcademy Visual Morse", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
        finally:
            cap.release()
            cv2.destroyAllWindows()
            self._face.close()


def run_stub_demo() -> None:
    """CLI entry for lab — prints instructions if deps missing."""
    if cv2 is None or mp is None:
        print("Install opencv-python and mediapipe to run visual Morse.")
        return
    tracker = VisualMorseTracker()
    print("Visual Morse: blink short=dot, long=dash. Press Q to exit.")
    tracker.run_webcam()


if __name__ == "__main__":
    run_stub_demo()
