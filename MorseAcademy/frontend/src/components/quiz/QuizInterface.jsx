import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Headphones, Loader2, RefreshCw, Send, XCircle } from "lucide-react";
import { api } from "../../api/client.js";
import { useMorseAudio } from "../../hooks/useMorseAudio.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { QUESTION_TYPE_LABELS, translateQuizPrompt } from "../../i18n/tr.js";
import LevelDropdown from "./LevelDropdown.jsx";

export default function QuizInterface() {
  const { isAuthenticated } = useAuth();
  const { playMorseString } = useMorseAudio();
  const [level, setLevel] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setAnswers({});
    try {
      const data = await api.quizQuestions(level);
      setQuestions(data.questions);
      setStartedAt(Date.now());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const gradeLocal = () => {
    let correct = 0;
    let wrong = 0;
    questions.forEach((q) => {
      const ans = (answers[q.id] || "").trim().toUpperCase();
      if (ans === (q.character || "").toUpperCase()) correct++;
      else wrong++;
    });
    return { correct, wrong };
  };

  const handleSubmit = async () => {
    const { correct, wrong } = gradeLocal();
    const duration = Math.floor((Date.now() - (startedAt || Date.now())) / 1000);
    const score = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
    setResult({ correct, wrong, score, duration });

    if (isAuthenticated) {
      try {
        await api.quizSubmit({
          level,
          answers: Object.entries(answers).map(([question_id, answer]) => ({
            question_id,
            answer,
          })),
          duration_seconds: duration,
          correct_count: correct,
          wrong_count: wrong,
        });
      } catch (e) {
        setError(e.message);
      }
    }
  };

  const setAnswer = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="glow-text text-2xl font-bold text-neon-green">Quiz Arenası</h2>
          <p className="text-sm text-cyber-muted">Çoktan seçmeli, çeviri ve sesli sorular</p>
        </div>
        <LevelDropdown
          value={level}
          onChange={setLevel}
          disabled={loading}
        />
      </header>

      {!isAuthenticated && (
        <p className="rounded-lg border border-cyber-blue/30 bg-cyber-blue/10 px-4 py-2 text-sm text-cyber-blue">
          Quiz puanlarını kaydetmek için giriş yapın.
        </p>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-neon-green" />
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-xl border border-cyber-border bg-cyber-panel p-5"
            >
              <p className="mb-3 text-xs text-cyber-muted">
                S{idx + 1} · {QUESTION_TYPE_LABELS[q.type] || q.type}
              </p>
              <p className="mb-4 font-medium">{translateQuizPrompt(q)}</p>

              {q.type === "multiple_choice" && (
                <div className="flex flex-wrap gap-2">
                  {q.options?.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswer(q.id, opt)}
                      className={`rounded-lg border px-4 py-2 text-sm transition ${
                        answers[q.id] === opt
                          ? "border-neon-green bg-neon-green/20 text-neon-green"
                          : "border-cyber-border hover:border-neon-green/40"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {(q.type === "text_input" || q.type === "audio") && (
                <div className="flex flex-wrap items-center gap-3">
                  {q.type === "audio" && (
                    <button
                      type="button"
                      onClick={() => playMorseString(q.morse)}
                      className="flex items-center gap-2 rounded-lg border border-cyber-blue/50 px-3 py-2 text-sm text-cyber-blue hover:bg-cyber-blue/10"
                    >
                      <Headphones className="h-4 w-4" />
                      Dinle
                    </button>
                  )}
                  {q.type === "text_input" && (
                    <span className="font-mono text-neon-green">{q.morse}</span>
                  )}
                  <input
                    type="text"
                    maxLength={1}
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswer(q.id, e.target.value.toUpperCase())}
                    placeholder="?"
                    className="w-16 rounded border border-cyber-border bg-cyber-bg px-3 py-2 text-center text-lg uppercase text-white"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {questions.length > 0 && !loading && !result && (
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 rounded-lg bg-neon-green px-6 py-3 font-semibold text-cyber-bg hover:opacity-90"
        >
          <Send className="h-5 w-5" />
          Quizi Gönder
        </button>
      )}

      {result && (
        <div className="rounded-xl border border-neon-green/40 bg-neon-green/10 p-6">
          <h3 className="mb-4 text-lg font-bold text-neon-green">Sonuçlar</h3>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-1 text-neon-green">
                <CheckCircle className="h-4 w-4" /> {result.correct} doğru
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <XCircle className="h-4 w-4" /> {result.wrong} yanlış
              </span>
              <span>Puan: {result.score}%</span>
              <span>Süre: {result.duration}s</span>
            </div>
            <button
              type="button"
              onClick={loadQuiz}
              disabled={loading}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-cyber-border bg-cyber-panel px-4 py-2.5 text-sm text-cyber-muted transition hover:border-neon-green/50 hover:text-neon-green disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Tekrar dene
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
