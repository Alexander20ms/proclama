"use client";

import ReactionBar from "./ReactionBar";
import { useLanguage } from "@/contexts/LanguageContext";

export type Proclama = {
  id: string;
  texto: string;
  autor: string;
  monto: number;
  categoria: string;
  reacciones: Record<string, number>;
  created_at: string;
};

export default function ProclamaCard({ proclama }: { proclama: Proclama }) {
  const { lang } = useLanguage();

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
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl px-6 py-5 hover:border-[#2A2A2A] transition-colors">
      <p className="text-white text-lg font-medium leading-relaxed mb-4">
        &ldquo;{proclama.texto}&rdquo;
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[#A0A0A0] text-sm">— {proclama.autor}</span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#A0A0A0] font-medium px-2.5 py-1 rounded-full bg-[#1E1E1E]">
            {proclama.categoria}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#3B82F6]/15 text-[#3B82F6]">
            {monto}
          </span>
          <span className="text-xs text-[#A0A0A0]">{fecha}</span>
        </div>
      </div>

      <ReactionBar
        proclamaId={proclama.id}
        initialReacciones={proclama.reacciones ?? {}}
      />
    </div>
  );
}
