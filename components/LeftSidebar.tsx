"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./UserMenu";

type CategoriaItem = { nombre_es: string; nombre_en: string; emoji: string };

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
  categorias: propCategorias,
  selectedCategoria,
  onCategoriaChange,
  search,
  onSearchChange,
}: Props) {
  const { tr, lang, setLang, toggleTheme, theme } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaItem[]>(propCategorias);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch categories directly from Supabase API on mount
  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((data) => {
        const cats = (data.categorias ?? []) as Array<{
          nombre_es: string;
          nombre_en: string;
          emoji: string;
        }>;
        if (cats.length > 0) {
          setCategorias(cats.map((c) => ({
            nombre_es: c.nombre_es,
            nombre_en: c.nombre_en,
            emoji: c.emoji,
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Sync prop updates
  useEffect(() => {
    if (propCategorias.length > 0) setCategorias(propCategorias);
  }, [propCategorias]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handlePublish() {
    window.location.href = user ? "/nueva" : "/login?next=/nueva";
  }

  const selectedCat = categorias.find((c) => c.nombre_es === selectedCategoria);
  const displayName =
    selectedCategoria === "all"
      ? `🌐 ${tr("filterAll")}`
      : selectedCat
      ? `${selectedCat.emoji} ${lang === "es" ? selectedCat.nombre_es : selectedCat.nombre_en}`
      : `🌐 ${tr("filterAll")}`;

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
          {tr("categoriesLabel")}
        </p>
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer flex items-center justify-between gap-2"
          >
            <span className="truncate">{displayName}</span>
            <svg
              viewBox="0 0 20 20"
              className={`w-4 h-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {open && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-surface border border-line rounded-xl shadow-lg py-1 max-h-64 overflow-y-auto">
              <button
                onClick={() => { onCategoriaChange("all"); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-hover ${
                  selectedCategoria === "all" ? "text-accent font-semibold" : "text-foreground"
                }`}
              >
                🌐 {tr("filterAll")}
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.nombre_es}
                  onClick={() => { onCategoriaChange(cat.nombre_es); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-hover ${
                    selectedCategoria === cat.nombre_es ? "text-accent font-semibold" : "text-foreground"
                  }`}
                >
                  {cat.emoji} {lang === "es" ? cat.nombre_es : cat.nombre_en}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 mx-3 border-t border-line pt-4 flex gap-2">
        <button
          onClick={toggleTheme}
          className="flex-1 text-muted hover:text-foreground text-xs border border-line py-1.5 rounded-lg transition-colors"
        >
          {theme === "dark" ? `☀️ ${tr("lightMode")}` : `🌙 ${tr("darkMode")}`}
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
