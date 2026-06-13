"use client";

import { useState } from "react";
import Link from "next/link";
import ReactionBar from "./ReactionBar";
import RespuestaThread from "./RespuestaThread";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTierFromNebulosas, type TierInfo } from "@/lib/tiers";
import { getAnimal } from "@/lib/animals";

export type Proclama = {
  id: string;
  texto: string;
  autor: string;
  monto: number;
  nebulosas?: number | null;
  categoria: string;
  reacciones: Record<string, number>;
  created_at: string;
  apoyos: number;
  monto_total: number;
  user_id?: string | null;
  autor_animal?: string | null;
};

function AnimalEmoji({
  name,
  savedAnimal,
  size = "md",
  className = "",
}: {
  name: string;
  savedAnimal?: string | null;
  size?: "md" | "xl";
  className?: string;
}) {
  const animal = getAnimal(name, savedAnimal);
  const sz = size === "xl" ? "text-[40px]" : "text-[32px]";
  return (
    <span
      className={`${sz} leading-none shrink-0 cursor-default select-none inline-block transition-transform duration-300 hover:scale-125 ${className}`}
      role="img"
      aria-label={name}
    >
      {animal}
    </span>
  );
}

function stripEmojis(s: string): string {
  return s
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/[☀-➿⌀-⏿⬀-⯿︀-️]/g, "")
    .trim();
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function AmountBadge({ tier, nebulosas }: { tier: TierInfo; nebulosas: number }) {
  const label = `♦️ ${Math.round(nebulosas).toLocaleString("en-US")}`;

  if (tier.level === 0) {
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
        {label}
      </span>
    );
  }

  if (tier.amountInnerClass) {
    return (
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.amountOuterClass}`}>
        <span className={tier.amountInnerClass}>{label}</span>
      </span>
    );
  }

  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.amountOuterClass}`}>
      {label}
    </span>
  );
}

function TierNameBadge({ tier }: { tier: TierInfo }) {
  if (!tier.name || !tier.nameBadgeClass) return null;
  return <span className={tier.nameBadgeClass}>{tier.name}</span>;
}

export default function ProclamaCard({
  proclama,
  isNew = false,
}: {
  proclama: Proclama;
  isNew?: boolean;
}) {
  const { tr } = useLanguage();
  const [threadOpen, setThreadOpen] = useState(false);
  const nebulasDisplay = (() => {
    if (proclama.nebulosas && Number(proclama.nebulosas) > 0) return Number(proclama.nebulosas);
    if (proclama.monto && proclama.monto > 0) return Math.round(proclama.monto / 25);
    return 2;
  })();
  const tier = getTierFromNebulosas(nebulasDisplay);

  const fecha = formatDateTime(proclama.created_at);

  const isHighTier = tier.level >= 4;
  const hoverClass = isHighTier ? "" : "hover:bg-surface";

  return (
    <article
      className={`px-6 py-5 rounded-[20px] border border-line mb-4 overflow-hidden transition-colors cursor-default ${hoverClass} ${
        isNew ? "card-enter" : ""
      } ${tier.cardClass}`}
    >
      {/* Tier 7 exclusive header banner */}
      {tier.level === 7 && (
        <div className="tier-7-header">👑 Official Owner of Proclama 👑</div>
      )}

      <div className="flex gap-3">
        {/* Animal avatar */}
        <div className="shrink-0 mt-0.5">
          <AnimalEmoji
            name={proclama.autor}
            savedAnimal={proclama.autor_animal}
            size={tier.level === 7 ? "xl" : "md"}
            className={tier.avatarClass}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
            {tier.authorPrefix && (
              <span className="text-sm leading-none">{tier.authorPrefix}</span>
            )}

            {proclama.user_id ? (
              <Link
                href={`/u/${encodeURIComponent(proclama.autor)}`}
                className={`font-bold text-sm leading-none hover:text-accent transition-colors ${
                  tier.level === 7 ? "tier-7-author text-yellow-400" : "text-foreground"
                }`}
              >
                {stripEmojis(proclama.autor)}
              </Link>
            ) : (
              <span
                className={`font-bold text-sm leading-none ${
                  tier.level === 7 ? "tier-7-author text-yellow-400" : "text-foreground"
                }`}
              >
                {stripEmojis(proclama.autor)}
              </span>
            )}

            <TierNameBadge tier={tier} />

            <span className="text-muted text-xs">{fecha}</span>

            <div className="ml-auto flex items-center gap-1.5">
              <AmountBadge tier={tier} nebulosas={nebulasDisplay} />
            </div>
          </div>

          {/* Texto */}
          <Link href={`/p/${proclama.id}`} className="block group">
            <p
              className={`leading-relaxed font-medium group-hover:text-accent transition-colors ${
                tier.level === 7
                  ? "tier-7-text"
                  : "text-foreground text-[18px]"
              }`}
            >
              &ldquo;{proclama.texto}&rdquo;
            </p>
          </Link>

          {/* Footer: reactions + reply button */}
          <div className="flex items-center justify-between mt-3">
            <ReactionBar
              proclamaId={proclama.id}
              initialReacciones={proclama.reacciones ?? {}}
            />
            <button
              onClick={() => setThreadOpen((v) => !v)}
              className={`flex items-center gap-1.5 text-sm px-2 py-1 rounded-lg transition-colors ${
                threadOpen
                  ? "text-accent"
                  : "text-muted hover:text-foreground hover:bg-hover"
              }`}
              title={tr("apoyoTitle")}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-[18px] h-[18px] fill-none stroke-current stroke-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                />
              </svg>
              <span className="text-xs font-semibold">{tr("replyBtn")}</span>
            </button>
          </div>

          {/* Thread (expandable) */}
          {threadOpen && (
            <RespuestaThread proclamaId={proclama.id} />
          )}
        </div>
      </div>
    </article>
  );
}
