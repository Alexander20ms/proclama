"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import ProclamaCard from "./ProclamaCard";
import type { Proclama } from "./ProclamaCard";

type Profile = {
  id: string;
  username: string;
  color: string;
  created_at: string;
};

type Props = {
  profile: Profile;
  proclamas: Proclama[];
  totalGastado: number;
  totalReacciones: number;
};

export default function UserProfileClient({ profile, proclamas, totalGastado, totalReacciones }: Props) {
  const { tr, lang } = useLanguage();

  const initial = profile.username[0]?.toUpperCase() ?? "?";
  const joinDate = new Date(profile.created_at).toLocaleDateString(
    lang === "es" ? "es-ES" : "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-line">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold text-foreground">
            Proclama<span className="text-accent">.</span>
          </Link>
          <Link href="/" className="text-muted hover:text-foreground text-sm transition-colors">
            {tr("userBackToWall")}
          </Link>
        </div>
      </header>

      {/* Profile header */}
      <div className="border-b border-line">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-start gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-extrabold text-3xl shrink-0"
              style={{ backgroundColor: profile.color }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-foreground font-extrabold text-2xl">@{profile.username}</h1>
              <p className="text-muted text-sm mt-0.5">{tr("userJoined")} {joinDate}</p>
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="text-foreground font-extrabold text-xl">{proclamas.length}</p>
                  <p className="text-muted text-xs">{tr("userProclamaasLabel")}</p>
                </div>
                <div className="text-center">
                  <p className="text-accent font-extrabold text-xl">${totalGastado.toFixed(0)}</p>
                  <p className="text-muted text-xs">{tr("userInvested")}</p>
                </div>
                <div className="text-center">
                  <p className="text-foreground font-extrabold text-xl">{totalReacciones}</p>
                  <p className="text-muted text-xs">{tr("userReactionsLabel")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proclamas feed */}
      <div className="max-w-2xl mx-auto">
        {proclamas.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-foreground font-bold mb-2">{tr("userNoProclamaas")}</p>
            <p className="text-muted text-sm">{tr("userNoProclamaasDesc")}</p>
          </div>
        ) : (
          <div className="border-x border-line">
            {proclamas.map((p) => (
              <ProclamaCard key={p.id} proclama={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
