import { NavLink } from "react-router-dom";
import {
  ArrowLeftRight,
  Gauge,
  GraduationCap,
  ListChecks,
  LogIn,
  LogOut,
  RadioTower,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", icon: Gauge, label: "Panel" },
  { to: "/learn", icon: GraduationCap, label: "Öğren" },
  { to: "/translate", icon: ArrowLeftRight, label: "Çevir" },
  { to: "/telegraph", icon: RadioTower, label: "Telgraf" },
  { to: "/quiz", icon: ListChecks, label: "Quiz" },
];

export default function Sidebar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-cyber-border bg-cyber-panel">
      <div className="border-b border-cyber-border p-6">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-neon-green" />
          <div>
            <h1 className="glow-text text-lg font-bold text-neon-green">MorseAcademy</h1>
            <p className="text-xs text-cyber-muted">Kriptoloji Lab v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-all ${
                isActive
                  ? "border-neon-green text-neon-green"
                  : "border-transparent text-cyber-muted hover:border-cyber-border hover:text-white"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-cyber-border p-4">
        {isAuthenticated ? (
          <>
            <p className="mb-2 truncate text-xs text-cyber-muted">
              Ajan: <span className="text-cyber-blue">{user?.username}</span>
            </p>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyber-border py-2 text-sm text-cyber-muted hover:border-red-500/50 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Çıkış
            </button>
          </>
        ) : (
          <NavLink
            to="/auth"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neon-green/40 py-2 text-sm text-neon-green hover:border-neon-green"
          >
            <LogIn className="h-4 w-4" />
            Giriş / Kayıt
          </NavLink>
        )}
      </div>
    </aside>
  );
}
