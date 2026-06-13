import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const MODES = [
  { id: "login", label: "Giriş" },
  { id: "register", label: "Kayıt" },
];

export default function AuthPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(username, password);
      else await register(username, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-cyber-bg">
      <header className="flex items-center justify-between border-b border-cyber-border px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-cyber-muted transition hover:text-neon-green"
        >
          <ArrowLeft className="h-4 w-4" />
          Ana sayfaya dön
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-neon-green" />
          <span className="glow-text font-bold text-neon-green">MorseAcademy</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-cyber-border bg-cyber-panel p-8 glow-green">
          <div className="mb-6 flex items-center gap-3">
            <Shield className="h-10 w-10 text-neon-green" />
            <div>
              <h1 className="text-xl font-bold text-neon-green">Ajan Erişimi</h1>
              <p className="text-xs text-cyber-muted">JWT ile güvenli kimlik doğrulama</p>
            </div>
          </div>

          <div className="mb-6 flex gap-2">
            {MODES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`flex-1 rounded-lg py-2 text-sm ${
                  mode === id
                    ? "bg-neon-green/20 text-neon-green"
                    : "text-cyber-muted hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adı"
              className="w-full rounded-lg border border-cyber-border bg-cyber-bg px-4 py-3 text-sm outline-none focus:border-neon-green/50"
            />
            {mode === "register" && (
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta"
                className="w-full rounded-lg border border-cyber-border bg-cyber-bg px-4 py-3 text-sm outline-none focus:border-neon-green/50"
              />
            )}
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              className="w-full rounded-lg border border-cyber-border bg-cyber-bg px-4 py-3 text-sm outline-none focus:border-neon-green/50"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-neon-green py-3 font-semibold text-cyber-bg disabled:opacity-50"
            >
              {loading ? "..." : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
