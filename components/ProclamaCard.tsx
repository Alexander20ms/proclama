"use client";

import { useState } from "react";
import Link from "next/link";
import ReactionBar from "./ReactionBar";
import RespuestaThread from "./RespuestaThread";
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
  user_id?: string | null;
};

const COLORS = [
  "bg-blue-600", "bg-purple-600", "bg-green-600",
  "bg-orange-600", "bg-red-600", "bg-pink-600",
];

function Avatar({ name }: { name: string }) {
  const initial = name.trim()[0]?.toUpperCase() ?? "?";
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div
      className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
    >
      {initial}
    </div>
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

export default function ProclamaCard({
  proclama,
  isNew = false,
}: {
  proclama: Proclama;
  isNew?: boolean;
}) {
  const { tr } = useLanguage();
  const [threadOpen, setThreadOpen] = useState(false);

  const monto = (proclama.monto / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  const fecha = formatDateTime(proclama.created_at);

  return (
    <article
      className={`px-4 py-4 border-b border-line hover:bg-surface transition-colors cursor-default ${
        isNew ? "card-enter" : ""
      }`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          <Avatar name={proclama.autor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
            {proclama.user_id ? (
              <Link
                href={`/u/${encodeURIComponent(proclama.autor)}`}
                className="text-foreground font-bold text-sm leading-none hover:text-accent transition-colors"
              >
                {proclama.autor}
              </Link>
            ) : (
              <span className="text-foreground font-bold text-sm leading-none">
                {proclama.autor}
              </span>
            )}
            <span className="text-muted text-xs">{fecha}</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                {monto}
              </span>
            </div>
          </div>

          {/* Texto */}
          <Link href={`/p/${proclama.id}`} className="block group">
            <p className="text-foreground text-[18px] leading-relaxed font-medium group-hover:text-accent transition-colors">
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
