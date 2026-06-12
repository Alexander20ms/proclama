"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import ReactionBar from "./ReactionBar";
import ApoyoModal from "./ApoyoModal";
import type { Proclama } from "./ProclamaCard";

export default function ProclamaPageClient({
  proclama,
}: {
  proclama: Proclama;
}) {
  const { lang, tr, toggleTheme, theme, setLang } = useLanguage();
  const [showApoyo, setShowApoyo] = useState(false);

  const monto = (proclama.monto / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  const fecha = new Date(proclama.created_at).toLocaleDateString(
    lang === "es" ? "es-ES" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://proclama.app/p/${proclama.id}`;

  const tweetText = `"${proclama.texto}" — ${tr("exitoTweetSuffix")}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(tweetText + " " + shareUrl)}`;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-line sticky top-0 bg-bg/95 backdrop-blur z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-extrabold text-foreground tracking-tight"
          >
            Proclama<span className="text-accent">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="text-muted hover:text-foreground text-base border border-line px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {theme === "dark" ? tr("themeToggleDark") : tr("themeToggleLight")}
            </button>
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="text-muted hover:text-foreground text-xs font-mono border border-line px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {tr("langToggle")}
            </button>
            <Link
              href="/"
              className="text-muted hover:text-foreground text-sm transition-colors"
            >
              {tr("backToWall")}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Category + date */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-muted font-medium px-2.5 py-1 rounded-full bg-line">
            {proclama.categoria}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent/15 text-accent">
            {monto}
          </span>
          <span className="text-xs text-muted">{fecha}</span>
        </div>

        {/* Main quote */}
        <blockquote className="bg-surface border border-line rounded-2xl px-8 py-10 mb-6">
          <p className="text-foreground text-2xl sm:text-3xl font-semibold leading-relaxed">
            &ldquo;{proclama.texto}&rdquo;
          </p>
          <footer className="mt-6 text-muted font-medium">
            — {proclama.autor}
          </footer>
        </blockquote>

        {/* Creyentes stats */}
        {(proclama.apoyos > 0 || proclama.monto_total > 0) && (
          <div className="flex items-center gap-6 mb-6 px-2 text-sm text-muted">
            <span>
              🤝{" "}
              <strong className="text-foreground">{proclama.apoyos}</strong>{" "}
              {tr("creyentesCount")}
            </span>
            {proclama.monto_total > 0 && (
              <span>
                💰{" "}
                <strong className="text-foreground">
                  ${proclama.monto_total.toFixed(2)}
                </strong>{" "}
                {tr("creyentesTotal")}
              </span>
            )}
          </div>
        )}

        {/* Reactions */}
        <div className="bg-surface border border-line rounded-2xl px-6 py-4 mb-6">
          <ReactionBar
            proclamaId={proclama.id}
            initialReacciones={proclama.reacciones ?? {}}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowApoyo(true)}
            className="bg-accent text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors"
          >
            {tr("apoyoBtn")}
          </button>
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-surface border border-line text-foreground font-semibold px-5 py-3 rounded-xl hover:bg-hover transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-current shrink-0"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {tr("exitoShare")}
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-surface border border-line text-foreground font-semibold px-5 py-3 rounded-xl hover:bg-hover transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {tr("shareWhatsapp")}
          </a>
        </div>

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-line">
          <Link
            href="/"
            className="text-muted hover:text-foreground text-sm transition-colors"
          >
            {tr("backToWall")}
          </Link>
        </div>
      </main>

      <footer className="text-center py-8 text-muted text-xs border-t border-line mt-4">
        {tr("footer")}
      </footer>

      {showApoyo && (
        <ApoyoModal
          proclama={proclama}
          onClose={() => setShowApoyo(false)}
        />
      )}
    </div>
  );
}
