"use client";

import { useState } from "react";
import Link from "next/link";
import ReactionBar from "./ReactionBar";
import ApoyoModal from "./ApoyoModal";
import { useLanguage } from "@/contexts/LanguageContext";

export type Proclama = {
  id: string;
  texto: string;
  autor: string;
  monto: number;
  categoria: string;
  reacciones: Record<string, number>;
  created_at: string;
  apoyos: number;
  monto_total: number;
};

export default function ProclamaCard({ proclama }: { proclama: Proclama }) {
  const { lang, tr } = useLanguage();
  const [showApoyo, setShowApoyo] = useState(false);

  const monto = (proclama.monto / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  const fecha = new Date(proclama.created_at).toLocaleDateString(
    lang === "es" ? "es-ES" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );

  return (
    <>
      <div className="bg-surface border border-line rounded-2xl px-6 py-5 hover:border-hover transition-colors">
        <Link href={`/p/${proclama.id}`} className="block group">
          <p className="text-foreground text-lg font-medium leading-relaxed mb-4 group-hover:text-accent transition-colors">
            &ldquo;{proclama.texto}&rdquo;
          </p>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-muted text-sm">— {proclama.autor}</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted font-medium px-2.5 py-1 rounded-full bg-line">
              {proclama.categoria}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent/15 text-accent">
              {monto}
            </span>
            <span className="text-xs text-muted">{fecha}</span>
          </div>
        </div>

        {/* Creyentes */}
        {(proclama.apoyos > 0 || proclama.monto_total > 0) && (
          <div className="flex items-center gap-3 mt-3 text-xs text-muted">
            <span>
              🤝 {proclama.apoyos} {tr("creyentesCount")}
            </span>
            {proclama.monto_total > 0 && (
              <span>
                ${proclama.monto_total.toFixed(2)} {tr("creyentesTotal")}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <ReactionBar
            proclamaId={proclama.id}
            initialReacciones={proclama.reacciones ?? {}}
          />
          <button
            onClick={() => setShowApoyo(true)}
            className="text-xs font-semibold text-accent border border-accent/30 px-3 py-1.5 rounded-full hover:bg-accent/10 transition-colors whitespace-nowrap"
          >
            {tr("apoyoBtn")}
          </button>
        </div>
      </div>

      {showApoyo && (
        <ApoyoModal
          proclama={proclama}
          onClose={() => setShowApoyo(false)}
        />
      )}
    </>
  );
}
