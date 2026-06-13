"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RegistroPage() {
  const router = useRouter();
  const { tr } = useLanguage();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? tr("nuevaErrorGenerico"));
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      setSuccess("Welcome! You received 40 🌌 nebulas to get started");
      setTimeout(() => router.push("/"), 1800);
    } catch {
      setError(tr("nuevaErrorConexion"));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="block text-center mb-8">
          <span className="text-4xl font-extrabold text-foreground tracking-tight">
            Proclama<span className="text-accent">.</span>
          </span>
          <p className="text-muted text-sm mt-1">{tr("tagline")}</p>
        </Link>

        <div className="bg-surface border border-line rounded-2xl p-8">
          <h1 className="text-xl font-bold text-foreground mb-6">{tr("registerTitle")}</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
                {tr("registerUsernameLabel")}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="your_username"
                required
                minLength={3}
                maxLength={30}
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="text-muted text-xs mt-1">{tr("registerUsernameHint")}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
                {tr("profileEmailLabel")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
                {tr("loginPasswordPlaceholder")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tr("registerPasswordHint")}
                required
                minLength={6}
                className="w-full bg-bg border border-line rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-900/20 border border-emerald-800/50 text-emerald-400 text-sm px-4 py-3 rounded-xl font-medium text-center">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !email || !password}
              className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? tr("registerBtnLoading") : tr("registerBtn")}
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-6">
            {tr("alreadyAccount")}{" "}
            <Link href="/login" className="text-accent hover:underline font-medium">
              {tr("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
