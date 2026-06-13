import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  GraduationCap,
  ListChecks,
  RadioTower,
  TrendingUp,
} from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { QUIZ_LEVELS } from "../components/quiz/LevelDropdown.jsx";

function formatQuizLevel(level) {
  const meta = QUIZ_LEVELS.find((l) => l.value === level);
  return meta ? `${meta.value} · ${meta.label}` : String(level ?? "—");
}

const cards = [
  {
    to: "/learn",
    icon: GraduationCap,
    title: "Alfabeyi Öğren",
    desc: "A–Z Mors kartları ve ses",
  },
  {
    to: "/translate",
    icon: ArrowLeftRight,
    title: "Çevirici",
    desc: "Metin ↔ Mors çevirisi",
  },
  {
    to: "/telegraph",
    icon: RadioTower,
    title: "Telgraf",
    desc: "Boşluk tuşu simülatörü",
  },
  {
    to: "/quiz",
    icon: ListChecks,
    title: "Quiz",
    desc: "Becerilerini test et",
  },
];

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.quizStats().then(setStats).catch(() => setStats(null));
  }, [isAuthenticated]);

  const percent = stats?.learned_percent ?? 0;
  const canReset =
    (stats?.learned_count ?? 0) > 0 || (stats?.recent_scores?.length ?? 0) > 0;

  async function handleResetProgress() {
    if (
      !window.confirm(
        "Öğrenme ilerlemesi ve son quiz sonuçları sıfırlansın mı? Bu işlem geri alınamaz."
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      await api.resetProgress();
      const fresh = await api.quizStats();
      setStats({ ...fresh, recent_scores: fresh.recent_scores ?? [] });
    } catch (err) {
      window.alert(err.message || "İlerleme sıfırlanamadı");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="glow-text text-3xl font-bold text-neon-green">
          Hoş geldin{user ? `, ${user.username}` : ""}
        </h2>
        <p className="mt-1 text-cyber-muted">Mors kriptoloji eğitim paneli</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col rounded-xl border border-cyber-border bg-cyber-panel p-6 md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-cyber-blue">
              <TrendingUp className="h-5 w-5" />
              Öğrenme İlerlemesi
            </h3>
            <span className="text-2xl font-bold text-neon-green">{percent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-cyber-bg">
            <div
              className="h-full rounded-full bg-neon-green transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-sm text-cyber-muted">
              {isAuthenticated
                ? `${stats?.learned_count ?? 0} / ${stats?.total_characters ?? 26} harf öğrenildi`
                : "Oturumlar arası ilerlemeyi kaydetmek için giriş yapın"}
            </p>
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleResetProgress}
                disabled={resetting || !canReset}
                className="shrink-0 rounded-lg border border-cyber-border px-3 py-1.5 text-xs text-cyber-muted transition hover:border-red-500/50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {resetting ? "Sıfırlanıyor…" : "İlerlemeyi sıfırla"}
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neon-green/30 bg-neon-green/5 p-6 glow-green">
          <p className="text-xs uppercase text-cyber-muted">Görev Durumu</p>
          <p className="mt-2 text-lg font-semibold text-neon-green">Aktif</p>
          <p className="mt-1 text-sm text-cyber-muted">Tüm modüller çevrimiçi</p>
        </div>
      </div>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-white">Hızlı Erişim</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ to, icon: Icon, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl border border-cyber-border bg-cyber-panel p-5 transition hover:border-neon-green/50 hover:bg-neon-green/5"
            >
              <Icon className="mb-3 h-8 w-8 text-cyber-blue group-hover:text-neon-green" />
              <h4 className="font-semibold text-white">{title}</h4>
              <p className="mt-1 text-xs text-cyber-muted">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {stats?.recent_scores?.length > 0 && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">Son Quiz Sonuçları</h3>
            <p className="text-xs text-cyber-muted">Son 5 quiz gösterilir · 6. quizte liste sıfırlanır</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-cyber-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cyber-border bg-cyber-panel text-cyber-muted">
                <tr>
                  <th className="px-4 py-3">Puan</th>
                  <th className="px-4 py-3">Doğru</th>
                  <th className="px-4 py-3">Yanlış</th>
                  <th className="px-4 py-3">Süre</th>
                  <th className="px-4 py-3">Seviye</th>
                  <th className="px-4 py-3">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_scores.map((s) => (
                  <tr key={s.id} className="border-b border-cyber-border/50">
                    <td className="px-4 py-3 text-neon-green">{s.score}%</td>
                    <td className="px-4 py-3">{s.correct_answers}</td>
                    <td className="px-4 py-3">{s.wrong_answers}</td>
                    <td className="px-4 py-3">{s.duration_seconds}s</td>
                    <td className="px-4 py-3 text-cyber-blue">{formatQuizLevel(s.level)}</td>
                    <td className="px-4 py-3 text-cyber-muted">
                      {new Date(s.quiz_date).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
