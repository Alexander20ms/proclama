"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";

const PRESET_COLORS = [
  "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#F97316",
  "#14B8A6", "#A855F7",
];

type MiProclama = {
  id: string;
  texto: string;
  monto: number;
  categoria: string;
  created_at: string;
};

type Tab = "info" | "proclamas";

export default function PerfilPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const { tr, lang } = useLanguage();

  const [tab, setTab] = useState<Tab>("info");
  const [misProclamas, setMisProclamaas] = useState<MiProclama[]>([]);
  const [loadingProclamaas, setLoadingProclamaas] = useState(false);
  const [selectedColor, setSelectedColor] = useState(profile?.color ?? "#3B82F6");
  const [savingColor, setSavingColor] = useState(false);
  const [colorSaved, setColorSaved] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.push("/login?next=/perfil");
  }, [authLoading, user, router]);

  // Sync color from profile
  useEffect(() => {
    if (profile?.color) setSelectedColor(profile.color);
  }, [profile?.color]);

  // Load proclamas on tab switch
  useEffect(() => {
    if (tab === "proclamas" && user && misProclamas.length === 0) {
      setLoadingProclamaas(true);
      supabase
        .from("proclamas")
        .select("id, texto, monto, categoria, created_at")
        .eq("user_id", user.id)
        .eq("publicada", true)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setMisProclamaas((data as MiProclama[]) ?? []);
          setLoadingProclamaas(false);
        });
    }
  }, [tab, user, misProclamas.length]);

  async function saveColor() {
    if (!user) return;
    setSavingColor(true);
    await supabase.from("perfiles").update({ color: selectedColor }).eq("id", user.id);
    await refreshProfile();
    setSavingColor(false);
    setColorSaved(true);
    setTimeout(() => setColorSaved(false), 2000);
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
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-extrabold text-2xl shrink-0"
            style={{ backgroundColor: profile.color }}
          >
            {profile.username[0]?.toUpperCase()}
          </div>
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
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{tr("profileAvatarColor")}</p>
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-10 h-10 rounded-full transition-all ${
                      selectedColor === c
                        ? "ring-2 ring-offset-2 ring-foreground ring-offset-bg scale-110"
                        : "hover:scale-105"
                    }`}
                    title={c}
                  />
                ))}
              </div>
              <button
                onClick={saveColor}
                disabled={savingColor || selectedColor === profile.color}
                className="mt-4 bg-accent text-white font-bold px-6 py-2 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                {savingColor ? tr("profileSaving") : colorSaved ? tr("profileSaved") : tr("profileSaveColor")}
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
                    {misProclamas.length} proclama{misProclamas.length !== 1 ? "s" : ""}
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
                        <span className="px-2 py-0.5 bg-line rounded-full">{p.categoria}</span>
                        <span className="text-accent font-bold">
                          ${(p.monto / 100).toFixed(0)}
                        </span>
                        <span>
                          {new Date(p.created_at).toLocaleDateString(
                            lang === "es" ? "es-ES" : "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
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
