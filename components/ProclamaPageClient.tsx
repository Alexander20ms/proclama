"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import ReactionBar from "./ReactionBar";
import RespuestaThread, { type Respuesta } from "./RespuestaThread";
import type { Proclama } from "./ProclamaCard";
import { getTier, type TierInfo } from "@/lib/tiers";
import { getAnimal } from "@/lib/animals";

function AnimalEmoji({
  name,
  savedAnimal,
  size = "lg",
  className = "",
}: {
  name: string;
  savedAnimal?: string | null;
  size?: "lg" | "xl";
  className?: string;
}) {
  const animal = getAnimal(name, savedAnimal);
  const sz = size === "xl" ? "text-[48px]" : "text-[40px]";
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

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function AmountBadge({ tier, monto }: { tier: TierInfo; monto: string }) {
  const label = tier.amountEmoji ? `${tier.amountEmoji} ${monto}` : monto;

  if (tier.level === 0) {
    return (
      <span className="text-sm font-bold px-3 py-1 rounded-full bg-accent/15 text-accent">
        {monto}
      </span>
    );
  }

  if (tier.amountInnerClass) {
    return (
      <span className={`text-sm font-bold px-3 py-1 rounded-full ${tier.amountOuterClass}`}>
        <span className={tier.amountInnerClass}>{label}</span>
      </span>
    );
  }

  return (
    <span className={`text-sm font-bold px-3 py-1 rounded-full ${tier.amountOuterClass}`}>
      {label}
    </span>
  );
}

export default function ProclamaPageClient({
  proclama,
  initialRespuestas,
}: {
  proclama: Proclama;
  initialRespuestas: Respuesta[];
}) {
  const { tr } = useLanguage();
  const [successMsg, setSuccessMsg] = useState(false);
  const tier = getTier(proclama.monto);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("respuesta") === "ok") {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 5000);
      }
    }
  }, []);

  const monto = (proclama.monto / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  const fecha = formatDateTime(proclama.created_at);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href.split("?")[0]
      : `${process.env.NEXT_PUBLIC_URL}/p/${proclama.id}`;

  const tweetText = `"${proclama.texto}" — ${tr("exitoTweetSuffix")}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-line sticky top-0 bg-bg/95 backdrop-blur z-40">
        <div className="max-w-[700px] mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold text-foreground tracking-tight">
            Proclama<span className="text-accent">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-muted hover:text-foreground text-sm transition-colors">
              {tr("backToWall")}
            </Link>
          </div>
        </div>
      </header>

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg z-50 text-sm">
          🎉 {tr("apoyoSuccess")}
        </div>
      )}

      {/* Main proclama */}
      <div className="max-w-[700px] mx-auto">
        <article className={`px-4 py-6 border-b border-line ${tier.cardClass}`}>

          {/* Tier 7 header banner */}
          {tier.level === 7 && (
            <div className="tier-7-header text-[15px] mb-4">
              👑 Official Owner of Proclama 👑
            </div>
          )}

          <div className="flex gap-3">
            <AnimalEmoji
              name={proclama.autor}
              savedAnimal={proclama.autor_animal}
              size={tier.level === 7 ? "xl" : "lg"}
              className={tier.avatarClass}
            />

            <div className="flex-1 min-w-0">
              {/* Author row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {tier.authorPrefix && (
                  <span className="text-base leading-none">{tier.authorPrefix}</span>
                )}

                <span
                  className={`font-bold text-base leading-none ${
                    tier.level === 7 ? "tier-7-author text-yellow-400" : "text-foreground"
                  }`}
                >
                  {proclama.autor}
                </span>

                {tier.name && tier.nameBadgeClass && (
                  <span className={tier.nameBadgeClass}>{tier.name}</span>
                )}

                <span className="text-muted text-sm">{fecha}</span>

                <div className="ml-auto flex gap-1.5">
                  <AmountBadge tier={tier} monto={monto} />
                </div>
              </div>

              {/* Texto — expanded on individual page */}
              <p
                className={`leading-relaxed font-semibold mb-4 ${
                  tier.level === 7
                    ? "tier-7-text text-2xl"
                    : "text-foreground text-2xl"
                }`}
              >
                &ldquo;{proclama.texto}&rdquo;
              </p>

              {/* Reactions + share */}
              <div className="flex flex-wrap items-center gap-3">
                <ReactionBar
                  proclamaId={proclama.id}
                  initialReacciones={proclama.reacciones ?? {}}
                />
                <a
                  href={tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-muted hover:text-foreground text-sm transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  {tr("shareBtn")}
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Respuestas thread — always open on this page */}
        <div className="px-4 pt-2 pb-8">
          <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            {initialRespuestas.length > 0
              ? `${initialRespuestas.length} ${tr("responsesLabel").toLowerCase()}`
              : tr("responsesLabel")}
          </p>
          <RespuestaThread
            proclamaId={proclama.id}
            initialRespuestas={initialRespuestas}
          />
        </div>
      </div>
    </div>
  );
}
