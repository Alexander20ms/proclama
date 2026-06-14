"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import ProclamaCard, { type Proclama } from "./ProclamaCard";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import UserMenu from "./UserMenu";
import Link from "next/link";

const HOME_URL = "https://proclama.vercel.app";

export default function HomeClient() {
  const { tr } = useLanguage();
  const { user } = useAuth();

  const [proclamas, setProclamaciones] = useState<Proclama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/proclamas?offset=0&limit=40")
      .then((r) => r.json())
      .then((data) => {
        if (data.proclamas) setProclamaciones(data.proclamas);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isEmpty = !loading && proclamas.length === 0;

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-line">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <a
            href={HOME_URL}
            className="text-xl font-extrabold text-foreground hover:opacity-75 transition-opacity"
          >
            Proclama<span className="text-accent">.</span>
          </a>
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
        <div className="px-4 pb-3">
          <button
            onClick={() => { window.location.href = HOME_URL; }}
            className="w-full bg-accent text-white font-bold px-4 py-2.5 rounded-xl hover:bg-blue-500 transition-colors text-sm text-center"
          >
            Home
          </button>
        </div>
      </header>

      {/* 3-column layout */}
      <div className="max-w-[1200px] mx-auto flex gap-0 md:gap-8 md:px-6">
        {/* Left sidebar — desktop only */}
        <aside className="hidden md:block w-[240px] shrink-0">
          <div className="sticky top-0 max-h-screen overflow-y-auto">
            <LeftSidebar />
          </div>
        </aside>

        {/* Center feed */}
        <main className="flex-1 min-w-0 max-w-[600px] border-x border-line">
          <div className="px-3 py-4">
            {loading && (
              <div className="flex justify-center py-28">
                <div className="w-8 h-8 border-2 border-line border-t-accent rounded-full animate-spin" />
              </div>
            )}

            {isEmpty && (
              <div className="text-center py-28 px-4">
                <p className="text-5xl mb-5">📣</p>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {tr("muroEmpty")}
                </h2>
                <Link
                  href="/nueva"
                  className="mt-6 inline-block bg-accent text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-500 transition-colors"
                >
                  {tr("muroEmptyBtn")}
                </Link>
              </div>
            )}

            {proclamas.map((p) => (
              <ProclamaCard key={p.id} proclama={p} isNew={false} />
            ))}
          </div>
        </main>

        {/* Right sidebar — large screens only */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-0 max-h-screen overflow-y-auto border-l border-line">
            <RightSidebar proclamas={proclamas} totalCount={proclamas.length} />
          </div>
        </aside>
      </div>
    </div>
  );
}
