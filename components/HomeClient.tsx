"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import ProclamaCard, { type Proclama } from "./ProclamaCard";
import Rankings from "./Rankings";

type SortKey = "monto" | "fecha" | "reacciones";

function totalReacciones(r: Record<string, number> | null): number {
  if (!r) return 0;
  return Object.values(r).reduce((a, b) => a + b, 0);
}

export default function HomeClient({
  proclamas,
  categorias,
}: {
  proclamas: Proclama[];
  categorias: string[];
}) {
  const { tr, lang, setLang, toggleTheme, theme } = useLanguage();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("monto");

  const filtered = useMemo(() => {
    let list = [...proclamas];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.texto.toLowerCase().includes(q) ||
          p.autor.toLowerCase().includes(q)
      );
    }

    if (catFilter !== "all") {
      list = list.filter((p) => p.categoria === catFilter);
    }

    list.sort((a, b) => {
      if (sort === "monto") return b.monto - a.monto;
      if (sort === "fecha")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sort === "reacciones")
        return totalReacciones(b.reacciones) - totalReacciones(a.reacciones);
      return 0;
    });

    return list;
  }, [proclamas, search, catFilter, sort]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-line sticky top-0 bg-bg/95 backdrop-blur z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold text-foreground tracking-tight">
              Proclama<span className="text-accent">.</span>
            </span>
            <p className="text-muted text-xs mt-0.5 hidden sm:block">
              {tr("tagline")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="text-muted hover:text-foreground text-base border border-line px-2.5 py-1.5 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? tr("themeToggleDark") : tr("themeToggleLight")}
            </button>
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="text-muted hover:text-foreground text-xs font-mono border border-line px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {tr("langToggle")}
            </button>
            <Link
              href="/nueva"
              className="bg-accent text-white font-semibold px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors text-sm whitespace-nowrap"
            >
              {tr("publishBtn")}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Rankings */}
        {proclamas.length >= 1 && <Rankings proclamas={proclamas} />}

        {/* Search + Filter + Sort */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr("searchPlaceholder")}
            className="flex-1 bg-surface border border-line rounded-xl px-4 py-2.5 text-foreground placeholder-muted text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
          />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-surface border border-line rounded-xl px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            <option value="all">{tr("filterAll")}</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-surface border border-line rounded-xl px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            <option value="monto">{tr("sortMonto")}</option>
            <option value="fecha">{tr("sortFecha")}</option>
            <option value="reacciones">{tr("sortReacciones")}</option>
          </select>
        </div>

        {/* Muro */}
        {proclamas.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted text-sm">
                {filtered.length} {tr("muroCount")}
              </p>
            </div>
            {filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((p) => (
                  <ProclamaCard key={p.id} proclama={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted">
                Sin resultados para &ldquo;{search}&rdquo;
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-28">
            <p className="text-5xl mb-5">📣</p>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {tr("muroEmpty")}
            </h2>
            <p className="text-muted mb-8 text-base">{tr("muroEmptyDesc")}</p>
            <Link
              href="/nueva"
              className="bg-accent text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-500 transition-colors inline-block"
            >
              {tr("muroEmptyBtn")}
            </Link>
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-muted text-xs border-t border-line mt-8">
        {tr("footer")}
      </footer>
    </div>
  );
}
