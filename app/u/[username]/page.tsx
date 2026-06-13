import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import ProclamaCard from "@/components/ProclamaCard";
import type { Proclama } from "@/components/ProclamaCard";

type Profile = {
  id: string;
  username: string;
  color: string;
  created_at: string;
};

async function getData(username: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase
    .from("perfiles")
    .select("id, username, color, created_at")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const { data: proclamas } = await supabase
    .from("proclamas")
    .select(
      "id, texto, autor, monto, categoria, reacciones, created_at, apoyos, monto_total, user_id"
    )
    .eq("user_id", profile.id)
    .eq("publicada", true)
    .order("created_at", { ascending: false });

  return { profile: profile as Profile, proclamas: (proclamas as Proclama[]) ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const username = decodeURIComponent(params.username);
  return {
    title: `@${username} — Proclama`,
    description: `Public proclamations by @${username}`,
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const username = decodeURIComponent(params.username);
  const data = await getData(username);
  if (!data) notFound();

  const { profile, proclamas } = data;
  const totalGastado = proclamas.reduce((s, p) => s + p.monto, 0) / 100;
  const totalReacciones = proclamas.reduce((s, p) => {
    const r = p.reacciones ?? {};
    return s + Object.values(r).reduce((a, b) => a + b, 0);
  }, 0);
  const initial = profile.username[0]?.toUpperCase() ?? "?";
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-line">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold text-foreground">
            Proclama<span className="text-accent">.</span>
          </Link>
          <Link href="/" className="text-muted hover:text-foreground text-sm transition-colors">
            ← Back to wall
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
              <p className="text-muted text-sm mt-0.5">Joined {joinDate}</p>
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="text-foreground font-extrabold text-xl">{proclamas.length}</p>
                  <p className="text-muted text-xs">proclamas</p>
                </div>
                <div className="text-center">
                  <p className="text-accent font-extrabold text-xl">${totalGastado.toFixed(0)}</p>
                  <p className="text-muted text-xs">invested</p>
                </div>
                <div className="text-center">
                  <p className="text-foreground font-extrabold text-xl">{totalReacciones}</p>
                  <p className="text-muted text-xs">reactions</p>
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
            <p className="text-foreground font-bold mb-2">No proclamas yet</p>
            <p className="text-muted text-sm">This user hasn&apos;t published anything.</p>
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
