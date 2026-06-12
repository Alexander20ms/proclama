"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

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
  totalProclamaas,
  totalReacciones,
  selectedCategoria,
  onCategoriaChange,
  search,
  onSearchChange,
}: Props) {
  const { tr, lang, setLang, toggleTheme, theme } = useLanguage();

  return (
    <div className="flex flex-col gap-2 py-4">
      {/* Logo */}
      <div className="px-3 mb-2">
        <span className="text-2xl font-extrabold text-foreground tracking-tight">
          Proclama<span className="text-accent">.</span>
        </span>
        <p className="text-muted text-xs mt-0.5">{tr("tagline")}</p>
      </div>

      {/* Publish button */}
      <Link
        href="/nueva"
        className="mx-3 bg-accent text-white font-bold px-4 py-2.5 rounded-xl hover:bg-blue-500 transition-colors text-sm text-center"
      >
        {tr("publishBtn")}
      </Link>

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

      {/* Categories */}
      <div className="mt-3">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider px-3 mb-1">
          Categorías
        </p>
        <button
          onClick={() => onCategoriaChange("all")}
          className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            selectedCategoria === "all"
              ? "bg-accent/15 text-accent"
              : "text-muted hover:bg-hover hover:text-foreground"
          }`}
        >
          🌐 {tr("filterAll")}
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.nombre}
            onClick={() => onCategoriaChange(cat.nombre)}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedCategoria === cat.nombre
                ? "bg-accent/15 text-accent"
                : "text-muted hover:bg-hover hover:text-foreground"
            }`}
          >
            {cat.emoji} {cat.nombre}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 mx-3 border-t border-line pt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Proclamas</span>
          <span className="text-foreground font-bold">{totalProclamaas}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Reacciones</span>
          <span className="text-foreground font-bold">{totalReacciones}</span>
        </div>
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

      {/* Admin link */}
      <div className="px-3 mt-2">
        <Link
          href="/admin"
          className="text-muted hover:text-foreground text-xs transition-colors"
        >
          Admin →
        </Link>
      </div>
    </div>
  );
}
