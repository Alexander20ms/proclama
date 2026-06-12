"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type Proclama = {
  id: string;
  texto: string;
  autor: string;
  monto: number;
  categoria: string;
  publicada: boolean;
  stripe_session_id: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [autenticado, setAutenticado] = useState(false);
  const [proclamas, setProclamAs] = useState<Proclama[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const login = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/proclamas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        setProclamAs(data.proclamas);
        setAutenticado(true);
      } else {
        setError("Contraseña incorrecta");
      }
      setLoading(false);
    },
    [password]
  );

  async function handleDelete(id: string, texto: string) {
    if (!confirm(`¿Eliminar permanentemente esta proclama?\n\n"${texto.slice(0, 80)}..."`)) return;
    setActionLoading(id + "-delete");

    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });

    if (res.ok) {
      setProclamAs((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Error al eliminar. Intenta de nuevo.");
    }
    setActionLoading(null);
  }

  async function handleToggle(id: string) {
    setActionLoading(id + "-toggle");

    const res = await fetch("/api/admin/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setProclamAs((prev) =>
        prev.map((p) => (p.id === id ? { ...p, publicada: data.publicada } : p))
      );
    } else {
      alert("Error al cambiar estado. Intenta de nuevo.");
    }
    setActionLoading(null);
  }

  // ── Pantalla de login ─────────────────────────────────────────────
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <p className="text-3xl mb-2">🔒</p>
            <h1 className="text-2xl font-bold text-gray-900">Panel Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Solo acceso autorizado</p>
          </div>

          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7] focus:border-transparent"
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-[#534AB7] text-white font-bold py-3 rounded-xl hover:bg-[#3D3589] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-400 text-sm hover:text-gray-600">
              ← Volver al muro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Panel principal ───────────────────────────────────────────────
  const publicadas = proclamas.filter((p) => p.publicada).length;
  const ocultas = proclamas.filter((p) => !p.publicada).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#534AB7] text-white">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-extrabold hover:text-purple-200 transition-colors">
              Proclama
            </Link>
            <span className="bg-purple-800 text-purple-200 text-xs font-semibold px-2.5 py-1 rounded-full">
              Admin
            </span>
          </div>
          <Link href="/" className="text-purple-200 hover:text-white text-sm transition-colors">
            ← Ver muro público
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Todas las proclamas ({proclamas.length})
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {publicadas} publicadas
            </span>
            <span className="flex items-center gap-1.5 text-orange-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
              {ocultas} ocultas
            </span>
          </div>
        </div>

        {/* Lista */}
        {proclamas.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No hay proclamas aún.</div>
        ) : (
          <div className="space-y-3">
            {proclamas.map((p) => {
              const isDeleting = actionLoading === p.id + "-delete";
              const isToggling = actionLoading === p.id + "-toggle";
              const busy = isDeleting || isToggling;

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-xl border px-5 py-4 transition-colors ${
                    p.publicada
                      ? "border-gray-100"
                      : "border-orange-100 bg-orange-50/40"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium leading-snug mb-2">
                        &ldquo;{p.texto}&rdquo;
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <span className="text-gray-500">— {p.autor}</span>
                        <span className="font-bold text-emerald-600">
                          ${(p.monto / 100).toFixed(2)}
                        </span>
                        <span className="text-gray-400">
                          {new Date(p.created_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span
                          className={`font-semibold ${
                            p.publicada ? "text-emerald-600" : "text-orange-500"
                          }`}
                        >
                          {p.publicada ? "● Publicada" : "○ Oculta"}
                        </span>
                        <span className="text-gray-300 text-xs font-mono truncate max-w-[180px]">
                          {p.stripe_session_id ?? "sin session"}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleToggle(p.id)}
                        disabled={busy}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          p.publicada
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        }`}
                      >
                        {isToggling ? "..." : p.publicada ? "Ocultar" : "Mostrar"}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.texto)}
                        disabled={busy}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
