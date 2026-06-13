"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./UserMenu";

type Props = {
  search: string;
  onSearchChange: (q: string) => void;
};

export default function LeftSidebar({ search, onSearchChange }: Props) {
  const { tr, toggleTheme, theme } = useLanguage();
  const { user } = useAuth();

  function handlePublish() {
    window.location.href = user ? "/nueva" : "/login?next=/nueva";
  }

  return (
    <div className="flex flex-col gap-2 py-4">
      {/* Logo + UserMenu */}
      <div className="px-3 mb-2 flex items-start justify-between gap-2">
        <div>
          <span className="text-2xl font-extrabold text-foreground tracking-tight">
            Proclama<span className="text-accent">.</span>
          </span>
          <p className="text-muted text-xs mt-0.5">{tr("tagline")}</p>
        </div>
        <div className="pt-0.5">
          <UserMenu />
        </div>
      </div>

      {/* Publish button */}
      <button
        onClick={handlePublish}
        className="mx-3 bg-accent text-white font-bold px-4 py-2.5 rounded-xl hover:bg-blue-500 transition-colors text-sm text-center"
      >
        {tr("publishBtn")}
      </button>

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
