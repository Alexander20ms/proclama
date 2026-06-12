"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Proclama } from "./ProclamaCard";

function totalReacciones(r: Record<string, number> | null): number {
  if (!r) return 0;
  return Object.values(r).reduce((a, b) => a + b, 0);
}

function top3(list: Proclama[]): Proclama[] {
  return list.slice(0, 3);
}

function RankItem({
  pos,
  proclama,
  metric,
}: {
  pos: number;
  proclama: Proclama;
  metric: string;
}) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#1E1E1E] last:border-0">
      <span className="text-xl shrink-0 w-7 text-center">{medals[pos]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium leading-snug truncate">
          &ldquo;{proclama.texto.slice(0, 72)}{proclama.texto.length > 72 ? "…" : ""}&rdquo;
        </p>
        <p className="text-[#A0A0A0] text-xs mt-0.5">— {proclama.autor}</p>
      </div>
      <span className="text-[#3B82F6] text-xs font-bold shrink-0 ml-2">{metric}</span>
    </div>
  );
}

export default function Rankings({ proclamas }: { proclamas: Proclama[] }) {
  const { tr } = useLanguage();
  const [tab, setTab] = useState<0 | 1 | 2>(0);

  const byMonto = top3([...proclamas].sort((a, b) => b.monto - a.monto));
  const byLoved = top3(
    [...proclamas].sort((a, b) => totalReacciones(b.reacciones) - totalReacciones(a.reacciones))
  );
  const byImpact = top3(
    [...proclamas].sort(
      (a, b) => (b.reacciones?.["🤯"] || 0) - (a.reacciones?.["🤯"] || 0)
    )
  );

  const tabs = [tr("rankTab1"), tr("rankTab2"), tr("rankTab3")];
  const lists = [byMonto, byLoved, byImpact];
  const metrics = [
    (p: Proclama) =>
      "$" + (p.monto / 100).toLocaleString("en-US", { minimumFractionDigits: 0 }),
    (p: Proclama) => `${totalReacciones(p.reacciones)} ${tr("rankReactions")}`,
    (p: Proclama) => `${p.reacciones?.["🤯"] || 0} 🤯`,
  ];

  const current = lists[tab];

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5 mb-8">
      <p className="text-[#A0A0A0] text-xs font-semibold uppercase tracking-wider mb-4">
        {tr("rankingsTitle")}
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[#0A0A0A] rounded-xl p-1">
        {tabs.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i as 0 | 1 | 2)}
            className={`flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors ${
              tab === i
                ? "bg-[#3B82F6] text-white"
                : "text-[#A0A0A0] hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {current.length === 0 ? (
        <p className="text-[#A0A0A0] text-sm text-center py-4">{tr("rankEmpty")}</p>
      ) : (
        <div>
          {current.map((p, i) => (
            <RankItem
              key={p.id}
              pos={i}
              proclama={p}
              metric={metrics[tab](p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
