"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegistroPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create user + profile via server route (uses service role)
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error creating account");
        setLoading(false);
        return;
      }

      // Sign in immediately after registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push("/");
    } catch {
      setError("Connection error. Try again.");
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
          <p className="text-muted text-sm mt-1">Value your opinions.</p>
        </Link>

        <div className="bg-surface border border-line rounded-2xl p-8">
          <h1 className="text-xl font-bold text-foreground mb-6">Create account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
                Username
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
              <p className="text-muted text-xs mt-1">Letters, numbers, underscores. 3–30 chars.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider">
                Email
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
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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

            <button
              type="submit"
              disabled={loading || !username || !email || !password}
              className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
