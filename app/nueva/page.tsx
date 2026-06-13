"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const MONTOS_PRESET = [1, 2, 5, 10, 20, 50];

export default function NuevaPage() {
  const { tr } = useLanguage();
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [texto, setTexto] = useState("");
  const [montoSel, setMontoSel] = useState<number | "custom">(1);
  const [montoCustom, setMontoCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?next=/nueva&msg=login-required");
    }
  }, [authLoading, user, router]);

  const montoFinal =
    montoSel === "custom" ? parseFloat(montoCustom) || 0 : montoSel;

  const autor = profile?.username ?? "";

  const puedeEnviar =
    texto.trim().length > 0 &&
    autor.trim().length > 0 &&
    montoFinal >= 1 &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeEnviar || !user) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: texto.trim(),
          autor: autor.trim(),
          monto: montoFinal,
          categoria: "General",
          user_id: user.id,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? tr("nuevaErrorGenerico"));
        setLoading(false);
      }
    } catch {
      setError(tr("nuevaErrorConexion"));
      setLoading(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-line border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-line">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-extrabold text-foreground hover:text-muted transition-colors"
          >
            Proclama<span className="text-accent">.</span>
          </Link>
          <Link
            href="/"
            className="text-muted hover:text-foreground text-sm transition-colors"
          >
            {tr("backToWall")}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-surface border border-line rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {tr("nuevaTitle")}
          </h1>
          <p className="text-muted text-sm mb-8">{tr("nuevaDesc")}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Texto */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                {tr("nuevaTextoLabel")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value.slice(0, 280))}
                placeholder={tr("nuevaTextoPlaceholder")}
                rows={4}
                required
                className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none text-lg leading-relaxed"
              />
              <div className="flex justify-end mt-1.5">
                <span
                  className={`text-xs font-medium ${
                    texto.length >= 260 ? "text-orange-400" : "text-muted"
                  }`}
                >
                  {280 - texto.length} {tr("charactersLeft")}
                </span>
              </div>
            </div>

            {/* Autor (read-only, from profile) */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                {tr("nuevaAutorLabel")}
              </label>
              <div className="flex items-center gap-3 bg-bg border border-line rounded-xl px-4 py-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                  style={{ backgroundColor: profile?.color ?? "#3B82F6" }}
                >
                  {autor[0]?.toUpperCase()}
                </div>
                <span className="text-foreground font-medium">{autor}</span>
                <Link
                  href="/perfil"
                  className="ml-auto text-xs text-accent hover:underline"
                >
                  {tr("profileCambiar")}
                </Link>
              </div>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                {tr("nuevaMontoLabel")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {MONTOS_PRESET.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMontoSel(m)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                      montoSel === m
                        ? "bg-accent text-white"
                        : "bg-line text-muted hover:bg-hover hover:text-foreground"
                    }`}
                  >
                    ${m}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setMontoSel("custom")}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    montoSel === "custom"
                      ? "bg-accent text-white"
                      : "bg-line text-muted hover:bg-hover hover:text-foreground"
                  }`}
                >
                  {tr("nuevaOtro")}
                </button>
              </div>

              {montoSel === "custom" && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    value={montoCustom}
                    onChange={(e) => setMontoCustom(e.target.value)}
                    placeholder={tr("nuevaMin")}
                    min="1"
                    step="1"
                    className="w-full bg-bg border border-line rounded-xl pl-8 pr-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  />
                </div>
              )}

              {montoFinal >= 1 && (
                <p className="text-sm text-muted mt-2">
                  {tr("nuevaMontoPays")}{" "}
                  <span className="font-bold text-accent">
                    ${montoFinal.toFixed(2)}
                  </span>{" "}
                  {tr("nuevaMontoUSD")}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!puedeEnviar}
              className="w-full bg-accent text-white font-bold py-4 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-lg"
            >
              {loading
                ? tr("nuevaBtnLoading")
                : `${tr("nuevaBtn")}${montoFinal >= 1 ? " — $" + montoFinal.toFixed(2) : ""}`}
            </button>

            <p className="text-center text-muted text-xs">{tr("nuevaSecure")}</p>
          </form>
        </div>
      </main>
    </div>
  );
}
