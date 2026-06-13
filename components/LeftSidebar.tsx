"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import UserMenu from "./UserMenu";

type Props = {
  search: string;
  onSearchChange: (q: string) => void;
  onReset?: () => void;
};

export default function LeftSidebar({ search, onSearchChange, onReset }: Props) {
  const { tr, toggleTheme, theme } = useLanguage();
  const { user } = useAuth();
  const [nebulosas, setNebulosas] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { setNebulosas(null); return; }
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/billetera", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setNebulosas(Number(d.nebulosas));
      }
    })();
  }, [user]);

  function handlePublish() {
    window.location.href = user ? "/nueva" : "/login?next=/nueva";
  }

  return (
    <div className="flex flex-col gap-2 py-4">
      {/* Logo + UserMenu */}
      <div className="px-3 mb-1 flex items-start justify-between gap-2">
        <div>
          <button
            onClick={onReset}
            className="text-2xl font-extrabold text-foreground tracking-tight hover:opacity-75 transition-opacity text-left"
          >
            Proclama<span className="text-accent">.</span>
          </button>
          <p className="text-muted text-xs mt-0.5">{tr("tagline")}</p>
        </div>
        <div className="pt-0.5">
          <UserMenu />
        </div>
      </div>

      {/* Home button */}
      <button
        onClick={onReset}
        className="mx-3 flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors py-1"
      >
        <span>🏠</span>
        <span>Home</span>
      </button>

      {/* Publish button */}
      <button
        onClick={handlePublish}
        className="mx-3 bg-accent text-white font-bold px-4 py-2.5 rounded-xl hover:bg-blue-500 transition-colors text-sm text-center"
      >
        {tr("publishBtn")}
      </button>

      {/* Wallet link — only when logged in */}
      {user && nebulosas !== null && (
        <Link
          href="/billetera"
          className="mx-3 flex items-center justify-center gap-1.5 border border-line rounded-xl px-4 py-2 text-sm font-semibold text-foreground hover:bg-hover transition-colors"
        >
          <span>♦️</span>
          <span>{nebulosas.toLocaleString()} nebulas</span>
        </Link>
      )}

      {/* Search */}
      <div className="px-3 mt-2">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={tr("searchPlaceholder")}
          className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
        />
      </div>

      {/* Theme toggle */}
      <div className="mt-4 mx-3 border-t border-line pt-4">
        <button
          onClick={toggleTheme}
          className="w-full text-muted hover:text-foreground text-xs border border-line py-1.5 rounded-lg transition-colors"
        >
          {theme === "dark" ? `☀️ ${tr("lightMode")}` : `🌙 ${tr("darkMode")}`}
        </button>
      </div>
    </div>
  );
}
