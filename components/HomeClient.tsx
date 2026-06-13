"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import ProclamaCard, { type Proclama } from "./ProclamaCard";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import UserMenu from "./UserMenu";

type SortKey = "monto" | "reacciones";
type CategoriaItem = { nombre: string; emoji: string };

type Props = {
  initialProclamaas: Proclama[];
  totalCount: number;
  hasMore: boolean;
  categorias: CategoriaItem[];
  totalReacciones: number;
};

export default function HomeClient({
  initialProclamaas,
  totalCount,
  hasMore: initialHasMore,
  categorias,
  totalReacciones,
}: Props) {
  const { tr } = useLanguage();
  const { user } = useAuth();

  const [proclamas, setProclamaas] = useState<Proclama[]>(initialProclamaas);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const [categoria, setCategoria] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("monto");

  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const fetchPage = useCallback(
    async (p: number, reset = false) => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(p), limit: "10", sort });
      if (categoria !== "all") params.set("categoria", categoria);
      if (debouncedSearch) params.set("q", debouncedSearch);

      try {
        const res = await fetch(`/api/proclamas?${params}`);
        const data = await res.json();
        const newProclamaas: Proclama[] = data.proclamas ?? [];

        if (reset) {
          setProclamaas(newProclamaas);
          setNewIds(new Set());
        } else {
          const ids = new Set(newProclamaas.map((p: Proclama) => p.id));
          setNewIds(ids);
          setProclamaas((prev) => [...prev, ...newProclamaas]);
          // Clear animation flag after 600ms
          setTimeout(() => setNewIds(new Set()), 600);
        }

        setPage(p + 1);
        setHasMore(data.hasMore ?? false);
      } finally {
        setLoading(false);
      }
    },
    [categoria, debouncedSearch, sort]
  );

  // Reset on filter change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
    fetchPage(1, true);
  }, [categoria, debouncedSearch, sort, fetchPage]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPage(page);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchPage]);

  const SORT_OPTS: { key: SortKey; label: string }[] = [
    { key: "monto", label: tr("sortMonto") },
    { key: "reacciones", label: tr("sortReacciones") },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-line">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-xl font-extrabold text-foreground">
            Proclama<span className="text-accent">.</span>
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <UserMenu />
            <Link
              href={user ? "/nueva" : "/login?next=/nueva"}
              className="bg-accent text-white font-bold px-4 py-1.5 rounded-xl text-sm"
            >
              {tr("publishBtn")}
            </Link>
          </div>
        </div>
        {/* Mobile search */}
        <div className="px-4 pb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr("searchPlaceholder")}
            className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        {/* Mobile category filter */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          <button
            onClick={() => setCategoria("all")}
            className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
              categoria === "all"
                ? "bg-accent text-white"
                : "bg-line text-muted"
            }`}
          >
            Todas
          </button>
          {categorias.map((c) => (
            <button
              key={c.nombre}
              onClick={() => setCategoria(c.nombre)}
              className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                categoria === c.nombre
                  ? "bg-accent text-white"
                  : "bg-line text-muted"
              }`}
            >
              {c.emoji} {c.nombre}
            </button>
          ))}
        </div>
      </header>

      {/* 3-column layout */}
      <div className="max-w-[1200px] mx-auto flex gap-0 md:gap-8 md:px-6">
        {/* Left sidebar — desktop only */}
        <aside className="hidden md:block w-[240px] shrink-0">
          <div className="sticky top-0 max-h-screen overflow-y-auto">
            <LeftSidebar
              categorias={categorias}
              totalProclamaas={totalCount}
              totalReacciones={totalReacciones}
              selectedCategoria={categoria}
              onCategoriaChange={setCategoria}
              search={search}
              onSearchChange={setSearch}
            />
          </div>
        </aside>

        {/* Center feed */}
        <main className="flex-1 min-w-0 max-w-[600px] border-x border-line">
          {/* Sort tabs */}
          <div className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-line">
            <div className="flex">
              {SORT_OPTS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  className={`flex-1 py-3 text-xs font-semibold transition-colors border-b-2 ${
                    sort === opt.key
                      ? "border-accent text-accent"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feed */}
          {proclamas.length === 0 && !loading ? (
            <div className="text-center py-28 px-4">
              <p className="text-5xl mb-5">📣</p>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {debouncedSearch || categoria !== "all"
                  ? "Sin resultados"
                  : tr("muroEmpty")}
              </h2>
              {!debouncedSearch && categoria === "all" && (
                <Link
                  href="/nueva"
                  className="mt-6 inline-block bg-accent text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-500 transition-colors"
                >
                  {tr("muroEmptyBtn")}
                </Link>
              )}
            </div>
          ) : (
            <>
              {proclamas.map((p) => (
                <ProclamaCard
                  key={p.id}
                  proclama={p}
                  isNew={newIds.has(p.id)}
                />
              ))}

              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-4" />

              {/* Loading spinner */}
              {loading && (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-line border-t-accent rounded-full animate-spin" />
                </div>
              )}

              {/* End of feed */}
              {!hasMore && proclamas.length > 0 && (
                <p className="text-center text-muted text-xs py-8">
                  — {tr("footer")} —
                </p>
              )}
            </>
          )}
        </main>

        {/* Right sidebar — large screens only */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-0 max-h-screen overflow-y-auto border-l border-line">
            <RightSidebar proclamas={proclamas} totalCount={totalCount} />
          </div>
        </aside>
      </div>
    </div>
  );
}
