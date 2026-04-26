"use client";

import { useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import "./admin.css";

export default function LoginGate({ children }: { children: ReactNode }) {
  const { token, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-login">
      <form onSubmit={handleSubmit} className="editor-login__form">
        <h1 className="editor-login__title">Acceso al Editor</h1>
        <p className="editor-login__subtitle">Inicia sesión con tu cuenta de administrador</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="editor-login__error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
