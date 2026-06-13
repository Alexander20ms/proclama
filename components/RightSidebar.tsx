"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Proclama } from "./ProclamaCard";

function totalReacciones(r: Record<string, number> | null): number {
  if (!r) return 0;
  return Object.values(r).reduce((a, b) => a + b, 0);
}

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initial = name.trim()[0]?.toUpperCase() ?? "?";
  const colors = [
    "bg-blue-600", "bg-purple-600", "bg-green-600",
    "bg-orange-600", "bg-red-600", "bg-pink-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {initial}
    </div>
  );
}

export default function RightSidebar({
  proclamas,
}: {
  proclamas: Proclama[];
  totalCount?: number;
}) {
  const { lang } = useLanguage();

  const top3 = [...proclamas].sort((a, b) => b.monto - a.monto).slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];

  const recent = [...proclamas]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hoy = proclamas.filter((p) => new Date(p.created_at) >= today);
  const ingresosHoy = hoy.reduce((s, p) => s + p.monto, 0) / 100;
  const reactsHoy = hoy.reduce((s, p) => s + totalReacciones(p.reacciones), 0);

  return (
    <div className="flex flex-col gap-6 py-4 pl-6">
      {/* Rankings */}
      <div>
        <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">
          Top proclamas
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
                  {(p.monto / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div>
        <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">
          Más recientes
        </p>
        <div className="space-y-3">
          {recent.map((p) => (
            <Link
              key={p.id}
              href={`/p/${p.id}`}
              className="flex items-start gap-2 group"
            >
              <Avatar name={p.autor} />
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-xs font-medium leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                  &ldquo;{p.texto.slice(0, 60)}{p.texto.length > 60 ? "…" : ""}&rdquo;
                </p>
                <p className="text-muted text-xs mt-0.5">
                  {new Date(p.created_at).toLocaleDateString(
                    lang === "es" ? "es-ES" : "en-US",
                    { month: "short", day: "numeric" }
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Today stats */}
      <div className="border-t border-line pt-4">
        <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">
          Hoy
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted">Nuevas proclamas</span>
            <span className="text-foreground font-bold">{hoy.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">Generado</span>
            <span className="text-foreground font-bold">${ingresosHoy.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted">Reacciones</span>
            <span className="text-foreground font-bold">{reactsHoy}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
