"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  proclama: { texto: string; autor: string; id?: string } | null;
  siteUrl: string;
};

export default function ExitoClient({ proclama, siteUrl }: Props) {
  const { tr } = useLanguage();

  const tweetText = proclama
    ? `"${proclama.texto}" — ${tr("exitoTweetSuffix")}`
    : tr("exitoTweetGeneric");

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(siteUrl)}`;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-line">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-2xl font-extrabold text-foreground hover:text-muted transition-colors"
          >
            Proclama<span className="text-accent">.</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 w-full">
        {/* Celebración */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-5">🎉</div>
          <h1 className="text-3xl font-extrabold text-foreground mb-3">
            {tr("exitoTitle")}
          </h1>
          <p className="text-muted text-lg">{tr("exitoDesc")}</p>
        </div>

        {/* Card */}
        {proclama && (
          <div className="bg-surface border border-line rounded-2xl p-8 mb-8">
            <p className="text-2xl font-medium text-foreground leading-relaxed text-center italic">
              &ldquo;{proclama.texto}&rdquo;
            </p>
            <p className="text-center text-muted mt-4">— {proclama.autor}</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-surface border border-line text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-hover transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {tr("exitoShare")}
          </a>
          {proclama?.id && (
            <Link
              href={`/p/${proclama.id}`}
              className="flex items-center justify-center gap-2 bg-surface border border-line text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-hover transition-colors"
            >
              {tr("verProclama")}
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-accent text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors"
          >
            {tr("viewWall")}
          </Link>
        </div>
      </main>

      <footer className="text-center py-8 text-muted text-xs border-t border-line">
        {tr("footer")}
      </footer>
    </div>
  );
}
