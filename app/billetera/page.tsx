"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type Transaccion = {
  id: string;
  tipo: string;
  nebulosas: number;
  descripcion: string | null;
  created_at: string;
};

const PACKAGES = [
  { id: "p5", amount_usd: 5, nebulosas: 20, bonus: null },
  { id: "p10", amount_usd: 10, nebulosas: 40, bonus: null },
  { id: "p20", amount_usd: 20, nebulosas: 60, bonus: "50% BONUS", hot: true },
  { id: "p50", amount_usd: 50, nebulosas: 175, bonus: "75% BONUS", best: true },
  { id: "p100", amount_usd: 100, nebulosas: 500, bonus: "25% BONUS", premium: true },
  { id: "p200", amount_usd: 200, nebulosas: 800, bonus: null },
];

const TX_ICONS: Record<string, string> = {
  recarga: "💳",
  proclama: "📢",
  respuesta: "💬",
  regalo_enviado: "🎁",
  regalo_recibido: "🎁",
  bienvenida: "🌟",
};

function formatDate(d: string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default function BilleteraPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nebulosas, setNebulosas] = useState(0);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [recargarLoading, setRecargarLoading] = useState<string | null>(null);
  const [recargarMsg, setRecargarMsg] = useState("");

  // Gift form
  const [giftUsername, setGiftUsername] = useState("");
  const [giftAmount, setGiftAmount] = useState("");
  const [giftMsg, setGiftMsg] = useState("");
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftResult, setGiftResult] = useState<{ ok?: boolean; error?: string } | null>(null);

  const fetchWallet = useCallback(async () => {
    if (!user) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch("/api/billetera", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const d = await res.json();
      setNebulosas(Number(d.nebulosas));
      setTransacciones(d.transacciones ?? []);
    }
    setDataLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login?next=/billetera");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) fetchWallet();
  }, [user, fetchWallet]);

  useEffect(() => {
    if (searchParams.get("recarga") === "ok") {
      setRecargarMsg("Recharge successful! Your nebulas have been credited.");
    }
  }, [searchParams]);

  async function handleRecharge(pkgId: string) {
    setRecargarLoading(pkgId);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch("/api/billetera/recargar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ package_id: pkgId }),
    });
    const d = await res.json();
    if (d.url) {
      window.location.href = d.url;
    } else {
      setRecargarLoading(null);
    }
  }

  async function handleGift(e: React.FormEvent) {
    e.preventDefault();
    setGiftLoading(true);
    setGiftResult(null);
    const amount = parseFloat(giftAmount);
    if (!giftUsername || !amount || amount < 1) {
      setGiftResult({ error: "Username and amount (min 1) are required" });
      setGiftLoading(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch("/api/billetera/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        para_username: giftUsername.replace(/^@/, ""),
        nebulosas: amount,
        mensaje: giftMsg.trim() || undefined,
      }),
    });
    const d = await res.json();
    if (d.ok) {
      setGiftResult({ ok: true });
      setGiftUsername(""); setGiftAmount(""); setGiftMsg("");
      fetchWallet();
    } else {
      setGiftResult({ error: d.error ?? "Error sending nebulas" });
    }
    setGiftLoading(false);
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-line border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const usdEquiv = (nebulosas * 0.25).toFixed(2);

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold text-foreground">
            Proclama<span className="text-accent">.</span>
          </Link>
          <Link href="/" className="text-muted hover:text-foreground text-sm transition-colors">
            ← Back to wall
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Balance card */}
        <div className="bg-surface border border-line rounded-2xl p-8 text-center">
          <h1 className="text-muted text-sm font-semibold uppercase tracking-wider mb-3">My Wallet</h1>
          {dataLoading ? (
            <div className="w-8 h-8 border-2 border-line border-t-accent rounded-full animate-spin mx-auto" />
          ) : (
            <>
              <div className="text-6xl font-extrabold text-foreground leading-none mb-2">
                {nebulosas.toLocaleString()} 🌌
              </div>
              <p className="text-muted text-lg">Nebulas</p>
              <p className="text-muted text-sm mt-1">≈ ${usdEquiv} USD</p>
            </>
          )}
        </div>

        {recargarMsg && (
          <div className="bg-emerald-900/20 border border-emerald-800/50 text-emerald-400 text-sm px-4 py-3 rounded-xl text-center font-medium">
            {recargarMsg}
          </div>
        )}

        {/* Offer banners */}
        <div className="space-y-3">
          {/* $50 best value — most prominent */}
          <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-purple-900 via-purple-800 to-pink-800 border border-purple-600/50 shimmer-banner">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 animate-pulse" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-extrabold text-xl">⚡ BEST VALUE</p>
                  <p className="text-purple-200 text-sm mt-0.5">Recharge $50 and get <span className="text-white font-bold">75% MORE nebulas!</span></p>
                  <p className="text-purple-300 text-xs mt-1">175 🌌 instead of 100 🌌</p>
                </div>
                <button
                  onClick={() => handleRecharge("p50")}
                  disabled={!!recargarLoading}
                  className="bg-white text-purple-900 font-extrabold px-5 py-2.5 rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-60 text-sm shrink-0 ml-4"
                >
                  {recargarLoading === "p50" ? "…" : "Get $50"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {/* $20 hot deal */}
            <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-orange-900 to-yellow-800 border border-orange-600/50">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-yellow-500/10 animate-pulse" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">🔥 HOT DEAL</p>
                  <p className="text-orange-200 text-xs mt-0.5">Recharge $20, get <span className="text-white font-semibold">50% more!</span></p>
                  <p className="text-orange-300 text-xs">60 🌌 instead of 40 🌌</p>
                </div>
                <button
                  onClick={() => handleRecharge("p20")}
                  disabled={!!recargarLoading}
                  className="bg-white text-orange-900 font-bold px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors disabled:opacity-60 text-xs shrink-0 ml-3"
                >
                  {recargarLoading === "p20" ? "…" : "$20"}
                </button>
              </div>
            </div>

            {/* $100 premium */}
            <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-blue-900 to-cyan-800 border border-blue-600/50">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-cyan-500/10 animate-pulse" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">💎 PREMIUM</p>
                  <p className="text-blue-200 text-xs mt-0.5">Recharge $100, get <span className="text-white font-semibold">25% more!</span></p>
                  <p className="text-blue-300 text-xs">500 🌌 instead of 400 🌌</p>
                </div>
                <button
                  onClick={() => handleRecharge("p100")}
                  disabled={!!recargarLoading}
                  className="bg-white text-blue-900 font-bold px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-60 text-xs shrink-0 ml-3"
                >
                  {recargarLoading === "p100" ? "…" : "$100"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recharge table */}
        <div className="bg-surface border border-line rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="text-foreground font-bold text-lg">Recharge Nebulas 🌌</h2>
          </div>
          <div className="divide-y divide-line">
            {PACKAGES.map((pkg) => (
              <div key={pkg.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <span className="text-foreground font-bold text-lg">${pkg.amount_usd}</span>
                  <div>
                    <span className="text-foreground font-semibold">{pkg.nebulosas} 🌌</span>
                    {pkg.bonus && (
                      <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                        +{pkg.bonus}
                      </span>
                    )}
                    <p className="text-muted text-xs mt-0.5">≈ ${(pkg.nebulosas * 0.25).toFixed(2)} value</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRecharge(pkg.id)}
                  disabled={!!recargarLoading}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 ${
                    pkg.best
                      ? "bg-accent text-white hover:bg-blue-500"
                      : "bg-line text-foreground hover:bg-hover"
                  }`}
                >
                  {recargarLoading === pkg.id ? "…" : "Buy"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Send nebulas */}
        <div className="bg-surface border border-line rounded-2xl p-6">
          <h2 className="text-foreground font-bold text-lg mb-4">Send Nebulas 🌌</h2>
          <form onSubmit={handleGift} className="space-y-3">
            <input
              type="text"
              value={giftUsername}
              onChange={(e) => setGiftUsername(e.target.value)}
              placeholder="@username"
              required
              className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent text-sm"
            />
            <div className="flex gap-3">
              <input
                type="number"
                value={giftAmount}
                onChange={(e) => setGiftAmount(e.target.value)}
                placeholder="Amount (min 1)"
                min="1"
                step="1"
                required
                className="flex-1 bg-bg border border-line rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent text-sm"
              />
              <button
                type="submit"
                disabled={giftLoading || !giftUsername || !giftAmount}
                className="bg-accent text-white font-bold px-5 py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40 text-sm"
              >
                {giftLoading ? "…" : "Send 🌌"}
              </button>
            </div>
            <input
              type="text"
              value={giftMsg}
              onChange={(e) => setGiftMsg(e.target.value)}
              placeholder="Message (optional)"
              maxLength={100}
              className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent text-sm"
            />
            {giftResult?.ok && (
              <p className="text-emerald-400 text-sm font-medium">Nebulas sent successfully!</p>
            )}
            {giftResult?.error && (
              <p className="text-red-400 text-sm">{giftResult.error}</p>
            )}
          </form>
        </div>

        {/* Transaction history */}
        <div className="bg-surface border border-line rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="text-foreground font-bold text-lg">Transaction History</h2>
          </div>
          {dataLoading ? (
            <div className="p-8 text-center text-muted text-sm">Loading...</div>
          ) : transacciones.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">No transactions yet.</div>
          ) : (
            <div className="divide-y divide-line">
              {transacciones.map((tx) => {
                const isPositive = Number(tx.nebulosas) > 0;
                return (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{TX_ICONS[tx.tipo] ?? "🌌"}</span>
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {tx.descripcion ?? tx.tipo}
                        </p>
                        <p className="text-muted text-xs">{formatDate(tx.created_at)}</p>
                      </div>
                    </div>
                    <span
                      className={`font-bold text-sm ${
                        isPositive ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}{Number(tx.nebulosas).toFixed(0)} 🌌
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
