"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import ProclamaCard, { type Proclama } from "./ProclamaCard";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import UserMenu from "./UserMenu";
import Link from "next/link";

type Props = {
  initialProclamaas: Proclama[];
  totalCount: number;
  hasMore: boolean;
  totalReacciones?: number;
};

export default function HomeClient({
  initialProclamaas,
  totalCount,
  hasMore: initialHasMore,
}: Props) {
  const { tr } = useLanguage();
  const { user } = useAuth();

  // Source of truth: all proclamas loaded from server
  const [allProclamaas, setAllProclamaas] = useState<Proclama[]>(initialProclamaas);
  // Displayed proclamas: filtered subset of allProclamaas
  const [proclamas, setProclamaas] = useState<Proclama[]>(initialProclamaas);

  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Client-side filter: never fetch due to search
  useEffect(() => {
    if (!search.trim()) {
      setProclamaas(allProclamaas);
      return;
    }
    const q = search.toLowerCase();
    setProclamaas(
      allProclamaas.filter(
        (p) =>
          p.texto?.toLowerCase().includes(q) ||
          p.autor?.toLowerCase().includes(q)
      )
    );
  }, [search, allProclamaas]);

  const fetchPage = useCallback(async (p: number, reset = false) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "10" });

    try {
      const res = await fetch(`/api/proclamas?${params}`);
      const data = await res.json();
      const newProclamaas: Proclama[] = data.proclamas ?? [];

      if (reset) {
        setAllProclamaas(newProclamaas);
        setNewIds(new Set());
      } else {
        const ids = new Set(newProclamaas.map((p: Proclama) => p.id));
        setNewIds(ids);
        setAllProclamaas((prev) => [...prev, ...newProclamaas]);
        setTimeout(() => setNewIds(new Set()), 600);
      }

      setPage(p + 1);
      setHasMore(data.hasMore ?? false);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const resetFeed = useCallback(async () => {
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setPage(1);
    await fetchPage(1, true);
  }, [fetchPage]);

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-line">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={resetFeed}
            className="text-xl font-extrabold text-foreground hover:opacity-75 transition-opacity"
          >
            Proclama<span className="text-accent">.</span>
          </button>
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
      </header>

      {/* 3-column layout */}
      <div className="max-w-[1200px] mx-auto flex gap-0 md:gap-8 md:px-6">
        {/* Left sidebar — desktop only */}
        <aside className="hidden md:block w-[240px] shrink-0">
          <div className="sticky top-0 max-h-screen overflow-y-auto">
            <LeftSidebar
              search={search}
              onSearchChange={setSearch}
              onReset={resetFeed}
            />
          </div>
        </aside>

        {/* Center feed */}
        <main className="flex-1 min-w-0 max-w-[600px] border-x border-line">
          <div className="px-3 py-4">
            {proclamas.length === 0 && !loading ? (
              <div className="text-center py-28 px-4">
                <p className="text-5xl mb-5">📣</p>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {search ? tr("noResults") : tr("muroEmpty")}
                </h2>
                {!search && (
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

                {loading && (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-line border-t-accent rounded-full animate-spin" />
                  </div>
                )}

                {!hasMore && proclamas.length > 0 && (
                  <p className="text-center text-muted text-xs py-8">
                    — {tr("footer")} —
                  </p>
                )}
              </>
            )}
          </div>
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
