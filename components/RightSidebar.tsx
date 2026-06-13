"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Proclama } from "./ProclamaCard";

function totalReacciones(r: Record<string, number> | null): number {
  if (!r) return 0;
  return Object.values(r).reduce((a, b) => a + b, 0);
}

function getNebulosas(p: Proclama): number {
  if (p.nebulosas && Number(p.nebulosas) > 0) return Number(p.nebulosas);
  if (p.monto && p.monto > 0) return Math.round(p.monto / 25);
  return 0;
}

function formatNebulosas(n: number): string {
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${Math.round(n)}`;
}

export default function RightSidebar({
  proclamas,
}: {
  proclamas: Proclama[];
  totalCount?: number;
}) {
  const { tr } = useLanguage();

  const top3 = [...proclamas].sort((a, b) => getNebulosas(b) - getNebulosas(a)).slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hoy = proclamas.filter((p) => new Date(p.created_at) >= today);
  const reactsHoy = hoy.reduce((s, p) => s + totalReacciones(p.reacciones), 0);

  // Top Reactor: autor with most total reactions received today
  const reaccionesPorAutor: Record<string, number> = {};
  for (const p of hoy) {
    const total = totalReacciones(p.reacciones);
    reaccionesPorAutor[p.autor] = (reaccionesPorAutor[p.autor] ?? 0) + total;
  }
  const topReactor = Object.entries(reaccionesPorAutor).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Most Replied: proclama with most apoyos today
  const mostReplied = hoy.length > 0
    ? hoy.reduce((best, p) => (p.apoyos > best.apoyos ? p : best), hoy[0])
    : null;
  const mostRepliedHasReplies = mostReplied && mostReplied.apoyos > 0;

  // Highest nebulosas today
  const highestNebHoy = hoy.length > 0
    ? hoy.reduce((best, p) => (getNebulosas(p) > getNebulosas(best) ? p : best), hoy[0])
    : null;
  const highestNebValue = highestNebHoy ? getNebulosas(highestNebHoy) : 0;

  return (
    <div className="flex flex-col gap-6 py-4 pl-6">
      {/* Top proclamas */}
      <div>
        <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">
          {tr("rightTopProclamaas")}
        </p>
        <div className="space-y-3">
          {top3.map((p, i) => (
            <Link
              key={p.id}
              href={`/p/${p.id}`}
              className="flex items-start gap-2 group"
            >
              <span className="text-base shrink-0 mt-0.5">{medals[i]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-xs font-medium leading-snug truncate group-hover:text-accent transition-colors">
                  &ldquo;{p.texto.slice(0, 55)}{p.texto.length > 55 ? "…" : ""}&rdquo;
                </p>
                <p className="text-muted text-xs mt-0.5">
                  ♦️ {formatNebulosas(getNebulosas(p))}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Today stats */}
      <div className="border-t border-line pt-4">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">
          {tr("rightHoy")}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted">{tr("rightNuevasProclamaas")}</span>
            <span className="text-foreground font-bold">{hoy.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">{tr("rightReacciones")}</span>
            <span className="text-foreground font-bold">{reactsHoy}</span>
          </div>
          <div className="flex justify-between text-xs items-center">
            <span className="text-muted">Top Reactor</span>
            <span className="text-foreground font-bold">
              {topReactor ? `@${topReactor}` : "—"}
            </span>
          </div>
          <div className="flex justify-between text-xs items-start gap-2">
            <span className="text-muted shrink-0">Most Replied</span>
            {mostRepliedHasReplies ? (
              <Link
                href={`/p/${mostReplied!.id}`}
                className="text-accent font-bold text-right hover:underline truncate max-w-[120px]"
              >
                {mostReplied!.texto.slice(0, 40)}{mostReplied!.texto.length > 40 ? "…" : ""}
              </Link>
            ) : (
              <span className="text-foreground font-bold">—</span>
            )}
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">Highest ♦️ Today</span>
            <span className="text-foreground font-bold">
              {highestNebValue > 0 ? `♦️ ${formatNebulosas(highestNebValue)}` : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
