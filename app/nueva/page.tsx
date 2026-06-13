"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getTierFromNebulosas } from "@/lib/tiers";

const NEBULOSAS_PRESET = [2, 4, 10, 20, 40, 100, 200];

export default function NuevaPage() {
  const { tr } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [texto, setTexto] = useState("");
  const [nebulasSel, setNebulasSel] = useState<number | "custom">(2);
  const [nebulasCustom, setNebulasCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saldo, setSaldo] = useState<number | null>(null);
  const [saldoLoading, setSaldoLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?next=/nueva&msg=login-required");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/billetera", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setSaldo(Number(d.nebulosas));
      }
      setSaldoLoading(false);
    })();
  }, [user]);

  const nebulasFinales =
    nebulasSel === "custom" ? parseFloat(nebulasCustom) || 0 : nebulasSel;

  const tier = getTierFromNebulosas(nebulasFinales);
  const usdEquiv = (nebulasFinales * 0.25).toFixed(2);
  const saldoSuficiente = saldo !== null && saldo >= nebulasFinales;

  const puedeEnviar =
    texto.trim().length > 0 &&
    nebulasFinales >= 2 &&
    saldoSuficiente &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeEnviar || !user) return;
    setLoading(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    try {
      const res = await fetch("/api/publicar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          texto: texto.trim(),
          nebulosas: nebulasFinales,
          categoria: "General",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(`/p/${data.proclama_id}?nueva=ok`);
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
      <header className="border-b border-line">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold text-foreground hover:text-muted transition-colors">
            Proclama<span className="text-accent">.</span>
          </Link>
          <Link href="/" className="text-muted hover:text-foreground text-sm transition-colors">
            {tr("backToWall")}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-surface border border-line rounded-2xl p-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-foreground">{tr("nuevaTitle")}</h1>
            {!saldoLoading && saldo !== null && (
              <Link
                href="/billetera"
                className="text-sm font-semibold text-accent hover:text-blue-400 transition-colors"
              >
                {saldo.toLocaleString()} ♦️
              </Link>
            )}
          </div>
          <p className="text-muted text-sm mb-8">Your words. Your truth. Make it permanent.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Texto */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                {tr("nuevaTextoLabel")} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value.slice(0, 500))}
                placeholder={tr("nuevaTextoPlaceholder")}
                rows={5}
                required
                className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none text-lg leading-relaxed"
              />
              <div className="flex justify-end mt-1.5">
                <span className={`text-xs font-medium ${texto.length >= 460 ? "text-orange-400" : "text-muted"}`}>
                  {500 - texto.length} {tr("charactersLeft")}
                </span>
              </div>
            </div>

            {/* Nebulas selector */}
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">
                Nebulas to stake <span className="text-red-500">*</span>
                <span className="text-xs font-normal ml-2">(min 2 ♦️)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {NEBULOSAS_PRESET.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNebulasSel(n)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                      nebulasSel === n
                        ? "bg-accent text-white"
                        : "bg-line text-muted hover:bg-hover hover:text-foreground"
                    }`}
                  >
                    {n} ♦️
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setNebulasSel("custom")}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                    nebulasSel === "custom"
                      ? "bg-accent text-white"
                      : "bg-line text-muted hover:bg-hover hover:text-foreground"
                  }`}
                >
                  {tr("nuevaOtro")}
                </button>
              </div>

              {nebulasSel === "custom" && (
                <div className="relative mb-3">
                  <input
                    type="number"
                    value={nebulasCustom}
                    onChange={(e) => setNebulasCustom(e.target.value)}
                    placeholder="Minimum 2"
                    min="2"
                    step="1"
                    className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  />
                </div>
              )}

              {nebulasFinales >= 2 && (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-muted">
                    ≈ <span className="font-bold text-accent">${usdEquiv} USD</span>
                  </p>
                  {tier.name && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                      {tier.authorPrefix && `${tier.authorPrefix} `}{tier.name}
                    </span>
                  )}
                  {!tier.name && (
                    <span className="text-xs text-muted">(no tier)</span>
                  )}
                </div>
              )}
            </div>

            {/* Insufficient balance warning */}
            {saldo !== null && nebulasFinales >= 2 && !saldoSuficiente && (
              <div className="bg-orange-900/20 border border-orange-800/50 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <p className="text-orange-400 text-sm font-medium">
                  Insufficient nebulas — you have {saldo} ♦️, need {nebulasFinales} ♦️
                </p>
                <Link
                  href="/billetera"
                  className="bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-colors shrink-0"
                >
                  Recharge wallet
                </Link>
              </div>
            )}

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
                : nebulasFinales >= 2
                ? `Publish — ${nebulasFinales} ♦️`
                : "Publish"}
            </button>

            <p className="text-center text-muted text-xs">
              Nebulas are deducted immediately and the proclama is published instantly.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
