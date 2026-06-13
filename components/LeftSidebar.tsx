"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./UserMenu";

type CategoriaItem = { nombre: string; emoji: string };

type Props = {
  categorias: CategoriaItem[];
  totalProclamaas: number;
  totalReacciones: number;
  selectedCategoria: string;
  onCategoriaChange: (cat: string) => void;
  search: string;
  onSearchChange: (q: string) => void;
};

export default function LeftSidebar({
  categorias,
  selectedCategoria,
  onCategoriaChange,
  search,
  onSearchChange,
}: Props) {
  const { tr, lang, setLang, toggleTheme, theme } = useLanguage();
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

      {/* Categories dropdown */}
      <div className="px-3 mt-3">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-1.5">
          Categorías
        </p>
        <select
          value={selectedCategoria}
          onChange={(e) => onCategoriaChange(e.target.value)}
          className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          <option value="all">🌐 {tr("filterAll")}</option>
          {categorias.map((cat) => (
            <option key={cat.nombre} value={cat.nombre}>
              {cat.emoji} {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div className="mt-4 mx-3 border-t border-line pt-4 flex gap-2">
        <button
          onClick={toggleTheme}
          className="flex-1 text-muted hover:text-foreground text-xs border border-line py-1.5 rounded-lg transition-colors"
        >
          {theme === "dark" ? "☀️ Claro" : "🌙 Oscuro"}
        </button>
        <button
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          className="flex-1 text-muted hover:text-foreground text-xs font-mono border border-line py-1.5 rounded-lg transition-colors"
        >
          {tr("langToggle")}
        </button>
      </div>
    </div>
  );
}
