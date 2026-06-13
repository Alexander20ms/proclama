"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { ANIMALS, getAnimal } from "@/lib/animals";

type MiProclama = {
  id: string;
  texto: string;
  monto: number;
  created_at: string;
};

type Tab = "info" | "proclamas";

export default function PerfilPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const { tr } = useLanguage();

  const [tab, setTab] = useState<Tab>("info");
  const [misProclamas, setMisProclamaas] = useState<MiProclama[]>([]);
  const [loadingProclamaas, setLoadingProclamaas] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<string>("🐶");
  const [savingAnimal, setSavingAnimal] = useState(false);
  const [animalSaved, setAnimalSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login?next=/perfil");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (profile) {
      setSelectedAnimal(getAnimal(profile.username, profile.animal));
    }
  }, [profile]);

  useEffect(() => {
    if (tab === "proclamas" && user && misProclamas.length === 0) {
      setLoadingProclamaas(true);
      supabase
        .from("proclamas")
        .select("id, texto, monto, created_at")
        .eq("user_id", user.id)
        .eq("publicada", true)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setMisProclamaas((data as MiProclama[]) ?? []);
          setLoadingProclamaas(false);
        });
    }
  }, [tab, user, misProclamas.length]);

  async function saveAnimal() {
    if (!user) return;
    setSavingAnimal(true);
    await supabase.from("perfiles").update({ animal: selectedAnimal }).eq("id", user.id);
    await refreshProfile();
    setSavingAnimal(false);
    setAnimalSaved(true);
    setTimeout(() => setAnimalSaved(false), 2000);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-line border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const totalGastado = misProclamas.reduce((s, p) => s + p.monto, 0) / 100;
  const currentAnimal = getAnimal(profile.username, profile.animal);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-line sticky top-0 bg-bg/95 backdrop-blur z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold text-foreground">
            Proclama<span className="text-accent">.</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="text-muted hover:text-red-400 text-sm transition-colors"
          >
            {tr("signOut")}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile card */}
        <div className="bg-surface border border-line rounded-2xl p-6 mb-6 flex items-center gap-4">
          <span
            className="text-[56px] leading-none shrink-0 select-none inline-block transition-transform duration-300 hover:scale-125 cursor-default"
            role="img"
            aria-label={profile.username}
          >
            {currentAnimal}
          </span>
          <div>
            <p className="text-foreground font-bold text-lg">@{profile.username}</p>
            <p className="text-muted text-sm">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface border border-line rounded-xl p-1 mb-6 w-fit">
          {([
            { key: "info", label: tr("profileTabInfo") },
            { key: "proclamas", label: tr("profileTabProclamaas") },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t.key ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: info */}
        {tab === "info" && (
          <div className="bg-surface border border-line rounded-2xl p-6 space-y-6">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">{tr("profileUsernameLabel")}</p>
              <p className="text-foreground font-medium">@{profile.username}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">{tr("profileEmailLabel")}</p>
              <p className="text-foreground font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Your animal</p>
              <div className="grid grid-cols-5 gap-3">
                {ANIMALS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setSelectedAnimal(a)}
                    className={`flex items-center justify-center w-14 h-14 rounded-2xl text-[32px] transition-all ${
                      selectedAnimal === a
                        ? "ring-2 ring-accent bg-accent/10 scale-110"
                        : "hover:bg-hover hover:scale-105"
                    }`}
                    title={a}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <button
                onClick={saveAnimal}
                disabled={savingAnimal || selectedAnimal === currentAnimal}
                className="mt-5 bg-accent text-white font-bold px-6 py-2 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {savingAnimal ? tr("profileSaving") : animalSaved ? tr("profileSaved") : "Save animal"}
              </button>
            </div>
          </div>
        )}

        {/* Tab: my proclamas */}
        {tab === "proclamas" && (
          <div>
            {loadingProclamaas ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-line border-t-accent rounded-full animate-spin" />
              </div>
            ) : misProclamas.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">📣</p>
                <p className="text-foreground font-bold mb-2">{tr("profileNoProclamaas")}</p>
                <p className="text-muted text-sm mb-6">{tr("profileNoProclamaasDesc")}</p>
                <Link
                  href="/nueva"
                  className="bg-accent text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-500 transition-colors"
                >
                  {tr("publishBtn")}
                </Link>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted text-sm">
                    {misProclamas.length} proclamation{misProclamas.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-muted text-sm">
                    {tr("profileTotalSpent")}{" "}
                    <span className="text-accent font-bold">${totalGastado.toFixed(2)}</span>
                  </p>
                </div>
                <div className="space-y-3">
                  {misProclamas.map((p) => (
                    <Link
                      key={p.id}
                      href={`/p/${p.id}`}
                      className="block bg-surface border border-line rounded-xl p-4 hover:border-accent transition-colors group"
                    >
                      <p className="text-foreground font-medium leading-snug group-hover:text-accent transition-colors line-clamp-2">
                        &ldquo;{p.texto}&rdquo;
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                        <span className="text-accent font-bold">
                          ${(p.monto / 100).toFixed(0)}
                        </span>
                        <span>
                          {new Date(p.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
