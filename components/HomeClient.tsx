"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import ProclamaCard, { type Proclama } from "./ProclamaCard";
import Rankings from "./Rankings";

export default function HomeClient({ proclamas }: { proclamas: Proclama[] }) {
  const { tr, lang, setLang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-[#1E1E1E] sticky top-0 bg-[#0A0A0A]/95 backdrop-blur z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Proclama<span className="text-[#3B82F6]">.</span>
            </span>
            <p className="text-[#A0A0A0] text-xs mt-0.5 hidden sm:block">
              {tr("tagline")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="text-[#A0A0A0] hover:text-white text-xs font-mono border border-[#1E1E1E] px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {tr("langToggle")}
            </button>
            <Link
              href="/nueva"
              className="bg-[#3B82F6] text-white font-semibold px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors text-sm whitespace-nowrap"
            >
              {tr("publishBtn")}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Rankings */}
        {proclamas.length >= 1 && <Rankings proclamas={proclamas} />}

        {/* Muro */}
        {proclamas.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#A0A0A0] text-sm">
                {proclamas.length} {tr("muroCount")}
              </p>
              <p className="text-[#A0A0A0] text-xs">{tr("muroSorted")}</p>
            </div>
            <div className="space-y-3">
              {proclamas.map((p) => (
                <ProclamaCard key={p.id} proclama={p} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-28">
            <p className="text-5xl mb-5">📣</p>
            <h2 className="text-2xl font-bold text-white mb-2">
              {tr("muroEmpty")}
            </h2>
            <p className="text-[#A0A0A0] mb-8 text-base">{tr("muroEmptyDesc")}</p>
            <Link
              href="/nueva"
              className="bg-[#3B82F6] text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-500 transition-colors inline-block"
            >
              {tr("muroEmptyBtn")}
            </Link>
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-[#A0A0A0] text-xs border-t border-[#1E1E1E] mt-8">
        {tr("footer")}
      </footer>
    </div>
  );
}
